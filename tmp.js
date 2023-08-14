const fs = require('fs').promises;
const path = require('path');

async function countTypeScriptFiles(dirPath) {
    const have_Provider = [];

    async function traverseDir(currentPath) {
        const files = await fs.readdir(currentPath);

        for (const file of files) {
            const filePath = path.join(currentPath, file);
            const stats = await fs.stat(filePath);

            if (stats.isDirectory()) {
                await traverseDir(filePath);
            } else if (stats.isFile() && (file.endsWith('.ts') || file.endsWith('.tsx'))) {
                const searchString = /^import *\{? *preval *\}? *from *[\'|\"]babel-plugin-preval\/macro[\'|\"] *\;$/gm;

                try {
                    const content = await fs.readFile(filePath, 'utf-8');
                    if (searchString.test(content)) {
                        have_Provider.push(filePath);
                    }
                } catch (err) {
                    console.error('Error reading the file:', err);
                }
            }
        }
    }

    await traverseDir(dirPath);
    console.log(have_Provider);

    const regexPattern = /howhow\( *\"([^\(\)]+)\" *\)/g;

    for (let i = 0; i < have_Provider.length; i++) {
        const filePath = have_Provider[i];
        const fullPath = path.resolve(filePath);
        
        try {
            const data = await fs.readFile(fullPath, 'utf8');
            const matches = [...data.matchAll(regexPattern)];

            if (matches.length > 0) {
                console.log("Matches in file");
                matches.forEach(match => {
                    console.log(match[0]);
                    console.log(match[1]);
                });
            } else {
                console.log("No matches found");
            }
        } catch (err) {
            console.error('Error reading file:', err);
        }
    }
    return have_Provider;
}

const srcDir = './src';
countTypeScriptFiles(srcDir)
    .then(have_Provider => {
        console.log('Files with Provider imports:', have_Provider);
    })
    .catch(error => {
        console.error('Error counting TypeScript files:', error);
    });
