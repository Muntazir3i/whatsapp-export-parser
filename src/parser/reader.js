import { createReadStream, stat } from 'fs';
import readline from 'readline/promises'; // Import as lowercase 'readline'
import { text } from 'stream/consumers';
import { msgParser} from './messageParser.js';


export  function fileStream(location) {
  const fileStream = createReadStream(location, { encoding: 'utf8' });


  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity
  });

  return rl
}






