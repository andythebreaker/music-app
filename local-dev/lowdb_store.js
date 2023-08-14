const { Hash, createHash } = require('crypto');
const fs = require('fs');
const path = require('path');

function findMp3FilesInDirectory(directory) {
    fs.readdir(directory, (err, files) => {
        if (err) {
            console.error('Error reading directory:', err);
            return;
        }

        files.forEach(file => {
            const filePath = path.join(directory, file);

            fs.stat(filePath, (err, stats) => {
                if (err) {
                    console.error('Error stating file:', err);
                    return;
                }

                if (stats.isDirectory()) {
                    findMp3FilesInDirectory(filePath); // Recursively search subdirectories
                } else if (path.extname(file) === '.mp3') {
                    const h512=createHash("sha512");
                    h512.update(path.parse(file).name,'utf8');
                    // const h513=createHash("sha512");
                    // h513.update('的同學','utf8');
                    const h512s=h512.digest('hex');
                    console.log(`${file} @ ${path.basename(path.dirname(filePath))} [${path.parse(file).name}]`);// [${h512.digest('hex')===h513.digest('hex')}]`);
                    fs.readFile(filePath, (err, data) => {
                        if (err) {
                          console.error('Error reading input file:', err);
                          return;
                        }
                        const hexString = Buffer.from(data).toString('hex');
                        
                        fs.writeFile(`../src/speech/mp3/${path.basename(path.dirname(filePath))}/${h512s}.ts`, `/*do not modify this file, created by hexString-BOT; audio usage: How How; used: Fanhuaji*/ const SHA512_${h512s} : string= "${hexString}"; export default SHA512_${h512s};`, (err) => {
                          if (err) {
                            console.error('Error writing output file:', err);
                            return;
                          }
                          console.log('Binary hex string array saved');
                        });
                      });
                }
            });
        });
    });
}
const targetDirectory = '../../car_pi-master/car_pi-master/txt2sound/HowHow-parser/result/mp3'; // Replace with your directory path
findMp3FilesInDirectory(targetDirectory);
