import { Logger } from '@nestjs/common';
import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { SongDTO } from 'src/singer/singer.model';
import { RoomDTO } from './room.model';
import { RoomService } from './room.service';

interface roomPayloadOptions {
  action: 'new' | 'reconnect' | 'nextSong';
  roomId?: string;
}
[];

interface userPayloadOptions {
  action: 'enter' | 'leave' | 'addSong' | 'removeSong' | 'scapeSong';
  roomId: string;
  userId?: string;
  song?: SongDTO;
  youtubeId?: string;
  roomName?: string;
  displayName?: string;
}
[];

@WebSocketGateway({
  namespace: 'room',
  cors: {},
})
export class RoomGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  constructor(private roomService: RoomService) {}
  @WebSocketServer() server: Server;
  private logger: Logger = new Logger('RoomGateway');

  sendUpdatedRoom(room) {
    if (room?._id) {
      if (room.clientId) {
        this.server.emit('msgToRoom', room, room.clientId);
      }
      room.users.forEach((user) => {
        if (user.clientId) {
          this.server.emit('msgToUser', room, user.clientId);
        }
      });
    }
  }

  afterInit() {
    this.logger.log('Init');
  }
  handleConnection(client: Socket) {
    this.logger.log(`connected: ${client.id}`);
  }
  async handleDisconnect(client: Socket) {
    const room = await this.roomService.disconnectRoom(client.id);
    this.sendUpdatedRoom(room);
    this.logger.log(`disconnected: ${client.id}`);
  }

  @SubscribeMessage('roomSocket')
  async handleMessage(client: Socket, payload: roomPayloadOptions) {
    let room: RoomDTO;

    switch (payload.action) {
      case 'new':
        room = await this.roomService.createNewRoom(client.id);
        this.logger.log(`created room: ${room?._id}`);
        this.sendUpdatedRoom(room);
        break;
      case 'reconnect':
        room = await this.roomService.reconnectRoom(payload.roomId, client.id);
        this.sendUpdatedRoom(room);
        this.logger.log(`reconnected room: ${room?._id}`);
        break;

      case 'nextSong':
        room = await this.roomService.nextSongs(payload.roomId);
        this.sendUpdatedRoom(room);
        this.logger.log(
          `room ${room?._id} updated queue: ${room.songs.map(
            (song) => song.title,
          )}`,
        );
        break;
    }
  }

  @SubscribeMessage('userSocket')
  async handleUserMessage(client: Socket, payload: userPayloadOptions) {
    let room;
    switch (payload.action) {
      case 'enter':
        room = await this.roomService.enterTheRoom(
          client.id,
          payload.userId,
          payload.roomId,
          payload.displayName,
        );
        this.logger.log(`user ${payload.userId} entered in room ${room?._id}`);
        this.sendUpdatedRoom(room);
        break;
      case 'addSong':
        room = await this.roomService.addSongToQueue(
          payload.roomId,
          payload.song,
          payload.userId,
        );
        this.logger.log(
          `user ${payload.userId} added song "${payload.song.title}" in room ${room?._id}`,
        );
        this.sendUpdatedRoom(room);
        break;
      case 'removeSong':
        room = await this.roomService.removeSongFromQueue(
          payload.roomId,
          payload.youtubeId,
          payload.userId,
        );
        this.logger.log(
          `user ${payload.userId} removed song "${payload.youtubeId}" from room ${room?._id}`,
        );
        this.sendUpdatedRoom(room);
        break;
      case 'scapeSong':
        room = await this.roomService.nextSongs(payload.roomId);
        this.sendUpdatedRoom(room);
        this.logger.log(
          `someone updated queue: ${room.songs.map((song) => song.title)}`,
        );
        break;
    }
  }
}
