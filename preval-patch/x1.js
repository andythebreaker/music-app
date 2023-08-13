export function x() {
    const targetSTR = "達成目標十公里";
    const fs = require('fs');
    const path = require('path');
    const fetch = require('make-fetch-happen').defaults({
        cachePath: './my-cache' // path where cache will be written (and read)
    });
    fetch('http://api.zhconvert.org/convert?converter=Pinyin&text=' + targetSTR + '&prettify=1').then(res => {
        return res.json() // download the body as JSON
    }).then(body => {
        console.log(body.data.text);

        const directoryPath = './public/zhconvert';
        const fileName = targetSTR + '.txt';
        const fileContent = body.data.text;

        // Check if the directory exists, and if not, create it
        if (!fs.existsSync(directoryPath)) {
            fs.mkdirSync(directoryPath, { recursive: true });
        }

        const filePath = path.join(directoryPath, fileName);

        // Write the file content to the specified path
        fs.writeFile(filePath, fileContent, (err) => {
            if (err) {
                console.error('Error writing file:', err);
            } else {
                console.log('success');
            }
        });

        return null;//module.exports = "TS bad";
    });
}
