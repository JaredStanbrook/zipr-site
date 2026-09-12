CREATE TABLE `issue` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`product` text DEFAULT 'client' NOT NULL,
	`summary` text NOT NULL,
	`detail` text NOT NULL,
	`email` text,
	`version` text,
	`platform` text,
	`status` text DEFAULT 'new' NOT NULL,
	`note` text,
	`triaged_by` text,
	`triaged_at` text,
	`deleted_at` text,
	`created_at` text DEFAULT (current_timestamp) NOT NULL,
	`updated_at` text NOT NULL,
	FOREIGN KEY (`triaged_by`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE INDEX `issue_status_idx` ON `issue` (`status`);--> statement-breakpoint
CREATE INDEX `issue_product_idx` ON `issue` (`product`);--> statement-breakpoint
CREATE INDEX `issue_created_idx` ON `issue` (`created_at`);