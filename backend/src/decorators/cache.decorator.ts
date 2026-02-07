import { SetMetadata } from '@nestjs/common';

export function Cacheable(ttl?: number) {
  return (target: any, propertyKey: string, descriptor?: PropertyDescriptor) => {
    const originalMethod = descriptor.value;
    
    descriptor.value = async function (...args: any[]) {
      const cacheService = require('../services/cache.service').CacheService;
      const cacheKey = `${propertyKey}:${JSON.stringify(args)}`;
      
      let data = cacheService.get(cacheKey);
      if (data !== null) {
        return data;
      }
      
      data = await originalMethod.apply(this, args);
      cacheService.set(cacheKey, data, ttl);
      
      return data;
    };
    
    return descriptor;
  };
}

export function CacheEvict(pattern?: string) {
  return (target: any, propertyKey: string, descriptor?: PropertyDescriptor) => {
    const originalMethod = descriptor.value;
    
    descriptor.value = async function (...args: any[]) {
      const cacheService = require('../services/cache.service').CacheService;
      const result = await originalMethod.apply(this, args);
      
      // Evict cache entries matching pattern
      if (pattern) {
        const cacheKeys = cacheService['cache'].keys();
        for (const key of cacheKeys) {
          const keyStr = key as string;
          if (keyStr.includes(pattern)) {
            cacheService.delete(keyStr);
          }
        }
      }
      
      return result;
    };
    
    return descriptor;
  };
}
