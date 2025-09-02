import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards, Inject } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { ApiTags, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { 
  CreateProductDto,
  UpdateProductDto,
  ProductResponseDto,
  ProductSearchDto,
  PaginationDto,
  MESSAGE_PATTERNS,
  SERVICES,
  JwtAuthGuard,
  RolesGuard,
  Roles,
  UserRole,
  CurrentUser,
  JwtPayload 
} from '@app/common';
import { firstValueFrom } from 'rxjs';

@ApiTags('Products')
@Controller('products')
export class ProductController {
  constructor(
    @Inject(SERVICES.PRODUCT_SERVICE) private readonly productClient: ClientProxy,
  ) {}

  @Get()
  @ApiResponse({ status: 200, description: 'Products retrieved successfully' })
  async getProducts(
    @Query() searchDto: ProductSearchDto,
    @Query() paginationDto: PaginationDto,
  ) {
    const result = await firstValueFrom(
      this.productClient.send(MESSAGE_PATTERNS.PRODUCT_FIND_ALL, {
        ...searchDto,
        ...paginationDto,
      })
    );
    return result.data;
  }

  @Get('search')
  @ApiResponse({ status: 200, description: 'Products search completed' })
  async searchProducts(@Query() searchDto: ProductSearchDto) {
    const result = await firstValueFrom(
      this.productClient.send(MESSAGE_PATTERNS.PRODUCT_SEARCH, searchDto)
    );
    return result.data;
  }

  @Get(':id')
  @ApiResponse({ status: 200, description: 'Product retrieved successfully' })
  async getProductById(@Param('id') id: string): Promise<ProductResponseDto> {
    const result = await firstValueFrom(
      this.productClient.send(MESSAGE_PATTERNS.PRODUCT_FIND_BY_ID, id)
    );
    return result.data;
  }

  @Post()
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SELLER)
  @ApiResponse({ status: 201, description: 'Product created successfully' })
  async createProduct(
    @Body() createProductDto: CreateProductDto,
    @CurrentUser() user: JwtPayload,
  ): Promise<ProductResponseDto> {
    const result = await firstValueFrom(
      this.productClient.send(MESSAGE_PATTERNS.PRODUCT_CREATE, {
        ...createProductDto,
        sellerId: user.sub,
      })
    );
    return result.data;
  }

  @Put(':id')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SELLER)
  @ApiResponse({ status: 200, description: 'Product updated successfully' })
  async updateProduct(
    @Param('id') id: string,
    @Body() updateProductDto: UpdateProductDto,
    @CurrentUser() user: JwtPayload,
  ): Promise<ProductResponseDto> {
    const result = await firstValueFrom(
      this.productClient.send(MESSAGE_PATTERNS.PRODUCT_UPDATE, {
        id,
        ...updateProductDto,
        sellerId: user.sub,
      })
    );
    return result.data;
  }

  @Delete(':id')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SELLER)
  @ApiResponse({ status: 200, description: 'Product deleted successfully' })
  async deleteProduct(
    @Param('id') id: string,
    @CurrentUser() user: JwtPayload,
  ): Promise<void> {
    await firstValueFrom(
      this.productClient.send(MESSAGE_PATTERNS.PRODUCT_DELETE, {
        id,
        sellerId: user.sub,
      })
    );
  }
}
