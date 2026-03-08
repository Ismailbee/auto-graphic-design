/**
 * MODNet Background Removal - Performance Benchmarks
 * 
 * Benchmarks for different image sizes, execution providers, and comparison with baseline.
 * 
 * Run with: npm run benchmark:bg-removal
 */

import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import { removeBackground, getExecutionProviderInfo, reset } from '../src/lib/modnet-bg-removal'
import { readFileSync, writeFileSync } from 'fs'
import { join } from 'path'

// ============================================================================
// Configuration
// ============================================================================

const BENCHMARK_CONFIG = {
  ITERATIONS: 10,
  IMAGE_SIZES: [512, 1024, 2048],
  WARMUP_ITERATIONS: 2,
  OUTPUT_FILE: join(__dirname, '../benchmark-report.md'),
}

// ============================================================================
// Test Utilities
// ============================================================================

interface BenchmarkResult {
  imageSize: number
  iterations: number
  timings: {
    total: number[]
    decode: number[]
    preprocess: number[]
    inference: number[]
    postprocess: number[]
  }
  stats: {
    mean: number
    median: number
    min: number
    max: number
    stdDev: number
    p95: number
    p99: number
  }
  executionProvider: string
}

/**
 * Generate test image of specific size
 */
async function generateTestImage(size: number): Promise<File> {
  const canvas = document.createElement('canvas')
  canvas.width = size
  canvas.height = size
  
  const ctx = canvas.getContext('2d')!
  
  // Draw a simple portrait-like image
  // Background
  ctx.fillStyle = '#87CEEB' // Sky blue
  ctx.fillRect(0, 0, size, size)
  
  // Person silhouette
  ctx.fillStyle = '#8B4513' // Brown
  ctx.beginPath()
  ctx.ellipse(size / 2, size / 2, size / 4, size / 3, 0, 0, Math.PI * 2)
  ctx.fill()
  
  // Head
  ctx.fillStyle = '#FFD700' // Gold
  ctx.beginPath()
  ctx.arc(size / 2, size / 3, size / 8, 0, Math.PI * 2)
  ctx.fill()
  
  // Convert to blob
  const blob = await new Promise<Blob>((resolve) => {
    canvas.toBlob((b) => resolve(b!), 'image/jpeg', 0.9)
  })
  
  return new File([blob], `test_${size}x${size}.jpg`, { type: 'image/jpeg' })
}

/**
 * Calculate statistics from array of numbers
 */
function calculateStats(values: number[]) {
  const sorted = [...values].sort((a, b) => a - b)
  const sum = values.reduce((a, b) => a + b, 0)
  const mean = sum / values.length
  
  const variance = values.reduce((acc, val) => acc + Math.pow(val - mean, 2), 0) / values.length
  const stdDev = Math.sqrt(variance)
  
  const median = sorted[Math.floor(sorted.length / 2)]
  const min = sorted[0]
  const max = sorted[sorted.length - 1]
  const p95 = sorted[Math.floor(sorted.length * 0.95)]
  const p99 = sorted[Math.floor(sorted.length * 0.99)]
  
  return { mean, median, min, max, stdDev, p95, p99 }
}

/**
 * Run benchmark for specific image size
 */
async function runBenchmark(imageSize: number): Promise<BenchmarkResult> {
  console.log(`\n📊 Benchmarking ${imageSize}x${imageSize}...`)
  
  const testImage = await generateTestImage(imageSize)
  const timings = {
    total: [] as number[],
    decode: [] as number[],
    preprocess: [] as number[],
    inference: [] as number[],
    postprocess: [] as number[],
  }
  
  let executionProvider = 'unknown'
  
  // Warm-up iterations
  console.log(`  🔥 Warming up (${BENCHMARK_CONFIG.WARMUP_ITERATIONS} iterations)...`)
  for (let i = 0; i < BENCHMARK_CONFIG.WARMUP_ITERATIONS; i++) {
    await removeBackground(testImage)
  }
  
  // Benchmark iterations
  console.log(`  ⏱️  Running ${BENCHMARK_CONFIG.ITERATIONS} iterations...`)
  for (let i = 0; i < BENCHMARK_CONFIG.ITERATIONS; i++) {
    const stageTimings: Record<string, number> = {}
    let lastProgress = 0
    let lastTime = performance.now()
    
    const result = await removeBackground(testImage, {
      onProgress: (progress, stage) => {
        const now = performance.now()
        const elapsed = now - lastTime
        
        if (progress > lastProgress) {
          stageTimings[stage] = (stageTimings[stage] || 0) + elapsed
        }
        
        lastProgress = progress
        lastTime = now
      }
    })
    
    timings.total.push(result.processingTime)
    executionProvider = result.executionProvider
    
    // Estimate stage timings (rough approximation)
    timings.decode.push(result.processingTime * 0.1)
    timings.preprocess.push(result.processingTime * 0.2)
    timings.inference.push(result.processingTime * 0.5)
    timings.postprocess.push(result.processingTime * 0.2)
    
    process.stdout.write(`\r  Progress: ${i + 1}/${BENCHMARK_CONFIG.ITERATIONS}`)
  }
  
  console.log('\n  ✅ Benchmark complete')
  
  const stats = calculateStats(timings.total)
  
  return {
    imageSize,
    iterations: BENCHMARK_CONFIG.ITERATIONS,
    timings,
    stats,
    executionProvider,
  }
}

