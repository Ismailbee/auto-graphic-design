#!/usr/bin/env node

import lighthouse from 'lighthouse'
import * as fs from 'fs'
import * as path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const reportsDir = path.join(__dirname, '..', 'reports')

// Create reports directory if it doesn't exist
if (!fs.existsSync(reportsDir)) {
  fs.mkdirSync(reportsDir, { recursive: true })
}

const url = 'http://localhost:5174'

const options = {
  logLevel: 'info',
  output: 'json',
  onlyCategories: ['performance', 'accessibility', 'best-practices', 'seo'],
  port: 9222,
}

async function runLighthouse() {
  try {
    console.log(`🚀 Running Lighthouse audit on ${url}...`)
    console.log('⏳ This may take a minute...\n')

    const runnerResult = await lighthouse(url, options)

    if (!runnerResult) {
      throw new Error('Lighthouse audit failed - no result returned')
    }

    const reportJson = runnerResult.lhr
    const reportPath = path.join(reportsDir, 'lighthouse-report.json')
    const reportHtmlPath = path.join(reportsDir, 'lighthouse-report.html')

    // Save JSON report
    fs.writeFileSync(reportPath, JSON.stringify(reportJson, null, 2))
    console.log(`✅ JSON Report saved: ${reportPath}`)

    // Save HTML report
    const html = runnerResult.report[0]
    fs.writeFileSync(reportHtmlPath, html)
    console.log(`✅ HTML Report saved: ${reportHtmlPath}`)

    // Extract and display scores
    const scores = reportJson.categories
    console.log('\n📊 Lighthouse Scores:')
    console.log('═'.repeat(50))

    Object.entries(scores).forEach(([category, data]) => {
      const score = Math.round(data.score * 100)
      const status = score >= 90 ? '✅' : score >= 50 ? '⚠️' : '❌'
      console.log(`${status} ${category.charAt(0).toUpperCase() + category.slice(1)}: ${score}/100`)
    })

    console.log('═'.repeat(50))

    // Display main issues
    console.log('\n🔍 Key Findings:')
    const audits = reportJson.audits

    // Performance issues
    if (audits['largest-contentful-paint']) {
      console.log(`\n⏱️  Largest Contentful Paint: ${audits['largest-contentful-paint'].displayValue}`)
    }

    if (audits['cumulative-layout-shift']) {
      console.log(`📐 Cumulative Layout Shift: ${audits['cumulative-layout-shift'].displayValue}`)
    }

    if (audits['first-input-delay']) {
      console.log(`⚡ First Input Delay: ${audits['first-input-delay'].displayValue}`)
    }

    // Accessibility issues
    if (audits['color-contrast']) {
      const contrast = audits['color-contrast']
      if (contrast.score < 1) {
        console.log(`\n🎨 Color Contrast Issues: ${contrast.failureDescription}`)
      }
    }

    // Best practices
    if (audits['no-unload-listeners']) {
      const unload = audits['no-unload-listeners']
      if (unload.score < 1) {
        console.log(`\n⚠️  Unload Listeners Detected`)
      }
    }

    console.log('\n✨ Lighthouse audit complete!')
    console.log(`📄 View full report: ${reportHtmlPath}`)

    process.exit(0)
  } catch (error) {
    console.error('❌ Lighthouse audit failed:', error.message)
    process.exit(1)
  }
}

runLighthouse()

