import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { GetRokuAddress } from 'src/network/network';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';

async function bootstrap() {
  GetRokuAddress()
    .then(() => console.log('Roku address resolved'))
    .catch(console.error);

  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  app.useStaticAssets(join(__dirname, '..', 'public'));
  app.setBaseViewsDir(join(__dirname, '..', 'views'));
  app.setViewEngine('hbs');

  app.enableCors();

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap().catch(console.error);
