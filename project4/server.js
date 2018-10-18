'use strict';

const Hapi = require('hapi');
const PORT = 8000;
const Blockchain = require('./blockchain');
// const Block = require('./block');
const blockchain = new Blockchain();
const starHandler = require('./starHandler');
// const leveldb = require('./leveldbHandler');

// Create a server with a host and port
const server = Hapi.server({
    host: 'localhost',
    port: PORT
});

// Add the route
server.route([{
    method: ['GET', 'POST'],
    path: '/',
    handler: (request, h) => {
        return "Hello World!";
    }
},
{
    method:'GET',
    path:'/block/{height}',
    handler: async (request, h) => {
        try {
            const resp = await blockchain.getBlock(request.params.height);
            return resp;  
        } catch (error) {
            return {
                "status": 404,
                "message": "No block was found."
            };
        }
    }
},
{
    method:'GET',
    path:'/stars/address:{address}',
    handler: async (request, h) => {
        try {
            console.log(request.params.address);
            
            const resp = await blockchain.getBlocksByAddress(request.params.address);
            return resp;  
        } catch (error) {
            return {
                "status": 404,
                "message": "No block was found."
            };
        }
    }
},
{
    method:'GET',
    path:'/stars/hash:{hash}',
    handler: async (request, h) => {
        try {
            console.log(request.params.hash);
            
            const resp = await blockchain.getBlockByHash(request.params.hash);

            if (resp == null) {
                return {
                    "status": 404,
                    "message": "No block was found."
                };
            }
            return resp;  
        } catch (error) {
            return {
                "status": 404,
                "message": "No block was found."
            };
        }
    }
},
{
    method:'POST',
    path:'/block',
    handler: async (request,h) => {

        if (request.payload === null) {
            return {
                "status": 400,
                "message": "The body of Post message cannot be empty."
            };
        }

        if (request.payload.address === '' || request.payload.address === undefined) {
            return {
                "status": 400,
                "message": "Address cannot be empty."
            };
        }

        if (request.payload.star === '' || request.payload.star === undefined) {
            return {
                "status": 400,
                "message": "Contents of star cannot be empty."
            };
        }

        let address = request.payload.address;
        let star = request.payload.star;
        let resp = await starHandler.registerBlock(address, star);

        return resp;
    }
},
{
    method:'POST',
    path:'/requestValidation',
    handler: async (request,h) => {

        console.log("\n Message recieved for request validation.");
        console.log(request.payload);
        let address = request.payload.address;
        
        if (address === '' || address === undefined) {
            return {
                "status": 400,
                "message": "Address is empty."
            };
        }

        let resp = await starHandler.requestValidationHandler(address);
        
        return resp;
    }
},
{
    method:'POST',
    path:'/message-signature/validate',
    handler: async (request,h) => {

        console.log("\n Message recieved for signature validation.");
        console.log(request.payload);
        let address = request.payload.address;
        let signature = request.payload.signature;
        
        if (address === '' || address === undefined) {
            return {
                "status": 400,
                "message": "Address is empty."
            };
        }

        if (signature === '' || signature === undefined) {
            return {
                "status": 400,
                "message": "Signature is empty."
            };
        }

        let resp = await starHandler.messageSignatureValidator(address, signature);

        if (resp == null) {
            return {
                "status": 400,
                "message": "Message signature validation failed."
            };
        }
        
        return resp;
    }
}]);

function IsJsonString(json) {
    var str = json.toString();
     
    try {
        JSON.parse(str);
    } catch (e) {
        return false;
    }
    
    return true;
}

// Start the server
async function start() {

    try {
        await server.start();
    }
    catch (err) {
        console.log(err);
        process.exit(1);
    }

    console.log('Server running at:', server.info.uri);
};

start();