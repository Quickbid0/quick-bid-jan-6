// Real Product Flag System
export interface ProductEnvironment {
  isRealProduct: boolean;
  environment: 'test' | 'beta' | 'live';
}

// Real Product Data Structure
export interface RealProduct {
  id: string;
  title: string;
  description: string;
  category: string;
  images: string[];
  startingPrice: number;
  currentBid: number;
  auctionEnd: Date;
  seller: {
    id: string;
    name: string;
    verified: boolean;
  };
  environment: ProductEnvironment;
  verificationStatus: 'pending' | 'approved' | 'rejected';
  createdAt: Date;
  updatedAt: Date;
}

// Product Service with Real Data Support
export class ProductService {
  private static readonly MAX_REAL_PRODUCTS = 10;
  
  static async getProducts(environment?: 'test' | 'beta' | 'live'): Promise<RealProduct[]> {
    // Mix of mock and real products based on environment
    const mockProducts = await this.getMockProducts();
    const realProducts = await this.getRealProducts(environment);
    
    // Prioritize real products but ensure minimum content
    const allProducts = [...realProducts, ...mockProducts];
    return allProducts.slice(0, this.MAX_REAL_PRODUCTS);
  }
  
  static async getProductById(id: string): Promise<RealProduct | null> {
    // Try real products first, then fallback to mock
    const realProduct = await this.getRealProductById(id);
    if (realProduct) return realProduct;
    
    return this.getMockProductById(id);
  }
  
  private static async getRealProducts(environment?: 'test' | 'beta' | 'live'): Promise<RealProduct[]> {
    // TODO: Implement real product fetching from database
    // For now, return empty array - will be implemented in next steps
    return [];
  }
  
  private static async getRealProductById(id: string): Promise<RealProduct | null> {
    // TODO: Implement real product fetching by ID
    return null;
  }
  
  private static async getMockProducts(): Promise<RealProduct[]> {
    // Existing mock product logic
    return [];
  }
  
  private static async getMockProductById(id: string): Promise<RealProduct | null> {
    // Existing mock product logic
    return null;
  }
  
  // Safety validation
  static validateRealProduct(product: Partial<RealProduct>): boolean {
    if (!product.title || !product.description || !product.category) {
      return false;
    }
    
    if (!product.seller || !product.seller.id) {
      return false;
    }
    
    if (product.startingPrice && product.startingPrice < 0) {
      return false;
    }
    
    return true;
  }
}
