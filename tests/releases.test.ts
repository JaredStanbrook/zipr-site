import { describe, it, expect, beforeEach } from "vitest";
import { createHash } from "node:crypto";
import { Hono } from "hono";
import { eq } from "drizzle-orm";

import app from "../worker/app";
import type { AppEnv } from "../worker/types";
import { release, releaseAsset, type SelectReleaseAsset } from "../worker/schema/release.schema";
import { createRealDb } from "./utils/realDb";
import { createAppConfig, createAuthConfig } from "./utils/testApp";

/**
 * The release pipeline's API, and the two download pages it feeds.
 *
 * On `createRealDb` because what matters here is what the queries select —
 * that the stable page never offers an experimental file, that a stable
 * release is out of the token's reach — and the fake database replays rows
 * whatever the `where` clause says.
 */

const TOKEN = "a-long-random-release-token-for-tests";

/** Enough of R2 for the routes: objects held in memory, bodies read whole. */
const createBucket = () => {
  const objects = new Map<string, { bytes: Uint8Array; contentType?: string }>();
  return {
    objects,
    async put(key: string, value: ArrayBuffer | ReadableStream, options?: any) {
      const bytes = new Uint8Array(await new Response(value as any).arrayBuffer());
      objects.set(key, { bytes, contentType: options?.httpMetadata?.contentType });
      return {};
    },
    async get(key: string) {
      const held = objects.get(key);
      return held ? { body: new Response(held.bytes).body } : null;
    },
    async delete(key: string) {
      objects.delete(key);
    },
  };
};

let db: ReturnType<typeof createRealDb>["db"];
let bucket: ReturnType<typeof createBucket>;
let site: Hono<AppEnv>;
let env: any;

beforeEach(() => {
  db = createRealDb().db;
  bucket = createBucket();
  env = { R2: bucket, RELEASE_TOKEN: TOKEN, ORIGIN: "http://localhost:3000", APP_NAME: "Zipr" };
  site = new Hono<AppEnv>();
  site.use("*", async (c, next) => {
    c.set("db", db as any);
    c.set("app", createAppConfig());
    c.set("authConfig", createAuthConfig());
    c.set("auth", {
      user: null,
      session: null,
      destroySession() {},
      isRegistrationOpen: async () => false,
    } as any);
    c.set("isMethodEnabled", () => true);
    await next();
  });
  site.route("/", app);
});

const call = (
  method: string,
  path: string,
  { token = TOKEN, body, json }: { token?: string | null; body?: Uint8Array; json?: unknown } = {},
) => {
  const headers: Record<string, string> = {};
  if (token) headers.Authorization = `Bearer ${token}`;
  let payload: BodyInit | undefined;
  if (body) {
    payload = body;
    headers["Content-Length"] = String(body.byteLength);
    headers["Content-Type"] = "application/octet-stream";
  } else if (json !== undefined) {
    payload = JSON.stringify(json);
    headers["Content-Type"] = "application/json";
  }
  return site.fetch(
    new Request(`http://localhost${path}`, { method, headers, body: payload }),
    env,
  );
};

const page = async (path: string) =>
  (await site.fetch(new Request(`http://localhost${path}`), env)).text();

const VERSION = "0.2.0-experimental.1";
const bytes = (text: string) => new TextEncoder().encode(text);
const sha256 = (data: Uint8Array) => createHash("sha256").update(data).digest("hex");

const upload = (filename: string, platform: string, data: Uint8Array, arch = "x64") =>
  call("PUT", `/api/releases/${VERSION}/assets/${filename}?platform=${platform}&arch=${arch}`, {
    body: data,
  });

describe("the release token", () => {
  it("is refused when the site has none, wrong, or missing", async () => {
    delete env.RELEASE_TOKEN;
    expect((await call("PUT", `/api/releases/${VERSION}`, { json: {} })).status).toBe(503);

    env.RELEASE_TOKEN = TOKEN;
    expect(
      (await call("PUT", `/api/releases/${VERSION}`, { token: "wrong", json: {} })).status,
    ).toBe(401);
    expect((await call("PUT", `/api/releases/${VERSION}`, { token: null, json: {} })).status).toBe(
      401,
    );
    expect((await call("PUT", `/api/releases/${VERSION}`, { json: {} })).status).toBe(201);
  });
});

