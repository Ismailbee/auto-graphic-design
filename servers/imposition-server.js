// Imposition Server - Handles PDF imposition operations
// Port: 3001
// Endpoints: 
//   - POST /api/imposition/process (single file)
//   - POST /api/imposition/merge (multiple files)
//   - POST /api/imposition/convert (convert images/docs to PDF)

import express from 'express';
import cors from 'cors';
import multer from 'multer';
import { PDFDocument, degrees } from 'pdf-lib';
import mammoth from 'mammoth';
import puppeteer from 'puppeteer';
import { createWorker } from 'tesseract.js';

const app = express();
const PORT = 3001;

// Reusable browser instance for better performance
let sharedBrowser = null;
let browserInitPromise = null;

// Get or create browser instance
async function getBrowser() {
  if (sharedBrowser && sharedBrowser.isConnected()) {
    return sharedBrowser;
  }
  
  // If browser is being initialized, wait for it
  if (browserInitPromise) {
    return await browserInitPromise;
  }
  
  // Start browser initialization
  browserInitPromise = puppeteer.launch({ 
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  }).then(browser => {
    console.log('✅ Browser instance initialized');
    sharedBrowser = browser;
    browserInitPromise = null;
    return browser;
  }).catch(err => {
    console.error('❌ Failed to launch browser:', err);
    browserInitPromise = null;
    throw err;
  });
  
  return await browserInitPromise;
}

// Cleanup on server shutdown
process.on('SIGINT', async () => {
  console.log('Shutting down server...');
  if (sharedBrowser) {
    await sharedBrowser.close();
  }
  process.exit(0);
});

// Configure CORS
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:5174', 'http://localhost:3000'],
  credentials: true
}));

app.use(express.json());

// Configure multer for file uploads
const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: { fileSize: 50 * 1024 * 1024 } // 50MB limit
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'imposition-server', port: PORT });
});

// Process single PDF with imposition
app.post('/api/imposition/process', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const {
      type = 'booklet',
      pageSize = 'auto',
      orientation = 'portrait',
      duplex = 'long-edge',
      addBlankPages = 'false',
      addCropMarks = 'false',
      rotation = '0',
      rotationType = null,
      customWidth,
      customHeight,
      requestedPageCount
    } = req.body;

    console.log('Processing imposition:', {
      type,
      pageSize,
      orientation,
      rotation,
      requestedPageCount,
      fileSize: req.file.size,
      fileName: req.file.originalname
    });

    // Load the PDF
    const pdfDoc = await PDFDocument.load(req.file.buffer);
    const pageCount = pdfDoc.getPageCount();

    console.log(`Input PDF has ${pageCount} pages`);

    // Create output PDF
    const outputDoc = await PDFDocument.create();

    // Add blank page at the beginning if requested (not for merge)
    if (addBlankPages === 'true' && type !== 'merge') {
      addBlankPageAtStart(pdfDoc);
    }

    // Apply imposition based on type
    switch (type) {
      case 'booklet':
        await applyBookletImposition(pdfDoc, outputDoc, { rotation: parseInt(rotation) });
        break;
      case '2up':
        await apply2UpImposition(pdfDoc, outputDoc, { orientation, rotation: parseInt(rotation), rotationType });
        break;
      case '4up':
        await apply4UpImposition(pdfDoc, outputDoc, { orientation, rotation: parseInt(rotation), rotationType });
        break;
      case 'tent-card':
        await applyTentCardImposition(pdfDoc, outputDoc, { rotation: parseInt(rotation), rotationType });
        break;
      case '2-side':
        await apply2SideImposition(pdfDoc, outputDoc, { rotation: parseInt(rotation) });
        break;
      case 'side-fold-card':
        await applySideFoldCardImposition(pdfDoc, outputDoc, { rotation: parseInt(rotation), rotationType });
        break;
      case 'tri-fold-brochure':
        await applyTriFoldBrochureImposition(pdfDoc, outputDoc, { rotation: parseInt(rotation) });
        break;
      case 'tri-fold-pamphlet':
        await applyTriFoldPamphletImposition(pdfDoc, outputDoc, { rotation: parseInt(rotation) });
        break;
      case '8-up-perfect-bound-sheetwise':
        await apply8UpPerfectBoundSheetwise(pdfDoc, outputDoc, { rotation: parseInt(rotation), rotationType });
        break;
      case '8-up-perfect-bound-work-turn':
        await apply8UpPerfectBoundWorkTumble(pdfDoc, outputDoc, { rotation: parseInt(rotation), rotationType });
        break;
      case '8-up-perfect-bound-work-tumble':
        await apply8UpPerfectBoundWorkTurn(pdfDoc, outputDoc, { rotation: parseInt(rotation), rotationType });
        break;
      case '8-up-center-stitch-sheetwise':
        await apply8UpCenterStitchSheetwise(pdfDoc, outputDoc, { rotation: parseInt(rotation), rotationType });
        break;
      case '8-up-center-stitch-work-turn':
        await apply8UpCenterStitchWorkTurn(pdfDoc, outputDoc, { rotation: parseInt(rotation), rotationType });
        break;
      case '8-up-center-stitch-work-tumble':
        await apply8UpCenterStitchWorkTumble(pdfDoc, outputDoc, { rotation: parseInt(rotation), rotationType });
        break;
      case 'signature':
        await applySignatureImposition(pdfDoc, outputDoc, { 
          rotation: parseInt(rotation), 
          signatureSize: parseInt(requestedPageCount) || 16 
        });
        break;
      case 'merge':
      default:
        // Just copy pages as-is
        const pages = await outputDoc.copyPages(pdfDoc, pdfDoc.getPageIndices());
        pages.forEach(page => outputDoc.addPage(page));
    }

    // Generate PDF bytes
    const pdfBytes = await outputDoc.save();

    console.log(`Output PDF has ${outputDoc.getPageCount()} pages, ${pdfBytes.length} bytes`);

    // Send PDF
    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="imposed-${type}-${Date.now()}.pdf"`,
      'Content-Length': pdfBytes.length
    });

    res.send(Buffer.from(pdfBytes));

  } catch (error) {
    console.error('Imposition error:', error);
    res.status(500).json({ 
      error: 'Failed to process imposition',
      details: error.message 
    });
  }
});

// Merge multiple PDFs
app.post('/api/imposition/merge', upload.array('files', 10), async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: 'No files uploaded' });
    }

    console.log(`Merging ${req.files.length} PDFs`);

    const outputDoc = await PDFDocument.create();

    for (const file of req.files) {
      const pdfDoc = await PDFDocument.load(file.buffer);
      const pages = await outputDoc.copyPages(pdfDoc, pdfDoc.getPageIndices());
      pages.forEach(page => outputDoc.addPage(page));
    }

    const pdfBytes = await outputDoc.save();

    console.log(`Merged PDF has ${outputDoc.getPageCount()} pages, ${pdfBytes.length} bytes`);

    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="merged-${Date.now()}.pdf"`,
      'Content-Length': pdfBytes.length
    });

    res.send(Buffer.from(pdfBytes));

  } catch (error) {
    console.error('Merge error:', error);
    res.status(500).json({ 
      error: 'Failed to merge PDFs',
      details: error.message 
    });
  }
});

