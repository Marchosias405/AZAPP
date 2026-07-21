import "server-only";

import {
  createClient,
  type SupabaseClient,
} from "@supabase/supabase-js";

import type { Database } from "@/lib/supabase/database.types";

let serverAdminClient: SupabaseClient<Database> | null = null;

function getServerSupabaseConfig(): {
  url: string;
  key: string;
} {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key =
    process.env.SUPABASE_SECRET_KEY ??
    process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url) {
    throw new Error(
      "NEXT_PUBLIC_SUPABASE_URL is missing. Add it to your server environment variables.",
    );
  }

  if (!key) {
    throw new Error(
      "A Supabase server secret is missing. Add SUPABASE_SECRET_KEY or SUPABASE_SERVICE_ROLE_KEY.",
    );
  }

  return {
    url,
    key,
  };
}

export function getSupabaseServerAdminClient(): SupabaseClient<Database> {
  if (serverAdminClient) {
    return serverAdminClient;
  }

  const { url, key } = getServerSupabaseConfig();

  serverAdminClient = createClient<Database>(url, key, {
    auth: {
      autoRefreshToken: false,
      detectSessionInUrl: false,
      persistSession: false,
    },
  });

  return serverAdminClient;
}