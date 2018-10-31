var MyNotary = artifacts.require(“MyNotary”);
module.exports = function(deployer, network, accounts) {
 deployer.deploy(MyNotary,{from: accounts[0]});
};