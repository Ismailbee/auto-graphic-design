import { PDFDocument } from 'pdf-lib';
import sharp from 'sharp';

class ImpositionService {
  constructor() {
    this.pageSizes = {
      A4: { width: 595, height: 842 },
      A3: { width: 842, height: 1191 },
      Letter: { width: 612, height: 792 },
      Legal: { width: 612, height: 1008 },
      Tabloid: { width: 792, height: 1224 }
    };
  }

  getPageSize(size) {
    return this.pageSizes[size] || this.pageSizes.A4;
  }

  async convertImageToPdf(imageBuffer) {
    console.log('Converting image to PDF');
    
    try {
      const image = sharp(imageBuffer);
      const metadata = await image.metadata();
      const pngBuffer = await image.png().toBuffer();
      
      const pdfDoc = await PDFDocument.create();
      const embeddedImage = await pdfDoc.embedPng(pngBuffer);
      
      const page = pdfDoc.addPage([metadata.width, metadata.height]);
      page.drawImage(embeddedImage, {
        x: 0,
        y: 0,
        width: metadata.width,
        height: metadata.height,
      });
      
      return await pdfDoc.save();
    } catch (error) {
      console.error('Error converting image to PDF:', error);
      throw new Error('Failed to convert image to PDF: ' + error.message);
    }
  }

  async processFile(fileBuffer, fileName, impositionType, options) {
    console.log('Processing file:', fileName, 'Type:', impositionType);
    
    try {
      let pdfBuffer = fileBuffer;
      
      // Convert image to PDF if needed
      if (fileName.toLowerCase().match(/\.(jpg|jpeg|png|gif|bmp|tiff)$/)) {
        pdfBuffer = await this.convertImageToPdf(fileBuffer);
      }
      
      const sourcePdf = await PDFDocument.load(pdfBuffer);
      
      switch (impositionType) {
        case 'booklet':
          return await this.createBooklet(sourcePdf, options);
        case '2up':
          return await this.create2Up(sourcePdf, options);
        case '4up':
          return await this.create4Up(sourcePdf, options);
        default:
          // If no specific imposition, just copy all pages
          return await this.simplePassthrough(sourcePdf);
      }
    } catch (error) {
      console.error('Error processing file:', error);
      throw new Error('Failed to process file: ' + error.message);
    }
  }

  async simplePassthrough(sourcePdf) {
    const targetPdf = await PDFDocument.create();
    const totalPages = sourcePdf.getPageCount();
    const pageIndices = Array.from({ length: totalPages }, (_, i) => i);
    const copiedPages = await targetPdf.copyPages(sourcePdf, pageIndices);
    
    copiedPages.forEach((page) => {
      targetPdf.addPage(page);
    });
    
    return await targetPdf.save();
  }

