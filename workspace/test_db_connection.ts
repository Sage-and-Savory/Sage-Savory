import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const URL = process.env.VITE_SUPABASE_URL || 'https://zmgtllzebsgfolgytznp.supabase.co';
const KEY = process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InptZ3RsbHplYnNnZm9sZ3l0em5wIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA3MzA2NjIsImV4cCI6MjA5NjMwNjY2Mn0.IASgbwvZJtEYaL2qdKd7rBbNwUfFOji9ZpGYkF7_Gz4';

async function testConnection() {
  const supabase = createClient(URL, KEY);
  const { data, error } = await supabase.from('user_cloud_state').select('*').limit(1);
  if (error) {
    console.log("Error:", error.message);
  } else {
    console.log("Connection successful! Data retrieved.");
  }
}
testConnection().catch(console.error);
