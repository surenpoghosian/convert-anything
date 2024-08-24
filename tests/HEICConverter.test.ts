import { convertImage } from "../dist";

test ('converts HEIC correctly', () => {
  convertImage('/Users/surenpoghosyan/Documents/IMG_1850.HEIC','jpg')
})

// test ('1. detects non HEIC file type', () => {  
//   expect(()=>{
  // convertImage('/Users/surenpoghosyan/Documents/IMG_1850.HEIC','jpg')
//   }).toThrow('Input data is not a valid HEIC file')
// })
