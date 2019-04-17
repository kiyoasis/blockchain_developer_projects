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
    describe('check if the star created exists or not', () => {
        it('the same star already exists', async function () {
            await this.contract.createStar("Star power 103!", "I love my wonderful star", "dec_121.874", "mag_245.978", "ra_032.155", {from: accounts[0]});
            assert.equal(await this.contract.checkIfStarExist("dec_121.874", "mag_245.978", "ra_032.155"), true);
        })
    })

    // putStarUpForSale + starsForSale function tests
    describe('selling stars', () => { 

        let tokenId = 1;
        let user = accounts[1];
        let starPrice = web3.toWei(.01, "ether");

        it('putting star up for sale and check the star price', async function() {
            // createStar needs to be tested first
            await this.contract.createStar("Star power 103!", "I love my wonderful star", "dec_121.874", "mag_245.978", "ra_032.155", {from: user});
            await this.contract.putStarUpForSale(tokenId, starPrice, {from: user});
            assert.equal(await this.contract.starsForSale(tokenId), starPrice);
         })
    })

    // putStarUpForSale + buyStar + ownerOf tests all together
    describe('buying stars', () => { 

        let tokenId = 1;
        let user1 = accounts[1];
        let user2 = accounts[2];
        let starPrice = web3.toWei(.01, "ether");

        it('user2 buys the star from user1 and check the owner of the star', async function() {
            // createStar needs to be tested first
            await this.contract.createStar("Star power 103!", "I love my wonderful star", "dec_121.874", "mag_245.978", "ra_032.155", {from: user1});
            await this.contract.putStarUpForSale(tokenId, starPrice, {from: user1});
            await this.contract.buyStar(tokenId, {from: user2, value: starPrice, gasPrice: 0});
            assert.equal(await this.contract.ownerOf(tokenId), user2);
        })
    })

    // mint function test + ownerOf function test
    describe('can mint or not', () => { 

        let tokenId = 1;
        let user = accounts[0];

        beforeEach(async function () { 
            await this.contract.mint(tokenId, {from: user});
        })

        it('checking owner of the token', async function () { 
            assert.equal(await this.contract.ownerOf(tokenId, {from: user}), user);
        })
    })

    // approve function test + getApproved function test
    describe('can approve', () => { 
        let tokenId = 1;
        var user1 = accounts[1];
        var user2 = accounts[2];

        beforeEach(async function () { 
            await this.contract.mint(tokenId, {from: user1});
            await this.contract.approve(user2, tokenId, {from: user1});
        })

        it('can get approved', async function () { 
            assert.equal(await this.contract.getApproved(tokenId), user2);
        })
    })

    // setApprovalForAll function test + isApprovedForAll function test
    describe('can set approval for all', () => { 

        let tokenId = 1;
        var user1 = accounts[1];
        var user2 = accounts[2];
        
        beforeEach(async function () { 
            await this.contract.mint(tokenId, {from: user1});
            await this.contract.setApprovalForAll(user2, true, {from: user1});
        })

        it('is approved for all', async function () { 
            assert.equal(await this.contract.isApprovedForAll(user1, user2), true);
        })
    })

    // safeTransferFrom function test
    describe('safely transferring a star fron user1 to user2', () => {
        let tokenId = 1;
        let user1 = accounts[0];
        let user2 = accounts[1];

        beforeEach(async function() {
            await this.contract.createStar("Star power 103!", "I love my wonderful star", "dec_121.874", "mag_245.978", "ra_032.155", {from: user1});
            await this.contract.safeTransferFrom(user1, user2, tokenId);
        })

        // owner of the star needs to beleong to user2
        it('is the owner of the token', async function() {
            assert.equal(await this.contract.ownerOf(tokenId, {from: user1}), user2);
        })

        // owner of the star should not belong to user1
        it('is not the owner of the token', async function() {
            assert.notEqual(await this.contract.ownerOf(tokenId, {from: user1}), user1);
        })
    })
})