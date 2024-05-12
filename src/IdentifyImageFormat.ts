// Function to identify the image format based on its header
function identifyImageFormat(data: Buffer): string {
  // Check for common image format signatures
  if (data[0] === 0xFF && data[1] === 0xD8 && data[2] === 0xFF) {
    return 'jpeg';
  } else if (data[0] === 0x89 && data.toString('ascii', 1, 4) === 'PNG') {
    return 'png';
  } else if (data[0] === 0x42 && data[1] === 0x4D) {
    return 'bmp';
  } else if (data[8] === 0x57 && data[9] === 0x45 && data[10] === 0x42 && data[11] === 0x50) {
    return 'webp';
  } else if (data[4] === 0x66 && data[5] === 0x74 && data[6] === 0x79 && data[7] === 0x70) {
    return 'heic';
  } else {
    throw new Error('Unsupported image format');
  }
}

export { identifyImageFormat };