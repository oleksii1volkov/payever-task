import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from './schemas/user.schema';
import { Avatar, AvatarSchema } from '../avatar/schemas/avatar.schema';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { HttpModule } from '@nestjs/axios';

import { AvatarService } from '../avatar/avatar.service';
import { AvatarModule } from 'src/avatar/avatar.module';
import { RabbitMQService } from '../rabbitmq/rabbitmq.service';
import { RabbitMQModule } from '../rabbitmq/rabbitmq.module';
import { EmailService } from '../email/email.service';
import { EmailModule } from '../email/email.module';

@Module({
  imports: [
    HttpModule,
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: Avatar.name, schema: AvatarSchema },
    ]),
    AvatarModule,
    EmailModule,
    RabbitMQModule,
  ],
  controllers: [UserController],
  providers: [UserService, AvatarService, RabbitMQService, EmailService],
  exports: [UserService, AvatarService, RabbitMQService, EmailService],
})
export class UserModule {}
