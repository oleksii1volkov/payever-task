import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';

import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { EmailService } from '../email/email.service';
import { RabbitMQService } from '../rabbitmq/rabbitmq.service';

import { Model } from 'mongoose';
import { User } from './schemas/user.schema';

import { firstValueFrom } from 'rxjs';
import { CreateUserDto } from './dto/create-user.dto';

@Injectable()
export class UserService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<User>,
    private readonly httpService: HttpService,
    private readonly emailService: EmailService,
    private readonly rabbitMQService: RabbitMQService,
    private readonly configService: ConfigService,
  ) {}

  async createUser(createUserDto: CreateUserDto): Promise<User> {
    try {
      const newUser = new this.userModel(createUserDto);
      const savedUser = await newUser.save();

      try {
        await this.emailService.sendEmail({
          to: savedUser.email,
          subject: 'Welcome to Our Application!',
          text: `Hello ${newUser.name}, welcome to our application!`,
        });
      } catch (emailError) {
        console.error('Failed to send welcome email:', emailError.message);
      }

      try {
        await this.rabbitMQService.publishEvent(
          'userExchange',
          'user.created',
          { userId: newUser.id, email: newUser.email },
        );
      } catch (eventError) {
        console.error(
          'Failed to publish userCreated event:',
          eventError.message,
        );
      }

      return savedUser;
    } catch (error) {
      console.error('User creation failed:', error.message);
      throw new Error('User creation failed. Please try again later.');
    }
  }

  async findById(userId: string): Promise<User | null> {
    return this.userModel.findById(userId).exec();
  }

  async fetchUserFromExternalApi(userId: string): Promise<any> {
    const requestUrl =
      this.configService.get<string>('REQRES_API_URL') + '/users';

    try {
      const response = await firstValueFrom(
        this.httpService.get(`${requestUrl}/${userId}`),
      );
      return response.data.data;
    } catch (error) {
      throw new Error(
        `Failed to fetch user from external API: ${error.message}`,
      );
    }
  }

  // Placeholder method for adding an avatar
  async addAvatar(userId: string, file: Express.Multer.File): Promise<void> {
    // Simplified: Implement your logic to associate the uploaded file with the user
    console.log(`Adding avatar for user ${userId}`, file);
  }

  // Placeholder method for retrieving a user's avatar
  async getAvatar(userId: string): Promise<Buffer | null> {
    // Simplified: Implement your logic to retrieve and return the user's avatar
    console.log(`Fetching avatar for user ${userId}`);
    return null; // Return the avatar file or buffer
  }

  // Placeholder method for deleting a user's avatar
  async deleteAvatar(userId: string): Promise<void> {
    // Simplified: Implement your logic to delete the user's avatar
    console.log(`Deleting avatar for user ${userId}`);
  }
}
