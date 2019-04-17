'use strict';

const Hapi = require('hapi');
const PORT = 8545;

// Create a server with a host and port
const server = Hapi.server({
    host: 'localhost',
    port: PORT
});

// Add the route
const start = async () => {

    await server.register(require('inert'));

    server.route({
        method: 'GET',
        path: '/',
        handler: function (request, h) {

            return h.file('index.html');
        }
    });

    await server.start();

    console.log('Server running at:', server.info.uri);
};

start();