import { Controller, Logger } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { ProductService } from './product.service';
import { 
  CreateProductDto, 
  UpdateProductDto, 
  ProductResponseDto, 
  ProductSearchDto,
  MESSAGE_PATTERNS,
  ServiceResponse,
  PaginationDto
} from '@app/common';

@Controller()
export class ProductController {
  private readonly logger = new Logger(ProductController.name);

  constructor(private readonly productService: ProductService) {}

  @MessagePattern(MESSAGE_PATTERNS.PRODUCT_CREATE)
  async createProduct(@Payload() createProductDto: CreateProductDto): Promise<ServiceResponse<ProductResponseDto>> {
    try {
      const product = await this.productService.create(createProductDto);
      return { success: true, data: product };
    } catch (error) {
      this.logger.error('Failed to create product', error);
      return { success: false, error: error.message };
    }
  }

  @MessagePattern(MESSAGE_PATTERNS.PRODUCT_FIND_BY_ID)
  async findProductById(@Payload() id: string): Promise<ServiceResponse<ProductResponseDto>> {
    try {
      const product = await this.productService.findById(id);
      return { success: true, data: product };
    } catch (error) {
      this.logger.error('Failed to find product by ID', error);
      return { success: false, error: error.message };
    }
  }

  @MessagePattern(MESSAGE_PATTERNS.PRODUCT_FIND_ALL)
  async findAllProducts(@Payload() payload: PaginationDto & ProductSearchDto): Promise<ServiceResponse<any>> {
    try {
      const result = await this.productService.findAll(payload);
      return { success: true, data: result };
    } catch (error) {
      this.logger.error('Failed to find products', error);
      return { success: false, error: error.message };
    }
  }

  @MessagePattern(MESSAGE_PATTERNS.PRODUCT_UPDATE)
  async updateProduct(@Payload() payload: { id: string } & UpdateProductDto): Promise<ServiceResponse<ProductResponseDto>> {
    try {
      const { id, ...updateData } = payload;
      const product = await this.productService.update(id, updateData);
      return { success: true, data: product };
    } catch (error) {
      this.logger.error('Failed to update product', error);
      return { success: false, error: error.message };
    }
  }

  @MessagePattern(MESSAGE_PATTERNS.PRODUCT_DELETE)
  async deleteProduct(@Payload() payload: { id: string; sellerId?: string }): Promise<ServiceResponse<void>> {
    try {
      await this.productService.delete(payload.id, payload.sellerId);
      return { success: true };
    } catch (error) {
      this.logger.error('Failed to delete product', error);
      return { success: false, error: error.message };
    }
  }

  @MessagePattern(MESSAGE_PATTERNS.PRODUCT_SEARCH)
  async searchProducts(@Payload() searchDto: ProductSearchDto): Promise<ServiceResponse<ProductResponseDto[]>> {
    try {
      const products = await this.productService.search(searchDto);
      return { success: true, data: products };
    } catch (error) {
      this.logger.error('Failed to search products', error);
      return { success: false, error: error.message };
    }
  }

  @MessagePattern(MESSAGE_PATTERNS.PRODUCT_UPDATE_STOCK)
  async updateStock(@Payload() payload: { id: string; quantity: number }): Promise<ServiceResponse<ProductResponseDto>> {
    try {
      const product = await this.productService.updateStock(payload.id, payload.quantity);
      return { success: true, data: product };
    } catch (error) {
      this.logger.error('Failed to update product stock', error);
      return { success: false, error: error.message };
    }
  }
}
