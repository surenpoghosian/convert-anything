import fs from 'fs';
import { ImageConverterFactory } from './src/ImageConverterFactory';
import { identifyImageFormat } from './src/IdentifyImageFormat';

// Function to convert an image file
export async function convertImage(inputFile: string, outputFormat: string): Promise<void> {
  return new Promise<void>((resolve, reject) => {
    // Read the input image file
    fs.readFile(inputFile, (err, data) => {
      if (err) {
        reject(err);
        return;
      }

      // Identify the input image format
      const inputFormat = identifyImageFormat(data);

      // Create the appropriate image converter based on the format
      const converter = ImageConverterFactory.getConverter(inputFormat);

      // Decode the input image data based on its format
      const decodedImageData = converter.decode(data);

      // Encode the decoded image data into the desired output format
      const encodedImageData = converter.encode(decodedImageData);

      // Write the encoded image data to a new file
      const outputFile = `output.${outputFormat}`;
      fs.writeFile(outputFile, encodedImageData, (err) => {
        if (err) {
          reject(err);
          return;
        }
        console.log(`Image converted successfully to ${outputFormat} format!`);
        resolve();
      });
    });
  });
}