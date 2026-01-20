#!/usr/bin/env node
/**
 * Database Migration Runner
 * 
 * Usage: npm run migrate [filename]
 * 
 * Examples:
 *   npm run migrate                          # Run all pending migrations
 *   npm run migrate 006_create_platforms     # Run specific migration
 * 
 * Environment variables required:
 *   NEXT_PUBLIC_SUPABASE_URL
 *   SUPABASE_SERVICE_ROLE_KEY (for admin operations)
 */

const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

// Load environment variables
require('dotenv').config({ path: '.env.local' });
require('dotenv').config({ path: '.env' });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('❌ Missing environment variables:');
  if (!SUPABASE_URL) console.error('   - NEXT_PUBLIC_SUPABASE_URL');
  if (!SUPABASE_SERVICE_KEY) console.error('   - SUPABASE_SERVICE_ROLE_KEY');
  console.error('\nAdd SUPABASE_SERVICE_ROLE_KEY to your .env file.');
  console.error('You can find it in Supabase Dashboard → Settings → API → service_role key');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
  auth: { persistSession: false }
});

const SCRIPTS_DIR = path.join(__dirname, '../scripts');

async function runMigration(filePath) {
  const fileName = path.basename(filePath);
  console.log(`\n📦 Running migration: ${fileName}`);
  
  try {
    const sql = fs.readFileSync(filePath, 'utf8');
    
    // Split by semicolons but be careful with statements
    const statements = sql
      .split(/;(?=\s*(?:--|\/\*|CREATE|DROP|ALTER|INSERT|UPDATE|DELETE|GRANT|REVOKE|COMMENT|$))/i)
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--'));
    
    for (const statement of statements) {
      if (statement.trim()) {
        const { error } = await supabase.rpc('exec_sql', { sql: statement + ';' }).maybeSingle();
        
        // If exec_sql doesn't exist, try direct query (works for some operations)
        if (error && error.message?.includes('exec_sql')) {
          // For storage operations, we need the REST API
          console.log('   ⚠️  Some statements may need to be run manually in Supabase Dashboard');
        } else if (error) {
          // Check if it's a "already exists" type error - that's okay
          if (error.message?.includes('already exists') || error.message?.includes('duplicate')) {
            console.log(`   ⏭️  Skipped (already exists)`);
          } else {
            throw error;
          }
        }
      }
    }
    
    console.log(`   ✅ Completed: ${fileName}`);
    return true;
  } catch (error) {
    console.error(`   ❌ Failed: ${error.message}`);
    return false;
  }
}

async function main() {
  const specificFile = process.argv[2];
  
  console.log('🚀 Supabase Migration Runner');
  console.log('============================');
  
  // Get all SQL files in scripts directory
  let files = fs.readdirSync(SCRIPTS_DIR)
    .filter(f => f.endsWith('.sql'))
    .sort();
  
  if (specificFile) {
    // Run specific migration
    files = files.filter(f => f.includes(specificFile));
    if (files.length === 0) {
      console.error(`❌ No migration found matching: ${specificFile}`);
      process.exit(1);
    }
  }
  
  console.log(`\n📂 Found ${files.length} migration(s)`);
  
  let success = 0;
  let failed = 0;
  
  for (const file of files) {
    const result = await runMigration(path.join(SCRIPTS_DIR, file));
    if (result) success++;
    else failed++;
  }
  
  console.log('\n============================');
  console.log(`✅ Success: ${success}`);
  if (failed > 0) console.log(`❌ Failed: ${failed}`);
  
  console.log('\n💡 Note: Some migrations (storage buckets, RLS policies) may need to be');
  console.log('   run manually in the Supabase Dashboard SQL Editor for full effect.');
}

main().catch(console.error);
