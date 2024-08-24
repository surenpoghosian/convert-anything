import { ImageConverter } from '../ImageConverter';

interface Box {
  type: string;
  size: number;
  offset: number;
  children: Box[];
}

interface HEICMetadata {
  width?: number;
  height?: number;
  [key: string]: any; // Allow additional properties
}

class HEICConverter implements ImageConverter {
  decode(data: Buffer): any {
    // Implement HEIC decoding
    // Example: Implement a custom HEIC decoder
    if (!this.verifyHEICSignature(data)) {
      throw new Error('Input data is not a valid HEIC file');
    }

    const arrayBuffer = data.buffer.slice(data.byteOffset, data.byteOffset + data.byteLength);
    const dataView = new DataView(arrayBuffer);

    const d = this.getStringFromDataView(dataView, 0, dataView.byteLength)
    const boxes = this.parseBoxes(dataView, 0, data.byteOffset + data.byteLength)
    const metaBox = boxes.filter(item => item.type === 'meta');
    const extractedMeta = this.extractMetadataFromMetaBox(dataView, { type: metaBox[0].type, size: metaBox[0].size, offset: metaBox[0].offset, children: metaBox[0].children });
    console.log(extractedMeta);
    // console.log(d.includes('ftyp'))
    // console.log(d.includes('meta'))
    // console.log(d.indexOf('meta'))
    // console.log(d.includes('mdat'))
    // console.log(d.includes('iinf'))
    // console.log(d.includes('hdlr'))
    // console.log(d.includes('moov'))
    // console.log(d.includes('trak'))
    // console.log(d.includes('mdia'))
    // console.log(d.includes('minf'))
    // console.log(d.includes('dinf'))
    // console.log(d.includes('stbl'))

    // throw new Error('HEIC decoding not implemented');
  }
  
  encode(data: any): Buffer {
    // Implement HEIC encoding
    // Example: Implement a custom HEIC encoder
    throw new Error('HEIC decoding not implemented');
  }

  public parseBoxes(dataView: DataView, start: number, end: number): Box[] {
    const boxes: Box[] = [];
    let offset = start;

    while (offset < end) {
        if (offset + 8 > end) {
            console.warn("Invalid box header at offset", offset);
            break;
        }

        const size = dataView.getUint32(offset);
        const type = this.getStringFromDataView(dataView, offset + 4, offset + 8);
        let boxEnd = offset + size;

        // Handle extended size (64-bit size)
        if (size === 1) {
            if (offset + 16 > end) {
                console.warn("Invalid extended size header at offset", offset);
                break;
            }
            const high = dataView.getUint32(offset + 8);
            const low = dataView.getUint32(offset + 12);
            const extendedSize = high * 2 ** 32 + low;
            boxEnd = offset + extendedSize;
        }

        // Ensure the size is valid and within bounds
        if ((size < 8 && size !== 1) || boxEnd > dataView.byteLength) {
            console.warn(`Invalid box size at offset ${offset}: size=${size}`);
            break;
        }

        const box: Box = {
            type,
            size: size === 1 ? boxEnd - offset : size,
            offset,
            children: []
        };

        console.log(`Box detected: Type=${type}, Size=${size}, Offset=${offset}`);

        // Check for boxes that are known to contain children
        const containerBoxes = ['meta', 'moov', 'trak', 'mdia', 'minf', 'dinf', 'stbl'];
        if (containerBoxes.includes(type)) {
            box.children = this.parseBoxes(dataView, offset + (size === 1 ? 16 : 8), boxEnd);
        }

        boxes.push(box);
        offset = boxEnd;

        // Safeguard: Ensure progress is made
        if (offset <= start) {
            console.warn(`No progress made at offset ${offset}. Stopping.`);
            break;
        }
    }

    return boxes;
  }

  // Helper function to extract string from DataView
  public extractMetadataFromMetaBox(dataView: DataView, metaBox: Box): HEICMetadata {
    const metadata: HEICMetadata = {};
    const offset = metaBox.offset;
    const metaEnd = metaBox.offset + metaBox.size;

    // Parse child boxes of the meta box
    console.log('parsing child boxes below')
    const childBoxes = this.parseBoxes(dataView, offset, metaEnd);
    console.log('childBoxes',childBoxes);
    for (const child of childBoxes) {
      if (child.type === 'iloc') {
        // Parse iloc box to get item locations
        this.parseIlocBox(dataView, child, metadata);
      } else if (child.type === 'iprp') {
        // Parse iprp box to get item properties
        this.parseIprpBox(dataView, child, metadata);
      }
    }

    return metadata;
  }

