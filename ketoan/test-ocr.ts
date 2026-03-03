import { ocrService } from './app/services/ocr.service';
import path from 'path';

async function test() {
  const imagesDir = path.join(process.cwd(), '..', 'images');
  console.log('Scanning directory:', imagesDir);
  
  try {
    const results = await ocrService.processDirectory(imagesDir);
    console.log('Results:', JSON.stringify(results, null, 2));
  } catch (error) {
    console.error('Error:', error);
  }
}

test();
