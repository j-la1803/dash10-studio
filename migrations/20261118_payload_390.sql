-- Payload 3.87.1 -> 3.90.0: the only difference in this project's offline adapter schemas.
-- Nullable, no default, no data rewrite. Intentionally no destructive down migration.
ALTER TABLE public.users
  ADD COLUMN IF NOT EXISTS reset_password_requested_at timestamp(3) with time zone;
