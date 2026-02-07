// Real Product Service - Local Backend Implementation
const API_URL = 'http://localhost:4011';

export interface ProductEnvironment {
  isRealProduct: boolean;
  environment: 'test' | 'beta' | 'live';
}

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

export class ProductService {
  // Get all products
  static async getAllProducts(): Promise<RealProduct[]> {
    try {
      const response = await fetch(`${API_URL}/products`);
      
      if (!response.ok) {
        console.error('ProductService: Failed to fetch products:', response.statusText);
        return [];
      }

      const products = await response.json();
      
      return products.map(product => ({
        id: product.id.toString(),
        title: product.title,
        description: product.description,
        category: product.category,
        images: product.images || [],
        startingPrice: product.startingPrice,
        currentBid: product.currentBid,
        auctionEnd: new Date(product.endTime),
        seller: {
          id: product.seller.id,
          name: product.seller.name,
          verified: true
        },
        environment: {
          isRealProduct: true,
          environment: 'live' as const
        },
        verificationStatus: 'approved' as const,
        createdAt: new Date(product.createdAt),
        updatedAt: new Date(product.updatedAt)
      }));
    } catch (error) {
      console.error('ProductService: Failed to fetch products:', error);
      return [];
    }
  }

  // Get product by ID
  static async getProductById(id: string): Promise<RealProduct | null> {
    try {
      const response = await fetch(`${API_URL}/products/${id}`);
      
      if (!response.ok) {
        console.error('ProductService: Failed to fetch product:', response.statusText);
        return null;
      }

      const product = await response.json();
      
      if (!product) {
        return null;
      }

      return {
        id: product.id.toString(),
        title: product.title,
        description: product.description,
        category: product.category,
        images: product.images || [],
        startingPrice: product.startingPrice,
        currentBid: product.currentBid,
        auctionEnd: new Date(product.endTime),
        seller: {
          id: product.seller.id,
          name: product.seller.name,
          verified: true
        },
        environment: {
          isRealProduct: true,
          environment: 'live' as const
        },
        verificationStatus: 'approved' as const,
        createdAt: new Date(product.createdAt),
        updatedAt: new Date(product.updatedAt)
      };
    } catch (error) {
      console.error('ProductService: Error fetching product:', error);
      return null;
    }
  }

  // Create new product
  static async createProduct(product: Omit<RealProduct, 'id' | 'createdAt' | 'updatedAt' | 'environment' | 'verificationStatus'>): Promise<RealProduct | null> {
    try {
      const response = await fetch(`${API_URL}/products`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: product.title,
          description: product.description,
          category: product.category,
          images: product.images,
          startingPrice: product.startingPrice,
          currentBid: product.startingPrice,
          endTime: product.auctionEnd.toISOString(),
          sellerId: product.seller.id
        })
      });

      if (!response.ok) {
        console.error('ProductService: Failed to create product:', response.statusText);
        return null;
      }

      const createdProduct = await response.json();
      
      return {
        id: createdProduct.id.toString(),
        title: createdProduct.title,
        description: createdProduct.description,
        category: createdProduct.category,
        images: createdProduct.images || [],
        startingPrice: createdProduct.startingPrice,
        currentBid: createdProduct.currentBid,
        auctionEnd: new Date(createdProduct.endTime),
        seller: {
          id: createdProduct.seller.id,
          name: createdProduct.seller.name,
          verified: true
        },
        environment: {
          isRealProduct: true,
          environment: 'live' as const
        },
        verificationStatus: 'pending' as const,
        createdAt: new Date(createdProduct.createdAt),
        updatedAt: new Date(createdProduct.updatedAt)
      };
    } catch (error) {
      console.error('ProductService: Error creating product:', error);
      return null;
    }
  }

  // Update product
  static async updateProduct(id: string, updates: Partial<RealProduct>): Promise<RealProduct | null> {
    try {
      const updateData: any = {};
      
      if (updates.title) updateData.title = updates.title;
      if (updates.description) updateData.description = updates.description;
      if (updates.category) updateData.category = updates.category;
      if (updates.images) updateData.images = updates.images;
      if (updates.startingPrice) updateData.startingPrice = updates.startingPrice;
      if (updates.currentBid) updateData.currentBid = updates.currentBid;
      if (updates.auctionEnd) updateData.endTime = updates.auctionEnd.toISOString();

      const response = await fetch(`${API_URL}/products/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData)
      });

      if (!response.ok) {
        console.error('ProductService: Failed to update product:', response.statusText);
        return null;
      }

      const updatedProduct = await response.json();
      
      return {
        id: updatedProduct.id.toString(),
        title: updatedProduct.title,
        description: updatedProduct.description,
        category: updatedProduct.category,
        images: updatedProduct.images || [],
        startingPrice: updatedProduct.startingPrice,
        currentBid: updatedProduct.currentBid,
        auctionEnd: new Date(updatedProduct.endTime),
        seller: {
          id: updatedProduct.seller.id,
          name: updatedProduct.seller.name,
          verified: true
        },
        environment: {
          isRealProduct: true,
          environment: 'live' as const
        },
        verificationStatus: 'approved' as const,
        createdAt: new Date(updatedProduct.createdAt),
        updatedAt: new Date(updatedProduct.updatedAt)
      };
    } catch (error) {
      console.error('ProductService: Error updating product:', error);
      return null;
    }
  }

  // Delete product
  static async deleteProduct(id: string): Promise<boolean> {
    try {
      const response = await fetch(`${API_URL}/products/${id}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        console.error('ProductService: Failed to delete product:', response.statusText);
        return false;
      }

      return true;
    } catch (error) {
      console.error('ProductService: Error deleting product:', error);
      return false;
    }
  }

  // Get products by seller
  static async getProductsBySeller(sellerId: string): Promise<RealProduct[]> {
    try {
      const response = await fetch(`${API_URL}/products?sellerId=${sellerId}`);
      
      if (!response.ok) {
        console.error('ProductService: Failed to fetch seller products:', response.statusText);
        return [];
      }

      const products = await response.json();
      
      return products.map(product => ({
        id: product.id.toString(),
        title: product.title,
        description: product.description,
        category: product.category,
        images: product.images || [],
        startingPrice: product.startingPrice,
        currentBid: product.currentBid,
        auctionEnd: new Date(product.endTime),
        seller: {
          id: product.seller.id,
          name: product.seller.name,
          verified: true
        },
        environment: {
          isRealProduct: true,
          environment: 'live' as const
        },
        verificationStatus: 'approved' as const,
        createdAt: new Date(product.createdAt),
        updatedAt: new Date(product.updatedAt)
      }));
    } catch (error) {
      console.error('ProductService: Error fetching seller products:', error);
      return [];
    }
  }

  // Safety validation
  static validateProduct(product: Partial<RealProduct>): boolean {
    if (!product.title || !product.description || !product.category) {
      return false;
    }
    
    if (!product.seller || !product.seller.id) {
      return false;
    }
    
    if (product.startingPrice && product.startingPrice <= 0) {
      return false;
    }
    
    return true;
  }
}
