import { createReadStream } from 'fs';
import readline from 'readline/promises'; // Import as lowercase 'readline'

const fileStream = createReadStream('/home/mdot/projectFolder/whatsapp-export-parser/sample.txt', { encoding: 'utf8' });

// Use lowercase 'readline' here
const rl = readline.createInterface({
  input: fileStream,
  crlfDelay: Infinity
});

for await (const line of rl) {
  console.log(line);
}
