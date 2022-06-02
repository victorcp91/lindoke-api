import * as mongoose from 'mongoose';

export interface SongDTO {
  youtubeId: string;
  title: string;
}

export interface SingerDTO {
  id?: string;
  index: string;
  name: string;
  genre?: string;
  songs: SongDTO[];
}

export const SingerSchema = new mongoose.Schema({
  index: {
    type: String,
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  genre: {
    type: String,
  },
  songs: {
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
      },
    ],
  },
});
