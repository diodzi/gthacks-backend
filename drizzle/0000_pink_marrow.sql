-- Current sql file was generated after introspecting the database
-- If you want to run this migration please uncomment this code before executing migrations
/*
CREATE TABLE `betting_feeds` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`gameId` int NOT NULL,
	`season` int NOT NULL,
	`week` int NOT NULL,
	`seasonType` varchar(50) NOT NULL,
	`gameDate` datetime NOT NULL,
	`homeTeam` varchar(100) NOT NULL,
	`awayTeam` varchar(100) NOT NULL,
	`homeTeamId` int NOT NULL,
	`awayTeamId` int NOT NULL,
	`homeTeamScore` int,
	`awayTeamScore` int,
	`pointSpread` decimal(5,2),
	`overUnder` decimal(5,2),
	`homeTeamMoneyLine` int,
	`awayTeamMoneyLine` int,
	`updated` datetime NOT NULL,
	`created` datetime NOT NULL DEFAULT (CURRENT_TIMESTAMP),
	CONSTRAINT `betting_feeds_id` PRIMARY KEY(`id`),
	CONSTRAINT `id` UNIQUE(`id`)
);
--> statement-breakpoint
CREATE TABLE `users_table` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`username` varchar(255) NOT NULL,
	`email` varchar(255) NOT NULL,
	`rep_points` int,
	CONSTRAINT `users_table_id` PRIMARY KEY(`id`),
	CONSTRAINT `id` UNIQUE(`id`),
	CONSTRAINT `users_table_email_unique` UNIQUE(`email`)
);

*/