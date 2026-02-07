import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class CacheService {
  private cache = new Map<string, { data: any; expires: number; }>();
  private readonly logger = new Logger(CacheService.name);
  private readonly defaultTTL = 5 * 60 * 1000; // 5 minutes

  set(key: string, data: any, ttl?: number): void {
    const expires = Date.now() + (ttl || this.defaultTTL);
    this.cache.set(key, { data, expires });
  }

  get(key: string): any | null {
    const item = this.cache.get(key);
    
    if (!item) {
      return null;
    }
    
    if (Date.now() > item.expires) {
      this.cache.delete(key);
      return null;
    }
    
    return item.data;
  }

  delete(key: string): boolean {
    return this.cache.delete(key);
  }

  clear(): void {
    this.cache.clear();
  }

  getStats(): { size: number; memoryUsage: number } {
    let memoryUsage = 0;
    this.cache.forEach(item => {
      memoryUsage += JSON.stringify(item.data).length;
    });
    
    return {
      size: this.cache.size,
      memoryUsage,
    };
  }
}
