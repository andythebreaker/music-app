const master = require('minarun-core');

const srcDir = './src';
master(srcDir)
    .then(have_Provider => {
       // if (!mute) 
        console.log('Files with Provider imports:', have_Provider);
    })
    .catch(error => {
        console.error('Error counting TypeScript files:', error);
    });