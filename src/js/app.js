App = {
    web3Provider: null,
    contracts: {},

    init: async function () {
        // Load pets.
        $.getJSON('../pets.json', function (data) {
            var petsRow = $('#petsRow');
            var petTemplate = $('#petTemplate');

            for (i = 0; i < data.length; i++) {
                petTemplate.find('.panel-title').text(data[i].name);
                petTemplate.find('img').attr('src', data[i].picture);
                petTemplate.find('.pet-breed').text(data[i].breed);
                petTemplate.find('.pet-age').text(data[i].age);
                petTemplate.find('.pet-location').text(data[i].location);
                petTemplate.find('.btn-adopt').attr('data-id', data[i].id);
                petTemplate.find('.pet-price').text("$" + data[i].price);
                petsRow.append(petTemplate.html());
            }
        });

        return await App.initWeb3();
    },

    initWeb3: async function () {
        // Modern dapp browsers...
        if (window.ethereum) {
            App.web3Provider = window.ethereum;
            try {
                // Request account access
                await window.ethereum.request({method: "eth_requestAccounts"});
                ;
            } catch (error) {
                // User denied account access...
                console.error("User denied account access")
            }
        }
        // Legacy dapp browsers...
        else if (window.web3) {
            App.web3Provider = window.web3.currentProvider;
        }
        // If no injected web3 instance is detected, fall back to Ganache
        else {
            App.web3Provider = new Web3.providers.HttpProvider('http://localhost:7545');
        }
        web3 = new Web3(App.web3Provider);

        return App.initContract();
    },

    initContract: function () {
        $.getJSON('Adoption.json', function (data) {
            // Get the necessary contract artifact file and instantiate it with @truffle/contract
            var AdoptionArtifact = data;
            App.contracts.Adoption = TruffleContract(AdoptionArtifact);

            // Set the provider for our contract
            App.contracts.Adoption.setProvider(App.web3Provider);

            // Use our contract to retrieve and mark the adopted pets
            return App.markAdopted();
        });

        return App.bindEvents();
    },

    bindEvents: function () {
        $(document).on('click', '.btn-adopt', App.handleAdopt);

        let button = document.querySelector(".like-button");

        button.addEventListener("click", function(e) {
          e.preventDefault();
          this.classList.toggle("active");
          this.classList.add("animated");
          generateClones(this);

        });

        $(document).on('click', '.like-button', App.handleLike);


        function generateClones(button) {
          let clones = randomInt(2, 4);
          for (let it = 1; it <= clones; it++) {
            let clone = button.querySelector("svg").cloneNode(true),
              size = randomInt(5, 16);
            button.appendChild(clone);
            clone.setAttribute("width", size);
            clone.setAttribute("height", size);
            clone.style.position = "absolute";
            clone.style.transition =
              "transform 0.5s cubic-bezier(0.12, 0.74, 0.58, 0.99) 0.3s, opacity 1s ease-out .5s";
            let animTimeout = setTimeout(function() {
              clearTimeout(animTimeout);
              clone.style.transform =
                "translate3d(" +
                (plusOrMinus() * randomInt(10, 25)) +
                "px," +
                (plusOrMinus() * randomInt(10, 25)) +
                "px,0)";
              clone.style.opacity = 0;
            }, 1);
            let removeNodeTimeout = setTimeout(function() {
              clone.parentNode.removeChild(clone);
              clearTimeout(removeNodeTimeout);
            }, 900);
            let removeClassTimeout = setTimeout( function() {
              button.classList.remove("animated")
            }, 600);
          }
        }


        function plusOrMinus() {
          return Math.random() < 0.5 ? -1 : 1;
        }

        function randomInt(min, max) {
          return Math.floor(Math.random() * (max - min + 1) + min);
        }
    },

    markLiked: function(){
        var likeInstance;

        App.contracts.Favor.deployed().then(function (instance) {
            likeInstance = instance;

            return likeInstance.getFavors.call();
        }).then(function (favors) {
        // array integer
            for (i = 0; i < favors.length; i++) {
//                if (favors[i] !== '0x0000000000000000000000000000000000000000') {

                 $('.panel-pet').eq(i).find('like-text').text(favors[i].toString());
//                }
            }
        }).catch(function (err) {
            console.log(err.message);
        });

    },

    markAdopted: function () {
        var adoptionInstance;

        App.contracts.Adoption.deployed().then(function (instance) {
            adoptionInstance = instance;

            return adoptionInstance.getAdopters.call();
        }).then(function (adopters) {
            for (i = 0; i < adopters.length; i++) {
                if (adopters[i] !== '0x0000000000000000000000000000000000000000') {
                    $('.panel-pet').eq(i).find('button').text('Success').attr('disabled', true);
                }
            }
        }).catch(function (err) {
            console.log(err.message);
        });
    },

    handleLike: function(event){
        event.preventDefault();
        console.log("handle");

        var petId = parseInt($(event.target).data('id'));

        var favorInstance;

        web3.eth.getAccounts(function (error, accounts) {
            if (error) {
                console.log(error);
            }
            console.log(accounts);
            var account = accounts[0];
            console.log(account);

            App.contracts.Favor.deployed().then(function (instance) {
                favorInstance = instance;

                // Execute adopt as a transaction by sending account
                return favorInstance.like(petId, {from: account});
            }).then(function (result) {
                return App.markLiked();
            }).catch(function (err) {
                console.log(err.message);
            });
        });
    },

    handleAdopt: function (event) {
        event.preventDefault();

        var petId = parseInt($(event.target).data('id'));

        var adoptionInstance;

        web3.eth.getAccounts(function (error, accounts) {
            if (error) {
                console.log(error);
            }

            var account = accounts[0];

            App.contracts.Adoption.deployed().then(function (instance) {
                console.log(instance);
                adoptionInstance = instance;

                // Execute adopt as a transaction by sending account
                console.log(account);
                return adoptionInstance.adopt(petId, {from: account});
            }).then(function (result) {
                return App.markAdopted();
            }).catch(function (err) {
                console.log(err.message);
            });
        });
    }

};

$(function () {
    $(window).load(function () {
        App.init();
    });
});
