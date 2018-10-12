const leveldb = require('./leveldbHandler');

module.exports = {
    async requestValidationHandler(address) {
        const resp = null;
        try {
            resp = await leveldb.getAddressDataFromLevelDB(address);
        } catch (error) {
        }

        console.log(resp)

        console.log("requestValidationHandler is called");

        const timestamp = Date.now()
        const message = `${address}:${timestamp}:starRegistry`
        const validationWindow = 300

        const data = {
            address: address,
            message: message,
            requestTimeStamp: timestamp,
            validationWindow: validationWindow
        }

        db.put(data.address, JSON.stringify(data))

        return data
    }
}