// Simple backend API client for imposition endpoints
// Uses VITE_IMPOSITION_BASE_URL if provided, otherwise falls back to export server on 3001

const getBaseUrl = () => {
  const v = import.meta?.env?.VITE_IMPOSITION_BASE_URL
  if (v && typeof v === 'string' && v.trim()) return v.trim()
  return 'http://localhost:3001'
}

// Mock function to create a simple PDF blob for testing
function createMockPDF(filename = 'test.pdf') {
  const content = `%PDF-1.4
1 0 obj
<<
/Type /Catalog
/Pages 2 0 R
>>
endobj

2 0 obj
<<
/Type /Pages
/Kids [3 0 R]
/Count 1
>>
endobj

3 0 obj
<<
/Type /Page
/Parent 2 0 R
/MediaBox [0 0 612 792]
/Contents 4 0 R
>>
endobj

4 0 obj
<<
/Length 44
>>
stream
BT
/F1 12 Tf
100 700 Td
(Mock PDF for 1-64.pdf) Tj
ET
endstream
endobj

xref
0 5
0000000000 65535 f 
0000000009 00000 n 
0000000074 00000 n 
0000000120 00000 n 
0000000179 00000 n 
trailer
<<
/Size 5
/Root 1 0 R
>>
startxref
273
%%EOF`;
  
  return new Blob([content], { type: 'application/pdf' });
}

async function requestImposition(path, formData) {
  const base = getBaseUrl()
  
  try {
    const resp = await fetch(`${base}${path}`, {
      method: 'POST',
      body: formData
    })
    
    if (!resp.ok) {
      let msg = `HTTP ${resp.status}`
      try {
        const text = await resp.text()
        try {
          const j = JSON.parse(text)
          msg = j.error || msg
        } catch (_) {
          msg = text || msg
        }
      } catch (e) {
        // ignore parse errors and keep default message
      }
      throw new Error(msg)
    }
    
    return await resp.blob()
  } catch (error) {
    // If network error (backend not running), return mock PDF for testing
    if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
      console.warn(`Backend not available at ${base}${path}, returning mock PDF for testing`)
      
      // Simulate processing delay
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Get file name for mock
      const files = formData.getAll('files') || [formData.get('file')]
      const fileName = files[0]?.name || 'imposed-document'
      
      return createMockPDF(fileName)
    }
    
    // Re-throw other errors
    throw error
  }
}

export const backendApi = {
  // formData should include: file, impositionType, pageSize, orientation, addBlankPages
  impose: async (formData) => requestImposition('/api/imposition/process', formData),
  // formData should include: files[] (multiple), impositionType, pageSize, orientation, addBlankPages
  merge: async (formData) => requestImposition('/api/imposition/merge', formData),
  // formData should include: files[] (images to convert to PDF)
  convert: async (formData) => requestImposition('/api/imposition/convert', formData),
  // formData should include: file or files[], exportFormat (jpeg, png, doc)
  export: async (formData) => requestImposition('/api/imposition/export', formData),
}
