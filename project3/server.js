'use strict';

const Hapi=require('hapi');
const port = 8000
// const Blockchain = require('./simpleChain')
const Blockchain = require('./blockchain')
const Block = require('./block')
const  blockchain = new Blockchain()

// Create a server with a host and port
const server=Hapi.server({
    host: 'localhost',
    port: port
});

// Add the route
server.route([{
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
        const body = request.payload.body;
        if (body === '' || body === undefined) {
            return {
                "status": 400,
                "message": "Body if the request is null or undefined."
            };
        }

        let block = new Block(body);
        console.log(block);

        await blockchain.addBlock(block);
        const height = await blockchain.getBlockHeight();
        const resp = await blockchain.getBlock(height);
        
        return resp;
    }
}]);

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