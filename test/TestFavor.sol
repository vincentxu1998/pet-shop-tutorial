pragma solidity ^0.5.0;

import "truffle/Assert.sol";
import "truffle/DeployedAddresses.sol";
import "../contracts/Favor.sol";

contract TestFavor {
  // The address of the favor contract to be tested
  Favor favor = Favor(DeployedAddresses.Favor());

  // The id of the pet that will be used for testing
  uint expectedPetId = 8;

  // The expected owner of adopted pet is this contract
  uint expectedlike =1;

  // Testing the adopt() function
  function testUserCanLikePet() public {
//    favor.like(expectedPetId);
    uint returnedId = favor.like(expectedPetId);

    Assert.equal(returnedId, expectedPetId, "Favor of the expected pet should match what is returned.");
  }

  // Testing retrieval of a single pet's owner
  function testGetAdopterAddressByPetId() public {
    uint likes = favor.favors(expectedPetId);

    Assert.equal(likes, expectedlike, "The number of likes should be equal to expected likes");
  }

  // Testing retrieval of all pet owners
  function testGetAdopterAddressByPetIdInArray() public {
    // Store adopters in memory rather than contract's storage
    uint[16] memory favors = favor.getFavors();

    Assert.equal(favors[expectedPetId], expectedlike, "Owner of the expected pet should be this contract");
  }

}