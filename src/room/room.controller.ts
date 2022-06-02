import { Controller, Get, Param } from '@nestjs/common';
import { RoomService } from './room.service';

@Controller('roomCheck')
export class RoomController {
  constructor(private roomService: RoomService) {}

  @Get(':id')
  async getSongs(@Param('id') id: string) {
    return await this.roomService.roomExists(id);
  }
}
