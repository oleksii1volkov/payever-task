import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema()
export class Avatar extends Document {
  @Prop({ required: true })
  userId: string;

  @Prop({ required: true })
  filePath: string;

  // Add any other properties you need, like fileType, createdAt, etc.
}

export const AvatarSchema = SchemaFactory.createForClass(Avatar);
