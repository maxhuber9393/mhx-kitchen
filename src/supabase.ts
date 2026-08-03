import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://tbdwwkzcfhhshdqnopva.supabase.co";

const supabaseKey = "sb_publishable_mrntXYnehCJBy5fDB6_04w_byGCmqmE";

export const supabase = createClient(
  supabaseUrl,
  supabaseKey
);