// Convert images and documents to PDF
app.post('/api/imposition/convert', upload.array('files', 50), async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: 'No files uploaded' });
    }

    console.log(`Converting ${req.files.length} file(s) to PDF`);

    const {
      pageSize = 'auto',
      orientation = 'portrait',
      customWidth,
      customHeight
    } = req.body;

    const outputDoc = await PDFDocument.create();
    let browser;

    try {
      // Check if we need Puppeteer (only for DOCX/TXT files)
      const needsBrowser = req.files.some(file => {
        const type = file.mimetype.toLowerCase();
        return type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
               type === 'text/plain';
      });

      // Only get browser if needed (reuses existing instance for speed)
      if (needsBrowser) {
        browser = await getBrowser();
      }

      for (const file of req.files) {
        try {
          const fileType = file.mimetype.toLowerCase();

          // Image files
          if (fileType === 'image/jpeg' || fileType === 'image/jpg') {
            await processImageFile(outputDoc, file, 'jpg', { pageSize, orientation, customWidth, customHeight });
          } else if (fileType === 'image/png') {
            await processImageFile(outputDoc, file, 'png', { pageSize, orientation, customWidth, customHeight });
          } else if (fileType === 'image/gif' || fileType === 'image/tiff' || fileType === 'image/bmp' || fileType === 'image/webp') {
            // Convert other image formats to PNG first, then embed
            await processOtherImageFile(outputDoc, file, { pageSize, orientation, customWidth, customHeight });
          } 
          // Word documents
          else if (fileType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
            await processDocxFile(outputDoc, file, browser, { pageSize, orientation, customWidth, customHeight });
          } else if (fileType === 'application/msword') {
            console.warn(`Legacy .doc files require LibreOffice/Word installed. Skipping ${file.originalname}`);
            continue;
          }
          // PowerPoint files
          else if (fileType === 'application/vnd.openxmlformats-officedocument.presentationml.presentation' ||
                   fileType === 'application/vnd.ms-powerpoint') {
            console.warn(`PowerPoint files (.pptx/.ppt) require conversion software. Skipping ${file.originalname}`);
            continue;
          }
          // Excel files
          else if (fileType === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
                   fileType === 'application/vnd.ms-excel') {
            console.warn(`Excel files (.xlsx/.xls) require conversion software. Skipping ${file.originalname}`);
            continue;
          }
          // Plain text files
          else if (fileType === 'text/plain') {
            await processTextFile(outputDoc, file, browser, { pageSize, orientation, customWidth, customHeight });
          }
          else {
            console.warn(`Unsupported file type: ${fileType} for file ${file.originalname}`);
            continue;
          }

        } catch (fileError) {
          console.error(`Failed to process file ${file.originalname}:`, fileError.message);
          // Continue with other files
        }
      }

    } finally {
      // Don't close the shared browser - it's reused across requests
      // Browser will be closed on server shutdown
    }

    if (outputDoc.getPageCount() === 0) {
      return res.status(400).json({ error: 'No valid files could be processed' });
    }

    const pdfBytes = await outputDoc.save();

    console.log(`Converted PDF has ${outputDoc.getPageCount()} pages, ${pdfBytes.length} bytes`);

    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="converted-${Date.now()}.pdf"`,
      'Content-Length': pdfBytes.length
    });

    res.send(Buffer.from(pdfBytes));

  } catch (error) {
    console.error('Convert error:', error);
    res.status(500).json({ 
      error: 'Failed to convert files to PDF',
      details: error.message 
    });
  }
});

// Export PDF to other formats (JPEG, PNG, DOC)
app.post('/api/imposition/export', upload.array('files', 10), async (req, res) => {
  console.log('🔄 Export request received:', {
    fileCount: req.files?.length || 0,
    exportFormat: req.body.exportFormat
  });
  
  try {
    if (!req.files || req.files.length === 0) {
      console.error('❌ Export error: No files uploaded');
      return res.status(400).json({ error: 'No files uploaded' });
    }

    const { exportFormat } = req.body;
    
    if (!exportFormat || !['jpeg', 'png', 'doc'].includes(exportFormat)) {
      console.error('❌ Export error: Invalid export format:', exportFormat);
      return res.status(400).json({ error: 'Invalid export format. Use: jpeg, png, or doc' });
    }

    console.log(`✅ Exporting ${req.files.length} PDF(s) to ${exportFormat.toUpperCase()}`);

    const file = req.files[0]; // Take first file for now
    
    if (exportFormat === 'jpeg' || exportFormat === 'png') {
      // Convert PDF to images using Puppeteer with PDF.js viewer
      console.log('🖼️ Converting PDF to image...');
      
      const pdfDoc = await PDFDocument.load(file.buffer);
      const pages = pdfDoc.getPages();
      
      if (pages.length === 0) {
        return res.status(400).json({ error: 'PDF has no pages' });
      }

      // Get first page dimensions
      const page = pages[0];
      const { width, height } = page.getSize();
      
      console.log(`📄 PDF dimensions: ${width}x${height}`);
      
      // Use Puppeteer to render PDF to image
      const browser = await getBrowser();
      const browserPage = await browser.newPage();
      
      // Set viewport to PDF dimensions with scale factor
      const scaleFactor = 2; // For higher quality
      await browserPage.setViewport({
        width: Math.round(width * scaleFactor),
        height: Math.round(height * scaleFactor),
        deviceScaleFactor: 1
      });
      
      // Convert PDF to base64
      const pdfBase64 = file.buffer.toString('base64');
      
      // Create an HTML page with embedded PDF using canvas rendering
      const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { margin: 0; padding: 0; background: white; }
            canvas { display: block; width: 100%; height: auto; }
          </style>
          <script src="https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js"></script>
        </head>
        <body>
          <canvas id="pdf-canvas"></canvas>
          <script>
            pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
            
            const pdfData = atob('${pdfBase64}');
            const pdfArray = new Uint8Array(pdfData.length);
            for (let i = 0; i < pdfData.length; i++) {
              pdfArray[i] = pdfData.charCodeAt(i);
            }
            
            pdfjsLib.getDocument({data: pdfArray}).promise.then(function(pdf) {
              pdf.getPage(1).then(function(page) {
                const scale = ${scaleFactor};
                const viewport = page.getViewport({scale: scale});
                
                const canvas = document.getElementById('pdf-canvas');
                const context = canvas.getContext('2d');
                canvas.height = viewport.height;
                canvas.width = viewport.width;
                
                const renderContext = {
                  canvasContext: context,
                  viewport: viewport
                };
                
                page.render(renderContext).promise.then(function() {
                  document.body.setAttribute('data-loaded', 'true');
                });
              });
            });
          </script>
        </body>
        </html>
      `;
      
      // Load the HTML with embedded PDF
      await browserPage.setContent(htmlContent, { waitUntil: 'networkidle0' });
      
      // Wait for PDF to render
      await browserPage.waitForSelector('[data-loaded="true"]', { timeout: 10000 });
      
      // Take screenshot of the canvas
      const canvas = await browserPage.$('#pdf-canvas');
      const imageBuffer = await canvas.screenshot({
        type: exportFormat === 'png' ? 'png' : 'jpeg',
        quality: exportFormat === 'jpeg' ? 95 : undefined,
        omitBackground: exportFormat === 'png'
      });
      
      await browserPage.close();
      
      console.log(`✅ Image generated: ${imageBuffer.length} bytes`);
      
      const mimeType = exportFormat === 'png' ? 'image/png' : 'image/jpeg';
      const extension = exportFormat === 'png' ? 'png' : 'jpg';
      
      res.set({
        'Content-Type': mimeType,
        'Content-Disposition': `attachment; filename="converted-${Date.now()}.${extension}"`,
        'Content-Length': imageBuffer.length
      });
      
      res.send(imageBuffer);
      
    } else if (exportFormat === 'doc') {
      // PDF to DOC conversion - Extract text using PDF.js
      console.log('📄 Converting PDF to DOC...');
      
      try {
        const pdfDoc = await PDFDocument.load(file.buffer);
        const pages = pdfDoc.getPages();
        
        if (pages.length === 0) {
          console.error('❌ PDF has no pages to convert');
          return res.status(400).json({ error: 'PDF has no pages to convert' });
        }

        console.log(`📄 Extracting text from ${pages.length} page(s)...`);
        
        // Use Puppeteer with PDF.js to extract text
        const browser = await getBrowser();
        const browserPage = await browser.newPage();
        
        // Convert PDF to base64
        const pdfBase64 = file.buffer.toString('base64');
        
        // Create an HTML page to extract text using PDF.js
        const htmlContent = `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="utf-8">
            <script src="https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js"></script>
          </head>
          <body>
            <pre id="text-content"></pre>
            <script>
              pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
              
              const pdfData = atob('${pdfBase64}');
              const pdfArray = new Uint8Array(pdfData.length);
              for (let i = 0; i < pdfData.length; i++) {
                pdfArray[i] = pdfData.charCodeAt(i);
              }
              
              pdfjsLib.getDocument({data: pdfArray}).promise.then(async function(pdf) {
                let formattedData = [];
                let imagesByPage = {};
                
                for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
                  const page = await pdf.getPage(pageNum);
                  const textContent = await page.getTextContent();
                  const viewport = page.getViewport({scale: 2.0});
                  
                  if (pageNum > 1) {
                    formattedData.push({type: 'pagebreak'});
                  }
                  
                  // Extract images from page with positions
                  const ops = await page.getOperatorList();
                  const pageImages = [];
                  
                  for (let i = 0; i < ops.fnArray.length; i++) {
                    if (ops.fnArray[i] === pdfjsLib.OPS.paintImageXObject) {
                      try {
                        const imgName = ops.argsArray[i][0];
                        const img = await page.objs.get(imgName);
                        
                        if (img && img.data) {
                          // Render image to canvas
                          const canvas = document.createElement('canvas');
                          canvas.width = img.width;
                          canvas.height = img.height;
                          const ctx = canvas.getContext('2d');
                          
                          // Handle different image formats
                          if (img.kind === 1) { // Grayscale
                            const imgData = ctx.createImageData(img.width, img.height);
                            for (let j = 0; j < img.data.length; j++) {
                              const k = j * 4;
                              imgData.data[k] = img.data[j];
                              imgData.data[k + 1] = img.data[j];
                              imgData.data[k + 2] = img.data[j];
                              imgData.data[k + 3] = 255;
                            }
                            ctx.putImageData(imgData, 0, 0);
                          } else {
                            const imgData = ctx.createImageData(img.width, img.height);
                            imgData.data.set(img.data);
                            ctx.putImageData(imgData, 0, 0);
                          }
                          
                          // Convert to base64
                          const base64 = canvas.toDataURL('image/png').split(',')[1];
                          
                          // Get transform matrix to find position
                          const transform = ops.argsArray[i - 1] || [1, 0, 0, 1, 0, 0];
                          const yPos = transform[5] || 0;
                          
                          pageImages.push({
                            data: base64,
                            width: img.width,
                            height: img.height,
                            y: yPos,
                            pageNum: pageNum
                          });
                        }
                      } catch (imgError) {
                        console.warn('Could not extract image:', imgError);
                      }
                    }
                  }
                  
                  imagesByPage[pageNum] = pageImages;
                  
                  // Sort items by Y position (top to bottom) then X position (left to right)
                  let items = textContent.items.sort((a, b) => {
                    const yDiff = Math.abs(a.transform[5] - b.transform[5]);
                    if (yDiff > 5) {
                      return b.transform[5] - a.transform[5]; // Top to bottom
                    }
                    return a.transform[4] - b.transform[4]; // Left to right
                  });
                  
                  let lastY = null;
                  let lastGap = 0;
                  let lineItems = [];
                  let lineStartX = null;
                  
                  items.forEach((item, idx) => {
                    const y = item.transform[5];
                    const x = item.transform[4];
                    const fontSize = Math.round(item.transform[0]);
                    const fontName = item.fontName || '';
                    
                    // Extract actual font family name
                    let fontFamily = 'Times New Roman';
                    if (fontName.includes('Arial') || fontName.includes('Helvetica')) {
                      fontFamily = 'Arial';
                    } else if (fontName.includes('Courier')) {
                      fontFamily = 'Courier New';
                    } else if (fontName.includes('Times')) {
                      fontFamily = 'Times New Roman';
                    }
                    
                    // Detect text style
                    let isBold = fontName.toLowerCase().includes('bold');
                    let isItalic = fontName.toLowerCase().includes('italic') || fontName.toLowerCase().includes('oblique');
                    
                    if (lineStartX === null) lineStartX = x;
                    
                    // Calculate gap between lines
                    const currentGap = lastY !== null ? Math.abs(lastY - y) : 0;
                    
                    // New line if Y position changed significantly
                    if (lastY !== null && currentGap > 5) {
                      if (lineItems.length > 0) {
                        // Detect alignment based on X position
                        const pageWidth = viewport.width;
                        
                        let alignment = 'justify'; // Default to justify for better formatting
                        if (lineStartX > pageWidth * 0.4 && lineStartX < pageWidth * 0.6) {
                          alignment = 'center';
                        } else if (lineStartX > pageWidth * 0.7) {
                          alignment = 'right';
                        }
                        
                        // Determine if this is paragraph break (larger gap) or line break
                        const isParagraphBreak = currentGap > fontSize * 1.5;
                        
                        // Check if there's an image near this Y position
                        const nearbyImage = pageImages.find(img => Math.abs(img.y - lastY) < 100);
                        
                        formattedData.push({
                          type: 'line',
                          items: lineItems,
                          y: lastY,
                          alignment: alignment,
                          isParagraph: isParagraphBreak,
                          gap: currentGap,
                          image: nearbyImage
                        });
                        
                        lastGap = currentGap;
                      }
                      lineItems = [];
                      lineStartX = x;
                    }
                    
                    lineItems.push({
                      text: item.str,
                      fontSize: fontSize,
                      fontFamily: fontFamily,
                      isBold: isBold,
                      isItalic: isItalic,
                      x: x
                    });
                    
                    lastY = y;
                  });
                  
                  // Add last line
                  if (lineItems.length > 0) {
                    const pageWidth = viewport.width;
                    let alignment = 'left';
                    if (lineStartX > pageWidth * 0.4 && lineStartX < pageWidth * 0.6) {
                      alignment = 'center';
                    } else if (lineStartX > pageWidth * 0.7) {
                      alignment = 'right';
                    }
                    
                    const nearbyImage = pageImages.find(img => Math.abs(img.y - lastY) < 100);
                    
                    formattedData.push({
                      type: 'line',
                      items: lineItems,
                      y: lastY,
                      alignment: alignment,
                      isParagraph: true,
                      image: nearbyImage
                    });
                  }
                }
                
                document.getElementById('text-content').setAttribute('data-formatted', JSON.stringify(formattedData));
                document.getElementById('text-content').setAttribute('data-images', JSON.stringify(imagesByPage));
                document.getElementById('text-content').textContent = 'FORMATTED_DATA_AVAILABLE';
                document.body.setAttribute('data-loaded', 'true');
              }).catch(function(error) {
                console.error('PDF.js error:', error);
                document.getElementById('text-content').textContent = 'ERROR_EXTRACTING_TEXT';
                document.body.setAttribute('data-loaded', 'true');
              });
            </script>
          </body>
          </html>
        `;
        
        await browserPage.setContent(htmlContent, { waitUntil: 'networkidle0' });
        
        // Wait for text extraction to complete
        await browserPage.waitForSelector('[data-loaded="true"]', { timeout: 15000 });
        
        // Get extracted text and formatted data
        let extractedResult = await browserPage.evaluate(() => {
          const textContent = document.getElementById('text-content').textContent;
          const formattedAttr = document.getElementById('text-content').getAttribute('data-formatted');
          const imagesAttr = document.getElementById('text-content').getAttribute('data-images');
          return {
            text: textContent,
            formatted: formattedAttr ? JSON.parse(formattedAttr) : null,
            images: imagesAttr ? JSON.parse(imagesAttr) : []
          };
        });
        
        await browserPage.close();
        
        let extractedText = extractedResult.text;
        let formattedData = extractedResult.formatted;
        let pdfImages = extractedResult.images;
        
        console.log(`✅ Extracted data:`, { 
          textLength: extractedText.length, 
          hasFormatting: !!formattedData,
          items: formattedData?.length,
          imageCount: pdfImages.length
        });
        
        // Check if extraction failed or resulted in empty text - try OCR
        if (extractedText === 'ERROR_EXTRACTING_TEXT' || (!formattedData && extractedText.trim().length < 10)) {
          console.warn('⚠️ Text extraction failed or resulted in minimal text. Attempting OCR...');
          
          try {
            // This appears to be a scanned PDF - use OCR
            console.log('📸 Starting OCR process for scanned PDF...');
            
            const worker = await createWorker('eng');
            let ocrText = '';
            
            // Convert each PDF page to image and run OCR
            for (let pageNum = 1; pageNum <= pages.length; pageNum++) {
              console.log(`🔍 OCR processing page ${pageNum}/${pages.length}...`);
              
              // Render page to image using the same method as JPEG conversion
              const ocrBrowser = await getBrowser();
              const ocrPage = await ocrBrowser.newPage();
              
              const page = pdfDoc.getPages()[pageNum - 1];
              const { width, height } = page.getSize();
              
              await ocrPage.setViewport({
                width: Math.round(width * 2),
                height: Math.round(height * 2),
                deviceScaleFactor: 1
              });
              
              const pdfBase64 = file.buffer.toString('base64');
              
              const ocrHtml = `
                <!DOCTYPE html>
                <html>
                <head>
                  <style>body { margin: 0; padding: 0; background: white; }</style>
                  <script src="https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js"></script>
                </head>
                <body>
                  <canvas id="pdf-canvas"></canvas>
                  <script>
                    pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
                    const pdfData = atob('${pdfBase64}');
                    const pdfArray = new Uint8Array(pdfData.length);
                    for (let i = 0; i < pdfData.length; i++) pdfArray[i] = pdfData.charCodeAt(i);
                    pdfjsLib.getDocument({data: pdfArray}).promise.then(function(pdf) {
                      pdf.getPage(${pageNum}).then(function(page) {
                        const viewport = page.getViewport({scale: 2});
                        const canvas = document.getElementById('pdf-canvas');
                        const context = canvas.getContext('2d');
                        canvas.height = viewport.height;
                        canvas.width = viewport.width;
                        page.render({canvasContext: context, viewport: viewport}).promise.then(function() {
                          document.body.setAttribute('data-loaded', 'true');
                        });
                      });
                    });
                  </script>
                </body>
                </html>
              `;
              
              await ocrPage.setContent(ocrHtml, { waitUntil: 'networkidle0' });
              await ocrPage.waitForSelector('[data-loaded="true"]', { timeout: 10000 });
              
              const canvas = await ocrPage.$('#pdf-canvas');
              const imageBuffer = await canvas.screenshot({ type: 'png' });
              await ocrPage.close();
              
              // Run OCR on the image
              const { data: { text } } = await worker.recognize(imageBuffer);
              
              if (pageNum > 1) {
                ocrText += '\n\n';
              }
              ocrText += text.trim();
              
              console.log(`✅ OCR page ${pageNum} complete (${text.length} chars)`);
            }
            
            await worker.terminate();
            
            if (ocrText.trim().length > 10) {
              console.log(`✅ OCR successful! Extracted ${ocrText.length} characters`);
              extractedText = ocrText;
            } else {
              console.warn('⚠️ OCR returned minimal text');
              extractedText = `PDF to Word Conversion\n\n` +
                             `This document was converted from a PDF file.\n` +
                             `Original PDF contained ${pages.length} page(s).\n\n` +
                             `Note: OCR was attempted but yielded minimal results. The PDF may contain complex graphics, non-text content, or very low-quality scans.\n` +
                             `For best results, use a higher quality scan or the original digital document.`;
            }
          } catch (ocrError) {
            console.error('❌ OCR failed:', ocrError);
            extractedText = `PDF to Word Conversion\n\n` +
                           `This document was converted from a PDF file.\n` +
                           `Original PDF contained ${pages.length} page(s).\n\n` +
                           `Note: The PDF may contain images, scanned content, or complex formatting that cannot be extracted as text.\n` +
                           `For best results, use the original PDF file or a PDF with selectable text.`;
          }
        }
        
        // Generate RTF with formatting
        let rtfContent;
        
        if (formattedData && formattedData.length > 0) {
          console.log(`📝 Generating formatted RTF with inline images...`);
          
          // Build font table with actual fonts used
          let fontTable = '{\\fonttbl\n';
          fontTable += '{\\f0\\fswiss\\fcharset0 Arial;}\n';
          fontTable += '{\\f1\\froman\\fcharset0 Times New Roman;}\n';
          fontTable += '{\\f2\\fmodern\\fcharset0 Courier New;}\n';
          fontTable += '}\n';
          
          // Map font names to font numbers
          const fontMap = {
            'Arial': '\\f0',
            'Times New Roman': '\\f1',
            'Courier New': '\\f2'
          };
          
          // Build RTF with preserved formatting
          let rtfBody = '';
          let lastWasParagraph = false;
          
          formattedData.forEach((item, itemIdx) => {
            if (item.type === 'pagebreak') {
              rtfBody += '\\page\n';
            } else if (item.type === 'line') {
              // Add paragraph with alignment
              const alignCmd = {
                'left': '\\ql',
                'center': '\\qc',
                'right': '\\qr',
                'justify': '\\qj'
              }[item.alignment || 'left'];
              
              // Only add spacing after paragraph breaks
              let spacing = '';
              if (item.isParagraph) {
                spacing = '\\sa180 '; // Paragraph spacing (9pt after)
              }
              
              rtfBody += `\\pard${alignCmd}${spacing}`;
              
              // Add inline image if present
              if (item.image) {
                const img = item.image;
                // Convert base64 image to hex for RTF
                const imageBuffer = Buffer.from(img.data, 'base64');
                let hex = imageBuffer.toString('hex');
                // Limit hex string size for performance (max ~100KB)
                if (hex.length > 200000) {
                  hex = hex.substring(0, 200000);
                }
                
                // Scale image to fit (max width 6 inches = 8640 twips)
                // 1 pixel = 20 twips for proper aspect ratio
                const maxWidthTwips = 8640;
                const imageWidthTwips = img.width * 20;
                const imageHeightTwips = img.height * 20;
                
                // Scale down if too wide
                let displayWidthTwips = imageWidthTwips;
                let displayHeightTwips = imageHeightTwips;
                if (imageWidthTwips > maxWidthTwips) {
                  const scale = maxWidthTwips / imageWidthTwips;
                  displayWidthTwips = maxWidthTwips;
                  displayHeightTwips = Math.round(imageHeightTwips * scale);
                }
                
                rtfBody += `{\\pict\\pngblip\\picw${img.width}\\pich${img.height}\\picwgoal${displayWidthTwips}\\pichgoal${displayHeightTwips} ${hex}}\\par\n`;
              }
              
              // Process each text item in the line with its own formatting
              item.items.forEach((textItem, idx) => {
                const text = textItem.text || '';
                if (!text.trim()) {
                  if (idx < item.items.length - 1) rtfBody += ' ';
                  return;
                }
                
                // Calculate RTF font size (half-points, so 12pt = 24)
                const rtfFontSize = Math.max(textItem.fontSize * 2, 20);
                
                // Apply font family
                const fontCmd = fontMap[textItem.fontFamily] || '\\f1';
                rtfBody += fontCmd + ' ';
                
                // Apply formatting
                if (textItem.isBold) rtfBody += '\\b ';
                if (textItem.isItalic) rtfBody += '\\i ';
                rtfBody += `\\fs${rtfFontSize} `;
                
                // Escape special characters for RTF
                const escaped = text
                  .replace(/\\/g, '\\\\')
                  .replace(/{/g, '\\{')
                  .replace(/}/g, '\\}')
                  .replace(/[^\x00-\x7F]/g, (char) => {
                    const code = char.charCodeAt(0);
                    return code > 255 ? `\\u${code}?` : char;
                  });
                
                rtfBody += escaped;
                
                // Reset formatting
                if (textItem.isBold) rtfBody += '\\b0 ';
                if (textItem.isItalic) rtfBody += '\\i0 ';
                
                // Add space between items if needed
                if (idx < item.items.length - 1 && !text.endsWith(' ')) {
                  rtfBody += ' ';
                }
              });
              rtfBody += '\\par\n';
            }
          });
          
          rtfContent = `{\\rtf1\\ansi\\ansicpg1252\\deff1
${fontTable}
{\\*\\generator SmartDesignPro PDF to DOC Converter;}
\\viewkind4\\uc1
${rtfBody}
}`;
        } else {
          console.log('📝 Generating plain text RTF (no formatting data)...');
          
          // Fallback to plain text formatting
          extractedText = extractedText
            .split('\n')
            .map(line => line.trim())
            .filter(line => line.length > 0)
            .join('\n');
          
          rtfContent = `{\\rtf1\\ansi\\ansicpg1252\\deff0
{\\fonttbl
{\\f0\\fswiss\\fcharset0 Arial;}
{\\f1\\froman\\fcharset0 Times New Roman;}
}
{\\*\\generator SmartDesignPro PDF to DOC Converter;}
\\viewkind4\\uc1
\\pard\\f1\\fs22
${extractedText.split('\n').map(line => {
  if (line.trim() === '') return '\\par';
  const escaped = line
    .replace(/\\/g, '\\\\')
    .replace(/{/g, '\\{')
    .replace(/}/g, '\\}')
    .replace(/[^\x00-\x7F]/g, (char) => {
      const code = char.charCodeAt(0);
      return code > 255 ? `\\u${code}?` : char;
    });
  return escaped + '\\par';
}).join('\n')}
}`;
        }
        
        const docBuffer = Buffer.from(rtfContent, 'utf8');
        
        res.set({
          'Content-Type': 'application/rtf',
          'Content-Disposition': `attachment; filename="converted-${Date.now()}.rtf"`,
          'Content-Length': docBuffer.length
        });
        
        res.send(docBuffer);
        
        console.log(`✅ Successfully converted PDF to RTF (${pages.length} pages, ${docBuffer.length} bytes)`);
        
      } catch (pdfError) {
        console.error('PDF processing error:', pdfError);
        
        // Fallback: create a basic RTF document with error message
        const fallbackContent = `{\\rtf1\\ansi\\deff0
{\\fonttbl{\\f0\\fnil\\fcharset0 Arial;}}
{\\*\\generator SmartDesignPro;}
\\viewkind4\\uc1\\pard\\f0\\fs24
PDF to Word Conversion\\par
\\par
There was an issue processing the original PDF file.\\par
This document serves as a placeholder for the conversion.\\par
\\par
Please verify that the uploaded file is a valid PDF document.\\par
}`;
        
        const fallbackBuffer = Buffer.from(fallbackContent, 'utf8');
        
        res.set({
          'Content-Type': 'application/rtf',
          'Content-Disposition': `attachment; filename="converted-error-${Date.now()}.rtf"`,
          'Content-Length': fallbackBuffer.length
        });
        
        res.send(fallbackBuffer);
      }
    }

  } catch (error) {
    console.error('Export error:', error);
    res.status(500).json({ 
      error: 'Failed to export PDF',
      details: error.message 
    });
  }
});