  // Function to parse iloc box (simplified for demonstration)
  public parseIlocBox(dataView: DataView, ilocBox: Box, metadata: HEICMetadata): void {
    const offset = ilocBox.offset + 8; // Skip the box header
    const version = dataView.getUint8(offset);
    console.log('version',version)
    // Parse the iloc box based on its version and flags (this is a simplified example)
    // The actual parsing might be more complex based on the iloc box structure
    if (version === 0 || version === 1) {
      const itemCount = dataView.getUint16(offset + 4);
      console.log('itemCount',itemCount)
      for (let i = 0; i < itemCount; i++) {
        const itemOffset = offset + 6 + (i * 4);
        const itemId = dataView.getUint16(itemOffset);
        const dataReferenceIndex = dataView.getUint16(itemOffset + 2);
        console.log(itemOffset, itemId, dataReferenceIndex)
        // Add item location data to metadata (simplified)
        metadata[`item_${itemId}_location`] = dataReferenceIndex;
      }
    }
  }

  // Helper function to find the offset of a specific box type within a range
  public findBoxOffset(dataView: DataView, start: number, end: number, boxType: string): number {
    let offset = start;
    while (offset < end) {
      const size = dataView.getUint32(offset);
      const type = this.getStringFromDataView(dataView, offset + 4, offset + 8);
      if (type === boxType) {
        return offset;
      }
      offset += size;
    }
    return -1;
  }

  // Function to parse iprp box (simplified for demonstration)
  public parseIprpBox(dataView: DataView, iprpBox: Box, metadata: HEICMetadata): void {
    const offset = iprpBox.offset + 8; // Skip the box header
    const ipcoOffset = this.findBoxOffset(dataView, offset, iprpBox.size, 'ipco');
    console.log('ipcoOffset', ipcoOffset);
    if (ipcoOffset !== -1) {
      // Parse ipco box to extract properties (simplified)
      const ipcoSize = dataView.getUint32(ipcoOffset);
      const ipcoType = this.getStringFromDataView(dataView, ipcoOffset + 4, ipcoOffset + 8);
      if (ipcoType === 'ispe') {
        const width = dataView.getUint32(ipcoOffset + 12);
        const height = dataView.getUint32(ipcoOffset + 16);
        console.log(width, height)
        metadata.width = width;
        metadata.height = height;
      }
    }
  }

  // Helper function to extract string from DataView
  public getStringFromDataView(dataView: DataView, start: number, end: number): string {
    let result = '';
    for (let i = start; i < end; i++) {
        result += String.fromCharCode(dataView.getUint8(i));
    }
    return result;
  }

  public verifyHEICSignature(data: Buffer): boolean {
    // Check if the buffer is large enough to contain the signature and compatible brands
    if (data.length < 12) {
      return false; // Buffer too short to contain the signature
    }

    // Read the first few bytes of the file to identify the file signature
    const signature = data.slice(4, 8); // Signature starts from byte 4 and ends at byte 8

    // Verify if the file signature contains "ftyp" (Box Type)
    const isFTYPBox = signature.equals(Buffer.from('66747970', 'hex')); // 'ftyp' in hexadecimal

    if (!isFTYPBox) {
      return false; // "ftyp" box type not found
    }

    // Verify compatible brands within the "ftyp" box
    const compatibleBrands = this.readFTYPCompatibleBrands(data);
    if (!compatibleBrands.includes('heic') && !compatibleBrands.includes('heix')) {
      return false; // "heic" or "heix" not listed as compatible brands
    }

    return true; // Signature and compatible brands match HEIC file format
  }

  public readFTYPCompatibleBrands(data: Buffer): string[] {
    // Check if the buffer is large enough to contain compatible brands
    if (data.length < 16) {
      return []; // Insufficient data to contain compatible brands
    }

    // Read the size of the box (4 bytes, big-endian)
    const boxSize = data.readUInt32BE(0);

    // Check if the box size is valid
    if (boxSize < 16 || boxSize > data.length) {
      return []; // Invalid box size
    }

    // Read compatible brands starting from offset 16
    const compatibleBrands: string[] = [];
    for (let i = 16; i < boxSize; i += 4) {
        compatibleBrands.push(data.toString('ascii', i, i + 4));
    }

    return compatibleBrands;
  }
}

export { HEICConverter };