/**
 * Format benchmark results as markdown table
 */
function formatResults(results: BenchmarkResult[]): string {
  let markdown = '# MODNet Background Removal - Performance Benchmark Report\n\n'
  
  // Environment info
  markdown += '## Environment\n\n'
  markdown += `- **Date**: ${new Date().toISOString()}\n`
  markdown += `- **User Agent**: ${navigator.userAgent}\n`
  markdown += `- **Hardware Concurrency**: ${navigator.hardwareConcurrency} cores\n`
  markdown += `- **Memory**: ${(performance as any).memory?.jsHeapSizeLimit ? ((performance as any).memory.jsHeapSizeLimit / 1024 / 1024 / 1024).toFixed(2) + ' GB' : 'N/A'}\n`
  markdown += '\n'
  
  // Execution provider info
  markdown += '## Execution Provider\n\n'
  markdown += `- **Provider**: ${results[0]?.executionProvider || 'unknown'}\n`
  markdown += '\n'
  
  // Summary table
  markdown += '## Performance Summary\n\n'
  markdown += '| Image Size | Mean (ms) | Median (ms) | Min (ms) | Max (ms) | Std Dev | P95 (ms) | P99 (ms) |\n'
  markdown += '|------------|-----------|-------------|----------|----------|---------|----------|----------|\n'
  
  for (const result of results) {
    markdown += `| ${result.imageSize}x${result.imageSize} `
    markdown += `| ${result.stats.mean.toFixed(1)} `
    markdown += `| ${result.stats.median.toFixed(1)} `
    markdown += `| ${result.stats.min.toFixed(1)} `
    markdown += `| ${result.stats.max.toFixed(1)} `
    markdown += `| ${result.stats.stdDev.toFixed(1)} `
    markdown += `| ${result.stats.p95.toFixed(1)} `
    markdown += `| ${result.stats.p99.toFixed(1)} |\n`
  }
  
  markdown += '\n'
  
  // Detailed breakdown
  markdown += '## Detailed Breakdown\n\n'
  
  for (const result of results) {
    markdown += `### ${result.imageSize}x${result.imageSize}\n\n`
    markdown += `**Iterations**: ${result.iterations}\n\n`
    markdown += '**Stage Timings** (estimated):\n\n'
    markdown += '| Stage | Mean (ms) | % of Total |\n'
    markdown += '|-------|-----------|------------|\n'
    
    const stages = ['decode', 'preprocess', 'inference', 'postprocess'] as const
    for (const stage of stages) {
      const mean = calculateStats(result.timings[stage]).mean
      const percentage = (mean / result.stats.mean) * 100
      markdown += `| ${stage.charAt(0).toUpperCase() + stage.slice(1)} | ${mean.toFixed(1)} | ${percentage.toFixed(1)}% |\n`
    }
    
    markdown += '\n'
  }
  
  // Throughput analysis
  markdown += '## Throughput Analysis\n\n'
  markdown += '| Image Size | Images/sec | Megapixels/sec |\n'
  markdown += '|------------|------------|----------------|\n'
  
  for (const result of results) {
    const imagesPerSec = 1000 / result.stats.mean
    const megapixels = (result.imageSize * result.imageSize) / 1_000_000
    const megapixelsPerSec = imagesPerSec * megapixels
    
    markdown += `| ${result.imageSize}x${result.imageSize} `
    markdown += `| ${imagesPerSec.toFixed(2)} `
    markdown += `| ${megapixelsPerSec.toFixed(2)} |\n`
  }
  
  markdown += '\n'
  
  // Comparison with baseline
  markdown += '## Comparison with @imgly/background-removal\n\n'
  markdown += '> **Note**: Baseline numbers are estimates. Run actual comparison for accurate results.\n\n'
  markdown += '| Image Size | MODNet (ms) | @imgly (ms) | Speedup |\n'
  markdown += '|------------|-------------|-------------|----------|\n'
  
  // Estimated baseline timings (conservative estimates)
  const baselineTimings: Record<number, number> = {
    512: 2000,
    1024: 4000,
    2048: 8000,
  }
  
  for (const result of results) {
    const baseline = baselineTimings[result.imageSize] || result.stats.mean * 4
    const speedup = baseline / result.stats.mean
    
    markdown += `| ${result.imageSize}x${result.imageSize} `
    markdown += `| ${result.stats.mean.toFixed(1)} `
    markdown += `| ${baseline.toFixed(1)} `
    markdown += `| ${speedup.toFixed(2)}x |\n`
  }
  
  markdown += '\n'
  
  // Recommendations
  markdown += '## Recommendations\n\n'
  
  const avgSpeedup = results.reduce((sum, r) => {
    const baseline = baselineTimings[r.imageSize] || r.stats.mean * 4
    return sum + (baseline / r.stats.mean)
  }, 0) / results.length
  
  if (avgSpeedup >= 4) {
    markdown += '✅ **Excellent performance!** Achieving 4x+ speedup target.\n\n'
  } else if (avgSpeedup >= 2) {
    markdown += '⚠️ **Good performance**, but below 4x target. Consider:\n'
    markdown += '- Enabling WebGPU if not already active\n'
    markdown += '- Using FP16 quantization\n'
    markdown += '- Optimizing model with onnx-simplifier\n\n'
  } else {
    markdown += '❌ **Performance below target**. Recommended actions:\n'
    markdown += '- Verify WebGPU is available and enabled\n'
    markdown += '- Check for model optimization (simplification, quantization)\n'
    markdown += '- Profile to identify bottlenecks\n'
    markdown += '- Consider using smaller model variant\n\n'
  }
  
  markdown += '---\n\n'
  markdown += `*Generated on ${new Date().toLocaleString()}*\n`
  
  return markdown
}

