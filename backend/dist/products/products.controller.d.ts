import { ProductsService } from './products.service';
export declare class ProductsController {
    private readonly productsService;
    constructor(productsService: ProductsService);
    create(createProductDto: any, req: any): Promise<any>;
    bulkCreate(bulkProductDto: any, req: any): Promise<{
        message: string;
        products: any[];
    }>;
    findAll(): any;
    getMyProducts(req: any): Promise<{
        products: any[];
        total: number;
        active: number;
        sold: number;
    }>;
    findOne(id: string): Promise<any>;
    placeBid(id: string, bidDto: any, req: any): Promise<{
        id: number;
        productId: number;
        amount: number;
        bidderId: string;
        bidderName: string;
        createdAt: Date;
    }>;
    update(id: string): {
        message: string;
    };
    remove(id: string): {
        message: string;
    };
}
