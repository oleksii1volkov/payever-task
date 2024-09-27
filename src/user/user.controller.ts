import {
  Controller,
  Post,
  Get,
  Param,
  Delete,
  Body,
  UseInterceptors,
  UploadedFile,
  Res,
  HttpStatus,
} from '@nestjs/common';
import { UserService } from './user.service';
import { AvatarService } from '../avatar/avatar.service'; // Assume this exists
import { FileInterceptor } from '@nestjs/platform-express'; // For file uploads
import { Response } from 'express';

@Controller('api/users')
export class UserController {
  constructor(
    private readonly userService: UserService,
    private readonly avatarService: AvatarService, // Handling avatar logic
  ) {}

  @Post()
  async createUser(@Body() createUserDto: any) {
    const user = await this.userService.createUser(createUserDto);
    return { message: 'User created successfully', data: user };
  }

  @Get(':userId')
  async getUser(@Param('userId') userId: string) {
    const user = await this.userService.findById(userId);
    if (!user) {
      return { message: 'User not found' };
    }
    return { message: 'User retrieved successfully', data: user };
  }

  // Assuming there's a hypothetical endpoint to fetch user data from an external API
  @Get('external/:userId')
  async getUserFromExternal(@Param('userId') userId: string) {
    const userData = await this.userService.fetchUserFromExternalApi(userId);
    return {
      message: 'External user data retrieved successfully',
      data: userData,
    };
  }

  @Post(':userId/avatar')
  @UseInterceptors(FileInterceptor('avatar')) // Assuming 'avatar' is the name of the file field in the form-data
  async addAvatar(
    @Param('userId') userId: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    await this.avatarService.saveAvatar(userId, file); // Simplified
    return { message: 'Avatar added successfully' };
  }

  @Get(':userId/avatar')
  async getAvatar(@Param('userId') userId: string, @Res() res: Response) {
    const avatar = await this.avatarService.getAvatarByUserId(userId); // Simplified
    if (!avatar) {
      return res
        .status(HttpStatus.NOT_FOUND)
        .json({ message: 'Avatar not found' });
    }
    // Assuming avatar is a Buffer
    res.setHeader('Content-Type', 'image/jpeg'); // Set appropriate content type
    return res.send(avatar);
  }

  @Delete(':userId/avatar')
  async deleteAvatar(@Param('userId') userId: string) {
    await this.avatarService.deleteAvatar(userId); // Simplified
    return { message: 'Avatar deleted successfully' };
  }
}
