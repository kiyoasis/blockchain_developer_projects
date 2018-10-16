'use strict';

const Hapi = require('hapi');
const PORT = 8000;
const Blockchain = require('./blockchain');
const Block = require('./block');
const blockchain = new Blockchain();
const starHandler = require('./starHandler');

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
},{
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
    method:'POST',
    path:'/block',
    handler: async (request,h) => {
        let body = request.payload.body;

        if (body === '' || body === undefined) {

            if (IsJsonString(request.payload)) {
                var jsonObject = JSON.parse(request.payload);
                console.log(jsonObject);
                body = jsonObject.body;

                if (body === '' || body === undefined) {
                    return {
                        "status": 400,
                        "message": "Block body cannot be empty."
                    };
                }

            } else {
                return {
                    "status": 400,
                    "message": "Block body cannot be empty."
                };
            }
        }

        let block = new Block(body);
        console.log(block);

        await blockchain.addBlock(block);
        const height = await blockchain.getBlockHeight();
        const resp = await blockchain.getBlock(height);
        
        return resp;
    }
},{
    method:'POST',
    path:'/requestValidation',
    handler: async (request,h) => {

        let address = request.payload.address;

        console.log(request.payload);
        
        if (address === '' || address === undefined) {
            return {
                "status": 400,
                "message": "Address is empty."
            };
        }

        let resp = await starHandler.requestValidationHandler(address);
        
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