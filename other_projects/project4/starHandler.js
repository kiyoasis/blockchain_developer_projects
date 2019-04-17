const leveldb = require('./leveldbHandler');
const bitcoinMessage = require('bitcoinjs-message');
const Block = require('./block');
const Blockchain = require('./blockchain');
const blockchain = new Blockchain();

module.exports = {
    
    async requestValidationHandler(address) {

        let addressData;
        try {
            addressData = await leveldb.getAddressDataFromLevelDB(address);
            console.log("addressData found: \n" + addressData);
        } catch (error) {
            console.log("address data not found in the leveldb.");
            addressData == null;
        }

        let data = null;

        // The address data is new
        if (addressData == null) {
            const currentTime = Date.now();
            const message = `${address}:${currentTime}:starRegistry`;
            const validationWindow = 300;
    
            data = {
                address: address,
                requestTimeStamp: currentTime,
                message: message,
                validationWindow: validationWindow
            };
    
            await leveldb.addAddressDataToLevelDB(address, JSON.stringify(data));
            console.log("address data has been addeed!");
        }

        // The address data already existes but not validated.
        else {
            console.log("address data is temporalily registered.")
        
            let value = JSON.parse(addressData);
            const fiveMinutesAgo = Date.now() - (5 * 60 * 1000)
            const isExpired = value.requestTimeStamp < fiveMinutesAgo
        
            if (isExpired) {
                console.log("The address data has been expired and needs to be readded again.")
                const currentTime = Date.now();
                const message = `${address}:${currentTime}:starRegistry`;
                const validationWindow = 300;
        
                data = {
                    address: address,
                    requestTimeStamp: currentTime,
                    message: message,
                    validationWindow: validationWindow
                };

                await leveldb.addAddressDataToLevelDB(data.address, JSON.stringify(data));
            } else {
                console.log("The data is still not expired.")
                data = {
                    address: address,
                    message: value.message,
                    requestTimeStamp: value.requestTimeStamp,
                    validationWindow: Math.floor((value.requestTimeStamp - fiveMinutesAgo) / 1000)
                }
            }
        }

        return data
    }, 

    async messageSignatureValidator(address, signature) {

        let addressData;
        try {
            addressData = await leveldb.getAddressDataFromLevelDB(address);
            console.log("addressData found: \n" + addressData);
        } catch (error) {
            console.log("data not found");
            return null;
        }

        let value = JSON.parse(addressData);
        if (value.messageSignature === 'valid') {
            return {
                registerStar: true,
                status: value
            };
        } else {
            const fiveMinutesAgo = Date.now() - (5 * 60 * 1000);
            const isExpired = value.requestTimeStamp < fiveMinutesAgo;
            let isValid = false;
        
            if (isExpired) {
                value.validationWindow = 0;
                value.messageSignature = 'validationWindow was expired';
            } else {
                value.validationWindow = Math.floor((value.requestTimeStamp - fiveMinutesAgo) / 1000);
        
                try {
                    isValid = bitcoinMessage.verify(value.message, address, signature);
                } catch (error) {
                    isValid = false;
                }
        
                value.messageSignature = isValid ? 'valid' : 'invalid';
            }
            
            await leveldb.addAddressDataToLevelDB(address, JSON.stringify(value));
        
            return {
                registerStar: !isExpired && isValid,
                status: value
            };
        }

    },

    async registerBlock(address, star) {

        let addressData;
        try {
            addressData = await leveldb.getAddressDataFromLevelDB(address);
            console.log("addressData found: \n" + addressData);

            let value = JSON.parse(addressData)

            if (value.messageSignature !== "valid") {
                return {
                    "status": 400,
                    "message": "The message signature is not valid."
                };
            }

        } catch (error) {
            return {
                "status": 400,
                "message": "Address data not found."
            };
        }
        
        // If the address data is valid, do as follows:
        let body = {};
        body.address = address;

        if (star.ra === '' || star.ra === undefined) {
            return {
                "status": 400,
                "message": "ra of star cannot be empty."
            };
        }

        if (star.dec === '' || star.dec === undefined) {
            return {
                "status": 400,
                "message": "dec of star cannot be empty."
            };
        } 

        let story = "";
        if (star.story !== '' && star.story !== undefined) {
            story = star.story;
        }

        body.star = {
            ra: star.ra,
            dec: star.dec,
            mag: star.mag,
            con: star.con,
            story: new Buffer(story).toString('hex')
        };

        let block = new Block(body);
        await blockchain.addBlock(block);
        const height = await blockchain.getBlockHeight();
        const resp = await blockchain.getBlock(height);

        leveldb.deleteAddressData(address);

        return resp;
    }
}