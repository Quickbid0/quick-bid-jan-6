export declare function Cacheable(ttl?: number): (target: any, propertyKey: string, descriptor?: PropertyDescriptor) => PropertyDescriptor;
export declare function CacheEvict(pattern?: string): (target: any, propertyKey: string, descriptor?: PropertyDescriptor) => PropertyDescriptor;
