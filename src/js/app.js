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
                petTemplate.find('.img-center').attr('src', data[i].picture);
                petTemplate.find('.pet-breed').text(data[i].breed);
                petTemplate.find('.pet-age').text(data[i].age);
                petTemplate.find('.pet-location').text(data[i].location);
                petTemplate.find('.news-authenticity').attr('data-id', data[i].id);
                petTemplate.find('.btn-adopt').attr('data-id', data[i].id);
                petTemplate.find('.btn-revert').attr('data-id', data[i].id);
                petTemplate.find('.like-text').attr('data-id', data[i].id);
                petTemplate.find('.dislike-text').attr('data-id', data[i].id);
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
            App.getRevert();
            return App.markAdopted();
        });

        $.getJSON('Favor.json', function (data) {
            // Get the necessary contract artifact file and instantiate it with @truffle/contract
            var FavorArtifact = data;
            App.contracts.Favor = TruffleContract(FavorArtifact);

            // Set the provider for our contract
            App.contracts.Favor.setProvider(App.web3Provider);

            // Use our contract to retrieve and mark the adopted pets
            App.markLiked();
            console.log("call mark real 1");
            App.markReal();
            return App.markDisliked();
        });

        return App.bindEvents();
    },

    bindEvents: function () {
        $(document).on('click', '.btn-adopt', App.handleAdopt);
        $(document).on('click', '.like-button', App.handleLike);
        $(document).on('click', '.dislike-button', App.handleDislike);
        $(document).on('click', '.btn-revert', App.handleRevert);
    },

     markLiked: function () {
        var likeInstance;

        App.contracts.Favor.deployed().then(function (instance) {
            likeInstance = instance;

            return likeInstance.getFavors.call();
        }).then(function (favors) {
            for (i = 0; i < favors.length; i++) {
                let parent = $('.panel-pet').eq(i)[0];
                parent.querySelector('.like-text').textContent = favors[i].toString();
            }
        }).catch(function (err) {
            console.log(err.message);
        });
    },

    markDisliked: function () {
        var favorInstance;

        App.contracts.Favor.deployed().then(function (instance) {
            favorInstance = instance;

            return favorInstance.getDisfavors.call();
        }).then(function (disfavors) {
            console.log(disfavors);
            for (i = 0; i < disfavors.length; i++) {
                let parent = $('.panel-pet').eq(i)[0];
                parent.querySelector('.dislike-text').textContent = disfavors[i].toString();
            }
        }).catch(function (err) {
            console.log(err.message);
        });
    },

    markReal: function () {
        var favorInstance;


        App.contracts.Favor.deployed().then(function (instance) {
            favorInstance = instance;
            console.log("RealORFake");
            return favorInstance.getRealOrFake.call();
        }).then(function (real_fake) {

            console.log(real_fake);
            for (i = 0; i < real_fake.length; i++) {
                let parent = $('.panel-pet').eq(i)[0];
                if (real_fake[i] == true){
                    parent.querySelector('.news-authenticity').textContent = 'Real';
                    parent.querySelector('.top').src = "images/true.png";
                }else{
                    parent.querySelector('.news-authenticity').textContent = 'Fake';
                    parent.querySelector('.top').src = "images/fake.png";
                }
            }
        }).catch(function (err) {
            console.log(err.message);
        });
    },

    markRevert:function(){

        var adoptionInstance;

        App.contracts.Adoption.deployed().then(function (instance) {
            adoptionInstance = instance;

            return adoptionInstance.getAdopters.call();
        }).then(function (adopters) {
            console.log(adopters);
            for (i = 0; i < adopters.length; i++) {
                if (adopters[i] == '0x0000000000000000000000000000000000000000') {
                    let parent = $('.panel-pet').eq(i)[0];
                    parent.querySelector('.btn-revert').setAttribute('disabled', true);
                    parent.querySelector('.btn-adopt').removeAttribute('disabled');
                    parent.querySelector('.btn-adopt').textContent = "Own";
                }
            }
        }).catch(function (err) {
            console.log(err.message);
        });
    },

    getRevert: function(){

        web3.eth.getAccounts(function (error, accounts) {
            if (error) {
                console.log(error);
            }

            account = accounts[0];
            console.log("revert");
            console.log(account);

            var adoptionInstance;
            var account;


            App.contracts.Adoption.deployed().then(function (instance) {
                adoptionInstance = instance;
                // Execute adopt as a transaction by sending account

               return adoptionInstance.getAdopters.call();
            }).then(function (adopters) {
                // check whether the account has adopted any pets
                for (i = 0; i < adopters.length; i++) {
                    if (adopters[i] == account) {
                        let parent = $('.panel-pet').eq(i)[0];
                        console.log(parent.querySelector('.btn-revert'));
//                        parent.querySelector('.btn-revert').setAttribute('editable', true);
                        parent.querySelector('.btn-revert').removeAttribute('disabled');
                        parent.querySelector('.btn-adopt').textContent = "Own";
                        parent.querySelector('.btn-adopt').setAttribute('disabled', true);
                    }
                    else{
                        let parent = $('.panel-pet').eq(i)[0];
                        parent.querySelector('.btn-revert').setAttribute('disabled', true);
                        parent.querySelector('.btn-adopt').removeAttribute('disabled');
                        parent.querySelector('.btn-adopt').textContent = "Own";
//                        parent.querySelector('.btn-revert').setAttribute('editable', false);
                    }
                }
            }).catch(function (err) {
                console.log(err.message);
            });
        });
    },

    markAdopted: function () {
        var adoptionInstance;

        App.contracts.Adoption.deployed().then(function (instance) {
            adoptionInstance = instance;

            return adoptionInstance.getAdopters.call();
        }).then(function (adopters) {
            console.log(adopters);
            for (i = 0; i < adopters.length; i++) {
                if (adopters[i] !== '0x0000000000000000000000000000000000000000') {
                    console.log("mark adopt");
                    console.log(i);
                    let parent = $('.panel-pet').eq(i)[0];
                    parent.querySelector('.btn-adopt').setAttribute('disabled', true);
                    parent.querySelector('.btn-adopt').textContent = "Success";
                    parent.querySelector('.btn-revert').removeAttribute('disabled');
//                    $('.panel-pet').eq(i).find('button').text('Success').attr('disabled', true);
                }

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
            console.log(adopters);
            for (i = 0; i < adopters.length; i++) {
                if (adopters[i] !== '0x0000000000000000000000000000000000000000') {
                    console.log("mark adopt");
                    console.log(i);
                    let parent = $('.panel-pet').eq(i)[0];
                    parent.querySelector('.btn-adopt').setAttribute('disabled', true);
                    parent.querySelector('.btn-adopt').textContent = "Success";
                    parent.querySelector('.btn-revert').removeAttribute('disabled');
//                    $('.panel-pet').eq(i).find('button').text('Success').attr('disabled', true);
                }

            }
        }).catch(function (err) {
            console.log(err.message);
        });
    },

    handleRevert: function(event){
        event.preventDefault();

        var petId = parseInt($(event.target).data('id'));

        var revertInstance;

        web3.eth.getAccounts(function (error, accounts) {
            if (error) {
                console.log(error);
            }

            var account = accounts[0];

            App.contracts.Adoption.deployed().then(function (instance) {
                console.log(instance);
                revertInstance = instance;

                // Execute adopt as a transaction by sending account
                return revertInstance.revert(petId, {from: account});
//                  return adoptionInstance.adopt(petId, {from: account});
            }).then(function (result) {
                return App.markRevert();
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
                App.markReal();
                return App.markAdopted();
            }).catch(function (err) {
                console.log(err.message);
            });
        });
    },

    handleLike: function(event){
        event.preventDefault();
        console.log(event.target.parentElement.parentElement.parentElement);
        var petId = parseInt($(event.target.parentElement.parentElement.parentElement.querySelector('.like-text')).data('id'));

        console.log("Like")
        console.log(petId)
        var favorInstance;

        web3.eth.getAccounts(function (error, accounts) {
            if (error) {
                console.log(error);
            }
            var account = accounts[0];
            App.contracts.Favor.deployed().then(function (instance) {
                favorInstance = instance;

                // Execute adopt as a transaction by sending account
                console.log(petId);
                console.log(account);
                return favorInstance.like(petId, {from: account});
//                return 0;
            }).then(function (result) {
                App.markReal();
                return App.markLiked();
            }).catch(function (err) {
                console.log(err.message);
            });
        });
    },

    handleDislike: function(event){
        event.preventDefault();
        var petId = parseInt($(event.target.parentElement.parentElement.parentElement.querySelector('.dislike-text')).data('id'));
        console.log(petId);

        var favorInstance;

        web3.eth.getAccounts(function (error, accounts) {
            if (error) {
                console.log(error);
            }
            var account = accounts[0];
            App.contracts.Favor.deployed().then(function (instance) {
                favorInstance = instance;

                // Execute adopt as a transaction by sending account
                console.log(petId);
                console.log(account);
                return favorInstance.dislike(petId, {from: account});
//                return 0;
            }).then(function (result) {
                App.markReal();
                return App.markDisliked();
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
