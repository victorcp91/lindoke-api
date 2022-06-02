import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { WebSocketServer } from '@nestjs/websockets';
import { Server } from 'socket.io';
import { RoomDTO } from './room.model';
import { UserDTO } from 'src/user/user.model';
import generateCode from 'src/utils/generateCode';

@Injectable()
export class RoomService {
  constructor(
    @InjectModel('Room') private readonly roomModule: Model<RoomDTO>,
    @InjectModel('User') private readonly userModule: Model<UserDTO>,
  ) {}
  @WebSocketServer() server: Server;

  async createNewRoom(clientId: string) {
    try {
      const room = new this.roomModule({
        _id: generateCode(5),
        clientId,
      });
      const newRoom = await room.save();
      return newRoom;
    } catch (error) {
      console.log(error);
    }
  }

  async disconnectRoom(clientId: string): Promise<RoomDTO> {
    const room = await this.roomModule
      .findOneAndUpdate({ clientId }, { clientId: null })
      .exec();
    return room;
  }

  async reconnectRoom(roomId: string, clientId: string): Promise<RoomDTO> {
    const room = await this.roomModule.findOne({ _id: roomId });
    if (room) {
      await room.updateOne({ clientId }).exec();
      room.clientId = clientId;
      return room;
    }
  }

  async nextSongs(roomId: string): Promise<RoomDTO> {
    const room = await this.roomModule.findOne({ _id: roomId });
    if (room) {
      const currentSongs = [...room.songs];
      currentSongs.shift();
      room.songs = [...currentSongs];
      await room.updateOne({ songs: [...currentSongs] }).exec();
      return room;
    }
  }

  async enterTheRoom(
    clientId: string,
    userId: string,
    roomId: string,
    displayName: string,
  ): Promise<RoomDTO> {
    const room = await this.roomModule.findOne({ _id: roomId });
    if (room && userId && roomId && clientId) {
      const currentUsers = room.users;
      const alreadyInUserIndex = currentUsers.findIndex(
        (u) => u.userId === userId,
      );
      if (alreadyInUserIndex !== -1) {
        currentUsers[alreadyInUserIndex].clientId = clientId;
        currentUsers[alreadyInUserIndex].name = displayName;
      } else {
        currentUsers.push({
          userId,
          clientId,
          name: displayName,
        });
      }
      await room.updateOne({ users: [...currentUsers] }).exec();
      return room;
    }
  }

  async addSongToQueue(roomId, song, userId): Promise<RoomDTO> {
    const room = await this.roomModule.findOne({ _id: roomId });
    if (room) {
      const currentSongs = room.songs;
      const alreadyInQueueSong = currentSongs.find(
        (s) => s.youtubeId === song.youtubeId,
      );
      if (!alreadyInQueueSong) {
        currentSongs.push({
          ...song,
          userId,
        });
        await room.updateOne({ songs: [...currentSongs] }).exec();
      }
      return room;
    }
  }

  async removeSongFromQueue(roomId, youtubeId, userId): Promise<RoomDTO> {
    const room = await this.roomModule.findOne({ _id: roomId });
    if (room) {
      const currentSongs = room.songs;
      const songToBeRemovedIndex = currentSongs.findIndex(
        (s) => s.youtubeId === youtubeId,
      );
      if (
        songToBeRemovedIndex !== -1 &&
        currentSongs[songToBeRemovedIndex].userId === userId
      ) {
        currentSongs.splice(songToBeRemovedIndex, 1);
        await room.updateOne({ songs: [...currentSongs] }).exec();
      }
      return room;
    }
  }

  async roomExists(roomId): Promise<boolean> {
    const room = await this.roomModule.findOne({ _id: roomId });
    if (room?.clientId) {
      return true;
    }
    return false;
  }
}
