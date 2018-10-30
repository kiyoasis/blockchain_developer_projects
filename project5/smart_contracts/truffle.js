/*
 * NB: since truffle-hdwallet-provider 0.0.5 you must wrap HDWallet providers in a 
 * function when declaring them. Failure to do so will cause commands to hang. ex:
 * ```
 * mainnet: {
 *     provider: function() { 
 *       return new HDWalletProvider(mnemonic, 'https://mainnet.infura.io/<infura-key>') 
 *     },
 *     network_id: '1',
 *     gas: 4500000,
 *     gasPrice: 10000000000,
 *   },
 */
var HDWalletProvider = require('truffle-hdwallet-provider');
var mnemonic = 'various trick blood crime shoe erupt wedding lawn property belt arrow avoid';
var endpoint = 'https://rinkeby.infura.io/v3/a6c9127469b44b6aa399a3a023657125'

module.exports = {
    networks: { 
        development: {
            host: '127.0.0.1',
            port: 8545,
            network_id: "*"
        }, 
        rinkeby: {
            provider: function() { 
                return new HDWalletProvider(mnemonic, endpoint) 
            },
            network_id: 4,
            gas: 4500000,
            gasPrice: 10000000000,
        },
        solc: {
            optimizer: {
                enabled: true,
                runs: 200
            }
        }
    }
};