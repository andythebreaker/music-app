/*do not modify this file, created by preval*/
import { sha256 } from '@noble/hashes/sha256'; 
import { bytesToHex as toHex } from '@noble/hashes/utils';

interface Bot {
    [key: string]: string;
}
//e
const bot: Bot = {
    fba49a0af80691c092eafd5cf588d76ab1e5dd31a87622bfdb7018bb77c04fcf282d21080527734e1aeff8d73a4610da9244c3b39ee703518af795b5f6fc621: "zhe4 shi4 yi1 zhi1 da4 zhu1"
};

const howhow: (words: string) => string = (words) => {
    return bot[toHex(sha256(words))];
};

export default howhow;