import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// Using untyped client for simplicity - types are handled in types/database.ts
export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Server-side client for server actions
export function createServerClient() {
  return createClient(supabaseUrl, supabaseAnonKey)
}
