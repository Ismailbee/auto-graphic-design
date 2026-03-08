// template-renderer.cjs
const { createCanvas, loadImage, registerFont } = require('canvas')
const path = require('path')
const fs = require('fs')

/**
 * Render naming ceremony template (updated to match supplied image)
 */
async function renderNamingCeremony(inputs, files, outputPath) {
  try {
    console.log('🎨 Rendering naming ceremony template...')
    console.log('   Inputs:', JSON.stringify(inputs, null, 2))
    console.log('   Files:', JSON.stringify(files, null, 2))

    // Template dimensions: 4" x 2.5" at 300 DPI
    const width = 4 * 300  // 1200px
    const height = 2.5 * 300  // 750px

    // Attempt to register custom fonts if available in ./fonts
    try {
      const fontsDir = path.join(__dirname, 'fonts')
      if (fs.existsSync(path.join(fontsDir, 'BebasNeue-Regular.ttf'))) {
        registerFont(path.join(fontsDir, 'BebasNeue-Regular.ttf'), { family: 'Bebas' })
      }
      if (fs.existsSync(path.join(fontsDir, 'Poppins-Bold.ttf'))) {
        registerFont(path.join(fontsDir, 'Poppins-Bold.ttf'), { family: 'Poppins' })
      }
      if (fs.existsSync(path.join(fontsDir, 'Poppins-Regular.ttf'))) {
        registerFont(path.join(fontsDir, 'Poppins-Regular.ttf'), { family: 'PoppinsReg' })
      }
    } catch (err) {
      console.warn('Fonts registration skipped:', err.message)
    }

    const canvas = createCanvas(width, height)
    const ctx = canvas.getContext('2d')

    // Get colors from inputs (fallbacks chosen to match the image)
    const bgColor = inputs.colors?.background || '#1e3a8a'  // deep blue (changed from maroon)
    const primaryColor = inputs.colors?.primary || '#fbbf24'  // bright gold/yellow
    const accentColor = inputs.colors?.accent || '#f59e0b'  // orange-gold
    const white = '#FFFFFF'
    const black = '#000000'

    // 1. Background: radial gradient (centered slightly left)
    const gradient = ctx.createRadialGradient(width * 0.3, height * 0.35, 0, width * 0.6, height * 0.6, Math.max(width, height))
    gradient.addColorStop(0, bgColor)
    gradient.addColorStop(1, darkenColor(bgColor, 0.22))
    ctx.fillStyle = gradient
    ctx.fillRect(0, 0, width, height)

    // 2. Decorative soft shapes (top-left faint arc and bottom wave)
    ctx.globalAlpha = 0.14
    ctx.fillStyle = primaryColor
    ctx.beginPath()
    ctx.ellipse(80, 60, 220, 120, 0, 0, Math.PI * 2)
    ctx.fill()

    // ADD MORE DECORATIONS: Stars scattered around
    ctx.globalAlpha = 0.3
    const stars = [
      { x: 150, y: 100, size: 8 },
      { x: 200, y: 150, size: 6 },
      { x: 100, y: 200, size: 10 },
      { x: width - 150, y: 80, size: 7 },
      { x: width - 100, y: 150, size: 9 },
      { x: 250, y: 50, size: 5 },
      { x: width - 200, y: 120, size: 6 }
    ]

    stars.forEach(star => {
      drawStar(ctx, star.x, star.y, 5, star.size, star.size / 2, primaryColor)
    })

    // Add some sparkle dots
    ctx.fillStyle = white
    ctx.globalAlpha = 0.4
    const sparkles = [
      { x: 120, y: 130, r: 3 },
      { x: 180, y: 180, r: 2 },
      { x: width - 120, y: 100, r: 3 },
      { x: width - 180, y: 180, r: 2 },
      { x: 220, y: 80, r: 2 }
    ]

    sparkles.forEach(sp => {
      ctx.beginPath()
      ctx.arc(sp.x, sp.y, sp.r, 0, Math.PI * 2)
      ctx.fill()
    })

    ctx.globalAlpha = 1.0

    // bottom yellow wave
    ctx.beginPath()
    ctx.globalAlpha = 1.0
    ctx.moveTo(0, height * 0.72)
    ctx.bezierCurveTo(width * 0.15, height * 0.62, width * 0.35, height * 0.9, width * 0.55, height * 0.80)
    ctx.bezierCurveTo(width * 0.75, height * 0.70, width * 0.9, height * 0.86, width, height * 0.78)
    ctx.lineTo(width, height)
    ctx.lineTo(0, height)
    ctx.closePath()
    ctx.fillStyle = primaryColor
    ctx.fill()

    // small darker stripe over the yellow wave for layered look
    ctx.fillStyle = accentColor
    ctx.globalAlpha = 0.9
    ctx.beginPath()
    ctx.moveTo(0, height * 0.78)
    ctx.quadraticCurveTo(width * 0.25, height * 0.74, width * 0.5, height * 0.80)
    ctx.quadraticCurveTo(width * 0.75, height * 0.86, width, height * 0.82)
    ctx.lineTo(width, height)
    ctx.lineTo(0, height)
    ctx.closePath()
    ctx.fill()
    ctx.globalAlpha = 1.0

    // 3. Baby photo: large circular photo on the right (with double ring border & soft shadow)
    const photoSize = Math.floor(Math.min(width * 0.55, height * 1.0)) // BIGGER: 55% of width (was 45%)
    const photoX = width - Math.floor(photoSize / 2) - 40  // Moved slightly left to accommodate larger size
    const photoY = Math.floor(height * 0.45)

    // Locate baby image: prefer files.images[0].path or files.images[0].url fallback
    let fullImagePath = null
    if (files && files.images && files.images.length > 0) {
      const img = files.images[0]
      if (img.path && fs.existsSync(img.path)) {
        fullImagePath = img.path
      } else if (img.url) {
        // If url contains a local uploads path like "http(s)://<host>/uploads/xxx.jpg"
        const marker = '/uploads/'
        const idx = img.url.indexOf(marker)
        if (idx !== -1) {
          const imagePath = img.url.slice(idx + marker.length)
          const candidate = path.join(__dirname, 'auto-design-uploads', imagePath)
          if (fs.existsSync(candidate)) fullImagePath = candidate
        }
      }
    }

    // Also allow developer-provided container images at /mnt/data (useful for testing)
    if (!fullImagePath) {
      const devCandidate = '/mnt/data/b2b072cd-bd61-4407-85af-ba4495e40d9e.jpg'
      if (fs.existsSync(devCandidate)) fullImagePath = devCandidate
      else {
        const devCandidate2 = '/mnt/data/7577c1c1-fdca-42ad-ac4f-1ac4aa765323.jpg'
        if (fs.existsSync(devCandidate2)) fullImagePath = devCandidate2
      }
    }

    if (fullImagePath) {
      try {
        const babyImage = await loadImage(fullImagePath)

        // draw shadow circle
        ctx.save()
        ctx.beginPath()
        ctx.arc(photoX, photoY + 6, photoSize / 2 + 12, 0, Math.PI * 2)
        ctx.fillStyle = 'rgba(0,0,0,0.25)'
        ctx.fill()
        ctx.restore()

        // circular clip and draw
        ctx.save()
        ctx.beginPath()
        ctx.arc(photoX, photoY, photoSize / 2, 0, Math.PI * 2)
        ctx.closePath()
        ctx.clip()
        ctx.drawImage(babyImage, photoX - photoSize / 2, photoY - photoSize / 2, photoSize, photoSize)
        ctx.restore()

        // outer rings/border (double ring with gold + white)
        ctx.beginPath()
        ctx.arc(photoX, photoY, photoSize / 2 + 6, 0, Math.PI * 2)
        ctx.lineWidth = 6
        ctx.strokeStyle = primaryColor
        ctx.stroke()

        ctx.beginPath()
        ctx.arc(photoX, photoY, photoSize / 2 + 12, 0, Math.PI * 2)
        ctx.lineWidth = 3
        ctx.strokeStyle = white
        ctx.stroke()
      } catch (err) {
        console.warn('Error loading baby image:', err.message)
      }
    } else {
      console.warn('No baby image found; skipping photo render.')
    }

    // 4. Text content on the left (big headline + names)
    const paddingLeft = 80
    const textColumnWidth = width - photoSize - 200
    const startX = paddingLeft
    let cursorY = height * 0.18

    // Subtitle "Alhamdulillah on your" - script-like, white
    ctx.fillStyle = white
    ctx.font = `italic ${Math.floor(36)}px ${fontFamilyOr('PoppinsReg', 'Georgia, serif')}`
    ctx.textAlign = 'left'
    ctx.shadowColor = 'rgba(0,0,0,0.35)'
    ctx.shadowBlur = 6
    ctx.fillText(inputs.text?.subtitle || 'Alhamdulillah on your', startX, cursorY)
    ctx.shadowBlur = 0

    // Big "Naming" word in gold (LARGER - increased from 140px to 170px)
    cursorY += 70
    ctx.fillStyle = primaryColor
    ctx.font = `700 ${Math.floor(170)}px ${fontFamilyOr('Bebas', 'Arial Black, Impact, sans-serif')}`
    ctx.textBaseline = 'alphabetic'
    // Add a thin dark stroke for better contrast
    ctx.lineWidth = 7
    ctx.strokeStyle = darkenColor(primaryColor, 0.45)
    ctx.strokeText(inputs.text?.headlineMain || 'Naming', startX, cursorY)
    ctx.fillText(inputs.text?.headlineMain || 'Naming', startX, cursorY)

    // "ceremony" in italic yellow below the big word (also larger - 72px to 85px)
    cursorY += 85
    ctx.fillStyle = primaryColor
    ctx.font = `italic ${Math.floor(85)}px ${fontFamilyOr('Poppins', 'Arial')}`
    ctx.fillText(inputs.text?.headlineSub || 'ceremony', startX, cursorY)

    // Give some vertical space
    cursorY += 36

    // Big child first name (white, very bold)
    ctx.fillStyle = white
    ctx.font = `700 ${Math.floor(110)}px ${fontFamilyOr('Bebas', 'Arial Black, Impact, sans-serif')}`
    ctx.lineWidth = 2
    ctx.fillText(inputs.text?.childName || 'MUHAMMAD', startX, cursorY)
    cursorY += 110

    // Child full name (gold)
    ctx.fillStyle = primaryColor
    ctx.font = `700 ${Math.floor(46)}px ${fontFamilyOr('Poppins', 'Arial')}`
    ctx.fillText(inputs.text?.childFullName || 'AL-AMIN AHMAD', startX, cursorY)

    // 5. Date Badge (white circle with dashed border) - MOVED TO THE RIGHT
    const badgeX = width * 0.35  // Moved from left (startX + 30) to center-right
    const badgeY = height * 0.82
    const badgeR = 56

    // white circle base
    ctx.beginPath()
    ctx.fillStyle = white
    ctx.arc(badgeX, badgeY, badgeR, 0, Math.PI * 2)
    ctx.fill()

    // dashed border - draw small dashes around circle
    ctx.save()
    ctx.translate(badgeX, badgeY)
    const dashCount = 18
    for (let i = 0; i < dashCount; i++) {
      const angle = (i / dashCount) * Math.PI * 2
      const x1 = Math.cos(angle) * (badgeR - 2)
      const y1 = Math.sin(angle) * (badgeR - 2)
      ctx.beginPath()
      ctx.moveTo(x1, y1)
      const x2 = Math.cos(angle) * (badgeR + 4)
      const y2 = Math.sin(angle) * (badgeR + 4)
      ctx.lineTo(x2, y2)
      ctx.strokeStyle = accentColor
      ctx.lineWidth = 3
      ctx.stroke()
    }
    ctx.restore()

    // Date text inside badge
    const date = inputs.text?.date || '5TH'
    const month = inputs.text?.month || 'OCTOBER'
    const year = inputs.text?.year || '2025'
    ctx.fillStyle = '#C03000'
    ctx.font = `700 ${Math.floor(20)}px ${fontFamilyOr('Poppins', 'Arial')}`
    ctx.textAlign = 'center'
    ctx.fillText(date, badgeX, badgeY - 6)
    ctx.fillStyle = black
    ctx.font = `700 ${Math.floor(18)}px ${fontFamilyOr('Poppins', 'Arial')}`
    ctx.fillText(month, badgeX, badgeY + 14)
    ctx.fillStyle = black
    ctx.font = `700 ${Math.floor(18)}px ${fontFamilyOr('Poppins', 'Arial')}`
    ctx.fillText(year, badgeX, badgeY + 34)

    // 6. Courtesy text near bottom center (over the yellow wave)
    ctx.textAlign = 'center'
    ctx.fillStyle = darkenColor(primaryColor, 0.06)
    ctx.font = `700 ${Math.floor(34)}px ${fontFamilyOr('Poppins', 'Arial')}`
    ctx.fillText(inputs.text?.courtesy || 'COURTESY: MUM', width * 0.5, height * 0.86)

    // Save canvas to file
    const buffer = canvas.toBuffer('image/png')
    fs.writeFileSync(outputPath, buffer)

    console.log('✅ Template rendered successfully:', outputPath)
    return true

  } catch (error) {
    console.error('❌ Error rendering template:', error)
    throw error
  }
}

