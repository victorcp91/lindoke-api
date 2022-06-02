import {
  // MiddlewareConsumer,
  Module,
  // NestModule,
  // RequestMethod,
} from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { SingerModule } from './singer/singer.module';
import { RoomModule } from './room/room.module';
// import { UserModule } from './user/user.module';
// import { PreauthMiddleware } from './auth/preauth.middleware';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    // MongooseModule.forRoot(
    //   `mongodb://${process.env.DB_USER}:${process.env.DB_PASS}@${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_NAME}?authSource=admin`,
    // ),
    MongooseModule.forRoot(
      `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@${process.env.DB_HOST}lindokedb?retryWrites=true&w=majority`,
    ),
    SingerModule,
    RoomModule,
    // UserModule,
  ],
})
export class AppModule {
  //  implements NestModule {
  // configure(consumer: MiddlewareConsumer) {
  //   consumer.apply(PreauthMiddleware).forRoutes({
  //     path: '/user',
  //     method: RequestMethod.ALL,
  //   });
  // }
}