describe("creating an experimental build", () => {
  it("takes only a pre-release version, so a stable number is never used up", async () => {
    const plain = await call("PUT", "/api/releases/0.2.0", { json: {} });
    expect(plain.status).toBe(422);

    const made = await call("PUT", `/api/releases/${VERSION}`, { json: { notes: "From main" } });
    expect(made.status).toBe(201);
    const state = (await made.json()) as any;
    expect(state).toMatchObject({ version: VERSION, channel: "experimental", published: false });

    // A re-run finds the draft it made rather than failing on the unique index.
    const again = await call("PUT", `/api/releases/${VERSION}`, { json: {} });
    expect(again.status).toBe(200);
    const [row] = await db.select().from(release).where(eq(release.version, VERSION));
    expect(row?.notes).toBe("From main");
  });

  it("never touches a stable release, even one with a pre-release version", async () => {
    await db.insert(release).values({ version: "1.0.0-rc.1", channel: "stable", updatedAt: "x" });

    expect((await call("PUT", "/api/releases/1.0.0-rc.1", { json: {} })).status).toBe(409);
    expect((await call("GET", "/api/releases/1.0.0-rc.1")).status).toBe(404);
    expect(
      (
        await call("PUT", "/api/releases/1.0.0-rc.1/assets/Zipr.exe?platform=windows", {
          body: bytes("x"),
        })
      ).status,
    ).toBe(404);
    expect((await call("POST", "/api/releases/1.0.0-rc.1/publish")).status).toBe(404);

    const [row] = await db.select().from(release).where(eq(release.version, "1.0.0-rc.1"));
    expect(row?.publishedAt).toBeNull();
  });
});

describe("uploading installers", () => {
  beforeEach(async () => {
    await call("PUT", `/api/releases/${VERSION}`, { json: {} });
  });

  it("stores the bytes and records the checksum the site computed", async () => {
    const data = bytes("an AppImage, notionally");
    const res = await upload("Zipr_0.2.0-experimental.1_amd64.AppImage", "linux", data);
    expect(res.status).toBe(201);
    const stored = (await res.json()) as any;
    expect(stored.sha256).toBe(sha256(data));
    expect(stored.sizeBytes).toBe(data.byteLength);

    const [row] = await db.select().from(releaseAsset);
    expect(row).toMatchObject({
      platform: "linux",
      arch: "x64",
      filename: "Zipr_0.2.0-experimental.1_amd64.AppImage",
      contentType: "application/vnd.appimage",
      sha256: sha256(data),
    });
    expect(bucket.objects.get(row!.r2Key)?.bytes).toEqual(data);
  });

  it("replaces a file uploaded again, row and object together", async () => {
    await upload("Zipr_amd64.deb", "linux", bytes("first"));
    const [first] = await db.select().from(releaseAsset);
    await upload("Zipr_amd64.deb", "linux", bytes("second"));

    const rows = await db.select().from(releaseAsset);
    expect(rows).toHaveLength(1);
    expect(rows[0]!.sha256).toBe(sha256(bytes("second")));
    expect(bucket.objects.has(first!.r2Key)).toBe(false);
    expect(bucket.objects.size).toBe(1);
  });

  it("refuses a name that is not a plain file name, and a missing platform", async () => {
    expect((await upload("..%2F..%2Fetc%2Fpasswd", "linux", bytes("x"))).status).toBe(422);
    expect((await upload(".hidden", "linux", bytes("x"))).status).toBe(422);
    expect(
      (await call("PUT", `/api/releases/${VERSION}/assets/Zipr.exe`, { body: bytes("x") })).status,
    ).toBe(422);
    expect((await upload("Zipr.exe", "beos", bytes("x"))).status).toBe(422);
    expect(bucket.objects.size).toBe(0);
  });

  it("publishes only with something to offer, and freezes the build once it has", async () => {
    expect((await call("POST", `/api/releases/${VERSION}/publish`)).status).toBe(409);

    await upload("Zipr_x64-setup.exe", "windows", bytes("exe"));
    const published = await call("POST", `/api/releases/${VERSION}/publish`);
    expect(published.status).toBe(200);
    expect(((await published.json()) as any).published).toBe(true);

    // Publishing twice is a re-run, not an error; changing it is refused.
    expect((await call("POST", `/api/releases/${VERSION}/publish`)).status).toBe(200);
    expect((await upload("Zipr_x64-setup.exe", "windows", bytes("other"))).status).toBe(409);
    expect((await call("PUT", `/api/releases/${VERSION}`, { json: {} })).status).toBe(200);
  });
});

