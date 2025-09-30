import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { AppConfig } from "../config/env";

export type DatabaseClient = SupabaseClient;

export const createSupabaseClient = (config: AppConfig): DatabaseClient => {
  return createClient(config.supabase.url, config.supabase.serviceRoleKey ?? config.supabase.anonKey, {
    auth: { persistSession: false }
  });
};
