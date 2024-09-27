import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './user/user.module';
import { RabbitMQModule } from './rabbitmq/rabbitmq.module';
import { AvatarModule } from './avatar/avatar.module';
import { EmailModule } from './email/email.module';

@Module({
  imports: [
    // Load and make ConfigModule globally available for environment variable access
    ConfigModule.forRoot({
      isGlobal: true, // Make configuration accessible in every module
      envFilePath: '.env', // Specify the path to your environment variables file
      // Additional configuration options can be set here
    }),
    // Initialize MongooseModule with the MongoDB connection URI
    MongooseModule.forRootAsync({
      imports: [ConfigModule], // Make ConfigService available for injection
      useFactory: async (configService: ConfigService) => ({
        uri: configService.get<string>('MONGODB_URI'), // Get MongoDB URI from .env
        // Additional options for the connection can be specified here
      }),
      inject: [ConfigService], // Inject ConfigService to access environment variables
    }),
    // Import custom modules for the application
    UserModule,
    RabbitMQModule,
    AvatarModule,
    EmailModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
