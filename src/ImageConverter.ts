// Interface for Image Converter
export interface ImageConverter {
  decode(data: Buffer): any;
  encode(data: any): Buffer;
}