// Helper function to process image files
async function processImageFile(outputDoc, file, imageType, options) {
  const { pageSize, orientation, customWidth, customHeight } = options;
  
  let image;
  if (imageType === 'jpg') {
    image = await outputDoc.embedJpg(file.buffer);
  } else if (imageType === 'png') {
    image = await outputDoc.embedPng(file.buffer);
  }

  const { width: imgWidth, height: imgHeight } = image.scale(1);

  // Determine page dimensions
  const { pageWidth, pageHeight } = getPageDimensions(pageSize, orientation, customWidth, customHeight, imgWidth, imgHeight);

  // Create a page with the determined dimensions
  const page = outputDoc.addPage([pageWidth, pageHeight]);

  // Calculate scaling to fit image on page while maintaining aspect ratio
  const scaleX = pageWidth / imgWidth;
  const scaleY = pageHeight / imgHeight;
  const scale = Math.min(scaleX, scaleY);

  const scaledWidth = imgWidth * scale;
  const scaledHeight = imgHeight * scale;

  // Center the image on the page
  const x = (pageWidth - scaledWidth) / 2;
  const y = (pageHeight - scaledHeight) / 2;

  page.drawImage(image, {
    x,
    y,
    width: scaledWidth,
    height: scaledHeight,
  });

  console.log(`Added image ${file.originalname}: ${imgWidth}x${imgHeight} scaled to ${scaledWidth.toFixed(0)}x${scaledHeight.toFixed(0)} on ${pageWidth}x${pageHeight} page`);
}

