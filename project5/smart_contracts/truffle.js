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

var mnemonic = 'flip affair sentence host suggest old clutch crucial jungle cube deal symbol';
var endpoint = 'https://rinkeby.infura.io/v3/a3b7da9fe90e4a938e6120bdc03792d8'

module.exports = {
  // See <http://truffleframework.com/docs/advanced/configuration>
  // to customize your Truffle configuration!
  networks: {
      development: {
          host: '127.0.0.1',
          port: 8545,
          network_id: "*"
      },
      rinkeby: {
          provider: () => new HDWalletProvider(mnemonic, endpoint),
          network_id: 4,
          gas: 4500000, // 6700000,
          gasPrice: 10000000000
      },
  }
};