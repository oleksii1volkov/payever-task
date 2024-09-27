import {
  Controller,
  Post,
  Get,
  Param,
  UseInterceptors,
  UploadedFile,
  Res,
  Delete,
  HttpStatus,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { AvatarService } from './avatar.service';
import { Express, Response } from 'express';

@Controller('api/users')
export class AvatarController {
  constructor(private readonly avatarService: AvatarService) {}

  @Post(':userId/avatar')
  @UseInterceptors(FileInterceptor('file'))
  async uploadAvatar(
    @Param('userId') userId: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (!file) {
      return {
        statusCode: HttpStatus.BAD_REQUEST,
        message: 'No file uploaded.',
      };
    }
    await this.avatarService.saveAvatar(userId, file);
    return {
      statusCode: HttpStatus.OK,
      message: 'Avatar uploaded successfully.',
    };
  }

  @Get(':userId/avatar')
  async getAvatar(@Param('userId') userId: string, @Res() res: Response) {
    const avatar = await this.avatarService.getAvatarByUserId(userId);
    if (!avatar) {
      return res
        .status(HttpStatus.NOT_FOUND)
        .send({ message: 'Avatar not found.' });
    }

    // This example directly streams the file from storage. Adjust based on your storage solution.
    // If stored in a database or file system, you may need to read the file into a stream.
    // If using cloud storage, you might have a URL to return instead.
    res.sendFile(avatar.filePath, { root: '.' }); // Adjust the root or method based on your storage
  }

  @Delete(':userId/avatar')
  async deleteAvatar(@Param('userId') userId: string) {
    const result = await this.avatarService.deleteAvatar(userId);
    if (result) {
      return {
        statusCode: HttpStatus.OK,
        message: 'Avatar deleted successfully.',
      };
    } else {
      return { statusCode: HttpStatus.NOT_FOUND, message: 'Avatar not found.' };
    }
  }
}
