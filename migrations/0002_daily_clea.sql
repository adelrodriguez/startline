ALTER TABLE `activity_log` RENAME COLUMN "action" TO "type";--> statement-breakpoint
ALTER TABLE `password_reset_token` RENAME COLUMN "token" TO "hash";--> statement-breakpoint
DROP INDEX IF EXISTS `password_reset_token_user_id_unique`;--> statement-breakpoint
CREATE UNIQUE INDEX `password_reset_token_userId_unique` ON `password_reset_token` (`user_id`);--> statement-breakpoint
DROP INDEX IF EXISTS `email_verification_code_user_id_unique`;--> statement-breakpoint
CREATE UNIQUE INDEX `email_verification_code_userId_unique` ON `email_verification_code` (`user_id`);--> statement-breakpoint
DROP INDEX IF EXISTS `password_user_id_unique`;--> statement-breakpoint
CREATE UNIQUE INDEX `password_userId_unique` ON `password` (`user_id`);--> statement-breakpoint
DROP INDEX IF EXISTS `profile_user_id_unique`;--> statement-breakpoint
CREATE UNIQUE INDEX `profile_userId_unique` ON `profile` (`user_id`);--> statement-breakpoint
DROP INDEX IF EXISTS `user_google_id_unique`;--> statement-breakpoint
DROP INDEX IF EXISTS `user_github_id_unique`;--> statement-breakpoint
CREATE UNIQUE INDEX `user_googleId_unique` ON `user` (`google_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `user_githubId_unique` ON `user` (`github_id`);--> statement-breakpoint
DROP INDEX IF EXISTS `webhook_event_external_id_unique`;--> statement-breakpoint
CREATE UNIQUE INDEX `webhook_event_externalId_unique` ON `webhook_event` (`external_id`);--> statement-breakpoint
ALTER TABLE `organization_invitation` ADD `inviter_id` integer NOT NULL REFERENCES user(id);