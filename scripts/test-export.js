// Test script for PDF to DOC conversion
// Run this with: node test-export.js

import express from 'express';
import cors from 'cors';
import multer from 'multer';
import { PDFDocument } from 'pdf-lib';

const testApp = express();
const testPort = 3099;

testApp.use(cors());
testApp.use(express.json());

const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

// Test export endpoint
testApp.post('/test-export', upload.single('file'), async (req, res) => {
  console.log('🧪 Testing PDF to DOC conversion...');
  
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const exportFormat = 'doc';
    console.log(`✅ Processing ${exportFormat.toUpperCase()} conversion...`);

    // Create a simple test RTF document
    const rtfContent = `{\\rtf1\\ansi\\deff0
{\\fonttbl{\\f0\\fnil\\fcharset0 Arial;}}
{\\*\\generator SmartDesignPro Test;}
\\viewkind4\\uc1\\pard\\f0\\fs24
PDF to Word Conversion Test\\par
\\par
This is a test conversion from PDF to Word format.\\par
Conversion completed successfully!\\par
\\par
Generated on: ${new Date().toLocaleString()}\\par
}`;
    
    const docBuffer = Buffer.from(rtfContent, 'utf8');
    
    res.set({
      'Content-Type': 'application/rtf',
      'Content-Disposition': `attachment; filename="test-conversion-${Date.now()}.rtf"`,
      'Content-Length': docBuffer.length
    });
    
    res.send(docBuffer);
    console.log(`✅ Test conversion completed successfully (${docBuffer.length} bytes)`);
    
  } catch (error) {
    console.error('❌ Test conversion failed:', error);
    res.status(500).json({ 
      error: 'Test conversion failed',
      details: error.message 
    });
  }
});

testApp.listen(testPort, () => {
  console.log(`🧪 Test server running on http://localhost:${testPort}`);
  console.log('📤 Test endpoint: POST /test-export');
  console.log('💡 To test: Upload a file to http://localhost:3099/test-export');
});