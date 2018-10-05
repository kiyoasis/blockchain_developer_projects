/* ===== Persist data with LevelDB ===================================
|  Learn more: level: https://github.com/Level/level     |
|  =============================================================*/

const level = require('level');
const chainDB = './chaindata';
const db = level(chainDB);

function addBlockToLevelDB(key, value) {
  return new Promise((resolve, reject) => {
    db.put(key, value, (err) => {
      if (err) {
        reject(err);
      }

      resolve(`Block #${key} is added.`);
    });
  });
}

// Get data from levelDB with key
function getBlockFromLevelDB(key){
  return new Promise((resolve, reject) => {
    db.get(key, (err, value) => {
      if (err) reject(err);
      resolve(value);
    });
  });
}

function getBlockHeightLevelDB() {
  return new Promise((resolve, reject) => {
    let height = -1;

    db.createReadStream().on('data', (data) => {
      height++;
    }).on('error', (error) => {
      reject(error);
    }).on('close', () => {
      resolve(height);
    });
  });
}

function test() {
  //let blockHeight = 0;
  let stream = db.createReadStream();
  stream.on('data', function (data) {
    //blockHeight ++;
    console.log(data);
  });
  stream.on('close', function () {
    //console.log(blockHeight);
  });
}

// Deleting an element in levelDB with key
function deleteData(key) {
  db.del(key, function (err) {
    db.get(key, function (err, data) {
      console.log(data);
    })
  })
}

// Debug purpose
function deleteAllData() {
  getBlockHeightLevelDB().then((height) => {
    if (height+1 === 0) {
      console.log("No data in LevelDB.");
    } else {
      console.log("Deleting all data in LevelDB.");
      for (var i = 0; i < height+1; i++) {
        deleteData(i);
      }
    }
  });
}

/* ===== SHA256 with Crypto-js ===================================
|  Learn more: Crypto-js: https://github.com/brix/crypto-js      |
|  =============================================================*/

const SHA256 = require('crypto-js/sha256');

/* ===== Block Class ===================================
|  Class with a constructor for block data model       |
|  ====================================================*/

class Block {
  constructor(data) {
    this.hash = "",
    this.height = 0,
    this.body = data,
    this.time = 0,
    this.previousBlockHash = ""
  }
}

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
    // new chain array is commented out
    // this.chain = [];
    
    // add first genesis block
    this.getBlockHeight().then((height) => {
      if (height + 1 === 0) {
        this.addBlock(new Block("First block in the chain - Genesis block"));
        //console.log("Genesis block has been inserted.");
      }
    });
  }

  // addBlock method
  async addBlock(newBlock) {

    const chainHeight = parseInt(await this.getBlockHeight());
    console.log("chainHeight: " + chainHeight);

    // block height
    newBlock.height = chainHeight + 1;
    // newBlock.height = this.chain.length;
    
    // UTC timestamp
    newBlock.time = new Date().getTime().toString().slice(0,-3);
    
    if (newBlock.height > 0) {
      // previous block hash
      const previousBlock = await this.getBlock(chainHeight);
      newBlock.previousBlockHash = previousBlock.hash;
    }
    
    // SHA256 requires a string of data
    newBlock.hash = SHA256(JSON.stringify(newBlock)).toString();
    
    // add block to chain
    await addBlockToLevelDB(newBlock.height, JSON.stringify(newBlock));
  }

  // get block
  async getBlock(blockHeight){
    // Parse the string object into JSON
    let block = JSON.parse(await getBlockFromLevelDB(blockHeight));
    return block;
  }

  // Get block height
  async getBlockHeight() {
    const height = await getBlockHeightLevelDB();

    if (height === -1) {
      console.log("There is no block ins the chain.");
    } else {
      console.log("The block height is: "  + height);
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
      console.log('Block #' + blockHeight +' invalid hash:\n' + blockHash+'<>' + validBlockHash);
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
      let previousHash = await this.getBlock(i+1).previousBlockHash;
      if (blockHash !== previousHash) {
        errorLog.push(i);
      } else {
        console.log('The hash of block #' + i + ' is identical to the previous hash of block #' + (i+1) + ': Valid');
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


/* ===== Testing ==============================================================|
|  - Self-invoking function to add blocks to chain                             |
|  - Learn more:                                                               |
|   https://scottiestech.info/2014/07/01/javascript-fun-looping-with-a-delay/  |
|                                                                              |
|  * 100 Milliseconds loop = 36,000 blocks per hour                            |
|     (13.89 hours for 500,000 blocks)                                         |
|    Bitcoin blockchain adds 8640 blocks per day                               |
|     ( new block every 10 minutes )                                           |
|  ===========================================================================*/

// (function theLoop (i) {
//   setTimeout(function () {
//     addDataToLevelDB('Testing data');
//     if (--i) theLoop(i);
//   }, 100);
// })(10);

let blockchain = new Blockchain();
// let block = new Block("Test data");
// blockchain.addBlock(block);
// blockchain.validateBlock(1);

// (function theLoop (i) {
//   setTimeout(function () {
//       let blockTest = new Block("Test Block - " + (i + 1));
//       blockchain.addBlock(blockTest).then((result) => {
//           console.log(result);
//           i++;
//           if (i < 10) theLoop(i);
//       });
//   }, 1000);
// })(0);

blockchain.validateChain();

// let inducedErrorBlocks = [2,4];
// for (var i = 0; i < inducedErrorBlocks.length; i++) {
//   //blockchain.getBlock(inducedErrorBlocks[i]).body = 'induced chain error';

//   getBlockFromLevelDB(inducedErrorBlocks[i]).then((block) => {
//     block.body = 'induced chain error';
//     //addBlockToLevelDB(inducedErrorBlocks[i], JSON.stringify(block));
//     console.log(block);
//   });
// }

//deleteAllData();
//test();
