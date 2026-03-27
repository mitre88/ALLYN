import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

export const dynamic = 'force-dynamic'

// Creates the DB trigger for auto-creating profiles on signup
// POST /api/setup-db with { secret }
export async function POST(req: NextRequest) {
  const { secret } = await req.json()
  if (secret !== process.env.SETUP_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
  }

  const supabase = createAdminClient()

  // Create the trigger function + trigger via rpc (requires service role)
  const sql = `
    -- Function to handle new user signup
    CREATE OR REPLACE FUNCTION public.handle_new_user()
    RETURNS trigger
    LANGUAGE plpgsql
    SECURITY DEFINER SET search_path = public
    AS $$
    BEGIN
      INSERT INTO public.profiles (id, email, full_name, username, role, is_subscribed, affiliate_code)
      VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
        COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1)),
        COALESCE(NEW.raw_user_meta_data->>'role', 'user'),
        false,
        substr(md5(NEW.id::text), 1, 8)
      )
      ON CONFLICT (id) DO NOTHING;
      RETURN NEW;
    END;
    $$;

    -- Drop existing trigger if any
    DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

    -- Create trigger
    CREATE TRIGGER on_auth_user_created
      AFTER INSERT ON auth.users
      FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
  `

  const { error } = await supabase.rpc('exec_sql', { sql_query: sql }).single()

  // exec_sql may not exist, try direct approach
  if (error) {
    // Fallback: try pg_meta style
    return NextResponse.json({
      warning: 'Could not create trigger via RPC. Apply manually in Supabase SQL Editor.',
      sql: sql.trim(),
      error: error.message
    }, { status: 200 })
  }

  return NextResponse.json({ success: true, message: 'Trigger created successfully' })
}
