/* ===== SHA256 with Crypto-js ===================================
|  Learn more: Crypto-js: https://github.com/brix/crypto-js      |
|  =============================================================*/

const Block = require('./block')
const SHA256 = require('crypto-js/sha256');
const leveldb = require('./leveldbHandler');

/* ===== Blockchain ===================================
|  Class with a constructor for blockchain data model  |
|  with functions to support:                          |
|     - getBlockHeight()                               |
|     - addBlock()                                     |
|     - getBlock()                                     |
|     - validateBlock()                                |
|     - validateChain()                                |
|  ====================================================*/

class Blockchain {

    constructor() {
        // add first genesis block
        this.getBlockHeight().then((height) => {
            if (height + 1 === 0) {
                this.addBlock(new Block("First block in the chain - Genesis block"));
            }
        });
    }

    // addBlock method
    async addBlock(newBlock) {

        const chainHeight = parseInt(await this.getBlockHeight());
        console.log("chainHeight: " + chainHeight);

        // block height
        newBlock.height = chainHeight + 1;

        // UTC timestamp
        newBlock.time = new Date().getTime().toString().slice(0, -3);

        if (newBlock.height > 0) {
            // previous block hash
            const previousBlock = await this.getBlock(chainHeight);
            newBlock.previousBlockHash = previousBlock.hash;
        }

        // SHA256 requires a string of data
        newBlock.hash = SHA256(JSON.stringify(newBlock)).toString();

        // add block to chain
        await leveldb.addBlockToLevelDB(newBlock.height, JSON.stringify(newBlock));
    }

    // get block
    async getBlock(blockHeight) {
        // Parse the string object into JSON
        let block = JSON.parse(await leveldb.getBlockFromLevelDB(blockHeight));
        try {
            block.body.star.storyDecoded = new Buffer(block.body.star.story, 'hex').toString();
        } catch (error) {
            block = JSON.parse(await leveldb.getBlockFromLevelDB(blockHeight));
        }
        
        return block;
    }

    // get blocks by address
    async getBlocksByAddress(address) {
        let blocks = await leveldb.getBlocksByAddressFromLevelDB(address);
        return blocks;
    }

    // get blocks by address
    async getBlockByHash(hash) {
        let block = await leveldb.getBlockByHashFromLevelDB(hash);
        return block;
    }

    // Get block height
    async getBlockHeight() {
        const height = await leveldb.getBlockHeightLevelDB();

        if (height === -1) {
            console.log("There is no block in the chain.");
        }

        return height;
    }

    // validate block
    async validateBlock(blockHeight) {
        // get block object
        let block = await this.getBlock(blockHeight);
        // get block hash
        let blockHash = block.hash;
        // remove block hash to test block integrity
        block.hash = '';
        // generate block hash
        let validBlockHash = SHA256(JSON.stringify(block)).toString();
        // Compare
        if (blockHash === validBlockHash) {
            console.log('The block #' + blockHeight + ' is  valid');
            return true;
        } else {
            console.log('Block #' + blockHeight + ' invalid hash:\n' + blockHash + '<>' + validBlockHash);
            return false;
        }
    }

    // Validate blockchain
    async validateChain() {
        let errorLog = [];

        const height = parseInt(await this.getBlockHeight());

        for (var i = 0; i < height; i++) {
            // validate block
            if (!await this.validateBlock(i)) errorLog.push(i);

            // compare blocks hash link
            let blockHash = await this.getBlock(i).hash;
            let previousHash = await this.getBlock(i + 1).previousBlockHash;
            if (blockHash !== previousHash) {
                errorLog.push(i);
            } else {
                console.log('The hash of block #' + i + ' is identical to the previous hash of block #' + (i + 1) + ': Valid');
            }
        }

        // validate the last block
        if (!await this.validateBlock(height)) errorLog.push(height);

        if (errorLog.length > 0) {
            console.log('Block errors = ' + errorLog.length);
            console.log('Blocks: ' + errorLog);
        } else {
            console.log('No errors detected');
        }
    }
}
  
module.exports = Blockchain