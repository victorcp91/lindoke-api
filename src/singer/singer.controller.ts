import {
  Controller,
  Get,
  Param,
  Query,
  BadRequestException,
} from '@nestjs/common';
import { SingerService } from './singer.service';

@Controller('singer')
export class SingerController {
  constructor(private singerService: SingerService) {}
  @Get('')
  async filterSinger(@Query('letter') letter: string) {
    if (!letter) {
      throw new BadRequestException('Missing letter param');
    }
    return await this.singerService.getSingersByFirstLetter(letter);
  }

  @Get('/search')
  async searchNewSinger(@Query('q') singer: string) {
    if (!singer) {
      throw new BadRequestException('Missing singer param');
    }
    return await this.singerService.searchNewSinger(singer);
  }
  @Get('/all')
  async getAllSingers() {
    const response = await this.singerService.getAllSinger();
    return response;
  }
  // @Get('format')
  // async formatSongs() {
  //   return await this.singerService.formatSongs();
  // }
  @Get(':id')
  async getSongs(@Param('id') id: string) {
    return await this.singerService.getSongs(id);
  }
}