  async createBooklet(sourcePdf, options) {
    console.log('Creating booklet imposition');
    
    try {
      const targetPdf = await PDFDocument.create();
      const totalPages = sourcePdf.getPageCount();
      const sheetSize = this.getPageSize(options.pageSize || 'A4');
      
      // Pad to multiple of 4 for booklet
      const paddedCount = totalPages % 4 === 0 ? totalPages : totalPages + (4 - (totalPages % 4));
      
      console.log('Total pages:', totalPages, 'Padded to:', paddedCount);
      
      // Copy and embed all pages
      const pageIndices = Array.from({ length: totalPages }, (_, i) => i);
      const copiedPages = await targetPdf.copyPages(sourcePdf, pageIndices);
      
      // Embed pages for drawing
      const embeddedPages = await Promise.all(
        copiedPages.map(page => targetPdf.embedPage(page))
      );
      
      console.log('Copied pages:', copiedPages.length, 'Total pages:', totalPages);
      console.log('Embedded pages:', embeddedPages.length);
      console.log('Embedded pages types:', embeddedPages.map((p, i) => `${i}: ${typeof p}`));
      
      const pageWidth = sheetSize.width / 2;
      const pageHeight = sheetSize.height;

      // Create booklet sheets
      for (let i = 0; i < Math.ceil(paddedCount / 4); i++) {
        const frontSheet = targetPdf.addPage([sheetSize.width, sheetSize.height]);
        const backSheet = targetPdf.addPage([sheetSize.width, sheetSize.height]);

        // Page arrangement for booklet
        const outerLeft = paddedCount - 1 - (i * 2);  // Last pages go on outer left
        const innerLeft = i * 2;                      // First pages go on inner left
        const innerRight = innerLeft + 1;             // Next page on inner right  
        const outerRight = outerLeft - 1;             // Previous page on outer right

        console.log('Sheet', i + 1, '- Front: pages', innerLeft + 1, 'and', outerLeft + 1);
        console.log('Sheet', i + 1, '- Back: pages', innerRight + 1, 'and', outerRight + 1);
        console.log('Array indices - innerLeft:', innerLeft, 'outerLeft:', outerLeft, 'innerRight:', innerRight, 'outerRight:', outerRight);
        console.log('Array bounds check - embeddedPages.length:', embeddedPages.length);

        // Draw pages on front sheet (only if page exists)
        if (innerLeft < embeddedPages.length && embeddedPages[innerLeft]) {
          console.log('Drawing innerLeft page:', innerLeft, 'type:', typeof embeddedPages[innerLeft]);
          this.drawPageScaled(frontSheet, embeddedPages[innerLeft], 0, 0, pageWidth, pageHeight);
        }
        if (outerLeft >= 0 && outerLeft < embeddedPages.length && embeddedPages[outerLeft]) {
          console.log('Drawing outerLeft page:', outerLeft, 'type:', typeof embeddedPages[outerLeft]);
          this.drawPageScaled(frontSheet, embeddedPages[outerLeft], pageWidth, 0, pageWidth, pageHeight);
        }

        // Draw pages on back sheet (only if page exists)
        if (innerRight < embeddedPages.length && embeddedPages[innerRight]) {
          this.drawPageScaled(backSheet, embeddedPages[innerRight], pageWidth, 0, pageWidth, pageHeight);
        }
        if (outerRight >= 0 && outerRight < embeddedPages.length && embeddedPages[outerRight]) {
          this.drawPageScaled(backSheet, embeddedPages[outerRight], 0, 0, pageWidth, pageHeight);
        }
      }

      return await targetPdf.save();
    } catch (error) {
      console.error('Error in createBooklet:', error);
      throw error;
    }
  }

  async create2Up(sourcePdf, options) {
    console.log('Creating 2-up imposition');
    
    try {
      const targetPdf = await PDFDocument.create();
      const totalPages = sourcePdf.getPageCount();
      const sheetSize = this.getPageSize(options.pageSize || 'A4');
      
      const pageIndices = Array.from({ length: totalPages }, (_, i) => i);
      const copiedPages = await targetPdf.copyPages(sourcePdf, pageIndices);
      
      // Embed pages for drawing
      const embeddedPages = await Promise.all(
        copiedPages.map(page => targetPdf.embedPage(page))
      );
      
      const pageWidth = sheetSize.width / 2;
      const pageHeight = sheetSize.height;

      for (let i = 0; i < Math.ceil(totalPages / 2); i++) {
        const sheet = targetPdf.addPage([sheetSize.width, sheetSize.height]);
        
        const leftPageIdx = i * 2;
        const rightPageIdx = i * 2 + 1;

        if (leftPageIdx < embeddedPages.length && embeddedPages[leftPageIdx]) {
          this.drawPageScaled(sheet, embeddedPages[leftPageIdx], 0, 0, pageWidth, pageHeight);
        }

        if (rightPageIdx < embeddedPages.length && embeddedPages[rightPageIdx]) {
          this.drawPageScaled(sheet, embeddedPages[rightPageIdx], pageWidth, 0, pageWidth, pageHeight);
        }
      }

      return await targetPdf.save();
    } catch (error) {
      console.error('Error in create2Up:', error);
      throw error;
    }
  }

