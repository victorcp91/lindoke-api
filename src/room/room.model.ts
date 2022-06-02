import * as mongoose from 'mongoose';

interface userDTO {
  userId: string;
  clientId: string;
  name: string;
}

interface songDTO {
  userId: string;
  title: string;
  youtubeId: string;
  singer: string;
}

export interface RoomDTO {
  _id: string;
  name?: string;
  clientId?: string;
  users: userDTO[];
  songs: songDTO[];
}

export const RoomSchema = new mongoose.Schema({
  _id: {
    type: String,
    required: true,
  },
  clientId: {
    type: String,
  },
  name: {
    type: String,
  },
  users: [
    {
      userId: {
        type: String,
        required: true,
      },
      clientId: {
        type: String,
        required: true,
      },
      name: {
        type: String,
        required: true,
      },
    },
  ],
  songs: [
    {
      userId: {
        type: String,
        required: true,
      },
      title: {
        type: String,
        required: true,
      },
      youtubeId: {
        type: String,
        required: true,
      },
      singer: {
        type: String,
        required: true,
      },
    },
  ],
});
