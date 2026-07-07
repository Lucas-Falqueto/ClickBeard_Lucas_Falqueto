import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import morgan from 'morgan';

async function bootstrap() {
  console.log('DATABASE_URL IS:', process.env.DATABASE_URL);
  const app = await NestFactory.create(AppModule);

  app.setGlobalPrefix('api');
  app.enableCors();
  app.use(morgan('dev'));

  const config = new DocumentBuilder()
    .setTitle('ClickBeard API')
    .setDescription('API completa do sistema de agendamentos ClickBeard')
    .setVersion('2.0.0')
    .addBearerAuth()
    .build();

  if (process.env.NODE_ENV !== 'production') {
    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api-docs', app, document);
    console.log('Swagger UI available at /api-docs');
  }

  const PORT = process.env.PORT || 3001;
  await app.listen(PORT);
  console.log(`NestJS Server running on port ${PORT}`);
}
bootstrap();
