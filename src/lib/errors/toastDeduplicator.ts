import { type AppError } from './types';

interface ToastSignature {
  code: string;
  title: string;
  message: string;
  timestamp: number;
}

/**
 * Toast de-duplication manager to prevent spam
 */
export class ToastDeduplicator {
  private static recentToasts = new Map<string, ToastSignature>();
  private static readonly DEDUP_WINDOW_MS = 8000; // 8 seconds

  /**
   * Generates a signature for toast de-duplication
   */
  private static generateSignature(error: AppError): string {
    return `${error.code}:${error.userMessage.title}:${error.userMessage.message}`;
  }

  /**
   * Checks if a toast should be shown or if it's a duplicate
   */
  static shouldShowToast(error: AppError): boolean {
    const signature = this.generateSignature(error);
    const now = Date.now();
    
    const recent = this.recentToasts.get(signature);
    
    if (recent && (now - recent.timestamp) < this.DEDUP_WINDOW_MS) {
      return false; // Duplicate within window
    }

    // Record this toast
    this.recentToasts.set(signature, {
      code: error.code,
      title: error.userMessage.title,
      message: error.userMessage.message,
      timestamp: now
    });

    // Clean up old entries
    this.cleanup();
    
    return true;
  }

  /**
   * Cleans up old toast signatures
   */
  private static cleanup(): void {
    const now = Date.now();
    const cutoff = now - this.DEDUP_WINDOW_MS;
    
    for (const [signature, toast] of this.recentToasts.entries()) {
      if (toast.timestamp < cutoff) {
        this.recentToasts.delete(signature);
      }
    }
  }

  /**
   * Clears all stored toast signatures (useful for testing)
   */
  static clear(): void {
    this.recentToasts.clear();
  }

  /**
   * Gets the count of recent toasts (useful for testing)
   */
  static getRecentCount(): number {
    this.cleanup();
    return this.recentToasts.size;
  }
}