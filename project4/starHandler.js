const leveldb = require('./leveldbHandler');
//const bitcoin = require('bitcoinjs-lib');
const bitcoinMessage = require('bitcoinjs-message');
const Block = require('./block');
const Blockchain = require('./blockchain');
const blockchain = new Blockchain();

module.exports = {
    async requestValidationHandler(address) {

        console.log("requestValidationHandler is called");
        console.log("address: " + address);

        let addressData;
        try {
            addressData = await leveldb.getAddressDataFromLevelDB(address);
            console.log("addressData found: \n" + addressData);
        } catch (error) {
            console.log("data not found in the leveldb.");
            addressData == null;
        }

        let data = null;

        // The address data is new
        if (addressData == null) {
            const timestamp = Date.now();
            const message = `${address}:${timestamp}:starRegistry`;
            const validationWindow = 300;
    
            data = {
                address: address,
                requestTimeStamp: timestamp,
                message: message,
                validationWindow: validationWindow
            };
    
            await leveldb.addAddressDataToLevelDB(data.address, JSON.stringify(data));
            console.log("data has been addeed!");
        }

        // The address data already registered but not validated.
        else {
            console.log("address data is temporalily registered.")
        
            let value = JSON.parse(addressData)
        
            console.log(value)
        
            const nowSubFiveMinutes = Date.now() - (5 * 60 * 1000)
            const isExpired = value.requestTimeStamp < nowSubFiveMinutes
        
            if (isExpired) {
                console.log("The time has expired and rerefister data again.")
                const timestamp = Date.now();
                const message = `${address}:${timestamp}:starRegistry`;
                const validationWindow = 300;
        
                data = {
                    address: address,
                    requestTimeStamp: timestamp,
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
                    validationWindow: Math.floor((value.requestTimeStamp - nowSubFiveMinutes) / 1000)
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
            const nowSubFiveMinutes = Date.now() - (5 * 60 * 1000);
            const isExpired = value.requestTimeStamp < nowSubFiveMinutes
            let isValid = false
        
            if (isExpired) {
                value.validationWindow = 0
                value.messageSignature = 'Validation window was expired'
            } else {
                value.validationWindow = Math.floor((value.requestTimeStamp - nowSubFiveMinutes) / 1000);
        
                try {
                    isValid = bitcoinMessage.verify(value.message, address, signature);
                } catch (error) {
                    isValid = false;
                }
        
                value.messageSignature = isValid ? 'valid' : 'invalid'
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
        
        // If the address data is valid
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

        console.log("star.story: " + star.story);
        
        let story = "";
        if (star.story !== '' && star.story !== undefined) {
            story = star.story;
        }
        console.log("story: " + story);
        body.star = {
            ra: star.ra,
            dec: star.dec,
            mag: star.mag,
            con: star.con,
            story: new Buffer(story).toString('hex')
        }

        let block = new Block(body);
        console.log(block);

        await blockchain.addBlock(block);
        const height = await blockchain.getBlockHeight();
        const resp = await blockchain.getBlock(height);

        return resp;
    }
}