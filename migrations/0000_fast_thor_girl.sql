CREATE TABLE "screenshots" (
	"id" serial PRIMARY KEY NOT NULL,
	"summary_id" integer NOT NULL,
	"image_url" text NOT NULL,
	"timestamp" integer NOT NULL,
	"description" text DEFAULT '' NOT NULL
);
--> statement-breakpoint
CREATE TABLE "summaries" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer,
	"video_id" text NOT NULL,
	"video_url" text NOT NULL,
	"video_title" text NOT NULL,
	"video_author" text NOT NULL,
	"video_duration" integer DEFAULT 0 NOT NULL,
	"key_points" text[] DEFAULT '{}' NOT NULL,
	"summary" text NOT NULL,
	"structured_outline" jsonb NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"username" text NOT NULL,
	"password" text NOT NULL,
	"is_admin" boolean DEFAULT false NOT NULL,
	"invitation_token" text,
	"token_expiry" timestamp,
	"is_password_change_required" boolean DEFAULT false NOT NULL,
	CONSTRAINT "users_username_unique" UNIQUE("username")
);
