import { createClient } from '@supabase/supabase-js';

const URL = 'https://zmgtllzebsgfolgytznp.supabase.co';
const KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InptZ3RsbHplYnNnZm9sZ3l0em5wIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA3MzA2NjIsImV4cCI6MjA5NjMwNjY2Mn0.IASgbwvZJtEYaL2qdKd7rBbNwUfFOji9ZpGYkF7_Gz4';

async function testConnection() {
  console.log("Using URL:", URL);
  const supabase = createClient(URL, KEY);
  
  const res = await fetch(`${URL}/rest/v1/`, { headers: { apikey: KEY, Authorization: `Bearer ${KEY}` } });
  console.log("Raw Fetch Status:", res.status);
  const text = await res.text();
  console.log("Raw Fetch text:", text);
  
  const { data, error } = await supabase.from('user_cloud_state').select('*').limit(1);
  if (error) {
    console.log("Error querying:", error.message);
  } else {
    console.log("Connection successful! Data:", data);
  }
}
testConnection().catch(console.error);
