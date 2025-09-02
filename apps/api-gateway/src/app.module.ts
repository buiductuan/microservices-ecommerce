import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { JwtModule } from '@nestjs/jwt';
import { AuthController } from './auth/auth.controller';
import { UserController } from './user/user.controller';
import { ProductController } from './product/product.controller';
import { OrderController } from './order/order.controller';
import { NotificationController } from './notification/notification.controller';
import { JWT_CONSTANTS, SERVICES } from '@app/common';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    JwtModule.register({
      secret: JWT_CONSTANTS.SECRET,
      signOptions: { expiresIn: JWT_CONSTANTS.EXPIRES_IN },
    }),
    ClientsModule.register([
      {
        name: SERVICES.USER_SERVICE,
        transport: Transport.TCP,
        options: {
          host: process.env.USER_SERVICE_HOST || 'localhost',
          port: parseInt(process.env.USER_SERVICE_PORT) || 3001,
        },
      },
      {
        name: SERVICES.PRODUCT_SERVICE,
        transport: Transport.TCP,
        options: {
          host: process.env.PRODUCT_SERVICE_HOST || 'localhost',
          port: parseInt(process.env.PRODUCT_SERVICE_PORT) || 3002,
        },
      },
      {
        name: SERVICES.ORDER_SERVICE,
        transport: Transport.TCP,
        options: {
          host: process.env.ORDER_SERVICE_HOST || 'localhost',
          port: parseInt(process.env.ORDER_SERVICE_PORT) || 3003,
        },
      },
      {
        name: SERVICES.NOTIFICATION_SERVICE,
        transport: Transport.TCP,
        options: {
          host: process.env.NOTIFICATION_SERVICE_HOST || 'localhost',
          port: parseInt(process.env.NOTIFICATION_SERVICE_PORT) || 3004,
        },
      },
    ]),
  ],
  controllers: [AuthController, UserController, ProductController, OrderController, NotificationController],
  providers: [],
})
export class AppModule {}
