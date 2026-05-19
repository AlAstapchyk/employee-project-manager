import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Enable CORS for frontend communication
  app.enableCors({
    origin: process.env.CORS_ORIGIN ?? 'http://localhost:3000',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  });

  // Global validation pipe — auto-validates all incoming DTOs
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // Configure Swagger OpenAPI documentation
  const config = new DocumentBuilder()
    .setTitle('Workflex Employee & Project Manager API')
    .setDescription(
      'Kompleksowy interfejs REST API do zarządzania zasobami i kosztami projektów w firmie outsourcingowej WORKFLEX.',
    )
    .setVersion('1.0')
    .addTag('employees', 'Endpointy do pełnej obsługi CRUD dla pracowników')
    .addTag('projects', 'Endpointy do zarządzania projektami bazodanowymi')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  const port = process.env.PORT ?? 5000;
  await app.listen(port);
  console.log(`🚀 Backend running on http://localhost:${port}`);
  console.log(
    `📖 Swagger API documentation available on http://localhost:${port}/api/docs`,
  );
}
bootstrap().catch(console.error);
