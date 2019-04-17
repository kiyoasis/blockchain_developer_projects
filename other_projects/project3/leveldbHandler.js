/* ===== Persist data with LevelDB ===================================
|  Learn more: level: https://github.com/Level/level     |
|  =============================================================*/
const level = require('level');
const chainDB = './chaindata';
const db = level(chainDB);

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
    }
}