export interface Upload {
  id: number;
  filename: string;
  highlights: string[];
  images: { imageData: string }[];
  userId: number;
}