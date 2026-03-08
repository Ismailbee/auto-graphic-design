import { ref } from 'vue';

// Lazy load tesseract.js - only loads when OCR is actually used
let createWorkerFn: any = null;
const loadTesseract = async () => {
  if (!createWorkerFn) {
    const tesseract = await import('tesseract.js');
    createWorkerFn = tesseract.createWorker;
  }
  return createWorkerFn;
};

// Singleton worker instance
let worker: any = null;
let workerLoadingPromise: Promise<any> | null = null;

export function useOCR() {
  const isProcessing = ref(false);
  const progress = ref(0);
  const error = ref<string | null>(null);

  const initWorker = async () => {
    if (worker) return worker;
    
    if (workerLoadingPromise) return workerLoadingPromise;

    workerLoadingPromise = (async () => {
      try {
        // Lazy load tesseract.js
        const createWorker = await loadTesseract();
        // Use 'tessdata_fast' for better performance on mobile devices
        const newWorker = await createWorker('eng', 1, {
          langPath: 'https://tesseract.js.org/tessdata_fast', 
          logger: (m: any) => {
            // Only update progress if we are actively processing
          }
        });
        worker = newWorker;
        return worker;
      } catch (e) {
        workerLoadingPromise = null;
        throw e;
      }
    })();

    return workerLoadingPromise;
  };

  const recognizeText = async (imageSource: string | File): Promise<string> => {
    isProcessing.value = true;
    progress.value = 0;
    error.value = null;

    try {
      const w = await initWorker();
      
      // Attach a temporary logger for this specific job if possible, 
      // but createWorker options are set at creation. 
      // Tesseract.js v5 doesn't easily support per-job loggers without re-creation.
      // We will simulate progress or just rely on the final result for now to speed things up.

      const { data: { text } } = await w.recognize(imageSource);
      return text;
    } catch (err: any) {
      error.value = err.message || 'An error occurred during OCR processing';
      console.error('OCR Error:', err);
      return '';
    } finally {
      isProcessing.value = false;
    }
  };

  const terminate = async () => {
    if (worker) {
      await worker.terminate();
      worker = null;
      workerLoadingPromise = null;
    }
  };

  return {
    recognizeText,
    terminate,
    isProcessing,
    progress,
    error
  };
}
