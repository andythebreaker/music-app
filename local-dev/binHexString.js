const fs = require('fs');

// Replace these with your input and output file paths
const inputFile = 'tmp.mp3';
const outputFile = 'output.txt';

fs.readFile(inputFile, (err, data) => {
  if (err) {
    console.error('Error reading input file:', err);
    return;
  }
  const hexString = Buffer.from(data).toString('hex');
  fs.writeFile(outputFile, `/*do not modify this file, created by hexString-BOT; audio usage: How How; used: Fanhuaji*/ export const x1 : string= "${hexString}";`, (err) => {
    if (err) {
      console.error('Error writing output file:', err);
      return;
    }
    console.log('Binary hex string array saved to', outputFile);
  });
});
