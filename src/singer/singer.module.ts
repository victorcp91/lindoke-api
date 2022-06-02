import { CacheModule, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { HttpModule } from '@nestjs/axios';
import { SingerController } from './singer.controller';
import { SingerService } from './singer.service';
import { SingerSchema } from './singer.model';

@Module({
  imports: [
    CacheModule.register(),
    HttpModule,
    MongooseModule.forFeature([{ name: 'Singer', schema: SingerSchema }]),
  ],
  controllers: [SingerController],
  providers: [SingerService],
})
export class SingerModule {}
