/// <reference types="vite/client" />
import { createClient } from '@supabase/supabase-js';

const fallbackUrl = 'https://zmgtllzebsgfolgytznp.supabase.co';
const fallbackKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InptZ3RsbHplYnNnZm9sZ3l0em5wIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA3MzA2NjIsImV4cCI6MjA5NjMwNjY2Mn0.IASgbwvZJtEYaL2qdKd7rBbNwUfFOji9ZpGYkF7_Gz4';

let envUrl = import.meta.env.VITE_SUPABASE_URL || fallbackUrl;
let envKey = import.meta.env.VITE_SUPABASE_ANON_KEY || fallbackKey;

// Clean up URL
let supabaseUrl = envUrl.trim();

// If it's just the project ID, format it
if (supabaseUrl === 'zmgtllzebsgfolgytznp' || !supabaseUrl.startsWith('http')) {
  supabaseUrl = `https://${supabaseUrl.replace('https://', '')}.supabase.co`;
}

// Strip invalid trailing paths like /rest/v1 or /rest/v1/
supabaseUrl = supabaseUrl.replace(/\/+$/, '');
if (supabaseUrl.endsWith('/rest/v1')) {
  supabaseUrl = supabaseUrl.substring(0, supabaseUrl.length - 8);
}
// Strip again in case they had /rest/v1/ with a slash
supabaseUrl = supabaseUrl.replace(/\/+$/, '');

// Clean up key
let supabaseAnonKey = envKey.trim();
if (!supabaseAnonKey || supabaseAnonKey.length < 20) {
    supabaseAnonKey = fallbackKey;
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
