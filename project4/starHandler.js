const leveldb = require('./leveldbHandler');

module.exports = {
    async requestValidationHandler(address) {

        console.log("requestValidationHandler is called");
        console.log("address: " + address);

        let addressData;
        try {
            addressData = await leveldb.getAddressDataFromLevelDB(address);
            console.log("addressData found" + addressData);
        } catch (error) {
            console.log("data not found");
            addressData == null;
        }

        console.log("addressData: " + addressData);

        let data = null;

        // The address data is new
        if (addressData == null) {
            const timestamp = Date.now();
            const message = `${address}:${timestamp}:starRegistry`;
            const validationWindow = 300;
    
            data = {
                address: address,
                message: message,
                requestTimeStamp: timestamp,
                validationWindow: validationWindow
            };
    
            await leveldb.addAddressDataToLevelDB(data.address, JSON.stringify(data));
            console.log("data addeed");
        }

        // The address data already registered but not validated.
        else {
            console.log("address is temporalily registered.")
        
            let value = JSON.parse(addressData)
        
            console.log(value)
        
            const nowSubFiveMinutes = Date.now() - (5 * 60 * 1000)
            const isExpired = value.requestTimeStamp < nowSubFiveMinutes
        
            if (isExpired) {
                console.log("The time has expired.")
                const timestamp = Date.now();
                const message = `${address}:${timestamp}:starRegistry`;
                const validationWindow = 300;
        
                data = {
                    address: address,
                    message: message,
                    requestTimeStamp: timestamp,
                    validationWindow: validationWindow
                };

                await leveldb.addAddressDataToLevelDB(data.address, JSON.stringify(data));
                console.log("data addeed");
            } else {
                data = {
                    address: address,
                    message: value.message,
                    requestTimeStamp: value.requestTimeStamp,
                    validationWindow: Math.floor((value.requestTimeStamp - nowSubFiveMinutes) / 1000)
                }
        
            }
        }

        console.log("data: " + data);

        return data
    }
}