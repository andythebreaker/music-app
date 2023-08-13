const fs = require('fs');

// Replace these with your input and output file paths
const inputFile = 'tmp.mp3';
const outputFile = 'output.txt';

// Read the content of the input file
fs.readFile(inputFile, (err, data) => {
  if (err) {
    console.error('Error reading input file:', err);
    return;
  }

  // Convert the binary data to a hex string
  const hexString = Buffer.from(data).toString('hex');

  // Write the hex string to the output file
  fs.writeFile(outputFile, hexString, (err) => {
    if (err) {
      console.error('Error writing output file:', err);
      return;
    }
    console.log('Binary hex string array saved to', outputFile);
  });
});