describe("the download pages", () => {
  const publishStable = async () => {
    const [made] = await db
      .insert(release)
      .values({
        version: "0.1.0",
        channel: "stable",
        publishedAt: "2026-10-01T00:00:00.000Z",
        updatedAt: "x",
      })
      .returning({ id: release.id });
    await db.insert(releaseAsset).values({
      releaseId: made!.id,
      platform: "windows",
      filename: "Zipr_0.1.0_x64-setup.exe",
      r2Key: "releases/0.1.0/windows.exe",
      sizeBytes: 10,
      sha256: "a".repeat(64),
      updatedAt: "x",
    });
  };

  const publishExperimental = async () => {
    await call("PUT", `/api/releases/${VERSION}`, { json: { notes: "Built from abc1234" } });
    await upload("Zipr_0.2.0-experimental.1_amd64.AppImage", "linux", bytes("appimage"));
    await upload("Zipr_0.2.0-experimental.1_amd64.deb", "linux", bytes("deb"));
    await upload("Zipr-0.2.0-experimental.1-1.x86_64.rpm", "linux", bytes("rpm"));
    await upload("Zipr_0.2.0-experimental.1_aarch64.dmg", "macos", bytes("dmg"), "arm64");
    await call("POST", `/api/releases/${VERSION}/publish`);
  };

  /** The page split where the experimental section starts. */
  const halves = (html: string) => {
    const at = html.indexOf('id="experimental"');
    expect(at, "the page has an experimental section").toBeGreaterThan(-1);
    return { stable: html.slice(0, at), experimental: html.slice(at) };
  };
  const experimentalIds = async () => {
    const assets: SelectReleaseAsset[] = await db.select().from(releaseAsset);
    return assets.filter((asset) => asset.filename.includes("experimental")).map((a) => a.id);
  };

  it("offers an experimental build only in its own section, below the stable one", async () => {
    await publishStable();
    await publishExperimental();

    const { stable, experimental } = halves(await page("/downloads"));
    // Stable leads, and the switch under the heading jumps to the section.
    expect(stable).toContain("0.1.0");
    expect(stable).toContain('href="/downloads/1"');
    expect(stable).toContain('href="#experimental"');
    const ids = await experimentalIds();
    expect(ids).toHaveLength(4);
    for (const id of ids) {
      // None of its files is in the cards at the top…
      expect(stable).not.toContain(`href="/downloads/${id}"`);
      // …and every one is in its section.
      expect(experimental).toContain(`href="/downloads/${id}"`);
    }
    // The stable build is not offered as an experimental one.
    expect(experimental).not.toContain('href="/downloads/1"');
  });

  it("lists every file of an experimental build, with what each one is", async () => {
    await publishStable();
    await publishExperimental();

    const { experimental } = halves(await page("/downloads"));
    expect(experimental).toContain(VERSION);
    expect(experimental).toContain("AppImage — any distribution");
    expect(experimental).toContain("Debian and Ubuntu (.deb)");
    expect(experimental).toContain("Fedora and openSUSE (.rpm)");
    // An Apple-silicon image says so, rather than failing on an Intel Mac.
    expect(experimental).toContain("Apple silicon");
    expect(experimental).toContain(sha256(bytes("deb")));
    expect(experimental).toContain("Built from abc1234");
    // What to know first comes before the files.
    expect(experimental.indexOf("No upgrade path yet")).toBeLessThan(
      experimental.indexOf("AppImage — any distribution"),
    );
  });

  it("keeps the old experimental page as a redirect to the section", async () => {
    const res = await site.fetch(new Request("http://localhost/downloads/experimental"), env);
    expect(res.status).toBe(301);
    expect(res.headers.get("location")).toBe("/downloads#experimental");
  });

  it("says plainly when there is no experimental build, and offers no switch to one", async () => {
    await publishStable();
    // A draft does not count.
    await call("PUT", `/api/releases/${VERSION}`, { json: {} });

    const { stable, experimental } = halves(await page("/downloads"));
    expect(experimental).toContain("No experimental build right now");
    expect(stable).not.toContain('href="#experimental"');
  });
});
