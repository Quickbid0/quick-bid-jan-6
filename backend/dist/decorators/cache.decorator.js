"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Cacheable = Cacheable;
exports.CacheEvict = CacheEvict;
function Cacheable(ttl) {
    return (target, propertyKey, descriptor) => {
        const originalMethod = descriptor.value;
        descriptor.value = async function (...args) {
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
function CacheEvict(pattern) {
    return (target, propertyKey, descriptor) => {
        const originalMethod = descriptor.value;
        descriptor.value = async function (...args) {
            const cacheService = require('../services/cache.service').CacheService;
            const result = await originalMethod.apply(this, args);
            if (pattern) {
                const cacheKeys = cacheService['cache'].keys();
                for (const key of cacheKeys) {
                    const keyStr = key;
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
//# sourceMappingURL=cache.decorator.js.map