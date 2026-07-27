import { log } from 'console';
import { createReadStream } from 'fs';
import { type } from 'os';
import readline from 'readline/promises'; // Import as lowercase 'readline'

const fileStream = createReadStream('/Users/mohammadmuntazir/gitrepo/whatsapp-export-parser/sample.txt', { encoding: 'utf8' });
const demoText = "20/07/2026, 10:15 AM - Ali: Hey, how are you?";
let trackCurrectMsg = "";

// Use lowercase 'readline' here
const rl = readline.createInterface({
  input: fileStream,
  crlfDelay: Infinity
});

// implementing parser - demo

function msgParser(demoText) {
  let dateString = demoText.slice(0, 10);
  let [day, month, year] = dateString.split("/");
  let dateObj = new Date(year, month - 1, day);
  console.log(dateObj.toLocaleDateString('en-GB'));
}

msgParser(demoText)

// for await (const line of rl) {
//   console.log(line);
// }
