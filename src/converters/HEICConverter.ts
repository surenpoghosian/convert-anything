import { ImageConverter } from '../ImageConverter';

// HEIC Converter
class HEICConverter implements ImageConverter {
  decode(data: Buffer): any {
    // Implement HEIC decoding
    // Example: Implement a custom HEIC decoder
    throw new Error('HEIC decoding not implemented');
  }
  
  encode(data: any): Buffer {
    // Implement HEIC encoding
    // Example: Implement a custom HEIC encoder
    throw new Error('HEIC decoding not implemented');
  }
}

export { HEICConverter };