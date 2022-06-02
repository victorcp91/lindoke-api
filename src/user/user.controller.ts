import { Controller, Get, Req } from '@nestjs/common';
import { Request } from 'express';
import { UserService } from './user.service';

@Controller('user')
export class UserController {
  constructor(private userService: UserService) {}
  @Get('')
  async getUser(@Req() request: Request) {
    this.userService.getUser(request['user']._id);
  }
}
