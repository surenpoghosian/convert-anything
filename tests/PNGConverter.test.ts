import { convertImage } from "../dist";

test ('converts PNG correctly', () => {
    convertImage('/Users/surenpoghosyan/Documents/PNG_transparency_demonstration_1.png','jpg')
})

// test ('1. detects non PNG file type', () => {  
//   const image = convertImage('/Users/surenpoghosyan/Documents/322742631341211.webp','jpg')
//   expect(image).toThrow('Input data is not a valid PNG file')
// })

// test ('2. detects non PNG file type', () => {  
//   expect(()=>{
//     convertImage('/Users/surenpoghosyan/Documents/PNG_transparency_demonstration_1.png','heic')
//   }).toThrow('Input data is not a valid PNG file')
// })

// test ('2. detects non PNG file type', () => {  
//   const image = convertImage('/Users/surenpoghosyan/Documents/directed-by-robert-weide.gif','jpg')
//   // expect(image).toThrow('Input data is not a valid PNG file')
// })

// test ('3. detects non PNG file type', () => {  
//   const image = convertImage('/Users/surenpoghosyan/Documents/st,small,507x507-pad,600x600,f8f8f8.jpg','jpg')
//   // expect(image).toThrow('Input data is not a valid PNG file')
// })
