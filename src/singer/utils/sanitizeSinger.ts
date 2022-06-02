import { SongDTO } from '../singer.model';

export default function sanitizeSong(
  singerName: string,
  youtubeSong: any,
): SongDTO {
  if (!youtubeSong.snippet || !youtubeSong.snippet.title) {
    console.log('here', youtubeSong);
  }
  const formattedYoutubeTitle = youtubeSong.snippet.title.toLowerCase();
  const formattedSingerName = singerName.toLowerCase();
  const regSinger = new RegExp(singerName, 'ig');
  if (
    (formattedYoutubeTitle.includes('karaoke') ||
      formattedYoutubeTitle.includes('karaokê')) &&
    (formattedYoutubeTitle.includes(formattedSingerName) ||
      formattedYoutubeTitle.includes(formattedSingerName.replace(' ', '')))
  ) {
    let formattedTitle = formattedYoutubeTitle
      .replace(regSinger, '')
      .replace(
        /karaoke|karaokê|version|instrumental|#|karaok&amp;j|【no guide melody】|【with guide melody】|/g,
        '',
      )
      .replace(/ *\([^)]*\) */g, ' ')
      .replace(/[\[\]']+/g, '')
      .replace(/ *\|*\|/g, '')
      .replace(/^\s+/g, '')
      .replace(/\s+$/g, '')
      .replace(/&39;/g, "'")
      .replace(/&amp;/g, '')
      .replace(/•/g, '');

    formattedTitle = encodeURIComponent(formattedTitle);
    formattedTitle = decodeURIComponent(formattedTitle);

    if (
      formattedTitle.includes(' - ') ||
      formattedTitle.includes(' -') ||
      formattedTitle.includes('- ')
    ) {
      formattedTitle = formattedTitle
        .replace(/ - /g, ' ')
        .replace(/ -/g, ' ')
        .replace(/- /g, ' ')
        .replace(/  /g, ' ');
    }
    if (formattedTitle.startsWith('-')) {
      formattedTitle = formattedTitle.replace('-', '');
    }
    if (formattedTitle.endsWith('-')) {
      formattedTitle = formattedTitle.slice(0, -1);
    }
    if (formattedTitle.startsWith(' ')) {
      formattedTitle = formattedTitle.replace(' ', '');
    }
    if (formattedTitle.endsWith(' ')) {
      formattedTitle = formattedTitle.slice(0, -1);
    }
    if (formattedTitle && youtubeSong?.id?.videoId) {
      return {
        title: formattedTitle,
        youtubeId: youtubeSong.id.videoId,
      };
    }
  }
  return null;
}
