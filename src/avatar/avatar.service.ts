import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Avatar } from './schemas/avatar.schema';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class AvatarService {
  constructor(@InjectModel(Avatar.name) private avatarModel: Model<Avatar>) {}

  async saveAvatar(userId: string, file: Express.Multer.File): Promise<Avatar> {
    // Check if user already has an avatar
    const existingAvatar = await this.avatarModel.findOne({ userId });
    if (existingAvatar) {
      // Delete the old avatar file
      fs.unlinkSync(existingAvatar.filePath);
      // Update the existing avatar record
      existingAvatar.filePath = file.path;
      return existingAvatar.save();
    } else {
      // Create a new avatar record
      const newAvatar = new this.avatarModel({
        userId,
        filePath: file.path,
      });
      return newAvatar.save();
    }
  }

  async getAvatarByUserId(userId: string): Promise<Avatar | null> {
    return this.avatarModel.findOne({ userId }).exec();
  }

  async deleteAvatar(userId: string): Promise<boolean> {
    const avatar = await this.avatarModel.findOneAndDelete({ userId });
    if (avatar) {
      // Delete the avatar file
      fs.unlinkSync(avatar.filePath);
      return true;
    }
    return false;
  }
}