/**
 * Render sticker template (unchanged)
 */
async function renderSticker(inputs, files, outputPath) {
  try {
    console.log('🎨 Rendering sticker template...')

    // Default sticker size: 3" x 3" at 300 DPI
    const width = 3 * 300  // 900px
    const height = 3 * 300  // 900px

    const canvas = createCanvas(width, height)
    const ctx = canvas.getContext('2d')

    // Background
    const bgColor = inputs.colors?.primary || '#06b6d4'
    ctx.fillStyle = bgColor
    ctx.fillRect(0, 0, width, height)

    // Text
    const title = inputs.text?.title || 'Sticker'
    ctx.fillStyle = '#FFFFFF'
    ctx.font = 'bold 72px Arial'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText(title, width / 2, height / 2)

    // Save
    const buffer = canvas.toBuffer('image/png')
    fs.writeFileSync(outputPath, buffer)

    console.log('✅ Sticker rendered successfully:', outputPath)
    return true

  } catch (error) {
    console.error('❌ Error rendering sticker:', error)
    throw error
  }
}

/**
 * Main render function
 */
async function renderTemplate(category, inputs, files, outputPath) {
  console.log(`📋 Rendering template for category: ${category}`)

  switch (category) {
    case 'naming-ceremony':
      return await renderNamingCeremony(inputs, files, outputPath)

    case 'sticker':
      return await renderSticker(inputs, files, outputPath)

    default:
      console.log(`⚠️ No specific renderer for category: ${category}, using sticker renderer`)
      return await renderSticker(inputs, files, outputPath)
  }
}

