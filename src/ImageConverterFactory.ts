import { ImageConverter } from "./ImageConverter";
import { JPEGConverter } from "./converters/JPEGConverter";
import { PNGConverter } from "./converters/PNGConverter";
import { BMPConverter } from "./converters/BMPConverter";
import { WEBPConverter } from "./converters/WEBPConverter";
import { HEICConverter } from "./converters/HEICConverter";

// Image Converter Factory
class ImageConverterFactory {
  static getConverter(format: string): ImageConverter {
    switch (format) {
      case 'jpeg':
        return new JPEGConverter();
      case 'png':
        return new PNGConverter();
      case 'bmp':
        return new BMPConverter();
      case 'webp':
        return new WEBPConverter();
      case 'heic':
        return new HEICConverter();
      default:
        throw new Error('Unsupported image format');
    }
  }
}

export { ImageConverterFactory };