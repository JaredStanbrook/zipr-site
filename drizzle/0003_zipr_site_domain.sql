CREATE TABLE `enquiry` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`email` text NOT NULL,
	`organisation` text,
	`topic` text DEFAULT 'other' NOT NULL,
	`seats` integer,
	`message` text NOT NULL,
	`status` text DEFAULT 'new' NOT NULL,
	`handled_by` text,
	`handled_at` text,
	`deleted_at` text,
	`created_at` text DEFAULT (current_timestamp) NOT NULL,
	`updated_at` text NOT NULL,
	FOREIGN KEY (`handled_by`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE INDEX `enquiry_status_idx` ON `enquiry` (`status`);--> statement-breakpoint
CREATE INDEX `enquiry_created_idx` ON `enquiry` (`created_at`);--> statement-breakpoint
CREATE TABLE `release` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`version` text NOT NULL,
	`channel` text DEFAULT 'stable' NOT NULL,
	`notes` text,
	`published_at` text,
	`published_by` text,
	`deleted_at` text,
	`created_at` text DEFAULT (current_timestamp) NOT NULL,
	`updated_at` text NOT NULL,
	FOREIGN KEY (`published_by`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE UNIQUE INDEX `release_version_idx` ON `release` (`version`);--> statement-breakpoint
CREATE INDEX `release_published_idx` ON `release` (`published_at`);--> statement-breakpoint
CREATE TABLE `release_asset` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`release_id` integer NOT NULL,
	`platform` text NOT NULL,
	`arch` text DEFAULT 'x64' NOT NULL,
	`filename` text NOT NULL,
	`r2_key` text NOT NULL,
	`content_type` text DEFAULT 'application/octet-stream' NOT NULL,
	`size_bytes` integer NOT NULL,
	`sha256` text,
	`download_count` integer DEFAULT 0 NOT NULL,
	`created_at` text DEFAULT (current_timestamp) NOT NULL,
	`updated_at` text NOT NULL,
	FOREIGN KEY (`release_id`) REFERENCES `release`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `release_asset_key_idx` ON `release_asset` (`r2_key`);--> statement-breakpoint
CREATE INDEX `release_asset_release_idx` ON `release_asset` (`release_id`);