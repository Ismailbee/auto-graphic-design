// useImageEditor.js - Canvas-based image adjustments and transforms
// Works with an HTMLImageElement or image data URL. Can update a Konva image object by replacing its image src

export function useImageEditor() {
  function loadImage(src) {
    return new Promise((resolve, reject) => {
      const img = new Image()
      img.crossOrigin = 'anonymous'
      img.onload = () => resolve(img)
      img.onerror = reject
      img.src = src
    })
  }

  function createCanvas(w, h) {
    const canvas = document.createElement('canvas')
    canvas.width = w
    canvas.height = h
    const ctx = canvas.getContext('2d')
    return { canvas, ctx }
  }

  function clamp01(v) { return Math.max(0, Math.min(1, v)) }

  // Build a CSS filter string from adjustments
  function buildFilter({
    brightness = 0, // -1..1 => 0..2 scale
    contrast = 0,   // -1..1 => 0..2 scale
    saturation = 0, // -1..1 => 0..2 scale
    hue = 0,        // deg -180..180
    blur = 0,       // px 0..20
    sepia = 0,      // 0..1
    grayscale = 0,  // 0..1
  } = {}) {
    const b = (brightness + 1)
    const c = (contrast + 1)
    const s = (saturation + 1)
    const filters = [
      `brightness(${b})`,
      `contrast(${c})`,
      `saturate(${s})`,
    ]
    if (hue) filters.push(`hue-rotate(${hue}deg)`) 
    if (blur) filters.push(`blur(${blur}px)`)
    if (sepia) filters.push(`sepia(${clamp01(sepia)})`)
    if (grayscale) filters.push(`grayscale(${clamp01(grayscale)})`)
    return filters.join(' ')
  }

  // Apply adjustments using ctx.filter for speed
  async function applyAdjustments(src, options = {}) {
    const img = typeof src === 'string' ? await loadImage(src) : src
    const { canvas, ctx } = createCanvas(img.naturalWidth || img.width, img.naturalHeight || img.height)

    ctx.filter = buildFilter(options)
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height)

    // Optional vignette
    if (options.vignette && options.vignette > 0) {
      const g = ctx.createRadialGradient(
        canvas.width / 2,
        canvas.height / 2,
        Math.min(canvas.width, canvas.height) * 0.3,
        canvas.width / 2,
        canvas.height / 2,
        Math.max(canvas.width, canvas.height) * 0.7
      )
      g.addColorStop(0, 'rgba(0,0,0,0)')
      g.addColorStop(1, `rgba(0,0,0,${clamp01(options.vignette)})`)
      ctx.fillStyle = g
      ctx.fillRect(0, 0, canvas.width, canvas.height)
    }

    // Optional noise
    if (options.noise && options.noise > 0) {
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
      const data = imageData.data
      const amount = options.noise * 255 // 0..255
      for (let i = 0; i < data.length; i += 4) {
        const n = (Math.random() - 0.5) * amount
        data[i] = Math.max(0, Math.min(255, data[i] + n))
        data[i+1] = Math.max(0, Math.min(255, data[i+1] + n))
        data[i+2] = Math.max(0, Math.min(255, data[i+2] + n))
      }
      ctx.putImageData(imageData, 0, 0)
    }

    return canvas.toDataURL('image/png')
  }

  // Crop from center or by rect
  async function crop(src, { x = 0, y = 0, width, height } = {}) {
    const img = typeof src === 'string' ? await loadImage(src) : src
    const iw = img.naturalWidth || img.width
    const ih = img.naturalHeight || img.height
    const w = Math.round(width || iw)
    const h = Math.round(height || ih)
    const sx = Math.round(x)
    const sy = Math.round(y)

    const { canvas, ctx } = createCanvas(w, h)
    ctx.drawImage(img, sx, sy, w, h, 0, 0, w, h)
    return canvas.toDataURL('image/png')
  }

  // Rotate by degrees (90 multiples recommended) and/or flip
  async function transform(src, { rotate = 0, flipX = false, flipY = false } = {}) {
    const img = typeof src === 'string' ? await loadImage(src) : src
    const iw = img.naturalWidth || img.width
    const ih = img.naturalHeight || img.height

    const rad = (rotate % 360) * Math.PI / 180
    const isRightAngle = Math.abs((rotate % 180)) === 90
    const w = isRightAngle ? ih : iw
    const h = isRightAngle ? iw : ih

    const { canvas, ctx } = createCanvas(w, h)
    ctx.translate(w / 2, h / 2)
    ctx.rotate(rad)
    ctx.scale(flipX ? -1 : 1, flipY ? -1 : 1)
    ctx.drawImage(img, -iw / 2, -ih / 2)

    return canvas.toDataURL('image/png')
  }

  // Apply a preset (combo of adjustments)
  async function applyPreset(src, preset) {
    const map = {
      bw: { saturation: -1, contrast: 0.2 },
      vintage: { sepia: 0.5, contrast: -0.05, brightness: 0.05 },
      cinematic: { contrast: 0.15, saturation: -0.1, hue: -10, vignette: 0.35 },
      punch: { contrast: 0.25, saturation: 0.2 },
      matte: { contrast: -0.2, brightness: 0.1, vignette: 0.2 }
    }
    return applyAdjustments(src, map[preset] || {})
  }

  // Naive background removal (quick local heuristic):
  // - If a dominant corner color exists (within tolerance), make similar pixels transparent.
  async function removeBackground(src, { tolerance = 32 } = {}) {
    const img = typeof src === 'string' ? await loadImage(src) : src
    const w = img.naturalWidth || img.width
    const h = img.naturalHeight || img.height
    const { canvas, ctx } = createCanvas(w, h)
    ctx.drawImage(img, 0, 0)
    const imageData = ctx.getImageData(0, 0, w, h)
    const data = imageData.data

    // Sample corners
    const samples = [0, (w-1)*4, (h-1)*w*4, (h*w - 1)*4].map(i => [data[i], data[i+1], data[i+2]])
    // Average corner color
    const avg = samples.reduce((a, c) => [a[0]+c[0], a[1]+c[1], a[2]+c[2]], [0,0,0]).map(v => v / samples.length)
    const tol2 = tolerance * tolerance

    for (let i = 0; i < data.length; i += 4) {
      const dr = data[i] - avg[0]
      const dg = data[i+1] - avg[1]
      const db = data[i+2] - avg[2]
      if ((dr*dr + dg*dg + db*db) <= tol2) {
        data[i+3] = 0 // transparent
      }
    }
    ctx.putImageData(imageData, 0, 0)
    return canvas.toDataURL('image/png')
  }

  // Smart-ish: try trim transparent edges after removal to reduce halos
  async function removeBackgroundSmart(src, opts) {
    const removed = await removeBackground(src, opts)
    const img = await loadImage(removed)
    const w = img.naturalWidth || img.width
    const h = img.naturalHeight || img.height
    const { canvas, ctx } = createCanvas(w, h)
    ctx.drawImage(img, 0, 0)
    const { data } = ctx.getImageData(0, 0, w, h)
    let minX = w, minY = h, maxX = 0, maxY = 0
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        const i = (y*w + x)*4
        if (data[i+3] > 5) { // non-transparent
          if (x < minX) minX = x
          if (x > maxX) maxX = x
          if (y < minY) minY = y
          if (y > maxY) maxY = y
        }
      }
    }
    if (minX > maxX || minY > maxY) return removed
    return crop(removed, { x: minX, y: minY, width: maxX - minX + 1, height: maxY - minY + 1 })
  }

  // Replace a Konva image with a new dataURL
  async function updateKonvaImage(konvaImage, dataUrl) {
    if (!konvaImage) return
    if (!konvaImage._originalSrc) {
      // store original for reset
      try {
        konvaImage._originalSrc = konvaImage.image()?.src || null
      } catch (_) {}
    }
    const img = await loadImage(dataUrl)

    // Update the image source and ensure Konva node size/offset/cache are updated
    const imageObj = new Image();
    imageObj.crossOrigin = 'anonymous'
    imageObj.onload = function() {
      // Save previous intrinsic size and scale to preserve visual size where possible
      const prevW = (typeof konvaImage.width === 'function') ? konvaImage.width() : konvaImage.width || 0
      const prevH = (typeof konvaImage.height === 'function') ? konvaImage.height() : konvaImage.height || 0
      const prevScaleX = konvaImage.scaleX ? konvaImage.scaleX() : 1
      const prevScaleY = konvaImage.scaleY ? konvaImage.scaleY() : 1

      // Apply new image object
      konvaImage.image(imageObj)

      // Update intrinsic width/height on Konva node if API available
      if (typeof konvaImage.width === 'function' && typeof konvaImage.height === 'function') {
        konvaImage.width(imageObj.naturalWidth || imageObj.width)
        konvaImage.height(imageObj.naturalHeight || imageObj.height)
      }

      // If the intrinsic size changed, attempt to preserve apparent size by adjusting scale
      try {
        const newW = (typeof konvaImage.width === 'function') ? konvaImage.width() : konvaImage.width || imageObj.naturalWidth
        const newH = (typeof konvaImage.height === 'function') ? konvaImage.height() : konvaImage.height || imageObj.naturalHeight
        if (prevW && prevH && newW && newH) {
          const apparentW = prevW * prevScaleX
          const apparentH = prevH * prevScaleY
          konvaImage.scaleX(apparentW / newW)
          konvaImage.scaleY(apparentH / newH)
        }
      } catch (_) {}

      // Re-cache the image so Konva filters and transformer handle updated bounds
      try {
        konvaImage.cache()
      } catch (_) {}

      // Recalculate offset to keep centered positioning
      try {
        if (typeof konvaImage.offsetX === 'function' && typeof konvaImage.offsetY === 'function') {
          konvaImage.offsetX((konvaImage.width() || imageObj.naturalWidth) / 2)
          konvaImage.offsetY((konvaImage.height() || imageObj.naturalHeight) / 2)
        }
      } catch (_) {}

      // Force layer redraw
      konvaImage.getLayer()?.batchDraw()
    }
    imageObj.src = dataUrl;
  }

  async function resetKonvaImage(konvaImage) {
    if (!konvaImage || !konvaImage._originalSrc) return
    return updateKonvaImage(konvaImage, konvaImage._originalSrc)
  }

  return {
    applyAdjustments,
    crop,
    transform,
    applyPreset,
    removeBackground,
    removeBackgroundSmart,
    updateKonvaImage,
    resetKonvaImage,
  }
}
