//>>>This File: handler_databaseClient.js<<<

// Declares Credentials & adds to variables
const supabaseUrl = 'https://ybewrjihzlcouulellpp.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InliZXdyamloemxjb3V1bGVsbHBwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUxOTkwMDUsImV4cCI6MjA3MDc3NTAwNX0.AcJmtRQ5WGzLwJ8N8mg7uY0HP3XOKwxzBqIp5yfyhWg';

// Creates Database Client Object and attaches it to the Window (global variable) so all Script files have access
window.supabase = supabase.createClient(supabaseUrl, supabaseKey);