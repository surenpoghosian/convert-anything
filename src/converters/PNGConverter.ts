import zlib from 'zlib';
import { ImageConverter } from '../ImageConverter';
import { ColorType } from '../ColorType';

class PNGConverter implements ImageConverter {
  decode(data: Buffer): Buffer {
    // PNG decoding
    // Read PNG Header and verify
    if (!this.verifyPNGSignature(data)) {
      throw new Error('Input data is not a valid PNG file');
    }

    // Extract width and height from the IHDR chunk
    const { width, height, colorType, bitDepth } = this.extractImageInfo(data);

    // Extract and decompress image data from IDAT chunks
    const idatData = this.readIDATChunks(data);

    const decompressedImageData = this.decompressImageData(idatData, width, height, colorType, bitDepth);

    return decompressedImageData;
  }

  encode(data: Buffer): Buffer {
    // PNG encoding
    // Example: Implement PNG encoding without third-party libraries
    const { width, height } = this.extractImageInfo(data);
    return this.encodePNG(data, width, height);
  }

  private verifyPNGSignature(data: Buffer): boolean {
    // PNG signature: 137 80 78 71 13 10 26 10
    const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
    return data.slice(0, 8).equals(signature);
  }

  private readIHDRChunk(data: Buffer): { width: number; height: number; colorType: number; bitDepth: number } {
    // Ensure buffer length is sufficient to read IHDR chunk
    const ihdrOffset = 8; // IHDR chunk starts at offset 8
    const ihdrChunk = this.readChunk(data, ihdrOffset);

    // Verify IHDR chunk length
    if (ihdrChunk.length !== 13) {
        throw new Error('Invalid IHDR chunk length');
    }

    // Read width and height from the IHDR chunk data
    const width = ihdrChunk.data.readUInt32BE(0);
    const height = ihdrChunk.data.readUInt32BE(4);
    const bitDepth = ihdrChunk.data.readUInt8(8);
    const colorType = ihdrChunk.data.readUInt8(9);

    return { width, height, bitDepth, colorType };
  }

  private readIDATChunks(data: Buffer): Buffer {
    let idatData = Buffer.alloc(0);
    let offset = 8 + 25; // Skip PNG signature and IHDR chunk
    while (offset < data.length) {
      const chunk = this.readChunk(data, offset);

      if (chunk.type === 'IDAT') {
        idatData = Buffer.concat([idatData, chunk.data]);
      }
      offset += 12 + chunk.length; // Move to the next chunk
      if (chunk.type === 'IEND') break;
    }
    return idatData;
  }

  private decompressImageData(data: Buffer, width: number, height: number, colorType: number, bitDepth: number): Buffer {
    // Decompress image data using DEFLATE algorithm
    const decompressedData = zlib.inflateSync(data); // Synchronous decompression

    // Verify that the decompressed data length matches the expected image size
    const expectedSize = this.calculateExpectedSize(width, height, bitDepth, colorType);

    const relativeTolerance = 0.01; // 1% tolerance
    const actualSize = decompressedData.length;
    const absoluteDifference = Math.abs(actualSize - expectedSize);
    const relativeDifference = absoluteDifference / expectedSize;

    if (relativeDifference > relativeTolerance) {
      throw new Error(`Decompressed image data size does not match expected size. \n actual: ${actualSize}, expected: ${expectedSize}`);
    }

    return decompressedData;
  }

  private encodePNG(imageData: Buffer, width: number, height: number): Buffer {
    // Example implementation of PNG encoding
    // PNG Header
    const pngHeader = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
    
    // Write PNG Header
    let pngData = Buffer.concat([pngHeader]);
    
    // Write IHDR chunk (Image Header)
    const ihdrChunk = Buffer.alloc(13);
    ihdrChunk.writeUInt32BE(width, 0);
    ihdrChunk.writeUInt32BE(height, 4);
    // Add more IHDR data if needed (like bit depth, color type, etc.)
    pngData.write('IHDR', 8);
    pngData.writeUInt32BE(13, 12); // Chunk length
    pngData = Buffer.concat([pngData, ihdrChunk]);
    
    // Write Image Data
    // TODO: convert image data to PNG format (e.g., RGBA) and write it here
    
    // Write End Chunk (IEND)
    const iendChunk = Buffer.from([0, 0, 0, 0]);
    pngData.write('IEND', pngData.length);
    pngData = Buffer.concat([pngData, iendChunk]);

    return pngData;
  }

  private calculateExpectedSize(width: number, height: number, bitDepth: number, colorType: number): number {
    let bytesPerPixel: number;
    switch (colorType) {
        case ColorType.Grayscale: // Grayscale
            bytesPerPixel = Math.ceil(bitDepth / 8);
            break;
        case ColorType.Truecolor: // RGB
            bytesPerPixel = Math.ceil((bitDepth / 8) * 3);
            break;
        case ColorType.IndexedColor: // Indexed-color (palette)
            bytesPerPixel = Math.ceil(bitDepth / 8);
            break;
        case ColorType.GrayscaleAlpha: // Grayscale with alpha
            bytesPerPixel = Math.ceil((bitDepth / 8) * 2);
            break;
        case ColorType.TruecolorAlpha: // RGBA
            bytesPerPixel = Math.ceil((bitDepth / 8) * 4);
            break;
        default:
            throw new Error('Unsupported color type');
    }

    // Account for filter bytes (1 byte per scanline)
    const filterBytes: number = height;

    // Calculate the expected size
    const dataSize: number = (width * height * bytesPerPixel) + filterBytes; // Image data + filter bytes
    return dataSize;
}


  private extractImageInfo(data: Buffer): { width: number, height: number, colorType: ColorType, bitDepth: number, hasAlphaChannel: boolean } {
    // Extract width and height from the IHDR chunk
    const { width, height, colorType, bitDepth } = this.readIHDRChunk(data);

    // Determine if the image has an alpha channel
    const hasAlphaChannel = colorType === 4 || colorType === 6;

    return { width, height, colorType, bitDepth, hasAlphaChannel };
  }

  private readChunk(data: Buffer, offset: number): { length: number; type: string; data: Buffer } {
    const length = data.readUInt32BE(offset);
    const type = data.toString('ascii', offset + 4, offset + 8);
    const chunkData = data.slice(offset + 8, offset + 8 + length);
    return { length, type, data: chunkData };
  }
}

export { PNGConverter };

