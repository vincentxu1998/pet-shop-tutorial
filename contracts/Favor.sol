pragma solidity ^0.5.0;

contract Favor {
  uint[16] public favors;

  // Adopting a pet
  function like(uint petId) public returns (uint) {
    require(petId >= 0 && petId <= 15);

    favors[petId] += 1;
    return petId;
  }

  // Retrieving the adopters
  function getFavors() public view returns (uint[16] memory) {
    return favors;
  }

}