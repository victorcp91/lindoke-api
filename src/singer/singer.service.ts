import {
  CACHE_MANAGER,
  Inject,
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { Cache } from 'cache-manager';

import { HttpService } from '@nestjs/axios';
import { map, lastValueFrom } from 'rxjs';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { SingerDTO, SongDTO } from './singer.model';
import sanitizeSong from './utils/sanitizeSinger';

@Injectable()
export class SingerService {
  constructor(
    @InjectModel('Singer') private readonly singerModule: Model<SingerDTO>,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    private httpService: HttpService,
  ) {}

  async addToCache(key: string, item: string) {
    await this.cacheManager.set(key, item, { ttl: 0 });
  }

  async getFromCache(key: string) {
    const value = await this.cacheManager.get(key);
    return value;
  }

  async removeCache(key: string) {
    await this.cacheManager.del(key);
  }

  async getSongs(id: string) {
    const currentSinger = await this.singerModule.findOne({ id });
    if (!currentSinger) {
      throw new NotFoundException('Singer not found');
    }
    return currentSinger.songs;
  }

  async getSingersByFirstLetter(letter: string) {
    if (letter.length > 1) {
      throw new BadRequestException(
        'Search allows only the first letter or number',
      );
    }
    const singersStartingWithLetter = await this.singerModule.find({
      index: letter,
    });
    return singersStartingWithLetter;
  }

  async searchNewSinger(singer: string): Promise<SongDTO[]> {
    const foundSinger: any = await this.singerModule.findOne({ name: singer });

    if (foundSinger) {
      const formattedSinger = singer.replace('/ /g', '+');
      let foundSongs = [];
      let nextPage = '';

      for (let i = 0; i < 2; i += 1) {
        if (i === 0 || nextPage) {
          const youtubeResponse = await lastValueFrom(
            this.httpService
              .get(
                `${process.env.YOUTUBE_API_URL}?order=date&part=snippet&type=video&videoSyndicated=true&maxResults=50&videoEmbeddable=true&key=${process.env.YOUTUBE_API_KEY}&q=karaoke%20${formattedSinger}&pageToken=${nextPage}`,
              )
              .pipe(map((res) => res.data)),
          );
          if (youtubeResponse.items?.length) {
            foundSongs = [...foundSongs, ...youtubeResponse.items];
          }
          if (youtubeResponse.nextPageToken) {
            nextPage = youtubeResponse.nextPageToken;
          }
        }
      }

      let sanitizedSongs: SongDTO[] = [];
      foundSongs.forEach((s) => {
        const sanitized = sanitizeSong(singer, s);
        if (sanitized) {
          sanitizedSongs.push(sanitized);
        }
      });

      sanitizedSongs = sanitizedSongs.filter((newSong) => {
        if (!foundSinger?.songs.find((n) => n?.youtubeId === newSong)) {
          return true;
        }
        return false;
      });

      await foundSinger
        .updateOne({ songs: [...foundSinger.songs, ...sanitizedSongs] })
        .exec();
      this.removeCache('singers');
      return sanitizedSongs;
    }
    return [];

    // const newSinger: SingerDTO = {
    //   name: singer,
    //   index: singer[0].toUpperCase(),
    //   songs: sanitizedSongs,
    // };

    // return newSinger;
  }

  async getAllSinger() {
    const cacheResult: any = await this.getFromCache('singers');
    if (cacheResult) {
      return JSON.parse(cacheResult);
    } else {
      const result = await this.singerModule.find().exec();
      if (result) {
        const stringResult = JSON.stringify(result);
        await this.addToCache('singers', stringResult);
      }
      return result as SingerDTO[];
    }
  }
  // async formatSongs() {
  //   const formattedArtists = artists2.map((artist: any) => ({
  //     name: artist.name,
  //     index: artist.name.charAt(0).toUpperCase(),
  //     songs: [
  //       ...artist.songs.map((song) => {
  //         const youtubeSong = {
  //           snippet: { title: song.title },
  //           id: { videoId: song.id },
  //         };
  //         return sanitizeSong(artist.name, youtubeSong);
  //       }),
  //     ],
  //   }));
  //   await this.singerModule.insertMany(formattedArtists);
  //   return formattedArtists;
  // }
}
