import * as mongoose from 'mongoose';

export interface UserDTO {
  _id: string;
  name: string;
  avatar?: number;
}

export interface FavoriteSongDTO {
  youtubeId: string;
  title: string;
  singer: string;
}

export const UserSchema = new mongoose.Schema({
  _id: {
    type: String,
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  favorites: {
    type: [
      {
        youtubeId: {
          type: String,
          required: true,
        },
        title: {
          type: String,
          required: true,
        },
        singer: {
          type: String,
          required: true,
        },
      },
    ],
  },
});
