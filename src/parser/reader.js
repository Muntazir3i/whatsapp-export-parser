/**
 * @file reader.js
 * @description Provides streaming utilities for reading text files line-by-line using Node.js readline interface.
 */

import { createReadStream } from 'fs';
import readline from 'readline/promises';

/**
 * Creates a line-by-line readline Interface stream for a given file path.
 *
 * @param {string} location - Absolute or relative file system path to the chat export file.
 * @returns {readline.Interface} An async iterable Readline Interface stream.
 */
export function fileStream(location) {
  // Create an asynchronous read stream for the target text file using UTF-8 encoding
  const stream = createReadStream(location, { encoding: 'utf8' });

  // Wrap the readable stream in a readline interface for memory-efficient line parsing
  const rl = readline.createInterface({
    input: stream,
    crlfDelay: Infinity // Treats \r\n as a single line break
  });

  return rl;
}






