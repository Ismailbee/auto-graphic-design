// Storage utilities with quota management and fallbacks

interface StorageOptions {
  compress?: boolean;
  maxSize?: number; // in MB
  fallbackToMemory?: boolean;
}

class SafeStorage {
  private memoryFallback = new Map<string, string>();
  private readonly QUOTA_THRESHOLD = 0.8; // 80% of quota
  
  constructor(private storage: Storage = localStorage) {}
  
  /**
   * Safely set item in storage with quota management
   */
  setItem(key: string, value: string, options: StorageOptions = {}): boolean {
    try {
      // Check quota before setting
      if (this.isQuotaExceeded()) {
        console.warn('📦 Storage quota threshold reached, cleaning up...');
        this.cleanup();
      }
      
      const finalValue = options.compress ? this.compress(value) : value;
      
      // Check size limit
      if (options.maxSize && this.getItemSize(finalValue) > options.maxSize * 1024 * 1024) {
        console.warn(`📦 Item too large (${this.getItemSize(finalValue)} bytes), skipping storage`);
        return false;
      }
      
      this.storage.setItem(key, finalValue);
      const size = this.getItemSize(finalValue);
      // Only log larger operations to reduce console noise
      if (size > 50000) {
        console.log(`✅ Stored ${key} (${size} bytes)`);
      }
      return true;
      
    } catch (error: unknown) {
      if (error instanceof DOMException && error.name === 'QuotaExceededError') {
        console.warn('💾 Storage quota exceeded, attempting cleanup...');
        
        // Try cleanup and retry once
        this.cleanup();
        try {
          const finalValue = options.compress ? this.compress(value) : value;
          this.storage.setItem(key, finalValue);
          console.log(`✅ Stored ${key} after cleanup`);
          return true;
        } catch (retryError) {
          console.error('💾 Storage still full after cleanup');
          
          // Fallback to memory if requested
          if (options.fallbackToMemory) {
            this.memoryFallback.set(key, value);
            console.log(`🧠 Using memory fallback for ${key}`);
            return true;
          }
        }
      }
      
      console.error(`🚫 Failed to store ${key}:`, error.message);
      return false;
    }
  }
  
  /**
   * Safely get item from storage with fallback
   */
  getItem(key: string, options: StorageOptions = {}): string | null {
    try {
      const value = this.storage.getItem(key);
      if (value && options.compress) {
        return this.decompress(value);
      }
      return value;
    } catch (error) {
      // Only log missing critical data to reduce console noise
      if (key.includes('authenticated') || key.includes('user') || key.includes('token')) {
        console.warn(`📦 Failed to get ${key} from storage, checking memory fallback`);
      }
      return this.memoryFallback.get(key) || null;
    }
  }
  
  /**
   * Remove item from storage and memory
   */
  removeItem(key: string): void {
    try {
      this.storage.removeItem(key);
      this.memoryFallback.delete(key);
    } catch (error) {
      console.warn(`📦 Failed to remove ${key}:`, error);
    }
  }
  
  /**
   * Check if storage quota is near limit
   */
  private isQuotaExceeded(): boolean {
    try {
      if ('estimate' in navigator.storage) {
        navigator.storage.estimate().then(estimate => {
          const usage = estimate.usage || 0;
          const quota = estimate.quota || Infinity;
          const ratio = usage / quota;
          
          if (ratio > this.QUOTA_THRESHOLD) {
            console.warn(`📦 Storage usage: ${(ratio * 100).toFixed(1)}% (${this.formatBytes(usage)}/${this.formatBytes(quota)})`);
            return true;
          }
        });
      }
      return false;
    } catch {
      return false;
    }
  }
  
  /**
   * Clean up old/large items from storage
   */
  private cleanup(): void {
    try {
      const items: Array<{key: string, size: number, age: number}> = [];
      
      // Collect all items with metadata
      for (let i = 0; i < this.storage.length; i++) {
        const key = this.storage.key(i);
        if (key) {
          const value = this.storage.getItem(key);
          if (value) {
            items.push({
              key,
              size: this.getItemSize(value),
              age: Date.now() - (parseInt(key.split('_timestamp_')[1]) || 0)
            });
          }
        }
      }
      
      // Sort by size (descending) and age (descending)
      items.sort((a, b) => (b.size + b.age/1000) - (a.size + a.age/1000));
      
      // Remove largest/oldest items (up to 25% of total)
      const itemsToRemove = Math.ceil(items.length * 0.25);
      for (let i = 0; i < itemsToRemove && i < items.length; i++) {
        this.storage.removeItem(items[i].key);
        console.log(`🗑️ Cleaned up ${items[i].key} (${this.formatBytes(items[i].size)})`);
      }
      
    } catch (error) {
      console.error('🗑️ Cleanup failed:', error);
    }
  }
  
  private compress(data: string): string {
    // Simple compression - in production, use a proper compression library
    try {
      return btoa(data);
    } catch {
      return data;
    }
  }
  
  private decompress(data: string): string {
    try {
      return atob(data);
    } catch {
      return data;
    }
  }
  
  private getItemSize(value: string): number {
    return new Blob([value]).size;
  }
  
  private formatBytes(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }
}

// Export singleton instances
export const safeLocalStorage = new SafeStorage(localStorage);
export const safeSessionStorage = new SafeStorage(sessionStorage);

// Legacy compatibility
export const storageUtils = {
  setItem: (key: string, value: string, options?: StorageOptions) => safeLocalStorage.setItem(key, value, options),
  getItem: (key: string, options?: StorageOptions) => safeLocalStorage.getItem(key, options),
  removeItem: (key: string) => safeLocalStorage.removeItem(key)
};