-- Admin profile data (auth.users only stores email/credentials, no display name)
CREATE TABLE public.profiles (
  id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  nama_lengkap character varying,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT profiles_pkey PRIMARY KEY (id)
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own profile"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

-- Auto-create a profiles row whenever an admin is provisioned via the Supabase dashboard
CREATE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
  -- 'nama_lengkap' covers admins created manually via the dashboard;
  -- 'full_name'/'name' cover the Google OAuth profile payload.
  INSERT INTO public.profiles (id, nama_lengkap)
  VALUES (
    new.id,
    COALESCE(
      new.raw_user_meta_data ->> 'nama_lengkap',
      new.raw_user_meta_data ->> 'full_name',
      new.raw_user_meta_data ->> 'name'
    )
  );
  RETURN new;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Publish/draft toggle for the public homepage and future admin CRUD
ALTER TABLE public.wisata ADD COLUMN published boolean NOT NULL DEFAULT true;
ALTER TABLE public.umkm ADD COLUMN published boolean NOT NULL DEFAULT true;