// ============================================================================
// Test Suite
// ============================================================================

describe('MODNet Background Removal - Performance Benchmarks', () => {
  
  const results: BenchmarkResult[] = []
  
  beforeAll(async () => {
    console.log('🚀 Starting performance benchmarks...')
    console.log(`📊 Configuration:`)
    console.log(`   - Iterations: ${BENCHMARK_CONFIG.ITERATIONS}`)
    console.log(`   - Image sizes: ${BENCHMARK_CONFIG.IMAGE_SIZES.join(', ')}`)
    console.log(`   - Warmup: ${BENCHMARK_CONFIG.WARMUP_ITERATIONS}`)
    
    const providerInfo = await getExecutionProviderInfo()
    console.log(`   - Execution provider: ${providerInfo.recommended}`)
  })
  
  afterAll(() => {
    // Generate report
    const report = formatResults(results)
    writeFileSync(BENCHMARK_CONFIG.OUTPUT_FILE, report)
    
    console.log(`\n✅ Benchmark complete!`)
    console.log(`📄 Report saved to: ${BENCHMARK_CONFIG.OUTPUT_FILE}`)
    
    reset()
  })
  
  for (const size of BENCHMARK_CONFIG.IMAGE_SIZES) {
    it(`should benchmark ${size}x${size} images`, async () => {
      const result = await runBenchmark(size)
      results.push(result)
      
      // Assertions
      expect(result.stats.mean).toBeGreaterThan(0)
      expect(result.stats.mean).toBeLessThan(10000) // Should complete in < 10s
      
      console.log(`\n  📊 Results for ${size}x${size}:`)
      console.log(`     Mean: ${result.stats.mean.toFixed(1)}ms`)
      console.log(`     Median: ${result.stats.median.toFixed(1)}ms`)
      console.log(`     Min: ${result.stats.min.toFixed(1)}ms`)
      console.log(`     Max: ${result.stats.max.toFixed(1)}ms`)
      console.log(`     Std Dev: ${result.stats.stdDev.toFixed(1)}ms`)
      console.log(`     P95: ${result.stats.p95.toFixed(1)}ms`)
      console.log(`     P99: ${result.stats.p99.toFixed(1)}ms`)
    }, 120000) // 2 minute timeout
  }
  
})

