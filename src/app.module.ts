import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { RokuModule } from './roku/roku.module';
import { RequestLoggerMiddlware } from 'src/middleware/requestLoggerMiddleware';

@Module({
  imports: [ConfigModule.forRoot({ isGlobal: true }), RokuModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(RequestLoggerMiddlware).forRoutes('*');
  }
}
