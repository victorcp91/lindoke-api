import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { UserDTO } from './user.model';

@Injectable()
export class UserService {
  constructor(
    @InjectModel('User') private readonly singerModule: Model<UserDTO>,
  ) {}
  async getUser(userId) {
    const user = await this.singerModule.findOne(userId);
    if (!user) {
      throw new NotFoundException();
    }
    return user;
  }
}