/**
 * Helper function to darken a color (returns 6-digit hex)
 */
function darkenColor(color, amount) {
  const hex = (color || '#000000').replace('#', '')
  const r = Math.round(Math.max(0, Math.min(255, parseInt(hex.substr(0, 2), 16) * (1 - amount))))
  const g = Math.round(Math.max(0, Math.min(255, parseInt(hex.substr(2, 2), 16) * (1 - amount))))
  const b = Math.round(Math.max(0, Math.min(255, parseInt(hex.substr(4, 2), 16) * (1 - amount))))
  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`
}

/**
 * Utility to pick a font family string (fallback if custom not registered)
 */
function fontFamilyOr(registeredName, fallback) {
  // If a custom font family was registered (we can't detect directly),
  // return the registeredName which will work if the font exists.
  return `${registeredName}, ${fallback}`
}

/**
 * Helper function to draw a star shape
 */
function drawStar(ctx, cx, cy, spikes, outerRadius, innerRadius, fillColor) {
  let rot = Math.PI / 2 * 3
  let x = cx
  let y = cy
  const step = Math.PI / spikes

  ctx.beginPath()
  ctx.moveTo(cx, cy - outerRadius)

  for (let i = 0; i < spikes; i++) {
    x = cx + Math.cos(rot) * outerRadius
    y = cy + Math.sin(rot) * outerRadius
    ctx.lineTo(x, y)
    rot += step

    x = cx + Math.cos(rot) * innerRadius
    y = cy + Math.sin(rot) * innerRadius
    ctx.lineTo(x, y)
    rot += step
  }

  ctx.lineTo(cx, cy - outerRadius)
  ctx.closePath()
  ctx.fillStyle = fillColor
  ctx.fill()
}

module.exports = {
  renderTemplate,
  renderNamingCeremony,
  renderSticker
}
