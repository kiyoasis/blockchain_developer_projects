/* ===== Persist data with LevelDB ===================================
|  Learn more: level: https://github.com/Level/level     |
|  =============================================================*/
const level = require('level');
const chainDB = './chaindata';
const addressDB = './address';
const db = level(chainDB);
const addressdb = level(addressDB);

module.exports = {

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

    // Get data from levelDB with key
    getBlockByHashFromLevelDB(hash) {
        let rblock = null;
    
        return new Promise((resolve, reject) => {
            db.createReadStream().on('data', (data) => {
                let block = JSON.parse(data.value);
                if (block.hash !== '' && block.hash !== undefined) {
                    if (block.hash === hash) {
                        try {
                            block.body.star.storyDecoded = new Buffer(block.body.star.story, 'hex').toString();
                            rblock = block;
                        } catch (error) {
                            rblock = block;
                        }
                    }
                }
            }).on('error', (error) => {
                return reject(error)
            }).on('close', () => {
                return resolve(rblock)
            })
        })
    },

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
     * Address Handler
     */ 
    // Get data from addressDB with key
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

    async getAddressDataFromLevelDB(address) {
        return new Promise((resolve, reject) => {
            addressdb.get(address, (err, value) => {
                if (err) reject(err);
                resolve(value);
            });
        });
    },

}