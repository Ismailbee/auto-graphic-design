/**
 * Firebase Error Handler
 * Provides robust error handling for Firebase connection and storage issues
 */

import { FirebaseError } from 'firebase/app';

interface ErrorHandlerOptions {
  fallbackToMemory?: boolean;
  suppressConsoleErrors?: boolean;
  retryAttempts?: number;
}

class FirebaseErrorHandler {
  private retryAttempts = new Map<string, number>();
  private readonly MAX_RETRIES = 3;
  
  /**
   * Handle Firebase operation errors with graceful fallbacks
   */
  async handleFirebaseError<T>(
    operation: () => Promise<T>,
    operationName: string,
    options: ErrorHandlerOptions = {}
  ): Promise<T | null> {
    const { suppressConsoleErrors = false, retryAttempts = this.MAX_RETRIES } = options;
    
    try {
      return await operation();
    } catch (error) {
      return this.processError(error, operationName, options);
    }
  }
  
  /**
   * Handle Firebase errors with retry logic and fallbacks
   */
  private async processError<T>(
    error: any,
    operationName: string,
    options: ErrorHandlerOptions
  ): Promise<T | null> {
    const { suppressConsoleErrors = false, retryAttempts = this.MAX_RETRIES } = options;
    
    if (error instanceof FirebaseError) {
      return this.handleKnownFirebaseError(error, operationName, suppressConsoleErrors);
    }
    
    // Handle storage access errors
    if (this.isStorageError(error)) {
      return this.handleStorageError(error, operationName, suppressConsoleErrors);
    }
    
    // Handle network errors with retry
    if (this.isNetworkError(error) && this.shouldRetry(operationName, retryAttempts)) {
      await this.delay(1000); // Wait 1 second before retry
      return null; // Caller should implement retry logic
    }
    
    // Log unknown errors if not suppressed
    if (!suppressConsoleErrors) {
      console.warn(`🔥 ${operationName} failed:`, this.getErrorMessage(error));
    }
    
    return null;
  }
  
  /**
   * Handle known Firebase errors with appropriate responses
   */
  private handleKnownFirebaseError(
    error: FirebaseError,
    operationName: string,
    suppressConsoleErrors: boolean
  ): null {
    const errorCode = error.code;
    
    switch (errorCode) {
      case 'permission-denied':
        if (!suppressConsoleErrors) {
          console.warn(`🔐 ${operationName}: Permission denied. Check Firebase rules.`);
        }
        break;
        
      case 'unavailable':
        if (!suppressConsoleErrors) {
          console.warn(`🌐 ${operationName}: Firebase service temporarily unavailable.`);
        }
        break;
        
      case 'deadline-exceeded':
        if (!suppressConsoleErrors) {
          console.warn(`⏰ ${operationName}: Request timeout. Check network connection.`);
        }
        break;
        
      case 'unauthenticated':
        if (!suppressConsoleErrors) {
          console.warn(`🚫 ${operationName}: User not authenticated.`);
        }
        break;
        
      default:
        if (!suppressConsoleErrors) {
          console.warn(`🔥 ${operationName} Firebase error [${errorCode}]:`, error.message);
        }
        break;
    }
    
    return null;
  }
  
  /**
   * Handle storage access errors (tracking prevention, quota exceeded, etc.)
   */
  private handleStorageError(
    error: any,
    operationName: string,
    suppressConsoleErrors: boolean
  ): null {
    const errorMessage = this.getErrorMessage(error);
    
    if (errorMessage.includes('Tracking Prevention') || 
        errorMessage.includes('storage access')) {
      // These are browser-level restrictions, handle gracefully
      if (!suppressConsoleErrors) {
        console.warn(`📦 ${operationName}: Storage access restricted by browser. Using memory fallback.`);
      }
    } else if (errorMessage.includes('QuotaExceeded')) {
      if (!suppressConsoleErrors) {
        console.warn(`💾 ${operationName}: Storage quota exceeded. Consider clearing old data.`);
      }
    } else {
      if (!suppressConsoleErrors) {
        console.warn(`📦 ${operationName}: Storage error:`, errorMessage);
      }
    }
    
    return null;
  }
  
  /**
   * Check if error is related to storage access
   */
  private isStorageError(error: any): boolean {
    const errorMessage = this.getErrorMessage(error);
    return errorMessage.includes('storage') || 
           errorMessage.includes('localStorage') || 
           errorMessage.includes('sessionStorage') ||
           errorMessage.includes('QuotaExceeded') ||
           errorMessage.includes('Tracking Prevention');
  }
  
  /**
   * Check if error is network-related and retryable
   */
  private isNetworkError(error: any): boolean {
    const errorMessage = this.getErrorMessage(error);
    return errorMessage.includes('network') || 
           errorMessage.includes('timeout') || 
           errorMessage.includes('fetch') ||
           errorMessage.includes('Failed to fetch');
  }
  
  /**
   * Determine if operation should be retried
   */
  private shouldRetry(operationName: string, maxRetries: number): boolean {
    const currentAttempts = this.retryAttempts.get(operationName) || 0;
    if (currentAttempts >= maxRetries) {
      this.retryAttempts.delete(operationName);
      return false;
    }
    
    this.retryAttempts.set(operationName, currentAttempts + 1);
    return true;
  }
  
  /**
   * Get error message safely
   */
  private getErrorMessage(error: any): string {
    if (error instanceof Error) {
      return error.message;
    }
    if (typeof error === 'string') {
      return error;
    }
    return String(error);
  }
  
  /**
   * Simple delay utility for retries
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
  
  /**
   * Reset retry counters (useful for testing or manual reset)
   */
  resetRetryCounters(): void {
    this.retryAttempts.clear();
  }
  
  /**
   * Get current retry status for debugging
   */
  getRetryStatus(): Map<string, number> {
    return new Map(this.retryAttempts);
  }
}

// Export singleton instance
export const firebaseErrorHandler = new FirebaseErrorHandler();

// Export utility functions for common error handling patterns
export const withFirebaseErrorHandling = async <T>(
  operation: () => Promise<T>,
  operationName: string,
  options?: ErrorHandlerOptions
): Promise<T | null> => {
  return firebaseErrorHandler.handleFirebaseError(operation, operationName, options);
};

export default FirebaseErrorHandler;