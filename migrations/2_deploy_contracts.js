var Adoption = artifacts.require("Adoption");
var Favor = artifacts.require("Favor");

module.exports = function(deployer) {
  deployer.deploy(Adoption);
};

module.exports = function(deployer) {
  deployer.deploy(Favor);
};
