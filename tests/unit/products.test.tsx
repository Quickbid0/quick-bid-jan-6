import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';
import Products from '../../pages/Products';
import ProductDetail from '../../pages/ProductDetail';
import { productService } from '../../services/productService';

// Mock productService
jest.mock('../../services/productService');
const mockProductService = productService as jest.Mocked<typeof productService>;

// Mock storage service
jest.mock('../../services/storageService', () => ({
  storageService: {
    getAuthUser: jest.fn(() => ({
      id: 'test-user-id',
      email: 'test@example.com',
      role: 'buyer',
    })),
  },
}));

// Mock Supabase
jest.mock('../../lib/supabase', () => ({
  supabase: {
    from: jest.fn(() => ({
      select: jest.fn(() => ({
        eq: jest.fn(() => ({
          data: [],
          error: null,
        })),
      })),
    })),
  },
}));

const createTestQueryClient = () => new QueryClient({
  defaultOptions: {
    queries: { retry: false },
    mutations: { retry: false },
  },
});

const renderWithProviders = (ui: React.ReactElement) => {
  const queryClient = createTestQueryClient();
  return render(
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        {ui}
      </BrowserRouter>
    </QueryClientProvider>
  );
};

// Mock product data
const mockProducts = [
  {
    id: '1',
    title: 'Test Product 1',
    description: 'Test description 1',
    category: 'electronics',
    startingPrice: 100,
    currentBid: 150,
    auctionEnd: new Date(Date.now() + 86400000).toISOString(),
    sellerId: 'seller-1',
    images: ['image1.jpg'],
    verificationStatus: 'approved',
    auctionStatus: 'active',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '2',
    title: 'Test Product 2',
    description: 'Test description 2',
    category: 'vehicles',
    startingPrice: 5000,
    currentBid: 5500,
    auctionEnd: new Date(Date.now() + 172800000).toISOString(),
    sellerId: 'seller-2',
    images: ['image2.jpg'],
    verificationStatus: 'approved',
    auctionStatus: 'active',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

describe('Product Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Products Page', () => {
    it('renders product list correctly', async () => {
      mockProductService.getAllProducts.mockResolvedValue(mockProducts);

      renderWithProviders(<Products />);

      await waitFor(() => {
        expect(screen.getByText('Test Product 1')).toBeInTheDocument();
        expect(screen.getByText('Test Product 2')).toBeInTheDocument();
        expect(screen.getByText('₹100')).toBeInTheDocument();
        expect(screen.getByText('₹5,000')).toBeInTheDocument();
      });
    });

    it('shows loading state while fetching products', () => {
      mockProductService.getAllProducts.mockReturnValue(new Promise(() => {}));

      renderWithProviders(<Products />);

      expect(screen.getByText(/loading products/i)).toBeInTheDocument();
    });

    it('shows error message when products fail to load', async () => {
      mockProductService.getAllProducts.mockRejectedValue(new Error('Failed to fetch'));

      renderWithProviders(<Products />);

      await waitFor(() => {
        expect(screen.getByText(/failed to load products/i)).toBeInTheDocument();
      });
    });

    it('filters products by category', async () => {
      mockProductService.getAllProducts.mockResolvedValue(mockProducts);

      renderWithProviders(<Products />);

      await waitFor(() => {
        expect(screen.getByText('Test Product 1')).toBeInTheDocument();
      });

      const categoryFilter = screen.getByLabelText(/category/i);
      fireEvent.change(categoryFilter, { target: { value: 'electronics' } });

      await waitFor(() => {
        expect(screen.getByText('Test Product 1')).toBeInTheDocument();
        expect(screen.queryByText('Test Product 2')).not.toBeInTheDocument();
      });
    });

    it('searches products by title', async () => {
      mockProductService.getAllProducts.mockResolvedValue(mockProducts);

      renderWithProviders(<Products />);

      await waitFor(() => {
        expect(screen.getByText('Test Product 1')).toBeInTheDocument();
      });

      const searchInput = screen.getByPlaceholderText(/search products/i);
      fireEvent.change(searchInput, { target: { value: 'Product 1' } });

      await waitFor(() => {
        expect(screen.getByText('Test Product 1')).toBeInTheDocument();
        expect(screen.queryByText('Test Product 2')).not.toBeInTheDocument();
      });
    });

    it('sorts products by price', async () => {
      mockProductService.getAllProducts.mockResolvedValue(mockProducts);

      renderWithProviders(<Products />);

      await waitFor(() => {
        expect(screen.getByText('Test Product 1')).toBeInTheDocument();
      });

      const sortSelect = screen.getByLabelText(/sort by/i);
      fireEvent.change(sortSelect, { target: { value: 'price-low' } });

      await waitFor(() => {
        const products = screen.getAllByTestId('product-card');
        expect(products[0]).toHaveTextContent('Test Product 1');
        expect(products[1]).toHaveTextContent('Test Product 2');
      });
    });

    it('shows no products message when list is empty', async () => {
      mockProductService.getAllProducts.mockResolvedValue([]);

      renderWithProviders(<Products />);

      await waitFor(() => {
        expect(screen.getByText(/no products found/i)).toBeInTheDocument();
      });
    });
  });

  describe('Product Detail Page', () => {
    const mockProduct = mockProducts[0];

    it('renders product details correctly', async () => {
      mockProductService.getProductById.mockResolvedValue(mockProduct);

      renderWithProviders(<ProductDetail productId="1" />);

      await waitFor(() => {
        expect(screen.getByText('Test Product 1')).toBeInTheDocument();
        expect(screen.getByText('Test description 1')).toBeInTheDocument();
        expect(screen.getByText('₹100')).toBeInTheDocument();
        expect(screen.getByText('₹150')).toBeInTheDocument();
        expect(screen.getByText('electronics')).toBeInTheDocument();
      });
    });

    it('shows loading state while fetching product', () => {
      mockProductService.getProductById.mockReturnValue(new Promise(() => {}));

      renderWithProviders(<ProductDetail productId="1" />);

      expect(screen.getByText(/loading product/i)).toBeInTheDocument();
    });

    it('shows error message when product fails to load', async () => {
      mockProductService.getProductById.mockRejectedValue(new Error('Product not found'));

      renderWithProviders(<ProductDetail productId="1" />);

      await waitFor(() => {
        expect(screen.getByText(/product not found/i)).toBeInTheDocument();
      });
    });

    it('shows bid button for authenticated users', async () => {
      mockProductService.getProductById.mockResolvedValue(mockProduct);

      renderWithProviders(<ProductDetail productId="1" />);

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /place bid/i })).toBeInTheDocument();
      });
    });

    it('shows login prompt for unauthenticated users', async () => {
      mockProductService.getProductById.mockResolvedValue(mockProduct);

      // Mock unauthenticated user
      jest.doMock('../../services/storageService', () => ({
        storageService: {
          getAuthUser: jest.fn(() => null),
        },
      }));

      renderWithProviders(<ProductDetail productId="1" />);

      await waitFor(() => {
        expect(screen.getByText(/login to bid/i)).toBeInTheDocument();
      });
    });

    it('shows time remaining for auction', async () => {
      const futureDate = new Date(Date.now() + 86400000); // 24 hours from now
      const productWithFutureEnd = {
        ...mockProduct,
        auctionEnd: futureDate.toISOString(),
      };

      mockProductService.getProductById.mockResolvedValue(productWithFutureEnd);

      renderWithProviders(<ProductDetail productId="1" />);

      await waitFor(() => {
        expect(screen.getByText(/time remaining/i)).toBeInTheDocument();
        expect(screen.getByText(/23h/i)).toBeInTheDocument();
      });
    });

    it('shows auction ended message for expired auctions', async () => {
      const pastDate = new Date(Date.now() - 86400000); // 24 hours ago
      const expiredProduct = {
        ...mockProduct,
        auctionEnd: pastDate.toISOString(),
        auctionStatus: 'ended',
      };

      mockProductService.getProductById.mockResolvedValue(expiredProduct);

      renderWithProviders(<ProductDetail productId="1" />);

      await waitFor(() => {
        expect(screen.getByText(/auction ended/i)).toBeInTheDocument();
        expect(screen.queryByRole('button', { name: /place bid/i })).not.toBeInTheDocument();
      });
    });

    it('displays product images correctly', async () => {
      const productWithImages = {
        ...mockProduct,
        images: ['image1.jpg', 'image2.jpg', 'image3.jpg'],
      };

      mockProductService.getProductById.mockResolvedValue(productWithImages);

      renderWithProviders(<ProductDetail productId="1" />);

      await waitFor(() => {
        const images = screen.getAllByRole('img');
        expect(images).toHaveLength(3);
        expect(images[0]).toHaveAttribute('src', 'image1.jpg');
      });
    });

    it('shows seller information', async () => {
      mockProductService.getProductById.mockResolvedValue(mockProduct);

      renderWithProviders(<ProductDetail productId="1" />);

      await waitFor(() => {
        expect(screen.getByText(/seller information/i)).toBeInTheDocument();
        expect(screen.getByText('seller-1')).toBeInTheDocument();
      });
    });

    it('handles bid placement', async () => {
      mockProductService.getProductById.mockResolvedValue(mockProduct);

      renderWithProviders(<ProductDetail productId="1" />);

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /place bid/i })).toBeInTheDocument();
      });

      const bidButton = screen.getByRole('button', { name: /place bid/i });
      fireEvent.click(bidButton);

      await waitFor(() => {
        expect(screen.getByText(/enter bid amount/i)).toBeInTheDocument();
      });

      const bidInput = screen.getByLabelText(/bid amount/i);
      const confirmButton = screen.getByRole('button', { name: /confirm bid/i });

      fireEvent.change(bidInput, { target: { value: '200' } });
      fireEvent.click(confirmButton);

      await waitFor(() => {
        expect(screen.getByText(/bid placed successfully/i)).toBeInTheDocument();
      });
    });

    it('validates bid amount', async () => {
      mockProductService.getProductById.mockResolvedValue(mockProduct);

      renderWithProviders(<ProductDetail productId="1" />);

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /place bid/i })).toBeInTheDocument();
      });

      const bidButton = screen.getByRole('button', { name: /place bid/i });
      fireEvent.click(bidButton);

      await waitFor(() => {
        expect(screen.getByText(/enter bid amount/i)).toBeInTheDocument();
      });

      const bidInput = screen.getByLabelText(/bid amount/i);
      const confirmButton = screen.getByRole('button', { name: /confirm bid/i });

      fireEvent.change(bidInput, { target: { value: '100' }); // Same as current bid
      fireEvent.click(confirmButton);

      await waitFor(() => {
        expect(screen.getByText(/bid must be higher than current bid/i)).toBeInTheDocument();
      });
    });
  });

  describe('Product Service', () => {
    it('fetches all products successfully', async () => {
      mockProductService.getAllProducts.mockResolvedValue(mockProducts);

      const result = await productService.getAllProducts();

      expect(result).toEqual(mockProducts);
      expect(mockProductService.getAllProducts).toHaveBeenCalledTimes(1);
    });

    it('fetches product by ID successfully', async () => {
      mockProductService.getProductById.mockResolvedValue(mockProducts[0]);

      const result = await productService.getProductById('1');

      expect(result).toEqual(mockProducts[0]);
      expect(mockProductService.getProductById).toHaveBeenCalledWith('1');
    });

    it('handles product not found', async () => {
      mockProductService.getProductById.mockResolvedValue(null);

      const result = await productService.getProductById('nonexistent');

      expect(result).toBeNull();
      expect(mockProductService.getProductById).toHaveBeenCalledWith('nonexistent');
    });

    it('creates product successfully', async () => {
      const newProduct = {
        title: 'New Product',
        description: 'New description',
        category: 'electronics',
        startingPrice: 200,
        auctionEnd: new Date(Date.now() + 86400000).toISOString(),
      };

      const createdProduct = { ...newProduct, id: 'new-id' };
      mockProductService.createProduct.mockResolvedValue(createdProduct);

      const result = await productService.createProduct(newProduct);

      expect(result).toEqual(createdProduct);
      expect(mockProductService.createProduct).toHaveBeenCalledWith(newProduct);
    });

    it('updates product successfully', async () => {
      const updatedProduct = { ...mockProducts[0], title: 'Updated Product' };
      mockProductService.updateProduct.mockResolvedValue(updatedProduct);

      const result = await productService.updateProduct('1', updatedProduct);

      expect(result).toEqual(updatedProduct);
      expect(mockProductService.updateProduct).toHaveBeenCalledWith('1', updatedProduct);
    });

    it('deletes product successfully', async () => {
      mockProductService.deleteProduct.mockResolvedValue(true);

      const result = await productService.deleteProduct('1');

      expect(result).toBe(true);
      expect(mockProductService.deleteProduct).toHaveBeenCalledWith('1');
    });

    it('gets products by seller successfully', async () => {
      const sellerProducts = [mockProducts[0]];
      mockProductService.getProductsBySeller.mockResolvedValue(sellerProducts);

      const result = await productService.getProductsBySeller('seller-1');

      expect(result).toEqual(sellerProducts);
      expect(mockProductService.getProductsBySeller).toHaveBeenCalledWith('seller-1');
    });
  });
});
