#!/usr/bin/env node

import { spawn } from 'child_process'
import * as fs from 'fs'
import * as path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const reportsDir = path.join(__dirname, '..', 'reports')
const screenshotsDir = path.join(__dirname, '..', 'screenshots')

// Create directories if they don't exist
[reportsDir, screenshotsDir].forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true })
  }
})

console.log('🧪 SmartDesignPro - Comprehensive Testing Suite')
console.log('═'.repeat(60))
console.log(`📁 Reports Directory: ${reportsDir}`)
console.log(`📸 Screenshots Directory: ${screenshotsDir}`)
console.log('═'.repeat(60))

function runCommand(command, args, description) {
  return new Promise((resolve, reject) => {
    console.log(`\n▶️  ${description}...`)
    console.log(`   Command: ${command} ${args.join(' ')}`)
    console.log('─'.repeat(60))

    const process = spawn(command, args, {
      stdio: 'inherit',
      shell: true,
    })

    process.on('close', code => {
      if (code === 0) {
        console.log(`✅ ${description} completed successfully`)
        resolve()
      } else {
        console.error(`❌ ${description} failed with code ${code}`)
        reject(new Error(`${description} failed`))
      }
    })

    process.on('error', error => {
      console.error(`❌ Error running ${description}:`, error)
      reject(error)
    })
  })
}

async function runAllTests() {
  try {
    // Step 1: Run Playwright tests
    await runCommand('npx', ['playwright', 'test', '--reporter=html', '--reporter=json'], 
      'Step 1: Running Playwright Responsiveness Tests')

    // Step 2: Run Lighthouse audit
    await runCommand('node', ['scripts/run-lighthouse.js'], 
      'Step 2: Running Lighthouse Performance Audit')

    // Step 3: Generate combined report
    console.log('\n▶️  Step 3: Generating Combined Test Report...')
    console.log('─'.repeat(60))
    generateCombinedReport()

    console.log('\n' + '═'.repeat(60))
    console.log('✨ All tests completed successfully!')
    console.log('═'.repeat(60))
    console.log('\n📊 Test Results Summary:')
    console.log(`  📸 Screenshots: ${screenshotsDir}`)
    console.log(`  📄 Playwright Report: playwright-report/index.html`)
    console.log(`  📊 Lighthouse Report: ${path.join(reportsDir, 'lighthouse-report.html')}`)
    console.log(`  📋 Combined Report: ${path.join(reportsDir, 'combined-test-report.md')}`)
    console.log('═'.repeat(60))

  } catch (error) {
    console.error('\n❌ Test suite failed:', error.message)
    process.exit(1)
  }
}

function generateCombinedReport() {
  const reportPath = path.join(reportsDir, 'combined-test-report.md')
  
  let report = `# SmartDesignPro - Combined Test Report\n\n`
  report += `Generated: ${new Date().toLocaleString()}\n\n`

  // Playwright Results
  report += `## 📱 Playwright Responsiveness Tests\n\n`
  report += `### Test Coverage\n`
  report += `- ✅ Mobile (375×667)\n`
  report += `- ✅ Tablet (768×1024)\n`
  report += `- ✅ Desktop (1440×900)\n\n`

  report += `### Screenshots\n`
  if (fs.existsSync(screenshotsDir)) {
    const screenshots = fs.readdirSync(screenshotsDir)
    if (screenshots.length > 0) {
      screenshots.forEach(file => {
        report += `- \`${file}\`\n`
      })
    } else {
      report += `- No screenshots generated\n`
    }
  }
  report += `\n`

  // Lighthouse Results
  report += `## 🚀 Lighthouse Performance Audit\n\n`
  const lighthouseJsonPath = path.join(reportsDir, 'lighthouse-report.json')
  if (fs.existsSync(lighthouseJsonPath)) {
    try {
      const lighthouseData = JSON.parse(fs.readFileSync(lighthouseJsonPath, 'utf-8'))
      const scores = lighthouseData.categories

      report += `### Performance Scores\n\n`
      report += `| Category | Score | Status |\n`
      report += `|----------|-------|--------|\n`

      Object.entries(scores).forEach(([category, data]) => {
        const score = Math.round(data.score * 100)
        const status = score >= 90 ? '✅ Excellent' : score >= 50 ? '⚠️ Needs Work' : '❌ Poor'
        report += `| ${category.charAt(0).toUpperCase() + category.slice(1)} | ${score}/100 | ${status} |\n`
      })

      report += `\n### Key Metrics\n\n`
      const audits = lighthouseData.audits
      if (audits['largest-contentful-paint']) {
        report += `- **Largest Contentful Paint**: ${audits['largest-contentful-paint'].displayValue}\n`
      }
      if (audits['cumulative-layout-shift']) {
        report += `- **Cumulative Layout Shift**: ${audits['cumulative-layout-shift'].displayValue}\n`
      }
      if (audits['first-input-delay']) {
        report += `- **First Input Delay**: ${audits['first-input-delay'].displayValue}\n`
      }
    } catch (error) {
      report += `Error reading Lighthouse report: ${error.message}\n`
    }
  }

  report += `\n## 📋 Recommendations\n\n`
  report += `1. Review Playwright test results for layout issues\n`
  report += `2. Check Lighthouse report for performance improvements\n`
  report += `3. Verify all screenshots for visual consistency\n`
  report += `4. Address any accessibility issues found\n\n`

  report += `---\n`
  report += `*Report generated by SmartDesignPro Testing Suite*\n`

  fs.writeFileSync(reportPath, report)
  console.log(`✅ Combined report saved: ${reportPath}`)
}

// Run all tests
runAllTests()

