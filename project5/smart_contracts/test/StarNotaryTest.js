const StarNotary = artifacts.require('StarNotary')

contract('StarNotary', accounts => { 

    beforeEach(async function() { 
        this.contract = await StarNotary.new({from: accounts[0]})
    })
    
    // CreateStar function + tokenIdToStarInfo function test
    describe('can create a star', () => { 
        it('can create a star and all the info is registered', async function () { 
            let tokenId = 1;

            await this.contract.createStar("Star power 103!", "I love my wonderful star", "dec_121.874", "mag_245.978", "ra_032.155", {from: accounts[0]});

            assert.deepEqual(await this.contract.tokenIdToStarInfo(tokenId), ["Star power 103!", "I love my wonderful star", "dec_121.874", "mag_245.978", "ra_032.155"]);
        })
    })

    // checkIfStarExist function test
    describe('can check if star exists or not', () => {
        it('the same star already exists', async function () {
            await this.contract.createStar("Star power 103!", "I love my wonderful star", "dec_121.874", "mag_245.978", "ra_032.155", {from: accounts[0]});

            assert.equal(await this.contract.checkIfStarExist("dec_121.874", "mag_245.978", "ra_032.155"), true);
        })
    })

    // describe('buying and selling stars', () => { 

    //     let user1 = accounts[1]
    //     let user2 = accounts[2]

    //     let starId = 1
    //     let starPrice = web3.toWei(.01, "ether")

    //     beforeEach(async function () {
    //         await this.contract.createStar("Star power 103!", "I love my wonderful star", "dec_121.874", "mag_245.978", "ra_032.155", {from: user1})
    //     })

    //     describe('user1 can sell a star', () => { 
    //         it('user1 can put up their star for sale', async function () { 
    //             await this.contract.putStarUpForSale(starId, starPrice, {from: user1})
            
    //             assert.equal(await this.contract.starsForSale(starId), starPrice)
    //         })

    //         it('user1 gets the funds after selling a star', async function () { 
    //             let starPrice = web3.toWei(.05, 'ether')
                
    //             await this.contract.putStarUpForSale(starId, starPrice, {from: user1})

    //             let balanceOfUser1BeforeTransaction = web3.eth.getBalance(user1)
    //             await this.contract.buyStar(starId, {from: user2, value: starPrice})
    //             let balanceOfUser1AfterTransaction = web3.eth.getBalance(user1)

    //             assert.equal(balanceOfUser1BeforeTransaction.add(starPrice).toNumber(), 
    //                         balanceOfUser1AfterTransaction.toNumber())
    //         })
    //     })

    //     describe('user2 can buy a star that was put up for sale', () => { 
    //         beforeEach(async function () { 
    //             await this.contract.putStarUpForSale(starId, starPrice, {from: user1})
    //         })

    //         it('user2 is the owner of the star after they buy it', async function () { 
    //             await this.contract.buyStar(starId, {from: user2, value: starPrice})

    //             assert.equal(await this.contract.ownerOf(starId), user2)
    //         })

    //         it('user2 correctly has their balance changed', async function () { 
    //             let overpaidAmount = web3.toWei(.05, 'ether')

    //             const balanceOfUser2BeforeTransaction = web3.eth.getBalance(user2)
    //             await this.contract.buyStar(starId, {from: user2, value: overpaidAmount, gasPrice:0})
    //             const balanceAfterUser2BuysStar = web3.eth.getBalance(user2)

    //             assert.equal(balanceOfUser2BeforeTransaction.sub(balanceAfterUser2BuysStar), starPrice)
    //         })
    //     })
    // })

    // putStarUpForSale + buyStar + starsForSale + ownerOf tests all together
    describe('buying and selling stars', () => { 

        let tokenId = 1;
        let user1 = accounts[1];
        let user2 = accounts[2];
        let starPrice = web3.toWei(.01, "ether");

        it('put Star up for sale and check stars for sale', async function() {
            // createStar needs to be tested first
            await this.contract.createStar("Star power 103!", "I love my wonderful star", "dec_121.874", "mag_245.978", "ra_032.155", {from: user1});

            await this.contract.putStarUpForSale(tokenId, starPrice, {from: user1})

            assert.equal(await this.contract.starsForSale(tokenId), starPrice)
        // })

        // it('user2 buys the star and now the owner of the star', async function() {
            await this.contract.buyStar(tokenId, {from: user2, value: starPrice, gasPrice: 0})
            assert.equal(await this.contract.ownerOf(tokenId), user2)
        })
    })

    // mint function test + ownerOf function test
    describe('can mint', () => { 
        let tokenId = 1

        let user = accounts[0]

        beforeEach(async function () { 
            await this.contract.mint(tokenId, {from: user})
            //tx = await this.contract.setApprovalForAll(operator, true, {from: user1})
        })

        it('checking owner of the token', async function () { 
            assert.equal(await this.contract.ownerOf(tokenId, {from: user}), user)
        })
    })

    // approve function test + getApproved function test
    describe('can approve', () => { 
        let tokenId = 1
        let tx 
        var user1 = accounts[1]
        var user2 = accounts[2]

        beforeEach(async function () { 
            await this.contract.mint(tokenId, {from: user1})
            tx = await this.contract.approve(user2, tokenId, {from: user1})
        })

        it('can get approved', async function () { 
            assert.equal(await this.contract.getApproved(tokenId), user2)
        })
    })

    // setApprovalForAll function test + isApprovedForAll function test
    describe('can set approval for all', () => { 
        let tokenId = 1
        var user1 = accounts[1]
        var user2 = accounts[2]
        beforeEach(async function () { 
            await this.contract.mint(tokenId, {from: user1})
            await this.contract.setApprovalForAll(user2, true, {from: user1})
        })

        it('is approved for all works', async function () { 
            assert.equal(await this.contract.isApprovedForAll(user1, user2), true)
        })
    })

    // safeTransferFrom test
    describe('safeTransferFrom test', () => {
        let tokenId = 1;
        let defaultAccount = accounts[0];
        let to = accounts[1];

        beforeEach(async function() {
            await this.contract.createStar("Star power 103!", "I love my wonderful star", "dec_121.874", "mag_245.978", "ra_032.155", {from: defaultAccount})
            await this.contract.safeTransferFrom(defaultAccount, to, tokenId)
        })

        // ownerOf test
        it('is the owner of the token', async function() {
            assert.equal(await this.contract.ownerOf(tokenId, {from: defaultAccount}), to)
        })

        // ownerOf test
        it('is not the owner of the token', async function() {
            assert.notEqual(await this.contract.ownerOf(tokenId, {from: defaultAccount}), defaultAccount)
        })
    })
})