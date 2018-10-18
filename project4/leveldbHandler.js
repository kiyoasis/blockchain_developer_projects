/* ===== Persist data with LevelDB ===================================
|  Learn more: level: https://github.com/Level/level     |
|  =============================================================*/
const level = require('level');
const chainDB = './chaindata';
const addressDB = './address';
const db = level(chainDB);
const addressdb = level(addressDB);

module.exports = {
    // Adding a block to chaindata
    addBlockToLevelDB(key, value) {
        return new Promise((resolve, reject) => {
            db.put(key, value, (err) => {
                if (err) {
                    reject(err);
                }

                resolve(`Block #${key} is added.`);
            });
        });
    },

    // Get data from levelDB with key
    getBlockFromLevelDB(key) {
        return new Promise((resolve, reject) => {
            db.get(key, (err, value) => {
                if (err) reject(err);
                resolve(value);
            });
        });
    },

    // Getting blocks by address as a key
    getBlocksByAddressFromLevelDB(address) {
        const blocks = [];
        let block;
    
        return new Promise((resolve, reject) => {
            db.createReadStream().on('data', (data) => {
                // Avoid genesis block
                if (parseInt(data.key) !== 0) {
                    console.log(data.value);
                    block = JSON.parse(data.value);
                    if (block.body !== '' && block.body !== undefined) {
                        if (block.body.address !== '' && block.body.address !== undefined) {
                            if (block.body.address === address) {
                                block.body.star.storyDecoded = new Buffer(block.body.star.story, 'hex').toString();
                                blocks.push(block);
                            }
                        }
                    }
                }
            }).on('error', (error) => {
                return reject(error)
            }).on('close', () => {
                return resolve(blocks)
            })
        })
    },

    // Get block data from levelDB with hash key
    getBlockByHashFromLevelDB(hash) {
        let returnedBlock = null;
        return new Promise((resolve, reject) => {
            db.createReadStream().on('data', (data) => {
                let block = JSON.parse(data.value);
                if (block.hash !== '' && block.hash !== undefined) {
                    if (block.hash === hash) {
                        try {
                            block.body.star.storyDecoded = new Buffer(block.body.star.story, 'hex').toString();
                            returnedBlock = block;
                        } catch (error) {
                            returnedBlock = block;
                        }
                    }
                }
            }).on('error', (error) => {
                return reject(error)
            }).on('close', () => {
                return resolve(returnedBlock)
            })
        })
    },

    // Getting block height from level db
    getBlockHeightLevelDB() {
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
    },

    // Deleting an element in levelDB with key
    deleteData(key) {
        db.del(key, function(err) {
            db.get(key, function(err, data) {
                console.log(data);
            })
        })
    },

    // Debug purpose
    deleteAllData() {
        getBlockHeightLevelDB().then((height) => {
            if (height + 1 === 0) {
                console.log("No data in LevelDB.");
            } else {
                console.log("Deleting all data in LevelDB.");
                for (var i = 0; i < height + 1; i++) {
                    deleteData(i);
                }
            }
        });
    },

    /**
     * Address Data Handler
     */ 
    // Adding address data  to addressDB
    addAddressDataToLevelDB(address, value) {
        return new Promise((resolve, reject) => {
            addressdb.put(address, value, (err) => {
                if (err) {
                    reject(err);
                }
                resolve(`Address data of #${address} is added.`);
            });
        });
    },

    // Get address data from addressDB with address as a key
    async getAddressDataFromLevelDB(address) {
        return new Promise((resolve, reject) => {
            addressdb.get(address, (err, value) => {
                if (err) reject(err);
                resolve(value);
            });
        });
    },

    // Deleting an address data in levelDB with address key
    deleteAddressData(address) {
        addressdb.del(address, function(err) {
            addressdb.get(address, function(err, data) {
                console.log(address + " has been deleted.");
            })
        })
    }
}