// Helper function to process DOCX files
async function processDocxFile(outputDoc, file, browser, options) {
  const { pageSize, orientation, customWidth, customHeight } = options;
  
  // Convert DOCX to HTML
  const result = await mammoth.convertToHtml({ buffer: file.buffer });
  const html = result.value;
  
  if (result.messages.length > 0) {
    console.log('DOCX conversion messages:', result.messages);
  }

  // Create a styled HTML page
  const styledHtml = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { 
          font-family: 'Times New Roman', serif; 
          line-height: 1.6; 
          margin: 40px;
          color: #333;
        }
        p { margin-bottom: 12px; }
        h1, h2, h3, h4, h5, h6 { margin-top: 24px; margin-bottom: 12px; }
        ul, ol { margin-bottom: 12px; }
        table { border-collapse: collapse; width: 100%; margin-bottom: 12px; }
        td, th { border: 1px solid #ddd; padding: 8px; }
      </style>
    </head>
    <body>
      ${html}
    </body>
    </html>
  `;

  // Determine page dimensions
  const { pageWidth, pageHeight } = getPageDimensions(pageSize, orientation, customWidth, customHeight, 612, 792);

  // Create PDF from HTML using Puppeteer
  const page = await browser.newPage();
  await page.setContent(styledHtml);
  
  const pdfBuffer = await page.pdf({
    format: pageSize === 'custom' ? undefined : (pageSize === 'auto' ? 'Letter' : pageSize.toUpperCase()),
    width: pageSize === 'custom' ? `${pageWidth}pt` : undefined,
    height: pageSize === 'custom' ? `${pageHeight}pt` : undefined,
    landscape: orientation === 'landscape',
    margin: {
      top: '0.5in',
      right: '0.5in',
      bottom: '0.5in',
      left: '0.5in',
    },
  });

  await page.close();

  // Load the generated PDF and copy pages to output document
  const docPdf = await PDFDocument.load(pdfBuffer);
  const pages = await outputDoc.copyPages(docPdf, docPdf.getPageIndices());
  pages.forEach(page => outputDoc.addPage(page));

  console.log(`Added DOCX document ${file.originalname}: ${pages.length} pages`);
}

// Helper function to process other image formats (GIF, TIFF, BMP, WEBP)
async function processOtherImageFile(outputDoc, file, options) {
  const { pageSize, orientation, customWidth, customHeight } = options;
  
  try {
    // For now, we'll use a workaround: convert to base64 and embed as PNG
    // Note: pdf-lib has limited support for some formats
    const sharp = await import('sharp');
    
    // Convert image to PNG buffer
    const pngBuffer = await sharp.default(file.buffer)
      .png()
      .toBuffer();
    
    // Create a temporary file object with PNG mime type
    const pngFile = {
      ...file,
      buffer: pngBuffer,
      mimetype: 'image/png'
    };
    
    // Process as PNG
    await processImageFile(outputDoc, pngFile, 'png', options);
    console.log(`Converted ${file.originalname} to PNG and added to PDF`);
  } catch (error) {
    console.error(`Failed to process ${file.originalname}:`, error.message);
    console.warn(`Attempting fallback method for ${file.originalname}`);
    // Fallback: try to embed directly if it's a supported format
    throw error;
  }
}

// Helper function to process plain text files
async function processTextFile(outputDoc, file, browser, options) {
  const { pageSize, orientation, customWidth, customHeight } = options;
  
  // Convert text to HTML
  const textContent = file.buffer.toString('utf-8');
  const htmlContent = textContent
    .split('\n')
    .map(line => `<p>${line.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</p>`)
    .join('');
  
  // Create a styled HTML page
  const styledHtml = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { 
          font-family: 'Courier New', monospace; 
          line-height: 1.4; 
          margin: 40px;
          color: #000;
          font-size: 12px;
        }
        p { margin: 0; white-space: pre-wrap; }
      </style>
    </head>
    <body>
      ${htmlContent}
    </body>
    </html>
  `;

  // Determine page dimensions
  const { pageWidth, pageHeight } = getPageDimensions(pageSize, orientation, customWidth, customHeight, 612, 792);

  // Create PDF from HTML using Puppeteer
  const page = await browser.newPage();
  await page.setContent(styledHtml);
  
  const pdfBuffer = await page.pdf({
    format: pageSize === 'custom' ? undefined : (pageSize === 'auto' ? 'Letter' : pageSize.toUpperCase()),
    width: pageSize === 'custom' ? `${pageWidth}pt` : undefined,
    height: pageSize === 'custom' ? `${pageHeight}pt` : undefined,
    landscape: orientation === 'landscape',
    margin: {
      top: '0.5in',
      right: '0.5in',
      bottom: '0.5in',
      left: '0.5in',
    },
  });

  await page.close();

  // Load the generated PDF and copy pages to output document
  const docPdf = await PDFDocument.load(pdfBuffer);
  const pages = await outputDoc.copyPages(docPdf, docPdf.getPageIndices());
  pages.forEach(page => outputDoc.addPage(page));

  console.log(`Added text file ${file.originalname}: ${pages.length} pages`);
}

// Helper function to get page dimensions
function getPageDimensions(pageSize, orientation, customWidth, customHeight, defaultWidth = 612, defaultHeight = 792) {
  let pageWidth, pageHeight;

  if (pageSize === 'auto') {
    // Use provided dimensions (typically from original image/document)
    pageWidth = defaultWidth;
    pageHeight = defaultHeight;
    // Don't apply orientation transformation for auto mode - use original dimensions
    return { pageWidth, pageHeight };
  } else if (pageSize === 'custom' && customWidth && customHeight) {
    pageWidth = parseFloat(customWidth) * 72; // Convert inches to points
    pageHeight = parseFloat(customHeight) * 72;
  } else {
    // Standard page sizes (in points: 1 inch = 72 points)
    const sizes = {
      'letter': [612, 792],
      'legal': [612, 1008],
      'a4': [595, 842],
      'a3': [842, 1191],
      'tabloid': [792, 1224]
    };
    [pageWidth, pageHeight] = sizes[pageSize.toLowerCase()] || [612, 792];
  }

  // Apply orientation (only for non-auto page sizes)
  if (orientation === 'landscape' && pageHeight > pageWidth) {
    [pageWidth, pageHeight] = [pageHeight, pageWidth];
  }

  return { pageWidth, pageHeight };
}

// Imposition helper functions

// Helper function to add blank page at the beginning
function addBlankPageAtStart(pdfDoc) {
  const inputPages = pdfDoc.getPages();
  if (inputPages.length === 0) return;
  
  const firstPage = inputPages[0];
  const { width, height } = firstPage.getSize();
  
  // Create a blank page at the beginning with actual content (required by pdf-lib)
  const blankPage = pdfDoc.insertPage(0, [width, height]);
  // Draw a white rectangle to ensure the page has content
  blankPage.drawRectangle({
    x: 0,
    y: 0,
    width: width,
    height: height,
    color: { type: 'RGB', red: 1, green: 1, blue: 1 }
  });
  console.log('Added blank page at the beginning');
}

async function applyBookletImposition(inputDoc, outputDoc, options = {}) {
  // Get page count (blank page already added before this function if requested)
  const actualPageCount = inputDoc.getPageCount();
  const inputPages = inputDoc.getPages();
  
  // Calculate total pages (must be multiple of 4 for saddle-stitch)
  const totalPages = Math.ceil(actualPageCount / 4) * 4;

  // Get dimensions from first page
  const firstPage = inputDoc.getPages()[0];
  const { width: pageWidth, height: pageHeight } = firstPage.getSize();
  
  // Create spread dimensions (two pages side-by-side)
  const spreadWidth = pageWidth * 2;
  const spreadHeight = pageHeight;

  console.log(`Creating booklet with ${totalPages} pages (${actualPageCount} actual)`);

  // Saddle-stitch booklet page arrangement
  // For 4 pages: Spread 1: [4, 1] Spread 2: [2, 3]
  // For 8 pages: Spread 1: [8, 1] Spread 2: [2, 7] Spread 3: [6, 3] Spread 4: [4, 5]
  // Pattern: outer pages work inward
  
  const spreads = [];
  let leftIdx = totalPages;
  let rightIdx = 1;
  
  while (leftIdx > rightIdx) {
    spreads.push([leftIdx, rightIdx]);
    leftIdx--;
    rightIdx++;
  }

  console.log('Booklet spreads:', spreads);

  // Create imposed spreads with ODD pages on RIGHT, EVEN pages on LEFT
  for (const [backPage, frontPage] of spreads) {
    const spread = outputDoc.addPage([spreadWidth, spreadHeight]);
    
    // Determine which goes left and which goes right
    // ODD pages (1, 3, 5...) go on RIGHT side
    // EVEN pages (2, 4, 6...) go on LEFT side
    
    const leftPageNum = frontPage % 2 === 0 ? frontPage : backPage;
    const rightPageNum = frontPage % 2 === 0 ? backPage : frontPage;
    
    // Add LEFT page (even number or blank)
    if (leftPageNum <= actualPageCount) {
      const [leftPage] = await outputDoc.copyPages(inputDoc, [leftPageNum - 1]);
      const leftEmbed = await outputDoc.embedPage(leftPage);
      
      spread.drawPage(leftEmbed, {
        x: 0,
        y: 0,
        width: pageWidth,
        height: pageHeight,
        rotate: options.rotation ? degrees(options.rotation) : undefined
      });
    }
    
    // Add RIGHT page (odd number or blank)
    if (rightPageNum <= actualPageCount) {
      const [rightPage] = await outputDoc.copyPages(inputDoc, [rightPageNum - 1]);
      const rightEmbed = await outputDoc.embedPage(rightPage);
      
      spread.drawPage(rightEmbed, {
        x: pageWidth,
        y: 0,
        width: pageWidth,
        height: pageHeight,
        rotate: options.rotation ? degrees(options.rotation) : undefined
      });
    }
    
    console.log(`Spread created: LEFT=${leftPageNum}, RIGHT=${rightPageNum}`);
  }
}

async function apply2UpImposition(inputDoc, outputDoc, options = {}) {
  const pageCount = inputDoc.getPageCount();
  const inputPages = inputDoc.getPages();
  
  if (pageCount === 0) return;
  
  const firstPage = inputPages[0];
  const { width: pageWidth, height: pageHeight } = firstPage.getSize();
  
  // 2-up: Stack pages vertically (top and bottom)
  const spreadWidth = pageWidth;
  const spreadHeight = pageHeight * 2;
  
  // Determine rotation based on rotationType
  let topRotation = options.rotation || 0;
  let bottomRotation = options.rotation || 0;
  
  if (options.rotationType === 'top' && options.rotation === 180) {
    topRotation = 180;
    bottomRotation = 0;
  } else if (options.rotationType === 'bottom' && options.rotation === 180) {
    topRotation = 0;
    bottomRotation = 180;
  }
  
  console.log(`Creating 2-up imposition: ${pageCount} pages, stacked vertically, topRotation=${topRotation}┬░, bottomRotation=${bottomRotation}┬░`);
  
  // Create 2-up spreads with pages stacked vertically
  for (let i = 0; i < pageCount; i += 2) {
    const spread = outputDoc.addPage([spreadWidth, spreadHeight]);
    
    // Top page
    const [page1] = await outputDoc.copyPages(inputDoc, [i]);
    const embed1 = await outputDoc.embedPage(page1);
    
    const topDrawOptions = {
      x: topRotation === 180 ? pageWidth : 0,
      y: topRotation === 180 ? spreadHeight : pageHeight,
      width: pageWidth,
      height: pageHeight
    };
    
    if (topRotation !== 0) {
      topDrawOptions.rotate = degrees(topRotation);
    }
    
    spread.drawPage(embed1, topDrawOptions);
    
    // Bottom page (if it exists)
    if (i + 1 < pageCount) {
      const [page2] = await outputDoc.copyPages(inputDoc, [i + 1]);
      const embed2 = await outputDoc.embedPage(page2);
      
      const bottomDrawOptions = {
        x: bottomRotation === 180 ? pageWidth : 0,
        y: bottomRotation === 180 ? pageHeight : 0,
        width: pageWidth,
        height: pageHeight
      };
      
      if (bottomRotation !== 0) {
        bottomDrawOptions.rotate = degrees(bottomRotation);
      }
      
      spread.drawPage(embed2, bottomDrawOptions);
    }
    
    console.log(`2-up spread created: TOP=page ${i + 1} (${topRotation}┬░), BOTTOM=page ${i + 2} (${bottomRotation}┬░)`);
  }
}

async function apply4UpImposition(inputDoc, outputDoc, options = {}) {
  const pageCount = inputDoc.getPageCount();
  const inputPages = inputDoc.getPages();
  
  if (pageCount === 0) return;
  
  const firstPage = inputPages[0];
  const { width: pageWidth, height: pageHeight } = firstPage.getSize();
  
  // Create 2x2 grid
  const spreadWidth = pageWidth * 2;
  const spreadHeight = pageHeight * 2;
  
  // Determine rotation based on rotationType
  let topRotation = options.rotation || 0;
  let bottomRotation = options.rotation || 0;
  
  if (options.rotationType === 'top' && options.rotation === 180) {
    topRotation = 180;
    bottomRotation = 0;
  } else if (options.rotationType === 'bottom' && options.rotation === 180) {
    topRotation = 0;
    bottomRotation = 180;
  }
  
  console.log(`Creating 4-up imposition: topRotation=${topRotation}┬░, bottomRotation=${bottomRotation}┬░`);
  
  // Create 4-up spreads
  for (let i = 0; i < pageCount; i += 4) {
    const spread = outputDoc.addPage([spreadWidth, spreadHeight]);
    
    // Top-left
    if (i < pageCount) {
      const [page] = await outputDoc.copyPages(inputDoc, [i]);
      const embed = await outputDoc.embedPage(page);
      
      const drawOptions = {
        x: topRotation === 180 ? pageWidth : 0,
        y: topRotation === 180 ? spreadHeight : pageHeight,
        width: pageWidth,
        height: pageHeight
      };
      
      if (topRotation !== 0) {
        drawOptions.rotate = degrees(topRotation);
      }
      
      spread.drawPage(embed, drawOptions);
    }
    
    // Top-right
    if (i + 1 < pageCount) {
      const [page] = await outputDoc.copyPages(inputDoc, [i + 1]);
      const embed = await outputDoc.embedPage(page);
      
      const drawOptions = {
        x: topRotation === 180 ? spreadWidth : pageWidth,
        y: topRotation === 180 ? spreadHeight : pageHeight,
        width: pageWidth,
        height: pageHeight
      };
      
      if (topRotation !== 0) {
        drawOptions.rotate = degrees(topRotation);
      }
      
      spread.drawPage(embed, drawOptions);
    }
    
    // Bottom-left
    if (i + 2 < pageCount) {
      const [page] = await outputDoc.copyPages(inputDoc, [i + 2]);
      const embed = await outputDoc.embedPage(page);
      
      const drawOptions = {
        x: bottomRotation === 180 ? pageWidth : 0,
        y: bottomRotation === 180 ? pageHeight : 0,
        width: pageWidth,
        height: pageHeight
      };
      
      if (bottomRotation !== 0) {
        drawOptions.rotate = degrees(bottomRotation);
      }
      
      spread.drawPage(embed, drawOptions);
    }
    
    // Bottom-right
    if (i + 3 < pageCount) {
      const [page] = await outputDoc.copyPages(inputDoc, [i + 3]);
      const embed = await outputDoc.embedPage(page);
      
      const drawOptions = {
        x: bottomRotation === 180 ? spreadWidth : pageWidth,
        y: bottomRotation === 180 ? pageHeight : 0,
        width: pageWidth,
        height: pageHeight
      };
      
      if (bottomRotation !== 0) {
        drawOptions.rotate = degrees(bottomRotation);
      }
      
      spread.drawPage(embed, drawOptions);
    }
  }
}

async function applyTentCardImposition(inputDoc, outputDoc, options = {}) {
  // Tent card: Pages stacked vertically with top or bottom page rotated 180 degrees
  const pageCount = inputDoc.getPageCount();
  const inputPages = inputDoc.getPages();
  
  if (pageCount === 0) return;
  
  const firstPage = inputPages[0];
  const { width: pageWidth, height: pageHeight } = firstPage.getSize();
  
  // Stack pages vertically
  const spreadWidth = pageWidth;
  const spreadHeight = pageHeight * 2;
  
  // Determine which page to rotate
  let topRotation = 0;
  let bottomRotation = 0;
  
  if (options.rotationType === 'top' && options.rotation === 180) {
    topRotation = 180;
  } else if (options.rotationType === 'bottom' && options.rotation === 180) {
    bottomRotation = 180;
  } else if (!options.rotationType && options.rotation === 180) {
    // Default: rotate top if no type specified
    topRotation = 180;
  }
  
  console.log(`Creating tent-card imposition: topRotation=${topRotation}┬░, bottomRotation=${bottomRotation}┬░`);
  
  // Create tent-card spreads
  for (let i = 0; i < pageCount; i += 2) {
    const spread = outputDoc.addPage([spreadWidth, spreadHeight]);
    
    // Top page
    const [page1] = await outputDoc.copyPages(inputDoc, [i]);
    const embed1 = await outputDoc.embedPage(page1);
    
    const topDrawOptions = {
      x: topRotation === 180 ? pageWidth : 0,
      y: topRotation === 180 ? spreadHeight : pageHeight,
      width: pageWidth,
      height: pageHeight
    };
    
    if (topRotation !== 0) {
      topDrawOptions.rotate = degrees(topRotation);
    }
    
    spread.drawPage(embed1, topDrawOptions);
    
    // Bottom page (if it exists)
    if (i + 1 < pageCount) {
      const [page2] = await outputDoc.copyPages(inputDoc, [i + 1]);
      const embed2 = await outputDoc.embedPage(page2);
      
      const bottomDrawOptions = {
        x: bottomRotation === 180 ? pageWidth : 0,
        y: bottomRotation === 180 ? pageHeight : 0,
        width: pageWidth,
        height: pageHeight
      };
      
      if (bottomRotation !== 0) {
        bottomDrawOptions.rotate = degrees(bottomRotation);
      }
      
      spread.drawPage(embed2, bottomDrawOptions);
    }
    
    console.log(`Tent-card spread created: TOP=page ${i + 1} (${topRotation}┬░), BOTTOM=page ${i + 2} (${bottomRotation}┬░)`);
  }
}

async function apply2SideImposition(inputDoc, outputDoc, options = {}) {
  const pageCount = inputDoc.getPageCount();
  const inputPages = inputDoc.getPages();
  
  if (pageCount === 0) return;
  
  const firstPage = inputPages[0];
  const { width: pageWidth, height: pageHeight } = firstPage.getSize();
  
  // 2-side: Pages arranged side-by-side (left and right)
  // Page 1 left, Page 2 right, Page 3 left, Page 4 right...
  const spreadWidth = pageWidth * 2;
  const spreadHeight = pageHeight;
  
  console.log(`Creating 2-side imposition: ${pageCount} pages, alternating left-right`);
  
  // Create spreads with pages side-by-side
  for (let i = 0; i < pageCount; i += 2) {
    const spread = outputDoc.addPage([spreadWidth, spreadHeight]);
    
    // Left page (odd pages: 1, 3, 5...)
    const [page1] = await outputDoc.copyPages(inputDoc, [i]);
    const embed1 = await outputDoc.embedPage(page1);
    
    spread.drawPage(embed1, {
      x: 0, // Position at left
      y: 0,
      width: pageWidth,
      height: pageHeight,
      rotate: options.rotation ? degrees(options.rotation) : undefined
    });
    
    // Right page (even pages: 2, 4, 6...) if it exists
    if (i + 1 < pageCount) {
      const [page2] = await outputDoc.copyPages(inputDoc, [i + 1]);
      const embed2 = await outputDoc.embedPage(page2);
      
      spread.drawPage(embed2, {
        x: pageWidth, // Position at right
        y: 0,
        width: pageWidth,
        height: pageHeight,
        rotate: options.rotation ? degrees(options.rotation) : undefined
      });
    }
    
    console.log(`2-side spread created: LEFT=page ${i + 1}, RIGHT=page ${i + 2}`);
  }
}

async function applySideFoldCardImposition(inputDoc, outputDoc, options = {}) {
  // Side-fold card: Greeting card layout (4 pages on 1 sheet in 2x2 grid)
  // Layout when printed on one sheet:
  // [Page 4 (back) | Page 1 (front)]  - Top row
  // [Page 2 (inside-left) | Page 3 (inside-right)]  - Bottom row
  
  const pageCount = inputDoc.getPageCount();
  const inputPages = inputDoc.getPages();
  
  if (pageCount === 0) return;
  
  const firstPage = inputPages[0];
  const { width: pageWidth, height: pageHeight } = firstPage.getSize();
  
  // Create 2x2 grid (2 pages wide, 2 pages tall)
  const spreadWidth = pageWidth * 2;
  const spreadHeight = pageHeight * 2;
  
  // Determine rotation based on rotationType
  let topRotation = options.rotation || 0;
  let bottomRotation = options.rotation || 0;
  
  if (options.rotationType === 'top' && options.rotation === 180) {
    topRotation = 180;
    bottomRotation = 0;
  } else if (options.rotationType === 'bottom' && options.rotation === 180) {
    topRotation = 0;
    bottomRotation = 180;
  }
  
  console.log(`Creating side-fold card: ${pageCount} pages, 4 per sheet in 2x2 grid, topRotation=${topRotation}┬░, bottomRotation=${bottomRotation}┬░`);
  
  // Process pages in groups of 4 (one complete card per sheet)
  for (let i = 0; i < pageCount; i += 4) {
    const sheet = outputDoc.addPage([spreadWidth, spreadHeight]);
    
    // Top-left: Page 4 (back)
    if (i + 3 < pageCount) {
      const [page4] = await outputDoc.copyPages(inputDoc, [i + 3]);
      const embed4 = await outputDoc.embedPage(page4);
      
      const drawOptions = {
        x: topRotation === 180 ? pageWidth : 0,
        y: topRotation === 180 ? spreadHeight : pageHeight,
        width: pageWidth,
        height: pageHeight
      };
      
      if (topRotation !== 0) {
        drawOptions.rotate = degrees(topRotation);
      }
      
      sheet.drawPage(embed4, drawOptions);
    }
    
    // Top-right: Page 1 (front)
    const [page1] = await outputDoc.copyPages(inputDoc, [i]);
    const embed1 = await outputDoc.embedPage(page1);
    
    const topRightDrawOptions = {
      x: topRotation === 180 ? spreadWidth : pageWidth,
      y: topRotation === 180 ? spreadHeight : pageHeight,
      width: pageWidth,
      height: pageHeight
    };
    
    if (topRotation !== 0) {
      topRightDrawOptions.rotate = degrees(topRotation);
    }
    
    sheet.drawPage(embed1, topRightDrawOptions);
    
    // Bottom-left: Page 2 (inside-left)
    if (i + 1 < pageCount) {
      const [page2] = await outputDoc.copyPages(inputDoc, [i + 1]);
      const embed2 = await outputDoc.embedPage(page2);
      
      const drawOptions = {
        x: bottomRotation === 180 ? pageWidth : 0,
        y: bottomRotation === 180 ? pageHeight : 0,
        width: pageWidth,
        height: pageHeight
      };
      
      if (bottomRotation !== 0) {
        drawOptions.rotate = degrees(bottomRotation);
      }
      
      sheet.drawPage(embed2, drawOptions);
    }
    
    // Bottom-right: Page 3 (inside-right)
    if (i + 2 < pageCount) {
      const [page3] = await outputDoc.copyPages(inputDoc, [i + 2]);
      const embed3 = await outputDoc.embedPage(page3);
      
      const drawOptions = {
        x: bottomRotation === 180 ? spreadWidth : pageWidth,
        y: bottomRotation === 180 ? pageHeight : 0,
        width: pageWidth,
        height: pageHeight
      };
      
      if (bottomRotation !== 0) {
        drawOptions.rotate = degrees(bottomRotation);
      }
      
      sheet.drawPage(embed3, drawOptions);
    }
    
    console.log(`Side-fold card sheet created with pages ${i + 1}, ${i + 2}, ${i + 3}, ${i + 4}`);
  }
}

async function applyTriFoldBrochureImposition(inputDoc, outputDoc, options = {}) {
  // Tri-fold brochure: 3 panels side-by-side in page order
  // Sheet 1: Page 1 (left) | Page 2 (middle) | Page 3 (right)
  // Sheet 2: Page 4 (left) | Page 5 (middle) | Page 6 (right)
  // And so on...
  
  const pageCount = inputDoc.getPageCount();
  const inputPages = inputDoc.getPages();
  
  if (pageCount === 0) return;
  
  const firstPage = inputPages[0];
  const { width: pageWidth, height: pageHeight } = firstPage.getSize();
  
  // Create layout with 3 panels side-by-side
  const spreadWidth = pageWidth * 3;
  const spreadHeight = pageHeight;
  
  console.log(`Creating tri-fold brochure: ${pageCount} pages, 3 panels per sheet`);
  
  // Process pages in groups of 3
  for (let i = 0; i < pageCount; i += 3) {
    const sheet = outputDoc.addPage([spreadWidth, spreadHeight]);
    
    // Left panel - Page 1, 4, 7, etc.
    const [page1] = await outputDoc.copyPages(inputDoc, [i]);
    const embed1 = await outputDoc.embedPage(page1);
    
    sheet.drawPage(embed1, {
      x: 0,
      y: 0,
      width: pageWidth,
      height: pageHeight
    });
    
    // Middle panel - Page 2, 5, 8, etc. (if exists)
    if (i + 1 < pageCount) {
      const [page2] = await outputDoc.copyPages(inputDoc, [i + 1]);
      const embed2 = await outputDoc.embedPage(page2);
      
      sheet.drawPage(embed2, {
        x: pageWidth,
        y: 0,
        width: pageWidth,
        height: pageHeight
      });
    }
    
    // Right panel - Page 3, 6, 9, etc. (if exists)
    if (i + 2 < pageCount) {
      const [page3] = await outputDoc.copyPages(inputDoc, [i + 2]);
      const embed3 = await outputDoc.embedPage(page3);
      
      sheet.drawPage(embed3, {
        x: pageWidth * 2,
        y: 0,
        width: pageWidth,
        height: pageHeight
      });
    }
    
    console.log(`Tri-fold sheet created: Page ${i + 1} (left) | Page ${i + 2} (middle) | Page ${i + 3} (right)`);
  }
}

async function applyTriFoldPamphletImposition(inputDoc, outputDoc, options = {}) {
  // Tri-fold pamphlet: Specific arrangement for standard tri-fold pamphlet
  // Sheet 1: Page 1 (right) | Page 6 (middle) | Page 5 (left)
  // Sheet 2: Page 2 (left) | Page 3 (middle) | Page 4 (right)
  
  const pageCount = inputDoc.getPageCount();
  const inputPages = inputDoc.getPages();
  
  if (pageCount === 0) return;
  
  const firstPage = inputPages[0];
  const { width: pageWidth, height: pageHeight } = firstPage.getSize();
  
  // Create layout with 3 panels side-by-side
  const spreadWidth = pageWidth * 3;
  const spreadHeight = pageHeight;
  
  console.log(`Creating tri-fold pamphlet: ${pageCount} pages, 6 pages per pamphlet`);
  
  // Process pages in groups of 6 (one complete pamphlet)
  for (let i = 0; i < pageCount; i += 6) {
    // Sheet 1: Page 5 (left) | Page 6 (middle) | Page 1 (right)
    const sheet1 = outputDoc.addPage([spreadWidth, spreadHeight]);
    
    // Left panel - Page 5
    if (i + 4 < pageCount) {
      const [page5] = await outputDoc.copyPages(inputDoc, [i + 4]);
      const embed5 = await outputDoc.embedPage(page5);
      
      sheet1.drawPage(embed5, {
        x: 0,
        y: 0,
        width: pageWidth,
        height: pageHeight
      });
    }
    
    // Middle panel - Page 6
    if (i + 5 < pageCount) {
      const [page6] = await outputDoc.copyPages(inputDoc, [i + 5]);
      const embed6 = await outputDoc.embedPage(page6);
      
      sheet1.drawPage(embed6, {
        x: pageWidth,
        y: 0,
        width: pageWidth,
        height: pageHeight
      });
    }
    
    // Right panel - Page 1
    const [page1] = await outputDoc.copyPages(inputDoc, [i]);
    const embed1 = await outputDoc.embedPage(page1);
    
    sheet1.drawPage(embed1, {
      x: pageWidth * 2,
      y: 0,
      width: pageWidth,
      height: pageHeight
    });
    
    // Sheet 2: Page 2 (left) | Page 3 (middle) | Page 4 (right)
    const sheet2 = outputDoc.addPage([spreadWidth, spreadHeight]);
    
    // Left panel - Page 2
    if (i + 1 < pageCount) {
      const [page2] = await outputDoc.copyPages(inputDoc, [i + 1]);
      const embed2 = await outputDoc.embedPage(page2);
      
      sheet2.drawPage(embed2, {
        x: 0,
        y: 0,
        width: pageWidth,
        height: pageHeight
      });
    }
    
    // Middle panel - Page 3
    if (i + 2 < pageCount) {
      const [page3] = await outputDoc.copyPages(inputDoc, [i + 2]);
      const embed3 = await outputDoc.embedPage(page3);
      
      sheet2.drawPage(embed3, {
        x: pageWidth,
        y: 0,
        width: pageWidth,
        height: pageHeight
      });
    }
    
    // Right panel - Page 4
    if (i + 3 < pageCount) {
      const [page4] = await outputDoc.copyPages(inputDoc, [i + 3]);
      const embed4 = await outputDoc.embedPage(page4);
      
      sheet2.drawPage(embed4, {
        x: pageWidth * 2,
        y: 0,
        width: pageWidth,
        height: pageHeight
      });
    }
    
    console.log(`Tri-fold pamphlet created: Sheet1 (5|6|1), Sheet2 (2|3|4)`);
  }
}

async function apply8UpPerfectBoundSheetwise(inputDoc, outputDoc, options = {}) {
  // 8-up perfect bound sheetwise: Specific arrangement for perfect binding
  // Sheet 1: Top: 5,12,9,8 | Bottom: 4,13,16,1
  // Sheet 2: Top: 11,6,7,10 | Bottom: 14,3,2,15
  // Pattern continues for additional 16-page signatures
  
  const pageCount = inputDoc.getPageCount();
  const inputPages = inputDoc.getPages();
  
  if (pageCount === 0) return;
  
  const firstPage = inputPages[0];
  const { width: pageWidth, height: pageHeight } = firstPage.getSize();
  
  // Create 4x2 grid
  const spreadWidth = pageWidth * 4;
  const spreadHeight = pageHeight * 2;
  
  // Determine rotation based on rotationType
  let topRotation = 0;
  let bottomRotation = 0;
  
  if (options.rotationType === 'top' && options.rotation === 180) {
    topRotation = 180;
  } else if (options.rotationType === 'bottom' && options.rotation === 180) {
    bottomRotation = 180;
  }
  
  console.log(`Creating 8-up perfect bound sheetwise: ${pageCount} pages, topRotation=${topRotation}┬░, bottomRotation=${bottomRotation}┬░`);
  
  // Process pages in groups of 16 (2 sheets per signature)
  for (let sig = 0; sig < pageCount; sig += 16) {
    // Sheet 1 arrangement
    const sheet1 = outputDoc.addPage([spreadWidth, spreadHeight]);
    
    // Top row: 5, 12, 9, 8
    const topRow1 = [sig + 4, sig + 11, sig + 8, sig + 7];
    for (let col = 0; col < 4; col++) {
      const pageIndex = topRow1[col];
      if (pageIndex < pageCount) {
        const [page] = await outputDoc.copyPages(inputDoc, [pageIndex]);
        const embed = await outputDoc.embedPage(page);
        
        const drawOptions = {
          x: topRotation === 180 ? pageWidth * (col + 1) : pageWidth * col,
          y: topRotation === 180 ? spreadHeight : pageHeight,
          width: pageWidth,
          height: pageHeight
        };
        
        if (topRotation !== 0) {
          drawOptions.rotate = degrees(topRotation);
        }
        
        sheet1.drawPage(embed, drawOptions);
      }
    }
    
    // Bottom row: 4, 13, 16, 1
    const bottomRow1 = [sig + 3, sig + 12, sig + 15, sig + 0];
    for (let col = 0; col < 4; col++) {
      const pageIndex = bottomRow1[col];
      if (pageIndex < pageCount) {
        const [page] = await outputDoc.copyPages(inputDoc, [pageIndex]);
        const embed = await outputDoc.embedPage(page);
        
        const drawOptions = {
          x: bottomRotation === 180 ? pageWidth * (col + 1) : pageWidth * col,
          y: bottomRotation === 180 ? pageHeight : 0,
          width: pageWidth,
          height: pageHeight
        };
        
        if (bottomRotation !== 0) {
          drawOptions.rotate = degrees(bottomRotation);
        }
        
        sheet1.drawPage(embed, drawOptions);
      }
    }
    
    console.log(`Sheet 1: Top (${topRow1.map(p => p + 1).join(',')}), Bottom (${bottomRow1.map(p => p + 1).join(',')})`);
    
    // Sheet 2 arrangement
    const sheet2 = outputDoc.addPage([spreadWidth, spreadHeight]);
    
    // Top row: 7, 10, 11, 6
    const topRow2 = [sig + 6, sig + 9, sig + 10, sig + 5];
    for (let col = 0; col < 4; col++) {
      const pageIndex = topRow2[col];
      if (pageIndex < pageCount) {
        const [page] = await outputDoc.copyPages(inputDoc, [pageIndex]);
        const embed = await outputDoc.embedPage(page);
        
        const drawOptions = {
          x: topRotation === 180 ? pageWidth * (col + 1) : pageWidth * col,
          y: topRotation === 180 ? spreadHeight : pageHeight,
          width: pageWidth,
          height: pageHeight
        };
        
        if (topRotation !== 0) {
          drawOptions.rotate = degrees(topRotation);
        }
        
        sheet2.drawPage(embed, drawOptions);
      }
    }
    
    // Bottom row: 2, 15, 14, 3
    const bottomRow2 = [sig + 1, sig + 14, sig + 13, sig + 2];
    for (let col = 0; col < 4; col++) {
      const pageIndex = bottomRow2[col];
      if (pageIndex < pageCount) {
        const [page] = await outputDoc.copyPages(inputDoc, [pageIndex]);
        const embed = await outputDoc.embedPage(page);
        
        const drawOptions = {
          x: bottomRotation === 180 ? pageWidth * (col + 1) : pageWidth * col,
          y: bottomRotation === 180 ? pageHeight : 0,
          width: pageWidth,
          height: pageHeight
        };
        
        if (bottomRotation !== 0) {
          drawOptions.rotate = degrees(bottomRotation);
        }
        
        sheet2.drawPage(embed, drawOptions);
      }
    }
    
    console.log(`Sheet 2: Top (${topRow2.map(p => p + 1).join(',')}), Bottom (${bottomRow2.map(p => p + 1).join(',')})`);
  }
}

async function apply8UpPerfectBoundWorkTurn(inputDoc, outputDoc, options = {}) {
  // 8-up work and turn: Specific arrangement for work & turn printing
  // Sheet 1: Top: 3,6,5,4 | Bottom: 2,7,8,1
  // Sheet 2: Top: 11,14,13,12 | Bottom: 10,15,16,9
  // Pattern continues for additional 16-page signatures
  
  const pageCount = inputDoc.getPageCount();
  const inputPages = inputDoc.getPages();
  
  if (pageCount === 0) return;
  
  const firstPage = inputPages[0];
  const { width: pageWidth, height: pageHeight } = firstPage.getSize();
  
  // Create 4x2 grid
  const spreadWidth = pageWidth * 4;
  const spreadHeight = pageHeight * 2;
  
  // Determine rotation based on rotationType
  let topRotation = 0;
  let bottomRotation = 0;
  
  if (options.rotationType === 'top' && options.rotation === 180) {
    topRotation = 180;
  } else if (options.rotationType === 'bottom' && options.rotation === 180) {
    bottomRotation = 180;
  }
  
  console.log(`Creating 8-up perfect bound work & turn: ${pageCount} pages, topRotation=${topRotation}┬░, bottomRotation=${bottomRotation}┬░`);
  
  // Process pages in groups of 16 (2 sheets per signature)
  for (let sig = 0; sig < pageCount; sig += 16) {
    // Sheet 1 arrangement
    const sheet1 = outputDoc.addPage([spreadWidth, spreadHeight]);
    
    // Top row: 3, 6, 5, 4
    const topRow1 = [sig + 2, sig + 5, sig + 4, sig + 3];
    for (let col = 0; col < 4; col++) {
      const pageIndex = topRow1[col];
      if (pageIndex < pageCount) {
        const [page] = await outputDoc.copyPages(inputDoc, [pageIndex]);
        const embed = await outputDoc.embedPage(page);
        
        const drawOptions = {
          x: topRotation === 180 ? pageWidth * (col + 1) : pageWidth * col,
          y: topRotation === 180 ? spreadHeight : pageHeight,
          width: pageWidth,
          height: pageHeight
        };
        
        if (topRotation !== 0) {
          drawOptions.rotate = degrees(topRotation);
        }
        
        sheet1.drawPage(embed, drawOptions);
      }
    }
    
    // Bottom row: 2, 7, 8, 1
    const bottomRow1 = [sig + 1, sig + 6, sig + 7, sig + 0];
    for (let col = 0; col < 4; col++) {
      const pageIndex = bottomRow1[col];
      if (pageIndex < pageCount) {
        const [page] = await outputDoc.copyPages(inputDoc, [pageIndex]);
        const embed = await outputDoc.embedPage(page);
        
        const drawOptions = {
          x: bottomRotation === 180 ? pageWidth * (col + 1) : pageWidth * col,
          y: bottomRotation === 180 ? pageHeight : 0,
          width: pageWidth,
          height: pageHeight
        };
        
        if (bottomRotation !== 0) {
          drawOptions.rotate = degrees(bottomRotation);
        }
        
        sheet1.drawPage(embed, drawOptions);
      }
    }
    
    console.log(`Work & Turn Sheet 1: Top (${topRow1.map(p => p + 1).join(',')}), Bottom (${bottomRow1.map(p => p + 1).join(',')})`);
    
    // Sheet 2 arrangement
    const sheet2 = outputDoc.addPage([spreadWidth, spreadHeight]);
    
    // Top row: 11, 14, 13, 12
    const topRow2 = [sig + 10, sig + 13, sig + 12, sig + 11];
    for (let col = 0; col < 4; col++) {
      const pageIndex = topRow2[col];
      if (pageIndex < pageCount) {
        const [page] = await outputDoc.copyPages(inputDoc, [pageIndex]);
        const embed = await outputDoc.embedPage(page);
        
        const drawOptions = {
          x: topRotation === 180 ? pageWidth * (col + 1) : pageWidth * col,
          y: topRotation === 180 ? spreadHeight : pageHeight,
          width: pageWidth,
          height: pageHeight
        };
        
        if (topRotation !== 0) {
          drawOptions.rotate = degrees(topRotation);
        }
        
        sheet2.drawPage(embed, drawOptions);
      }
    }
    
    // Bottom row: 10, 15, 16, 9
    const bottomRow2 = [sig + 9, sig + 14, sig + 15, sig + 8];
    for (let col = 0; col < 4; col++) {
      const pageIndex = bottomRow2[col];
      if (pageIndex < pageCount) {
        const [page] = await outputDoc.copyPages(inputDoc, [pageIndex]);
        const embed = await outputDoc.embedPage(page);
        
        const drawOptions = {
          x: bottomRotation === 180 ? pageWidth * (col + 1) : pageWidth * col,
          y: bottomRotation === 180 ? pageHeight : 0,
          width: pageWidth,
          height: pageHeight
        };
        
        if (bottomRotation !== 0) {
          drawOptions.rotate = degrees(bottomRotation);
        }
        
        sheet2.drawPage(embed, drawOptions);
      }
    }
    
    console.log(`Work & Turn Sheet 2: Top (${topRow2.map(p => p + 1).join(',')}), Bottom (${bottomRow2.map(p => p + 1).join(',')})`);
  }
}

async function apply8UpPerfectBoundWorkTumble(inputDoc, outputDoc, options = {}) {
  // 8-up work and tumble: Same arrangement as work & turn
  // Sheet 1: Top: 5,4,7,2 | Bottom: 6,3,8,1
  // Sheet 2: Top: 13,12,15,10 | Bottom: 14,11,16,9
  // Pattern continues for additional 16-page signatures
  
  const pageCount = inputDoc.getPageCount();
  const inputPages = inputDoc.getPages();
  
  if (pageCount === 0) return;
  
  const firstPage = inputPages[0];
  const { width: pageWidth, height: pageHeight } = firstPage.getSize();
  
  // Create 4x2 grid
  const spreadWidth = pageWidth * 4;
  const spreadHeight = pageHeight * 2;
  
  // Determine rotation based on rotationType
  let topRotation = 0;
  let bottomRotation = 0;
  
  if (options.rotationType === 'top' && options.rotation === 180) {
    topRotation = 180;
  } else if (options.rotationType === 'bottom' && options.rotation === 180) {
    bottomRotation = 180;
  }
  
  console.log(`Creating 8-up perfect bound work & tumble: ${pageCount} pages, topRotation=${topRotation}┬░, bottomRotation=${bottomRotation}┬░`);
  
  // Process pages in groups of 16 (2 sheets per signature)
  for (let sig = 0; sig < pageCount; sig += 16) {
    // Sheet 1 arrangement
    const sheet1 = outputDoc.addPage([spreadWidth, spreadHeight]);
    
    // Top row: 5, 4, 7, 2
    const topRow1 = [sig + 4, sig + 3, sig + 6, sig + 1];
    for (let col = 0; col < 4; col++) {
      const pageIndex = topRow1[col];
      if (pageIndex < pageCount) {
        const [page] = await outputDoc.copyPages(inputDoc, [pageIndex]);
        const embed = await outputDoc.embedPage(page);
        
        const drawOptions = {
          x: topRotation === 180 ? pageWidth * (col + 1) : pageWidth * col,
          y: topRotation === 180 ? spreadHeight : pageHeight,
          width: pageWidth,
          height: pageHeight
        };
        
        if (topRotation !== 0) {
          drawOptions.rotate = degrees(topRotation);
        }
        
        sheet1.drawPage(embed, drawOptions);
      }
    }
    
    // Bottom row: 6, 3, 8, 1
    const bottomRow1 = [sig + 5, sig + 2, sig + 7, sig + 0];
    for (let col = 0; col < 4; col++) {
      const pageIndex = bottomRow1[col];
      if (pageIndex < pageCount) {
        const [page] = await outputDoc.copyPages(inputDoc, [pageIndex]);
        const embed = await outputDoc.embedPage(page);
        
        const drawOptions = {
          x: bottomRotation === 180 ? pageWidth * (col + 1) : pageWidth * col,
          y: bottomRotation === 180 ? pageHeight : 0,
          width: pageWidth,
          height: pageHeight
        };
        
        if (bottomRotation !== 0) {
          drawOptions.rotate = degrees(bottomRotation);
        }
        
        sheet1.drawPage(embed, drawOptions);
      }
    }
    
    console.log(`Work & Tumble Sheet 1: Top (${topRow1.map(p => p + 1).join(',')}), Bottom (${bottomRow1.map(p => p + 1).join(',')})`);
    
    // Sheet 2 arrangement
    const sheet2 = outputDoc.addPage([spreadWidth, spreadHeight]);
    
    // Top row: 13, 12, 15, 10
    const topRow2 = [sig + 12, sig + 11, sig + 14, sig + 9];
    for (let col = 0; col < 4; col++) {
      const pageIndex = topRow2[col];
      if (pageIndex < pageCount) {
        const [page] = await outputDoc.copyPages(inputDoc, [pageIndex]);
        const embed = await outputDoc.embedPage(page);
        
        const drawOptions = {
          x: topRotation === 180 ? pageWidth * (col + 1) : pageWidth * col,
          y: topRotation === 180 ? spreadHeight : pageHeight,
          width: pageWidth,
          height: pageHeight
        };
        
        if (topRotation !== 0) {
          drawOptions.rotate = degrees(topRotation);
        }
        
        sheet2.drawPage(embed, drawOptions);
      }
    }
    
    // Bottom row: 14, 11, 16, 9
    const bottomRow2 = [sig + 13, sig + 10, sig + 15, sig + 8];
    for (let col = 0; col < 4; col++) {
      const pageIndex = bottomRow2[col];
      if (pageIndex < pageCount) {
        const [page] = await outputDoc.copyPages(inputDoc, [pageIndex]);
        const embed = await outputDoc.embedPage(page);
        
        const drawOptions = {
          x: bottomRotation === 180 ? pageWidth * (col + 1) : pageWidth * col,
          y: bottomRotation === 180 ? pageHeight : 0,
          width: pageWidth,
          height: pageHeight
        };
        
        if (bottomRotation !== 0) {
          drawOptions.rotate = degrees(bottomRotation);
        }
        
        sheet2.drawPage(embed, drawOptions);
      }
    }
    
    console.log(`Work & Tumble Sheet 2: Top (${topRow2.map(p => p + 1).join(',')}), Bottom (${bottomRow2.map(p => p + 1).join(',')})`);
  }
}

async function apply8UpCenterStitchSheetwise(inputDoc, outputDoc, options = {}) {
  /**
   * 8-UP CENTER-STITCH SHEETWISE IMPOSITION
   * 
   * OVERVIEW:
   * Arranges pages so that proper spreads are created when sheets are stacked.
   * - Sheet 1 Front: Page 1 & Page N (outer spread)
   * - Sheet 1 Back: Page 2 & Page N-1 (backs page 1 & N)
   * - Sheet 2 Front: Page 3 & Page N-2
   * - Sheet 2 Back: Page 4 & Page N-3 (backs page 3 & N-2)
   * - And so on...
   * 
   * BOOKLET SPREAD PAIRING:
   * For N total pages:
   * - Spread 1: Page 1 (right) | Page N (left)
   * - Spread 2: Page 2 (right) | Page N-1 (left)
   * - Spread 3: Page 3 (right) | Page N-2 (left)
   * - Spread 4: Page 4 (right) | Page N-3 (left)
   * - Spread 5: Page 5 (right) | Page N-4 (left)
   * ... continues
   * 
   * 8-UP LAYOUT:
   * Every 2 spreads fill one sheet (4 pages), arranged in 2x2 grid:
   * 
   * ΓöîΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓö¼ΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÉ
   * Γöé  Spread 1    Γöé  Spread 3    Γöé
   * Γöé  N  |  1     Γöé  N-2  |  3   Γöé  ΓåÉ Top row (odd spreads)
   * Γö£ΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓö╝ΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöñ
   * Γöé  Spread 2    Γöé  Spread 4    Γöé
   * Γöé  N-1  |  2   Γöé  N-3  |  4   Γöé  ΓåÉ Bottom row (even spreads - backs)
   * ΓööΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓö┤ΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÿ
   */
  
  const pageCount = inputDoc.getPageCount();
  
  if (pageCount === 0) {
    console.log('ΓÜá∩╕Å No pages to impose');
    return;
  }
  
  // ==================== STEP 1: VALIDATE & PAD PAGES ====================
  
  // Calculate total pages needed (must be multiple of 4 for booklet)
  const adjustedPageCount = Math.ceil(pageCount / 4) * 4;
  const blanksNeeded = adjustedPageCount - pageCount;
  
  console.log('\n≡ƒôï 8-UP CENTER STITCH SHEETWISE IMPOSITION');
  console.log(`Original pages: ${pageCount}`);
  console.log(`Adjusted pages: ${adjustedPageCount} (added ${blanksNeeded} blank pages)`);
  
  // Get page dimensions
  const inputPages = inputDoc.getPages();
  const firstPage = inputPages[0];
  const { width: pageWidth, height: pageHeight } = firstPage.getSize();
  
  // ==================== STEP 2: GENERATE SPREAD PAIRS ====================
  
  /**
   * Generate spread pairs following booklet logic
   * Each spread has: [leftPage, rightPage]
   * 
   * For N pages:
   * Spread 0: [N, 1]
   * Spread 1: [N-1, 2]
   * Spread 2: [N-2, 3]
   * Spread 3: [N-3, 4]
   * ...
   */
  const spreads = [];
  const totalSpreads = adjustedPageCount / 2;
  
  for (let i = 0; i < totalSpreads; i++) {
    const rightPage = i + 1;                    // 1, 2, 3, 4, ...
    const leftPage = adjustedPageCount - i;     // N, N-1, N-2, N-3, ...
    spreads.push({ left: leftPage, right: rightPage });
  }
  
  console.log(`\n≡ƒôû Generated ${totalSpreads} spreads:`);
  console.log(`First 8 spreads: ${spreads.slice(0, 8).map((s, i) => `[${s.left}|${s.right}]`).join(' ')}`);
  
  // ==================== STEP 3: ARRANGE IN 8-UP SHEETS ====================
  
  // Sheet dimensions: 4 pages wide ├ù 2 pages tall
  const sheetWidth = pageWidth * 4;
  const sheetHeight = pageHeight * 2;
  
  // Determine rotation based on rotationType
  let topRotation = 0;
  let bottomRotation = 0;
  
  if (options.rotationType === 'top' && options.rotation === 180) {
    topRotation = 180;
  } else if (options.rotationType === 'bottom' && options.rotation === 180) {
    bottomRotation = 180;
  } else if (!options.rotationType && options.rotation === 180) {
    // If no rotationType specified but rotation is 180, apply to all
    topRotation = 180;
    bottomRotation = 180;
  }
  
  console.log(`\n≡ƒôÉ Sheet Dimensions: ${sheetWidth} ├ù ${sheetHeight}`);
  console.log(`Layout: 2 spreads ├ù 2 rows (4 spreads per sheet = 8 pages)`);
  console.log(`Rotation: topRotation=${topRotation}┬░, bottomRotation=${bottomRotation}┬░`);
  
  /**
   * Process spreads in groups of 4 (each sheet contains 4 spreads = 8 pages)
   * 
   * Sheet layout (4 spreads):
   * Top row: Spread 0 (left), Spread 2 (right)
   * Bottom row: Spread 1 (left), Spread 3 (right)
   * 
   * This ensures:
   * - Spreads 0 & 1 are on same sheet (1 backs 2)
   * - Spreads 2 & 3 are on same sheet (3 backs 4)
   */
  const totalSheets = Math.ceil(totalSpreads / 4);
  
  for (let sheetIndex = 0; sheetIndex < totalSheets; sheetIndex++) {
    const sheetNum = sheetIndex + 1;
    const sheet = outputDoc.addPage([sheetWidth, sheetHeight]);
    
    console.log(`\n≡ƒôä Sheet ${sheetNum} of ${totalSheets}:`);
    
    // Get 4 spreads for this sheet with alternating pattern
    // Sheet 1: Spreads 0, 4, 2, 6 (0,2 from current + 4,6 from next)
    // Sheet 2: Spreads 1, 5, 3, 7 (swapped from Sheet 1)
    const startSpreadIndex = sheetIndex * 4;
    let sheetSpreads;
    
    if (sheetIndex % 2 === 0) {
      // Even sheets (1st, 3rd, 5th...): Take spreads 0,2 from current group, 0,2 from next group
      sheetSpreads = [
        spreads[startSpreadIndex + 0],      // Top-left
        spreads[startSpreadIndex + 4],      // Bottom-left (from next group)
        spreads[startSpreadIndex + 2],      // Top-right
        spreads[startSpreadIndex + 6]       // Bottom-right (from next group)
      ];
    } else {
      // Odd sheets (2nd, 4th, 6th...): Take the swapped spreads (all positions swapped)
      sheetSpreads = [
        spreads[startSpreadIndex - 1],      // Top-left (spread 3 from previous) - swapped
        spreads[startSpreadIndex + 3],      // Bottom-left (spread 7) - swapped
        spreads[startSpreadIndex - 3],      // Top-right (spread 1 from previous) - swapped
        spreads[startSpreadIndex + 1]       // Bottom-right (spread 5) - swapped
      ];
    }
    
    // Layout positions for 4 spreads (each spread takes 2 columns)
    const positions = [
      { row: 1, colStart: 0, name: 'Top-Left (Front)' },      // Spread 0
      { row: 0, colStart: 0, name: 'Bottom-Left (Back)' },    // Spread 1
      { row: 1, colStart: 2, name: 'Top-Right (Front)' },     // Spread 2
      { row: 0, colStart: 2, name: 'Bottom-Right (Back)' }    // Spread 3
    ];
    
    for (let i = 0; i < 4; i++) {
      const spread = sheetSpreads[i];
      if (!spread) continue;
      
      const pos = positions[i];
      const spreadNum = startSpreadIndex + i + 1;
      
      // Determine which rotation to use based on row (1 = top, 0 = bottom)
      const currentRotation = pos.row === 1 ? topRotation : bottomRotation;
      
      // Draw LEFT page of spread
      const leftPageIndex = spread.left - 1; // Convert to 0-based
      if (leftPageIndex < pageCount) {
        const [page] = await outputDoc.copyPages(inputDoc, [leftPageIndex]);
        const embed = await outputDoc.embedPage(page);
        
        const drawOptions = {
          x: currentRotation === 180 ? pageWidth * (pos.colStart + 1) : pageWidth * pos.colStart,
          y: currentRotation === 180 ? pageHeight * (pos.row + 1) : pageHeight * pos.row,
          width: pageWidth,
          height: pageHeight
        };
        
        if (currentRotation !== 0) {
          drawOptions.rotate = degrees(currentRotation);
        }
        
        sheet.drawPage(embed, drawOptions);
      }
      
      // Draw RIGHT page of spread
      const rightPageIndex = spread.right - 1; // Convert to 0-based
      if (rightPageIndex < pageCount) {
        const [page] = await outputDoc.copyPages(inputDoc, [rightPageIndex]);
        const embed = await outputDoc.embedPage(page);
        
        const drawOptions = {
          x: currentRotation === 180 ? pageWidth * (pos.colStart + 2) : pageWidth * (pos.colStart + 1),
          y: currentRotation === 180 ? pageHeight * (pos.row + 1) : pageHeight * pos.row,
          width: pageWidth,
          height: pageHeight
        };
        
        if (currentRotation !== 0) {
          drawOptions.rotate = degrees(currentRotation);
        }
        
        sheet.drawPage(embed, drawOptions);
      }
      
      console.log(`  ${pos.name}: Spread ${spreadNum} [${spread.left}|${spread.right}]`);
    }
    
    console.log(`  Γ£à Sheet ${sheetNum} complete`);
  }
  
  console.log(`\nΓ£à 8-UP CENTER STITCH SHEETWISE COMPLETE`);
  console.log(`Total sheets: ${totalSheets}`);
  console.log(`Pages per sheet: 8 (4 spreads ├ù 2 pages each)`);
}

async function apply8UpCenterStitchWorkTurn(inputDoc, outputDoc, options = {}) {
  /**
   * 8-UP CENTER-STITCH WORK & TURN IMPOSITION
   * 
   * Work & Turn: Sheet is printed on one side, then flipped along the short edge,
   * and printed again on the same side. Both images share the same gripper edge.
   * 
   * Uses the same spread-based layout as Sheetwise.
   */
  
  const pageCount = inputDoc.getPageCount();
  
  if (pageCount === 0) {
    console.log('ΓÜá∩╕Å No pages to impose');
    return;
  }
  
  // Validate & pad pages
  const adjustedPageCount = Math.ceil(pageCount / 4) * 4;
  const blanksNeeded = adjustedPageCount - pageCount;
  
  console.log('\n≡ƒôï 8-UP CENTER STITCH WORK & TURN IMPOSITION');
  console.log(`Original pages: ${pageCount}`);
  console.log(`Adjusted pages: ${adjustedPageCount} (added ${blanksNeeded} blank pages)`);
  
  // Get page dimensions
  const inputPages = inputDoc.getPages();
  const firstPage = inputPages[0];
  const { width: pageWidth, height: pageHeight } = firstPage.getSize();
  
  // Generate spread pairs
  const spreads = [];
  const totalSpreads = adjustedPageCount / 2;
  
  for (let i = 0; i < totalSpreads; i++) {
    const rightPage = i + 1;
    const leftPage = adjustedPageCount - i;
    spreads.push({ left: leftPage, right: rightPage });
  }
  
  console.log(`\n≡ƒôû Generated ${totalSpreads} spreads (Work & Turn)`);
  
  // Sheet dimensions
  const sheetWidth = pageWidth * 4;
  const sheetHeight = pageHeight * 2;
  
  // Determine rotation based on rotationType
  let topRotation = 0;
  let bottomRotation = 0;
  
  if (options.rotationType === 'top' && options.rotation === 180) {
    topRotation = 180;
  } else if (options.rotationType === 'bottom' && options.rotation === 180) {
    bottomRotation = 180;
  } else if (!options.rotationType && options.rotation === 180) {
    // If no rotationType specified but rotation is 180, apply to all
    topRotation = 180;
    bottomRotation = 180;
  }
  
  console.log(`Rotation: topRotation=${topRotation}┬░, bottomRotation=${bottomRotation}┬░`);
  
  const totalSheets = Math.ceil(totalSpreads / 4);
  
  for (let sheetIndex = 0; sheetIndex < totalSheets; sheetIndex++) {
    const sheetNum = sheetIndex + 1;
    const sheet = outputDoc.addPage([sheetWidth, sheetHeight]);
    
    console.log(`\n≡ƒôä Sheet ${sheetNum} of ${totalSheets} (Work & Turn):`);
    
    const startSpreadIndex = sheetIndex * 4;
    const sheetSpreads = [
      spreads[startSpreadIndex + 0],
      spreads[startSpreadIndex + 1],
      spreads[startSpreadIndex + 2],
      spreads[startSpreadIndex + 3]
    ];
    
    const positions = [
      { row: 1, colStart: 0, name: 'Top-Left' },
      { row: 0, colStart: 0, name: 'Bottom-Left' },
      { row: 1, colStart: 2, name: 'Top-Right' },
      { row: 0, colStart: 2, name: 'Bottom-Right' }
    ];
    
    for (let i = 0; i < 4; i++) {
      const spread = sheetSpreads[i];
      if (!spread) continue;
      
      const pos = positions[i];
      const spreadNum = startSpreadIndex + i + 1;
      
      // Determine which rotation to use based on row (1 = top, 0 = bottom)
      const currentRotation = pos.row === 1 ? topRotation : bottomRotation;
      
      // Draw LEFT page
      const leftPageIndex = spread.left - 1;
      if (leftPageIndex < pageCount) {
        const [page] = await outputDoc.copyPages(inputDoc, [leftPageIndex]);
        const embed = await outputDoc.embedPage(page);
        
        const drawOptions = {
          x: currentRotation === 180 ? pageWidth * (pos.colStart + 1) : pageWidth * pos.colStart,
          y: currentRotation === 180 ? pageHeight * (pos.row + 1) : pageHeight * pos.row,
          width: pageWidth,
          height: pageHeight
        };
        
        if (currentRotation !== 0) {
          drawOptions.rotate = degrees(currentRotation);
        }
        
        sheet.drawPage(embed, drawOptions);
      }
      
      // Draw RIGHT page
      const rightPageIndex = spread.right - 1;
      if (rightPageIndex < pageCount) {
        const [page] = await outputDoc.copyPages(inputDoc, [rightPageIndex]);
        const embed = await outputDoc.embedPage(page);
        
        const drawOptions = {
          x: currentRotation === 180 ? pageWidth * (pos.colStart + 2) : pageWidth * (pos.colStart + 1),
          y: currentRotation === 180 ? pageHeight * (pos.row + 1) : pageHeight * pos.row,
          width: pageWidth,
          height: pageHeight
        };
        
        if (currentRotation !== 0) {
          drawOptions.rotate = degrees(currentRotation);
        }
        
        sheet.drawPage(embed, drawOptions);
      }
      
      console.log(`  ${pos.name}: Spread ${spreadNum} [${spread.left}|${spread.right}]`);
    }
    
    console.log(`  Γ£à Sheet ${sheetNum} complete (Work & Turn)`);
  }
  
  console.log(`\nΓ£à 8-UP CENTER STITCH WORK & TURN COMPLETE`);
}

async function apply8UpCenterStitchWorkTumble(inputDoc, outputDoc, options = {}) {
  /**
   * 8-UP CENTER-STITCH WORK & TUMBLE IMPOSITION
   * 
   * Work & Tumble: Sheet is printed on one side, then flipped along the long edge,
   * and printed again on the reverse side. Images have opposite gripper edges.
   * 
   * Uses the same spread-based layout as Sheetwise.
   */
  
  const pageCount = inputDoc.getPageCount();
  
  if (pageCount === 0) {
    console.log('ΓÜá∩╕Å No pages to impose');
    return;
  }
  
  // Validate & pad pages
  const adjustedPageCount = Math.ceil(pageCount / 4) * 4;
  const blanksNeeded = adjustedPageCount - pageCount;
  
  console.log('\n≡ƒôï 8-UP CENTER STITCH WORK & TUMBLE IMPOSITION');
  console.log(`Original pages: ${pageCount}`);
  console.log(`Adjusted pages: ${adjustedPageCount} (added ${blanksNeeded} blank pages)`);
  
  // Get page dimensions
  const inputPages = inputDoc.getPages();
  const firstPage = inputPages[0];
  const { width: pageWidth, height: pageHeight } = firstPage.getSize();
  
  // Generate spread pairs
  const spreads = [];
  const totalSpreads = adjustedPageCount / 2;
  
  for (let i = 0; i < totalSpreads; i++) {
    const rightPage = i + 1;
    const leftPage = adjustedPageCount - i;
    spreads.push({ left: leftPage, right: rightPage });
  }
  
  console.log(`\n≡ƒôû Generated ${totalSpreads} spreads (Work & Tumble)`);
  
  // Sheet dimensions
  const sheetWidth = pageWidth * 4;
  const sheetHeight = pageHeight * 2;
  
  // Determine rotation based on rotationType
  let topRotation = 0;
  let bottomRotation = 0;
  
  if (options.rotationType === 'top' && options.rotation === 180) {
    topRotation = 180;
  } else if (options.rotationType === 'bottom' && options.rotation === 180) {
    bottomRotation = 180;
  } else if (!options.rotationType && options.rotation === 180) {
    // If no rotationType specified but rotation is 180, apply to all
    topRotation = 180;
    bottomRotation = 180;
  }
  
  console.log(`Rotation: topRotation=${topRotation}┬░, bottomRotation=${bottomRotation}┬░`);
  
  const totalSheets = Math.ceil(totalSpreads / 4);
  
  for (let sheetIndex = 0; sheetIndex < totalSheets; sheetIndex++) {
    const sheetNum = sheetIndex + 1;
    const sheet = outputDoc.addPage([sheetWidth, sheetHeight]);
    
    console.log(`\n≡ƒôä Sheet ${sheetNum} of ${totalSheets} (Work & Tumble):`);
    
    const startSpreadIndex = sheetIndex * 4;
    
    // For all sheets, swap spreads 1 and 2
    const sheetSpreads = [
      spreads[startSpreadIndex + 0],  // Top-Left: Spread 0
      spreads[startSpreadIndex + 2],  // Bottom-Left: Spread 2 (swapped)
      spreads[startSpreadIndex + 1],  // Top-Right: Spread 1 (swapped)
      spreads[startSpreadIndex + 3]   // Bottom-Right: Spread 3
    ];
    
    const positions = [
      { row: 1, colStart: 0, name: 'Top-Left' },
      { row: 0, colStart: 0, name: 'Bottom-Left' },
      { row: 1, colStart: 2, name: 'Top-Right' },
      { row: 0, colStart: 2, name: 'Bottom-Right' }
    ];
    
    for (let i = 0; i < 4; i++) {
      const spread = sheetSpreads[i];
      if (!spread) continue;
      
      const pos = positions[i];
      const spreadNum = startSpreadIndex + i + 1;
      
      // Determine which rotation to use based on row (1 = top, 0 = bottom)
      const currentRotation = pos.row === 1 ? topRotation : bottomRotation;
      
      // Draw LEFT page
      const leftPageIndex = spread.left - 1;
      if (leftPageIndex < pageCount) {
        const [page] = await outputDoc.copyPages(inputDoc, [leftPageIndex]);
        const embed = await outputDoc.embedPage(page);
        
        const drawOptions = {
          x: currentRotation === 180 ? pageWidth * (pos.colStart + 1) : pageWidth * pos.colStart,
          y: currentRotation === 180 ? pageHeight * (pos.row + 1) : pageHeight * pos.row,
          width: pageWidth,
          height: pageHeight
        };
        
        if (currentRotation !== 0) {
          drawOptions.rotate = degrees(currentRotation);
        }
        
        sheet.drawPage(embed, drawOptions);
      }
      
      // Draw RIGHT page
      const rightPageIndex = spread.right - 1;
      if (rightPageIndex < pageCount) {
        const [page] = await outputDoc.copyPages(inputDoc, [rightPageIndex]);
        const embed = await outputDoc.embedPage(page);
        
        const drawOptions = {
          x: currentRotation === 180 ? pageWidth * (pos.colStart + 2) : pageWidth * (pos.colStart + 1),
          y: currentRotation === 180 ? pageHeight * (pos.row + 1) : pageHeight * pos.row,
          width: pageWidth,
          height: pageHeight
        };
        
        if (currentRotation !== 0) {
          drawOptions.rotate = degrees(currentRotation);
        }
        
        sheet.drawPage(embed, drawOptions);
      }
      
      console.log(`  ${pos.name}: Spread ${spreadNum} [${spread.left}|${spread.right}]`);
    }
    
    console.log(`  Γ£à Sheet ${sheetNum} complete (Work & Tumble)`);
  }
  
  console.log(`\nΓ£à 8-UP CENTER STITCH WORK & TUMBLE COMPLETE`);
}

async function applySignatureImposition(inputDoc, outputDoc, options = {}) {
  /**
   * SIGNATURE IMPOSITION
   * 
   * Creates printer signatures (folded sections) from a document.
   * Supports 4-page, 8-page, 16-page, and 32-page signatures.
   * 
   * A signature is a printed sheet that is folded to create multiple pages.
   * Pages are arranged so that when the sheet is folded and trimmed,
   * pages appear in the correct sequence.
   * 
   * For 16-page signature (most common):
   * - Sheet 1 Front: 16, 1, 2, 15, 14, 3, 4, 13
   * - Sheet 1 Back:  12, 5, 6, 11, 10, 7, 8, 9
   * 
   * For 8-page signature:
   * - Front: 8, 1, 2, 7
   * - Back:  6, 3, 4, 5
   * 
   * For 4-page signature:
   * - Front: 4, 1
   * - Back:  2, 3
   */
  
  const pageCount = inputDoc.getPageCount();
  let signatureSize = options.signatureSize || 16; // Default to 16-page signatures
  const rotation = options.rotation || 0;
  
  if (pageCount === 0) {
    console.log('ΓÜá∩╕Å No pages to impose');
    return;
  }
  
  // Validate signature size - must be an even number >= 4, max 60
  if (!signatureSize || signatureSize < 4 || signatureSize > 60 || signatureSize % 2 !== 0) {
    console.log(`ΓÜá∩╕Å Invalid signature size: ${signatureSize}. Must be an even number between 4 and 60. Using 16-page signatures.`);
    signatureSize = 16;
  }
  
  console.log(`\n≡ƒôï SIGNATURE IMPOSITION`);
  console.log(`Signature size: ${signatureSize} pages`);
  console.log(`Original pages: ${pageCount}`);
  
  // Calculate how many complete signatures and remaining pages
  const completeSignatures = Math.floor(pageCount / signatureSize);
  const remainingPages = pageCount % signatureSize;
  const blanksInLastSignature = remainingPages === 0 ? 0 : signatureSize - remainingPages;
  
  let adjustedPageCount;
  let lastSignatureSize = signatureSize;
  
  // If the last signature has more than 4 blank pages, rebalance only that signature
  if (blanksInLastSignature > 4 && remainingPages > 0) {
    console.log(`ΓÜá∩╕Å Last signature would have ${blanksInLastSignature} blank pages (more than 4)`);
    
    // Try to find a smaller size for the last signature only
    const possibleSizes = [60, 56, 52, 48, 44, 40, 36, 32, 20, 16, 12, 8, 4];
    let bestSize = signatureSize;
    let bestBlanks = blanksInLastSignature;
    
    for (const size of possibleSizes) {
      if (size >= remainingPages && size <= signatureSize) {
        const testBlanks = size - remainingPages;
        if (testBlanks <= 4 && testBlanks < bestBlanks) {
          bestSize = size;
          bestBlanks = testBlanks;
          break; // Found a good fit
        }
      }
    }
    
    // If we still have blanks and remaining pages is at least 4, use exact remaining pages
    if (bestBlanks > 0 && remainingPages >= 4 && remainingPages % 2 === 0) {
      console.log(`Γ£à Using exact remaining pages (${remainingPages}) for last signature (0 blanks)`);
      lastSignatureSize = remainingPages;
      adjustedPageCount = (completeSignatures * signatureSize) + lastSignatureSize;
    } else if (bestBlanks < blanksInLastSignature) {
      console.log(`Γ£à Rebalancing last signature from ${signatureSize} to ${bestSize} pages (${bestBlanks} blanks instead of ${blanksInLastSignature})`);
      lastSignatureSize = bestSize;
      adjustedPageCount = (completeSignatures * signatureSize) + lastSignatureSize;
    } else {
      adjustedPageCount = Math.ceil(pageCount / signatureSize) * signatureSize;
    }
  } else {
    adjustedPageCount = Math.ceil(pageCount / signatureSize) * signatureSize;
  }
  
  const totalBlanksNeeded = adjustedPageCount - pageCount;
  console.log(`Adjusted pages: ${adjustedPageCount} (added ${totalBlanksNeeded} blank pages)`);
  
  // Get page dimensions
  const inputPages = inputDoc.getPages();
  const firstPage = inputPages[0];
  const { width: pageWidth, height: pageHeight } = firstPage.getSize();
  
  // Each sheet has 2 pages side-by-side (one spread)
  const sheetWidth = pageWidth * 2;
  const sheetHeight = pageHeight;
  
  console.log(`Sheet dimensions: ${sheetWidth} ├ù ${sheetHeight} (2 pages per sheet)`);
  
  // Process each signature
  const totalSignatures = completeSignatures + (remainingPages > 0 ? 1 : 0);
  console.log(`Total signatures: ${totalSignatures} (${completeSignatures} complete + ${remainingPages > 0 ? 1 : 0} partial)`);
  
  for (let sigIndex = 0; sigIndex < totalSignatures; sigIndex++) {
    const sigNum = sigIndex + 1;
    const isLastSignature = (sigIndex === totalSignatures - 1) && (remainingPages > 0);
    const currentSignatureSize = isLastSignature ? lastSignatureSize : signatureSize;
    const basePageNum = sigIndex * signatureSize;
    
    console.log(`\n≡ƒôä Signature ${sigNum} (${currentSignatureSize} pages, starting at page ${basePageNum + 1}):`);
    
    // Generate page order for this signature size
    const pageOrder = generateSignaturePageOrder(currentSignatureSize, basePageNum);
    
    // Create separate sheets for each spread (pair of pages)
    const spreadsPerSide = pageOrder.front.length / 2;
    
    // Create front spreads
    for (let spreadIndex = 0; spreadIndex < spreadsPerSide; spreadIndex++) {
      const leftPageIndex = pageOrder.front[spreadIndex * 2];
      const rightPageIndex = pageOrder.front[spreadIndex * 2 + 1];
      
      const frontSheet = outputDoc.addPage([sheetWidth, sheetHeight]);
      console.log(`  Front Spread ${spreadIndex + 1}: ${leftPageIndex + 1}, ${rightPageIndex + 1}`);
      
      // Draw left page
      if (leftPageIndex < pageCount) {
        const [page] = await outputDoc.copyPages(inputDoc, [leftPageIndex]);
        const embed = await outputDoc.embedPage(page);
        frontSheet.drawPage(embed, {
          x: 0,
          y: 0,
          width: pageWidth,
          height: pageHeight,
          rotate: rotation !== 0 ? degrees(rotation) : undefined
        });
      }
      
      // Draw right page
      if (rightPageIndex < pageCount) {
        const [page] = await outputDoc.copyPages(inputDoc, [rightPageIndex]);
        const embed = await outputDoc.embedPage(page);
        frontSheet.drawPage(embed, {
          x: pageWidth,
          y: 0,
          width: pageWidth,
          height: pageHeight,
          rotate: rotation !== 0 ? degrees(rotation) : undefined
        });
      }
    }
    
    // Create back spreads
    for (let spreadIndex = 0; spreadIndex < spreadsPerSide; spreadIndex++) {
      const leftPageIndex = pageOrder.back[spreadIndex * 2];
      const rightPageIndex = pageOrder.back[spreadIndex * 2 + 1];
      
      const backSheet = outputDoc.addPage([sheetWidth, sheetHeight]);
      console.log(`  Back Spread ${spreadIndex + 1}:  ${leftPageIndex + 1}, ${rightPageIndex + 1}`);
      
      // Draw left page
      if (leftPageIndex < pageCount) {
        const [page] = await outputDoc.copyPages(inputDoc, [leftPageIndex]);
        const embed = await outputDoc.embedPage(page);
        backSheet.drawPage(embed, {
          x: 0,
          y: 0,
          width: pageWidth,
          height: pageHeight,
          rotate: rotation !== 0 ? degrees(rotation) : undefined
        });
      }
      
      // Draw right page
      if (rightPageIndex < pageCount) {
        const [page] = await outputDoc.copyPages(inputDoc, [rightPageIndex]);
        const embed = await outputDoc.embedPage(page);
        backSheet.drawPage(embed, {
          x: pageWidth,
          y: 0,
          width: pageWidth,
          height: pageHeight,
          rotate: rotation !== 0 ? degrees(rotation) : undefined
        });
      }
    }
    
    console.log(`  Γ£à Signature ${sigNum} complete`);
  }
  
  console.log(`\nΓ£à SIGNATURE IMPOSITION COMPLETE`);
  console.log(`Total sheets created: ${outputDoc.getPageCount()}`);
}

function generateSignaturePageOrder(signatureSize, basePageNum) {
  /**
   * Generate page order for different signature sizes
   * Each spread is a pair of pages (left, right)
   * Front and back should have different pages - no repetition
   * Returns { front: [...], back: [...] } where arrays contain page pairs
   */
  
  const front = [];
  const back = [];
  
  if (signatureSize === 4) {
    // 4-page signature
    // Front: 4, 1
    // Back: 2, 3
    front.push(basePageNum + 3, basePageNum + 0);
    back.push(basePageNum + 1, basePageNum + 2);
  } else if (signatureSize === 8) {
    // 8-page signature - ensure no page appears on both front and back
    // Front spreads: (8,1), (2,7)
    // Back spreads: (6,3), (4,5)
    front.push(
      basePageNum + 7, basePageNum + 0,  // Spread 1: 8, 1
      basePageNum + 1, basePageNum + 6   // Spread 2: 2, 7
    );
    back.push(
      basePageNum + 5, basePageNum + 2,  // Spread 1: 6, 3
      basePageNum + 3, basePageNum + 4   // Spread 2: 4, 5
    );
  } else if (signatureSize === 12) {
    // 12-page signature (3 spreads per side)
    // Front: 12,1 / 2,11 / 10,3
    // Back: 4,9 / 8,5 / 6,7
    front.push(
      basePageNum + 11, basePageNum + 0,   // Spread 1: 12, 1
      basePageNum + 1, basePageNum + 10,   // Spread 2: 2, 11
      basePageNum + 9, basePageNum + 2     // Spread 3: 10, 3
    );
    back.push(
      basePageNum + 3, basePageNum + 8,    // Spread 1: 4, 9
      basePageNum + 7, basePageNum + 4,    // Spread 2: 8, 5
      basePageNum + 5, basePageNum + 6     // Spread 3: 6, 7
    );
  } else if (signatureSize === 16) {
    // 16-page signature (4 spreads per side, no repetition)
    // Front: 16,1 / 2,15 / 14,3 / 4,13
    // Back: 12,5 / 6,11 / 10,7 / 8,9
    front.push(
      basePageNum + 15, basePageNum + 0,   // Spread 1: 16, 1
      basePageNum + 1, basePageNum + 14,   // Spread 2: 2, 15
      basePageNum + 13, basePageNum + 2,   // Spread 3: 14, 3
      basePageNum + 3, basePageNum + 12    // Spread 4: 4, 13
    );
    back.push(
      basePageNum + 11, basePageNum + 4,   // Spread 1: 12, 5
      basePageNum + 5, basePageNum + 10,   // Spread 2: 6, 11
      basePageNum + 9, basePageNum + 6,    // Spread 3: 10, 7
      basePageNum + 7, basePageNum + 8     // Spread 4: 8, 9
    );
  } else if (signatureSize === 20) {
    // 20-page signature (5 spreads per side)
    // Front: 20,1 / 2,19 / 18,3 / 4,17 / 16,5
    // Back: 6,15 / 14,7 / 8,13 / 12,9 / 10,11
    front.push(
      basePageNum + 19, basePageNum + 0,   // Spread 1: 20, 1
      basePageNum + 1, basePageNum + 18,   // Spread 2: 2, 19
      basePageNum + 17, basePageNum + 2,   // Spread 3: 18, 3
      basePageNum + 3, basePageNum + 16,   // Spread 4: 4, 17
      basePageNum + 15, basePageNum + 4    // Spread 5: 16, 5
    );
    back.push(
      basePageNum + 5, basePageNum + 14,   // Spread 1: 6, 15
      basePageNum + 13, basePageNum + 6,   // Spread 2: 14, 7
      basePageNum + 7, basePageNum + 12,   // Spread 3: 8, 13
      basePageNum + 11, basePageNum + 8,   // Spread 4: 12, 9
      basePageNum + 9, basePageNum + 10    // Spread 5: 10, 11
    );
  } else if (signatureSize === 32) {
    // 32-page signature (8 spreads per side, no repetition)
    // Front: 32,1 / 2,31 / 30,3 / 4,29 / 28,5 / 6,27 / 26,7 / 8,25
    // Back: 24,9 / 10,23 / 22,11 / 12,21 / 20,13 / 14,19 / 18,15 / 16,17
    front.push(
      basePageNum + 31, basePageNum + 0,   // Spread 1: 32, 1
      basePageNum + 1, basePageNum + 30,   // Spread 2: 2, 31
      basePageNum + 29, basePageNum + 2,   // Spread 3: 30, 3
      basePageNum + 3, basePageNum + 28,   // Spread 4: 4, 29
      basePageNum + 27, basePageNum + 4,   // Spread 5: 28, 5
      basePageNum + 5, basePageNum + 26,   // Spread 6: 6, 27
      basePageNum + 25, basePageNum + 6,   // Spread 7: 26, 7
      basePageNum + 7, basePageNum + 24    // Spread 8: 8, 25
    );
    back.push(
      basePageNum + 23, basePageNum + 8,   // Spread 1: 24, 9
      basePageNum + 9, basePageNum + 22,   // Spread 2: 10, 23
      basePageNum + 21, basePageNum + 10,  // Spread 3: 22, 11
      basePageNum + 11, basePageNum + 20,  // Spread 4: 12, 21
      basePageNum + 19, basePageNum + 12,  // Spread 5: 20, 13
      basePageNum + 13, basePageNum + 18,  // Spread 6: 14, 19
      basePageNum + 17, basePageNum + 14,  // Spread 7: 18, 15
      basePageNum + 15, basePageNum + 16   // Spread 8: 16, 17
    );
  } else if (signatureSize === 36) {
    // 36-page signature (9 spreads per side)
    // Front: 36,1 / 2,35 / 34,3 / 4,33 / 32,5 / 6,31 / 30,7 / 8,29 / 28,9
    // Back: 10,27 / 26,11 / 12,25 / 24,13 / 14,23 / 22,15 / 16,21 / 20,17 / 18,19
    front.push(
      basePageNum + 35, basePageNum + 0,   // Spread 1: 36, 1
      basePageNum + 1, basePageNum + 34,   // Spread 2: 2, 35
      basePageNum + 33, basePageNum + 2,   // Spread 3: 34, 3
      basePageNum + 3, basePageNum + 32,   // Spread 4: 4, 33
      basePageNum + 31, basePageNum + 4,   // Spread 5: 32, 5
      basePageNum + 5, basePageNum + 30,   // Spread 6: 6, 31
      basePageNum + 29, basePageNum + 6,   // Spread 7: 30, 7
      basePageNum + 7, basePageNum + 28,   // Spread 8: 8, 29
      basePageNum + 27, basePageNum + 8    // Spread 9: 28, 9
    );
    back.push(
      basePageNum + 9, basePageNum + 26,   // Spread 1: 10, 27
      basePageNum + 25, basePageNum + 10,  // Spread 2: 26, 11
      basePageNum + 11, basePageNum + 24,  // Spread 3: 12, 25
      basePageNum + 23, basePageNum + 12,  // Spread 4: 24, 13
      basePageNum + 13, basePageNum + 22,  // Spread 5: 14, 23
      basePageNum + 21, basePageNum + 14,  // Spread 6: 22, 15
      basePageNum + 15, basePageNum + 20,  // Spread 7: 16, 21
      basePageNum + 19, basePageNum + 16,  // Spread 8: 20, 17
      basePageNum + 17, basePageNum + 18   // Spread 9: 18, 19
    );
  } else if (signatureSize === 40) {
    // 40-page signature (10 spreads per side)
    // Front: 40,1 / 2,39 / 38,3 / 4,37 / 36,5 / 6,35 / 34,7 / 8,33 / 32,9 / 10,31
    // Back: 30,11 / 12,29 / 28,13 / 14,27 / 26,15 / 16,25 / 24,17 / 18,23 / 22,19 / 20,21
    front.push(
      basePageNum + 39, basePageNum + 0,   // Spread 1: 40, 1
      basePageNum + 1, basePageNum + 38,   // Spread 2: 2, 39
      basePageNum + 37, basePageNum + 2,   // Spread 3: 38, 3
      basePageNum + 3, basePageNum + 36,   // Spread 4: 4, 37
      basePageNum + 35, basePageNum + 4,   // Spread 5: 36, 5
      basePageNum + 5, basePageNum + 34,   // Spread 6: 6, 35
      basePageNum + 33, basePageNum + 6,   // Spread 7: 34, 7
      basePageNum + 7, basePageNum + 32,   // Spread 8: 8, 33
      basePageNum + 31, basePageNum + 8,   // Spread 9: 32, 9
      basePageNum + 9, basePageNum + 30    // Spread 10: 10, 31
    );
    back.push(
      basePageNum + 29, basePageNum + 10,  // Spread 1: 30, 11
      basePageNum + 11, basePageNum + 28,  // Spread 2: 12, 29
      basePageNum + 27, basePageNum + 12,  // Spread 3: 28, 13
      basePageNum + 13, basePageNum + 26,  // Spread 4: 14, 27
      basePageNum + 25, basePageNum + 14,  // Spread 5: 26, 15
      basePageNum + 15, basePageNum + 24,  // Spread 6: 16, 25
      basePageNum + 23, basePageNum + 16,  // Spread 7: 24, 17
      basePageNum + 17, basePageNum + 22,  // Spread 8: 18, 23
      basePageNum + 21, basePageNum + 18,  // Spread 9: 22, 19
      basePageNum + 19, basePageNum + 20   // Spread 10: 20, 21
    );
  } else if (signatureSize === 44) {
    // 44-page signature (11 spreads per side)
    // Front: 44,1 / 2,43 / 42,3 / 4,41 / 40,5 / 6,39 / 38,7 / 8,37 / 36,9 / 10,35 / 34,11
    // Back: 12,33 / 32,13 / 14,31 / 30,15 / 16,29 / 28,17 / 18,27 / 26,19 / 20,25 / 24,21 / 22,23
    front.push(
      basePageNum + 43, basePageNum + 0,   // Spread 1: 44, 1
      basePageNum + 1, basePageNum + 42,   // Spread 2: 2, 43
      basePageNum + 41, basePageNum + 2,   // Spread 3: 42, 3
      basePageNum + 3, basePageNum + 40,   // Spread 4: 4, 41
      basePageNum + 39, basePageNum + 4,   // Spread 5: 40, 5
      basePageNum + 5, basePageNum + 38,   // Spread 6: 6, 39
      basePageNum + 37, basePageNum + 6,   // Spread 7: 38, 7
      basePageNum + 7, basePageNum + 36,   // Spread 8: 8, 37
      basePageNum + 35, basePageNum + 8,   // Spread 9: 36, 9
      basePageNum + 9, basePageNum + 34,   // Spread 10: 10, 35
      basePageNum + 33, basePageNum + 10   // Spread 11: 34, 11
    );
    back.push(
      basePageNum + 11, basePageNum + 32,  // Spread 1: 12, 33
      basePageNum + 31, basePageNum + 12,  // Spread 2: 32, 13
      basePageNum + 13, basePageNum + 30,  // Spread 3: 14, 31
      basePageNum + 29, basePageNum + 14,  // Spread 4: 30, 15
      basePageNum + 15, basePageNum + 28,  // Spread 5: 16, 29
      basePageNum + 27, basePageNum + 16,  // Spread 6: 28, 17
      basePageNum + 17, basePageNum + 26,  // Spread 7: 18, 27
      basePageNum + 25, basePageNum + 18,  // Spread 8: 26, 19
      basePageNum + 19, basePageNum + 24,  // Spread 9: 20, 25
      basePageNum + 23, basePageNum + 20,  // Spread 10: 24, 21
      basePageNum + 21, basePageNum + 22   // Spread 11: 22, 23
    );
  } else if (signatureSize === 48) {
    // 48-page signature (12 spreads per side)
    // Front: 48,1 / 2,47 / 46,3 / 4,45 / 44,5 / 6,43 / 42,7 / 8,41 / 40,9 / 10,39 / 38,11 / 12,37
    // Back: 36,13 / 14,35 / 34,15 / 16,33 / 32,17 / 18,31 / 30,19 / 20,29 / 28,21 / 22,27 / 26,23 / 24,25
    front.push(
      basePageNum + 47, basePageNum + 0,   // Spread 1: 48, 1
      basePageNum + 1, basePageNum + 46,   // Spread 2: 2, 47
      basePageNum + 45, basePageNum + 2,   // Spread 3: 46, 3
      basePageNum + 3, basePageNum + 44,   // Spread 4: 4, 45
      basePageNum + 43, basePageNum + 4,   // Spread 5: 44, 5
      basePageNum + 5, basePageNum + 42,   // Spread 6: 6, 43
      basePageNum + 41, basePageNum + 6,   // Spread 7: 42, 7
      basePageNum + 7, basePageNum + 40,   // Spread 8: 8, 41
      basePageNum + 39, basePageNum + 8,   // Spread 9: 40, 9
      basePageNum + 9, basePageNum + 38,   // Spread 10: 10, 39
      basePageNum + 37, basePageNum + 10,  // Spread 11: 38, 11
      basePageNum + 11, basePageNum + 36   // Spread 12: 12, 37
    );
    back.push(
      basePageNum + 35, basePageNum + 12,  // Spread 1: 36, 13
      basePageNum + 13, basePageNum + 34,  // Spread 2: 14, 35
      basePageNum + 33, basePageNum + 14,  // Spread 3: 34, 15
      basePageNum + 15, basePageNum + 32,  // Spread 4: 16, 33
      basePageNum + 31, basePageNum + 16,  // Spread 5: 32, 17
      basePageNum + 17, basePageNum + 30,  // Spread 6: 18, 31
      basePageNum + 29, basePageNum + 18,  // Spread 7: 30, 19
      basePageNum + 19, basePageNum + 28,  // Spread 8: 20, 29
      basePageNum + 27, basePageNum + 20,  // Spread 9: 28, 21
      basePageNum + 21, basePageNum + 26,  // Spread 10: 22, 27
      basePageNum + 25, basePageNum + 22,  // Spread 11: 26, 23
      basePageNum + 23, basePageNum + 24   // Spread 12: 24, 25
    );
  } else if (signatureSize === 52) {
    // 52-page signature (13 spreads per side)
    // Front: 52,1 / 2,51 / 50,3 / 4,49 / 48,5 / 6,47 / 46,7 / 8,45 / 44,9 / 10,43 / 42,11 / 12,41 / 40,13
    // Back: 14,39 / 38,15 / 16,37 / 36,17 / 18,35 / 34,19 / 20,33 / 32,21 / 22,31 / 30,23 / 24,29 / 28,25 / 26,27
    front.push(
      basePageNum + 51, basePageNum + 0,   // Spread 1: 52, 1
      basePageNum + 1, basePageNum + 50,   // Spread 2: 2, 51
      basePageNum + 49, basePageNum + 2,   // Spread 3: 50, 3
      basePageNum + 3, basePageNum + 48,   // Spread 4: 4, 49
      basePageNum + 47, basePageNum + 4,   // Spread 5: 48, 5
      basePageNum + 5, basePageNum + 46,   // Spread 6: 6, 47
      basePageNum + 45, basePageNum + 6,   // Spread 7: 46, 7
      basePageNum + 7, basePageNum + 44,   // Spread 8: 8, 45
      basePageNum + 43, basePageNum + 8,   // Spread 9: 44, 9
      basePageNum + 9, basePageNum + 42,   // Spread 10: 10, 43
      basePageNum + 41, basePageNum + 10,  // Spread 11: 42, 11
      basePageNum + 11, basePageNum + 40,  // Spread 12: 12, 41
      basePageNum + 39, basePageNum + 12   // Spread 13: 40, 13
    );
    back.push(
      basePageNum + 13, basePageNum + 38,  // Spread 1: 14, 39
      basePageNum + 37, basePageNum + 14,  // Spread 2: 38, 15
      basePageNum + 15, basePageNum + 36,  // Spread 3: 16, 37
      basePageNum + 35, basePageNum + 16,  // Spread 4: 36, 17
      basePageNum + 17, basePageNum + 34,  // Spread 5: 18, 35
      basePageNum + 33, basePageNum + 18,  // Spread 6: 34, 19
      basePageNum + 19, basePageNum + 32,  // Spread 7: 20, 33
      basePageNum + 31, basePageNum + 20,  // Spread 8: 32, 21
      basePageNum + 21, basePageNum + 30,  // Spread 9: 22, 31
      basePageNum + 29, basePageNum + 22,  // Spread 10: 30, 23
      basePageNum + 23, basePageNum + 28,  // Spread 11: 24, 29
      basePageNum + 27, basePageNum + 24,  // Spread 12: 28, 25
      basePageNum + 25, basePageNum + 26   // Spread 13: 26, 27
    );
  } else if (signatureSize === 56) {
    // 56-page signature (14 spreads per side)
    // Front: 56,1 / 2,55 / 54,3 / 4,53 / 52,5 / 6,51 / 50,7 / 8,49 / 48,9 / 10,47 / 46,11 / 12,45 / 44,13 / 14,43
    // Back: 42,15 / 16,41 / 40,17 / 18,39 / 38,19 / 20,37 / 36,21 / 22,35 / 34,23 / 24,33 / 32,25 / 26,31 / 30,27 / 28,29
    front.push(
      basePageNum + 55, basePageNum + 0,   // Spread 1: 56, 1
      basePageNum + 1, basePageNum + 54,   // Spread 2: 2, 55
      basePageNum + 53, basePageNum + 2,   // Spread 3: 54, 3
      basePageNum + 3, basePageNum + 52,   // Spread 4: 4, 53
      basePageNum + 51, basePageNum + 4,   // Spread 5: 52, 5
      basePageNum + 5, basePageNum + 50,   // Spread 6: 6, 51
      basePageNum + 49, basePageNum + 6,   // Spread 7: 50, 7
      basePageNum + 7, basePageNum + 48,   // Spread 8: 8, 49
      basePageNum + 47, basePageNum + 8,   // Spread 9: 48, 9
      basePageNum + 9, basePageNum + 46,   // Spread 10: 10, 47
      basePageNum + 45, basePageNum + 10,  // Spread 11: 46, 11
      basePageNum + 11, basePageNum + 44,  // Spread 12: 12, 45
      basePageNum + 43, basePageNum + 12,  // Spread 13: 44, 13
      basePageNum + 13, basePageNum + 42   // Spread 14: 14, 43
    );
    back.push(
      basePageNum + 41, basePageNum + 14,  // Spread 1: 42, 15
      basePageNum + 15, basePageNum + 40,  // Spread 2: 16, 41
      basePageNum + 39, basePageNum + 16,  // Spread 3: 40, 17
      basePageNum + 17, basePageNum + 38,  // Spread 4: 18, 39
      basePageNum + 37, basePageNum + 18,  // Spread 5: 38, 19
      basePageNum + 19, basePageNum + 36,  // Spread 6: 20, 37
      basePageNum + 35, basePageNum + 20,  // Spread 7: 36, 21
      basePageNum + 21, basePageNum + 34,  // Spread 8: 22, 35
      basePageNum + 33, basePageNum + 22,  // Spread 9: 34, 23
      basePageNum + 23, basePageNum + 32,  // Spread 10: 24, 33
      basePageNum + 31, basePageNum + 24,  // Spread 11: 32, 25
      basePageNum + 25, basePageNum + 30,  // Spread 12: 26, 31
      basePageNum + 29, basePageNum + 26,  // Spread 13: 30, 27
      basePageNum + 27, basePageNum + 28   // Spread 14: 28, 29
    );
  } else if (signatureSize === 60) {
    // 60-page signature (15 spreads per side)
    // Front: 60,1 / 2,59 / 58,3 / 4,57 / 56,5 / 6,55 / 54,7 / 8,53 / 52,9 / 10,51 / 50,11 / 12,49 / 48,13 / 14,47 / 46,15
    // Back: 16,45 / 44,17 / 18,43 / 42,19 / 20,41 / 40,21 / 22,39 / 38,23 / 24,37 / 36,25 / 26,35 / 34,27 / 28,33 / 32,29 / 30,31
    front.push(
      basePageNum + 59, basePageNum + 0,   // Spread 1: 60, 1
      basePageNum + 1, basePageNum + 58,   // Spread 2: 2, 59
      basePageNum + 57, basePageNum + 2,   // Spread 3: 58, 3
      basePageNum + 3, basePageNum + 56,   // Spread 4: 4, 57
      basePageNum + 55, basePageNum + 4,   // Spread 5: 56, 5
      basePageNum + 5, basePageNum + 54,   // Spread 6: 6, 55
      basePageNum + 53, basePageNum + 6,   // Spread 7: 54, 7
      basePageNum + 7, basePageNum + 52,   // Spread 8: 8, 53
      basePageNum + 51, basePageNum + 8,   // Spread 9: 52, 9
      basePageNum + 9, basePageNum + 50,   // Spread 10: 10, 51
      basePageNum + 49, basePageNum + 10,  // Spread 11: 50, 11
      basePageNum + 11, basePageNum + 48,  // Spread 12: 12, 49
      basePageNum + 47, basePageNum + 12,  // Spread 13: 48, 13
      basePageNum + 13, basePageNum + 46,  // Spread 14: 14, 47
      basePageNum + 45, basePageNum + 14   // Spread 15: 46, 15
    );
    back.push(
      basePageNum + 15, basePageNum + 44,  // Spread 1: 16, 45
      basePageNum + 43, basePageNum + 16,  // Spread 2: 44, 17
      basePageNum + 17, basePageNum + 42,  // Spread 3: 18, 43
      basePageNum + 41, basePageNum + 18,  // Spread 4: 42, 19
      basePageNum + 19, basePageNum + 40,  // Spread 5: 20, 41
      basePageNum + 39, basePageNum + 20,  // Spread 6: 40, 21
      basePageNum + 21, basePageNum + 38,  // Spread 7: 22, 39
      basePageNum + 37, basePageNum + 22,  // Spread 8: 38, 23
      basePageNum + 23, basePageNum + 36,  // Spread 9: 24, 37
      basePageNum + 35, basePageNum + 24,  // Spread 10: 36, 25
      basePageNum + 25, basePageNum + 34,  // Spread 11: 26, 35
      basePageNum + 33, basePageNum + 26,  // Spread 12: 34, 27
      basePageNum + 27, basePageNum + 32,  // Spread 13: 28, 33
      basePageNum + 31, basePageNum + 28,  // Spread 14: 32, 29
      basePageNum + 29, basePageNum + 30   // Spread 15: 30, 31
    );
  } else {
    // Dynamic generation for any even signature size using booklet formula
    console.log(`ΓÜá∩╕Å Using dynamic page order generation for ${signatureSize}-page signature`);
    
    const pagesPerSide = signatureSize / 2;
    let pageNum = 0;
    
    // Front side: Start from outside pages working inward
    // Pattern: last,first / second,second-to-last / etc.
    for (let i = 0; i < pagesPerSide / 2; i++) {
      front.push(
        basePageNum + (signatureSize - 1 - pageNum),  // High page (descending)
        basePageNum + pageNum                          // Low page (ascending)
      );
      pageNum++;
    }
    
    // Back side: Continue the pattern for remaining pages
    for (let i = 0; i < pagesPerSide / 2; i++) {
      back.push(
        basePageNum + pageNum,                         // Low page (continuing)
        basePageNum + (signatureSize - 1 - pageNum)   // High page (descending)
      );
      pageNum++;
    }
  }
  
  return { front, back };
}

// Start server
app.listen(PORT, () => {
  console.log(`≡ƒÜÇ Imposition Server running on http://localhost:${PORT}`);
  console.log(`≡ƒôä Endpoints:`);
  console.log(`   POST /api/imposition/process - Process single PDF`);
  console.log(`   POST /api/imposition/merge - Merge multiple PDFs`);
  console.log(`   POST /api/imposition/convert - Convert images to PDF`);
  console.log(`   GET  /health - Health check`);
}).on('error', (err) => {
  console.error('Γ¥î Server error:', err);
  if (err.code === 'EADDRINUSE') {
    console.error(`Port ${PORT} is already in use. Please close the other process or use a different port.`);
  }
  process.exit(1);
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error('Γ¥î Uncaught exception:', err);
});

process.on('unhandledRejection', (err) => {
  console.error('Γ¥î Unhandled rejection:', err);
});
