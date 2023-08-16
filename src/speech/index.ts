
/*do not modify this file, created by preval*/
import { sha256 } from '@noble/hashes/sha256'; 
import { bytesToHex as toHex } from '@noble/hashes/utils';

interface Bot {
    [key: string]: string;
}

const bot: Bot = {
    
    

};

const howhow: (words: string) => string = (words) => {
    console.log(toHex(sha256(words)));
    return bot['_'+String(toHex(sha256(words)))];
};

export default howhow;
