export interface Music {
  name: string;
  author?: string;
  cover?: string;
  audio: string;
  description?: string;
  rating?: number;
  uid: string;
  musicId?: string;
  tags: string[];
  uploadDate: Date;
}
