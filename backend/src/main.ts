import { ValidationPipe } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { GlobalExceptionFilter } from "./common/filters/global-exception.filter";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const config = app.get(ConfigService);
  const port = config.get<number>("PORT", 4000);

  app.enableCors();
  app.useGlobalPipes(
    new ValidationPipe({
      forbidNonWhitelisted: true,
      transform: true,
      whitelist: true
    })
  );
  app.useGlobalFilters(new GlobalExceptionFilter());

  logEnvironmentTargets(config);

  await app.listen(port, "0.0.0.0");
}

function logEnvironmentTargets(config: ConfigService) {
  const databaseUrl = config.get<string>("DATABASE_URL");
  const redisUrl = config.get<string>("REDIS_URL");
  const minioEndpoint = config.get<string>("MINIO_ENDPOINT", "not-set");

  console.log("[config] Environment targets", {
    databaseHost: getUrlHost(databaseUrl),
    redisHost: getUrlHost(redisUrl),
    minioEndpoint
  });
}

function getUrlHost(value?: string) {
  if (!value) {
    return "not-set";
  }

  try {
    return new URL(value).hostname;
  } catch {
    return "invalid-url";
  }
}

void bootstrap();
