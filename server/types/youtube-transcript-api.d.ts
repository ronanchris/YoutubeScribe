declare module 'youtube-transcript-api' {
  interface TranscriptItem {
    text: string;
    duration: number;
    offset: number;
  }

  export class YoutubeTranscript {
    static fetchTranscript(videoId: string): Promise<TranscriptItem[]>;
  }
}