/**
 * Logger utility for consistent logging across the application
 * In production, you can easily disable or redirect logs
 */

const isDevelopment = import.meta.env.DEV

export const logger = {
  log: (...args: any[]) => {
    if (isDevelopment) {
      console.log(...args)
    }
  },
  
  warn: (...args: any[]) => {
    console.warn(...args)
  },
  
  error: (...args: any[]) => {
    console.error(...args)
  },
  
  debug: (...args: any[]) => {
    if (isDevelopment) {
      console.log('[DEBUG]', ...args)
    }
  },
  
  info: (...args: any[]) => {
    if (isDevelopment) {
      console.log('[INFO]', ...args)
    }
  }
}

