ALTER TABLE "band_members" DROP CONSTRAINT "band_members_band_id_bands_id_fk";
--> statement-breakpoint
ALTER TABLE "band_members" DROP CONSTRAINT "band_members_user_id_users_id_fk";
--> statement-breakpoint
ALTER TABLE "bands" DROP CONSTRAINT "bands_user_id_users_id_fk";
--> statement-breakpoint
ALTER TABLE "classifieds" DROP CONSTRAINT "classifieds_user_id_users_id_fk";
--> statement-breakpoint
ALTER TABLE "contact_requests" DROP CONSTRAINT "contact_requests_requester_id_users_id_fk";
--> statement-breakpoint
ALTER TABLE "contact_requests" DROP CONSTRAINT "contact_requests_recipient_id_users_id_fk";
--> statement-breakpoint
ALTER TABLE "credentials" DROP CONSTRAINT "credentials_profile_id_volunteer_profiles_id_fk";
--> statement-breakpoint
ALTER TABLE "gig_managers" DROP CONSTRAINT "gig_managers_gig_id_gigs_id_fk";
--> statement-breakpoint
ALTER TABLE "gig_managers" DROP CONSTRAINT "gig_managers_user_id_users_id_fk";
--> statement-breakpoint
ALTER TABLE "gigs" DROP CONSTRAINT "gigs_creator_id_users_id_fk";
--> statement-breakpoint
ALTER TABLE "gigs" DROP CONSTRAINT "gigs_band_id_bands_id_fk";
--> statement-breakpoint
ALTER TABLE "gigs" DROP CONSTRAINT "gigs_musician_id_musician_profiles_id_fk";
--> statement-breakpoint
ALTER TABLE "marketplace_listings" DROP CONSTRAINT "marketplace_listings_user_id_users_id_fk";
--> statement-breakpoint
ALTER TABLE "messages" DROP CONSTRAINT "messages_sender_id_users_id_fk";
--> statement-breakpoint
ALTER TABLE "messages" DROP CONSTRAINT "messages_receiver_id_users_id_fk";
--> statement-breakpoint
ALTER TABLE "musician_profiles" DROP CONSTRAINT "musician_profiles_user_id_users_id_fk";
--> statement-breakpoint
ALTER TABLE "notifications" DROP CONSTRAINT "notifications_user_id_users_id_fk";
--> statement-breakpoint
ALTER TABLE "organisation_members" DROP CONSTRAINT "organisation_members_organisation_id_organisations_id_fk";
--> statement-breakpoint
ALTER TABLE "organisation_members" DROP CONSTRAINT "organisation_members_user_id_users_id_fk";
--> statement-breakpoint
ALTER TABLE "professional_profiles" DROP CONSTRAINT "professional_profiles_user_id_users_id_fk";
--> statement-breakpoint
ALTER TABLE "profile_skills" DROP CONSTRAINT "profile_skills_profile_id_volunteer_profiles_id_fk";
--> statement-breakpoint
ALTER TABLE "profile_skills" DROP CONSTRAINT "profile_skills_skill_id_skills_id_fk";
--> statement-breakpoint
ALTER TABLE "rate_limits" DROP CONSTRAINT "rate_limits_user_id_users_id_fk";
--> statement-breakpoint
ALTER TABLE "reports" DROP CONSTRAINT "reports_reporter_id_users_id_fk";
--> statement-breakpoint
ALTER TABLE "reviews" DROP CONSTRAINT "reviews_reviewer_id_users_id_fk";
--> statement-breakpoint
ALTER TABLE "sys_user_roles" DROP CONSTRAINT "sys_user_roles_user_id_users_id_fk";
--> statement-breakpoint
ALTER TABLE "user_apps" DROP CONSTRAINT "user_apps_user_id_users_id_fk";
--> statement-breakpoint
ALTER TABLE "user_apps" DROP CONSTRAINT "user_apps_app_id_apps_id_fk";
--> statement-breakpoint
ALTER TABLE "volunteer_applications" DROP CONSTRAINT "volunteer_applications_role_id_volunteer_roles_id_fk";
--> statement-breakpoint
ALTER TABLE "volunteer_applications" DROP CONSTRAINT "volunteer_applications_applicant_id_volunteer_profiles_id_fk";
--> statement-breakpoint
ALTER TABLE "volunteer_profiles" DROP CONSTRAINT "volunteer_profiles_user_id_users_id_fk";
--> statement-breakpoint
ALTER TABLE "volunteer_roles" DROP CONSTRAINT "volunteer_roles_organisation_id_organisations_id_fk";
--> statement-breakpoint
ALTER TABLE "band_members" ADD CONSTRAINT "band_members_band_id_bands_id_fk" FOREIGN KEY ("band_id") REFERENCES "public"."bands"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "band_members" ADD CONSTRAINT "band_members_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bands" ADD CONSTRAINT "bands_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "classifieds" ADD CONSTRAINT "classifieds_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "contact_requests" ADD CONSTRAINT "contact_requests_requester_id_users_id_fk" FOREIGN KEY ("requester_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "contact_requests" ADD CONSTRAINT "contact_requests_recipient_id_users_id_fk" FOREIGN KEY ("recipient_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "credentials" ADD CONSTRAINT "credentials_profile_id_volunteer_profiles_id_fk" FOREIGN KEY ("profile_id") REFERENCES "public"."volunteer_profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "gig_managers" ADD CONSTRAINT "gig_managers_gig_id_gigs_id_fk" FOREIGN KEY ("gig_id") REFERENCES "public"."gigs"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "gig_managers" ADD CONSTRAINT "gig_managers_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "gigs" ADD CONSTRAINT "gigs_creator_id_users_id_fk" FOREIGN KEY ("creator_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "gigs" ADD CONSTRAINT "gigs_band_id_bands_id_fk" FOREIGN KEY ("band_id") REFERENCES "public"."bands"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "gigs" ADD CONSTRAINT "gigs_musician_id_musician_profiles_id_fk" FOREIGN KEY ("musician_id") REFERENCES "public"."musician_profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "marketplace_listings" ADD CONSTRAINT "marketplace_listings_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "messages" ADD CONSTRAINT "messages_sender_id_users_id_fk" FOREIGN KEY ("sender_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "messages" ADD CONSTRAINT "messages_receiver_id_users_id_fk" FOREIGN KEY ("receiver_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "musician_profiles" ADD CONSTRAINT "musician_profiles_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "organisation_members" ADD CONSTRAINT "organisation_members_organisation_id_organisations_id_fk" FOREIGN KEY ("organisation_id") REFERENCES "public"."organisations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "organisation_members" ADD CONSTRAINT "organisation_members_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "professional_profiles" ADD CONSTRAINT "professional_profiles_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "profile_skills" ADD CONSTRAINT "profile_skills_profile_id_volunteer_profiles_id_fk" FOREIGN KEY ("profile_id") REFERENCES "public"."volunteer_profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "profile_skills" ADD CONSTRAINT "profile_skills_skill_id_skills_id_fk" FOREIGN KEY ("skill_id") REFERENCES "public"."skills"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "rate_limits" ADD CONSTRAINT "rate_limits_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reports" ADD CONSTRAINT "reports_reporter_id_users_id_fk" FOREIGN KEY ("reporter_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_reviewer_id_users_id_fk" FOREIGN KEY ("reviewer_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sys_user_roles" ADD CONSTRAINT "sys_user_roles_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_apps" ADD CONSTRAINT "user_apps_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_apps" ADD CONSTRAINT "user_apps_app_id_apps_id_fk" FOREIGN KEY ("app_id") REFERENCES "public"."apps"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "volunteer_applications" ADD CONSTRAINT "volunteer_applications_role_id_volunteer_roles_id_fk" FOREIGN KEY ("role_id") REFERENCES "public"."volunteer_roles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "volunteer_applications" ADD CONSTRAINT "volunteer_applications_applicant_id_volunteer_profiles_id_fk" FOREIGN KEY ("applicant_id") REFERENCES "public"."volunteer_profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "volunteer_profiles" ADD CONSTRAINT "volunteer_profiles_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "volunteer_roles" ADD CONSTRAINT "volunteer_roles_organisation_id_organisations_id_fk" FOREIGN KEY ("organisation_id") REFERENCES "public"."organisations"("id") ON DELETE cascade ON UPDATE no action;