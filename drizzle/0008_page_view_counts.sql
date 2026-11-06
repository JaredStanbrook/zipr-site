CREATE TABLE `page_view_daily` (
	`day` text NOT NULL,
	`path` text NOT NULL,
	`source` text NOT NULL,
	`country` text NOT NULL,
	`device` text NOT NULL,
	`views` integer DEFAULT 0 NOT NULL,
	PRIMARY KEY(`day`, `path`, `source`, `country`, `device`)
);
--> statement-breakpoint
CREATE INDEX `page_view_daily_day_idx` ON `page_view_daily` (`day`);