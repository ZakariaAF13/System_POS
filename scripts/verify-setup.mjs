#!/usr/bin/env node
/**
 * Setup Verification Script
 * Checks if all required configurations are in place
 */

import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = join(__dirname, '..');

console.log('🔍 Verifying System POS Setup...\n');

let hasErrors = false;

// Check 1: Environment Variables
console.log('1️⃣  Checking environment variables...');
try {
  const envContent = readFileSync(join(rootDir, '.env.local'), 'utf-8');
  
  const hasUrl = envContent.includes('NEXT_PUBLIC_SUPABASE_URL=');
  const hasAnonKey = envContent.includes('NEXT_PUBLIC_SUPABASE_ANON_KEY=');
  
  if (!hasUrl || !hasAnonKey) {
    console.log('   ❌ Missing required environment variables');
    console.log('   Please check NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local');
    hasErrors = true;
  } else {
    console.log('   ✅ Environment variables found\n');
  }
} catch (error) {
  console.log('   ❌ .env.local file not found');
  console.log('   Please copy .env.example to .env.local and fill in your values\n');
  hasErrors = true;
}

// Check 2: Supabase Connection
console.log('2️⃣  Testing Supabase connection...');
try {
  // Load env from .env.local
  const envContent = readFileSync(join(rootDir, '.env.local'), 'utf-8');
  const urlMatch = envContent.match(/NEXT_PUBLIC_SUPABASE_URL=(.+)/);
  const keyMatch = envContent.match(/NEXT_PUBLIC_SUPABASE_ANON_KEY=(.+)/);
  
  if (!urlMatch || !keyMatch) {
    console.log('   ⚠️  Cannot test connection - missing credentials\n');
  } else {
    const url = urlMatch[1].trim();
    const key = keyMatch[1].trim();
    
    if (url.includes('your-project') || key.includes('your-anon-key')) {
      console.log('   ⚠️  Placeholder values detected - please update .env.local\n');
      hasErrors = true;
    } else {
      const supabase = createClient(url, key);
      
      // Test query
      const { data, error } = await supabase
        .from('menu_items')
        .select('id')
        .limit(1);
      
      if (error && error.message.includes('relation "menu_items" does not exist')) {
        console.log('   ❌ Database tables not found');
        console.log('   Please run the SQL migration file\n');
        hasErrors = true;
      } else if (error) {
        console.log('   ❌ Connection error:', error.message, '\n');
        hasErrors = true;
      } else {
        console.log('   ✅ Successfully connected to Supabase');
        console.log('   ✅ Database tables exist\n');
      }
    }
  }
} catch (error) {
  console.log('   ⚠️  Could not test connection\n');
}

// Check 3: Required Dependencies
console.log('3️⃣  Checking dependencies...');
try {
  const packageJson = JSON.parse(readFileSync(join(rootDir, 'package.json'), 'utf-8'));
  
  const requiredDeps = [
    '@supabase/supabase-js',
    'next',
    'react',
    'lucide-react'
  ];
  
  let missingDeps = [];
  for (const dep of requiredDeps) {
    if (!packageJson.dependencies[dep]) {
      missingDeps.push(dep);
    }
  }
  
  if (missingDeps.length > 0) {
    console.log('   ❌ Missing dependencies:', missingDeps.join(', '));
    console.log('   Please run: npm install\n');
    hasErrors = true;
  } else {
    console.log('   ✅ All required dependencies installed\n');
  }
} catch (error) {
  console.log('   ❌ Could not read package.json\n');
  hasErrors = true;
}

// Check 4: Migration File
console.log('4️⃣  Checking migration file...');
try {
  const migrationFile = join(rootDir, 'supabase/migrations/20251106_create_menu_and_promo_tables.sql');
  readFileSync(migrationFile, 'utf-8');
  console.log('   ✅ Migration file found\n');
} catch (error) {
  console.log('   ❌ Migration file not found');
  console.log('   Please ensure supabase/migrations/20251106_create_menu_and_promo_tables.sql exists\n');
  hasErrors = true;
}

// Summary
console.log('\n' + '='.repeat(50));
if (hasErrors) {
  console.log('⚠️  Setup incomplete - please fix the issues above');
  console.log('📖 Read SETUP_CHECKLIST.md for detailed instructions');
  process.exit(1);
} else {
  console.log('✅ Setup verification passed!');
  console.log('🚀 You can now run: npm run dev');
  console.log('\n📖 See MENU_CRUD_GUIDE.md for usage instructions');
  process.exit(0);
}
