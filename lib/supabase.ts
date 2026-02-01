
import { createClient } from '@supabase/supabase-js';

// Project credentials provided for the Rarefindshq database
const PROJECT_URL = 'https://nebjsaqxxwzglbfotdeq.supabase.co';
const PROJECT_ANON_KEY = 'sb_publishable_nsgEuf5zrd5sTPmLf3pTcw_c6zaR-v5';

/**
 * Robustly retrieves environment variables, checking common injection points 
 * and falling back to the provided project defaults to ensure connectivity.
 */
const getEnvVar = (key: string): string => {
  const win = window as any;
  
  // Check process.env (Node-like environments)
  const processEnv = win.process?.env || {};
  // Check custom ENV objects (some sandboxes use this)
  const customEnv = win.ENV || {};
  
  const val = processEnv[key] || 
              processEnv[`NEXT_PUBLIC_${key}`] || 
              customEnv[key] || 
              customEnv[`NEXT_PUBLIC_${key}`];

  // Return the value if it looks valid and isn't a known placeholder
  if (val && val !== 'placeholder-anon-key' && val !== 'missing-key') {
    return val;
  }

  // Fallback to hardcoded project defaults
  if (key === 'SUPABASE_URL') return PROJECT_URL;
  if (key === 'SUPABASE_ANON_KEY') return PROJECT_ANON_KEY;

  return '';
};

const supabaseUrl = getEnvVar('SUPABASE_URL');
const supabaseAnonKey = getEnvVar('SUPABASE_ANON_KEY');

// Verify if the configuration is a valid URL and key
export const hasValidConfig = !!(supabaseUrl && supabaseUrl.startsWith('http') && supabaseAnonKey);

// Initialize Supabase client
// We use the derived credentials to ensure the app is always functional
export const supabase = createClient(
  hasValidConfig ? supabaseUrl : PROJECT_URL, 
  hasValidConfig ? supabaseAnonKey : PROJECT_ANON_KEY
);

if (!hasValidConfig) {
  console.info('Supabase initializing with fallback project credentials.');
}