  async create4Up(sourcePdf, options) {
    console.log('Creating 4-up imposition');
    
    try {
      const targetPdf = await PDFDocument.create();
      const totalPages = sourcePdf.getPageCount();
      const sheetSize = this.getPageSize(options.pageSize || 'A4');
      
      const pageIndices = Array.from({ length: totalPages }, (_, i) => i);
      const copiedPages = await targetPdf.copyPages(sourcePdf, pageIndices);
      
      // Embed pages for drawing
      const embeddedPages = await Promise.all(
        copiedPages.map(page => targetPdf.embedPage(page))
      );
      
      const pageWidth = sheetSize.width / 2;
      const pageHeight = sheetSize.height / 2;

      for (let i = 0; i < Math.ceil(totalPages / 4); i++) {
        const sheet = targetPdf.addPage([sheetSize.width, sheetSize.height]);
        
        const pageStartIdx = i * 4;
        const positions = [
          { x: 0, y: pageHeight },           // Top left
          { x: pageWidth, y: pageHeight },   // Top right  
          { x: 0, y: 0 },                    // Bottom left
          { x: pageWidth, y: 0 }             // Bottom right
        ];

        for (let j = 0; j < 4; j++) {
          const pageIdx = pageStartIdx + j;
          if (pageIdx < embeddedPages.length && embeddedPages[pageIdx]) {
            this.drawPageScaled(sheet, embeddedPages[pageIdx], 
              positions[j].x, positions[j].y, pageWidth, pageHeight);
          }
        }
      }

      return await targetPdf.save();
    } catch (error) {
      console.error('Error in create4Up:', error);
      throw error;
    }
  }

  getPageDimensions(sourcePage) {
    if (!sourcePage) {
      throw new Error('Source page is missing');
    }

    if (typeof sourcePage.getSize === 'function') {
      return sourcePage.getSize();
    }

    if (typeof sourcePage.width === 'number' && typeof sourcePage.height === 'number') {
      return { width: sourcePage.width, height: sourcePage.height };
    }

    if (typeof sourcePage.size === 'object' && sourcePage.size) {
      const { width, height } = sourcePage.size;
      if (typeof width === 'number' && typeof height === 'number') {
        return { width, height };
      }
    }

    if (typeof sourcePage.scale === 'function') {
      const scaled = sourcePage.scale(1);
      if (scaled && typeof scaled.width === 'number' && typeof scaled.height === 'number') {
        return { width: scaled.width, height: scaled.height };
      }
    }

    throw new Error('Unable to determine source page dimensions');
  }

  drawPageScaled(targetSheet, sourcePage, x, y, width, height) {
    if (!sourcePage || !targetSheet) {
      console.warn('Invalid page objects provided - sourcePage:', typeof sourcePage, 'targetSheet:', typeof targetSheet);
      return;
    }

    if (typeof sourcePage === 'number' && isNaN(sourcePage)) {
      console.error('sourcePage is NaN! Cannot draw page.');
      return;
    }

    try {
      console.log('Drawing page - sourcePage type:', typeof sourcePage, 'sourcePage:', sourcePage);
      const sourceSize = this.getPageDimensions(sourcePage);
      if (!sourceSize || !sourceSize.width || !sourceSize.height) {
        throw new Error('Invalid source page dimensions');
      }
      const scale = Math.min(width / sourceSize.width, height / sourceSize.height);
      const scaledWidth = sourceSize.width * scale;
      const scaledHeight = sourceSize.height * scale;

      const centerX = x + (width - scaledWidth) / 2;
      const centerY = y + (height - scaledHeight) / 2;

      targetSheet.drawPage(sourcePage, {
        x: centerX,
        y: centerY,
        width: scaledWidth,
        height: scaledHeight,
      });
    } catch (error) {
      console.error('Error drawing page:', error);
      throw error;
    }
  }
}

export default new ImpositionService();