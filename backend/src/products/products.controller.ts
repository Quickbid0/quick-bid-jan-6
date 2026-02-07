import { Controller, Get, Post, Body, Param, Delete, Put, Req, UseGuards } from '@nestjs/common';
import { ProductsService } from './products.service';

@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Post()
  async create(@Body() createProductDto: any, @Req() req: any) {
    // Get seller ID from authenticated request
    const sellerId = req.user?.id;
    if (!sellerId) {
      throw new Error('Authentication required');
    }

    // Verify seller is authenticated and verified
    await this.productsService.verifySeller(sellerId);

    return this.productsService.create(createProductDto, sellerId);
  }

  @Post('bulk-create')
  async bulkCreate(@Body() bulkProductDto: any, @Req() req: any) {
    // Get seller ID from authenticated request
    const sellerId = req.user?.id;
    if (!sellerId) {
      throw new Error('Authentication required');
    }

    // Verify seller is authenticated and verified
    await this.productsService.verifySeller(sellerId);

    return this.productsService.bulkCreate(bulkProductDto, sellerId);
  }

  @Get()
  findAll() {
    return this.productsService.findAll();
  }

  @Get('my-products')
  getMyProducts(@Req() req: any) {
    // Get seller ID from request (mock for now)
    const sellerId = req.user?.id || 'seller1';
    return this.productsService.getMyProducts(sellerId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.productsService.findOne(+id);
  }

  @Post(':id/bid')
  placeBid(@Param('id') id: string, @Body() bidDto: any, @Req() req: any) {
    // Get bidder info from request (mock for now)
    const bidderId = req.user?.id || 'bidder1';
    const bidderName = req.user?.name || 'Demo Bidder';
    return this.productsService.placeBid(+id, bidDto.amount, bidderId, bidderName);
  }

  @Put(':id')
  update(@Param('id') id: string) {
    return { message: 'Product update not yet implemented' };
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return { message: 'Product removal not yet implemented' };
  }
}
