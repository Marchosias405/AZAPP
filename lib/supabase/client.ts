import {
  createClient,
  type SupabaseClient,
} from "@supabase/supabase-js";

import type { Database } from "@/lib/supabase/database.types";

let browserClient: SupabaseClient<Database> | null = null;

function getBrowserSupabaseConfig(): {
  url: string;
  key: string;
} {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key =
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url) {
    throw new Error(
      "NEXT_PUBLIC_SUPABASE_URL is missing. Add it to your local environment variables.",
    );
  }

  if (!key) {
    throw new Error(
      "A Supabase publishable or anon key is missing. Add NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY or NEXT_PUBLIC_SUPABASE_ANON_KEY.",
    );
  }

  return {
    url,
    key,
  };
}

export function getSupabaseBrowserClient(): SupabaseClient<Database> {
  if (browserClient) {
    return browserClient;
  }

  const { url, key } = getBrowserSupabaseConfig();

  browserClient = createClient<Database>(url, key);

  return browserClient;
}