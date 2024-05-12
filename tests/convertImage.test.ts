import { convertImage } from "../dist";

test ('converts png correctly', () => {
  convertImage('/Users/surenpoghosyan/Documents/PNG_transparency_demonstration_1.png','jpg')
  convertImage('/Users/surenpoghosyan/Documents/NewTux.png','jpg')
  convertImage('/Users/surenpoghosyan/Documents/IMG_1850.png','jpg')
  convertImage('/Users/surenpoghosyan/Documents/IMG_1850_2.png','jpg')
  // const image = convertImage('/Users/surenpoghosyan/Documents/IMG_5029.heic','jpg')
  // expect(image)
})

// import { add } from '../dist';

// test('adds two numbers correctly', () => {
//   const result = add(2, 3);
//   expect(result).toBe(5);
// });