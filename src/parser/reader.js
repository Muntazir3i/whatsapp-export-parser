import { createReadStream } from 'fs';
import readline from 'readline/promises'; // Import as lowercase 'readline'
import { text } from 'stream/consumers';
import { msgParser } from './messageParser.js';

const fileStream = createReadStream('/home/mdot/projectFolder/whatsapp-export-parser/sample.txt', { encoding: 'utf8' });


const rl = readline.createInterface({
  input: fileStream,
  crlfDelay: Infinity
});


for await (const line of rl) {
  if(line.length === 0){
    continue;
  }
  msgParser(line);
}


