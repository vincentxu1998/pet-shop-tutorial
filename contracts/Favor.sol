pragma solidity ^0.5.0;

contract Favor {
  uint[16] public favors;

  uint[16] public disfavors;

  bool[16] public real_fake;

  function assert_real_or_fake(uint petId) public returns(uint){
    if (favors[petId] > disfavors[petId]){
      real_fake[petId] = true;
    }else{
      real_fake[petId] = false;
    }
    return petId;
  }

  // Adopting a pet
  function like(uint petId) public returns (uint) {
    require(petId >= 0 && petId <= 15);

    favors[petId] += 1;
    assert_real_or_fake(petId);
    return petId;
  }

  function dislike(uint petId) public returns (uint) {
    require(petId >= 0 && petId <= 15);

    disfavors[petId] += 1;
    assert_real_or_fake(petId);
    return petId;
  }


  // Retrieving the adopters
  function getFavors() public view returns (uint[16] memory) {
    return favors;
  }

  function getDisfavors() public view returns (uint[16] memory) {
    return disfavors;
  }

  function getRealOrFake() public view returns (bool[16] memory) {
    return real_fake;
  }

}