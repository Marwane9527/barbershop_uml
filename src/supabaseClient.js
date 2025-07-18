import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://mxragqdhdgqfkwkenlka.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im14cmFncWRoZGdxZmt3a2VubGthIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI1OTkwNDMsImV4cCI6MjA2ODE3NTA0M30.JziujEK4tniLwOe_78APlfJGVWosnJdlQVb8DpDX6_U";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
