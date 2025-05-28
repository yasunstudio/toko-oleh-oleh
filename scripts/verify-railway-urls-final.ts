#!/usr/bin/env npx tsx

/**
 * Final Railway URL Verification Script
 * Memastikan semua URL Railway sudah konsisten dan menggunakan domain yang benar
 */

import { execSync } from 'child_process'
import { readFileSync, readdirSync, statSync } from 'fs'
import { join } from 'path'

const CORRECT_RAILWAY_URL = 'https://oleh-oleh-production-ce0f.up.railway.app'
const CORRECT_DOMAIN = 'oleh-oleh-production-ce0f.up.railway.app'

const INCORRECT_URLS = [
  'https://oleh-oleh-production.up.railway.app',
  'https://toko-service-production.up.railway.app', 
  'https://scintillating-courage-production-6c8e.up.railway.app',
  'https://your-railway-domain.railway.app',
  'https://your-app-name.railway.app'
]

interface UrlCheck {
  file: string
  line: number
  content: string
  isCorrect: boolean
  url: string
}

function getAllFiles(dir: string, extension: string[] = ['.ts', '.tsx', '.js', '.jsx', '.md', '.env', '.sh']): string[] {
  const files: string[] = []
  
  function traverse(currentDir: string) {
    const items = readdirSync(currentDir)
    
    for (const item of items) {
      const fullPath = join(currentDir, item)
      const stat = statSync(fullPath)
      
      if (stat.isDirectory()) {
        // Skip node_modules and .git directories
        if (!['node_modules', '.git', '.next', 'dist', 'build'].includes(item)) {
          traverse(fullPath)
        }
      } else {
        const hasValidExtension = extension.some(ext => item.endsWith(ext)) || item.startsWith('.env')
        if (hasValidExtension) {
          files.push(fullPath)
        }
      }
    }
  }
  
  traverse(dir)
  return files
}

function checkFileForUrls(filePath: string): UrlCheck[] {
  try {
    const content = readFileSync(filePath, 'utf-8')
    const lines = content.split('\n')
    const results: UrlCheck[] = []
    
    lines.forEach((line, index) => {
      // Look for any railway.app URLs
      const railwayRegex = /https?:\/\/[^\s"']+railway\.app[^\s"']*/g
      const matches = line.match(railwayRegex)
      
      if (matches) {
        matches.forEach(url => {
          // Skip documentation URLs and placeholder URLs
          if (url.includes('docs.railway.app') || 
              url.includes('[your-domain]') ||
              url.includes('your-app-name') ||
              url.includes('your-railway-domain')) {
            return
          }
          
          const isCorrect = url.includes('ce0f')
          results.push({
            file: filePath,
            line: index + 1,
            content: line.trim(),
            isCorrect,
            url
          })
        })
      }
    })
    
    return results
  } catch (error) {
    console.warn(`Could not read file ${filePath}: ${error}`)
    return []
  }
}

async function main() {
  console.log('🔍 Final Railway URL Verification\n')
  console.log(`✅ Correct URL: ${CORRECT_RAILWAY_URL}`)
  console.log(`❌ Incorrect URLs to find: ${INCORRECT_URLS.join(', ')}\n`)
  
  const projectRoot = process.cwd()
  const allFiles = getAllFiles(projectRoot)
  
  console.log(`📁 Scanning ${allFiles.length} files...\n`)
  
  const allUrlChecks: UrlCheck[] = []
  
  for (const file of allFiles) {
    const checks = checkFileForUrls(file)
    allUrlChecks.push(...checks)
  }
  
  // Group by correctness
  const correctUrls = allUrlChecks.filter(check => check.isCorrect)
  const incorrectUrls = allUrlChecks.filter(check => !check.isCorrect)
  
  // Results
  console.log('📊 RESULTS:\n')
  
  console.log(`✅ Correct URLs found: ${correctUrls.length}`)
  if (correctUrls.length > 0) {
    const uniqueFiles = [...new Set(correctUrls.map(c => c.file.replace(projectRoot + '/', '')))]
    console.log(`   Files with correct URLs: ${uniqueFiles.length}`)
    uniqueFiles.forEach(file => {
      console.log(`   - ${file}`)
    })
  }
  
  console.log(`\n❌ Incorrect URLs found: ${incorrectUrls.length}`)
  if (incorrectUrls.length > 0) {
    incorrectUrls.forEach(check => {
      const relativePath = check.file.replace(projectRoot + '/', '')
      console.log(`   - ${relativePath}:${check.line}`)
      console.log(`     URL: ${check.url}`)
      console.log(`     Line: ${check.content}`)
      console.log('')
    })
  }
  
  // Summary
  console.log('\n📝 SUMMARY:')
  console.log(`Total Railway URLs found: ${allUrlChecks.length}`)
  console.log(`Correct URLs (with ce0f): ${correctUrls.length}`)
  console.log(`Incorrect URLs: ${incorrectUrls.length}`)
  
  if (incorrectUrls.length === 0) {
    console.log('\n🎉 SUCCESS: All Railway URLs are consistent!')
    console.log(`All URLs point to: ${CORRECT_RAILWAY_URL}`)
  } else {
    console.log('\n⚠️  WARNING: Found incorrect URLs that need to be fixed')
    process.exit(1)
  }
  
  // Final verification - test the correct URL
  console.log('\n🌐 Testing production URL...')
  try {
    const testResult = execSync(`curl -s -o /dev/null -w "%{http_code}" ${CORRECT_RAILWAY_URL}`, { encoding: 'utf-8' })
    if (testResult.trim() === '200') {
      console.log(`✅ Production URL is accessible: ${CORRECT_RAILWAY_URL}`)
    } else {
      console.log(`⚠️  Production URL returned status: ${testResult.trim()}`)
    }
  } catch (error) {
    console.log(`❌ Could not test production URL: ${error}`)
  }
}

main().catch(console.error)
