declare module 'youtube-captions-scraper' {
  export interface Caption {
    start: string;
    dur: string;
    text: string;
  }

  export interface GetSubtitlesParams {
    videoID: string;
    lang?: string;
    auto?: boolean;
  }

  export function getSubtitles(params: GetSubtitlesParams): Promise<Caption[]>;
}