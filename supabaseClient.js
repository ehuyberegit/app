const SUPABASE_URL = 'https://rlpqyzasvbkrnphjajhr.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJscHF5emFzdmJrcm5waGphamhyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ5MjEyMzAsImV4cCI6MjA4MDQ5NzIzMH0.iI-DDQPV0HTmZ7H2XqxZUAmCTRw7JgQp5kH9E0jdJ6w';

// Initialize Supabase client
const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
window.supabaseClient = supabaseClient;
