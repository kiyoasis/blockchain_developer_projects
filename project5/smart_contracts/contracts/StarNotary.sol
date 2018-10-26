pragma solidity ^0.4.23;

import './ERC721Token.sol';

contract StarNotary is ERC721Token { 

    struct Star { 
        string name;
        string story;
        Coordinates coordinates;
    }

    struct Coordinates {
        string dec;
        string mag;
        string ra;
    }

    uint public tokenId = 1;
    mapping(uint256 => Star) public tokenIdToStarInfo;
    mapping(uint256 => uint256) public starsForSale;

    function createStar(string _name, string _story, string _dec, string _mag, string _ra) public { 

        require(tokenId != 0);
        //require(bytes(_name).length != 0);
        
        //require(!checkIfStarExist(_dec, _mag, _ra));

        Coordinates memory coord = Coordinates(_dec, _mag, _ra);

        Star memory newStar = Star(_name, _story, coord);

        tokenIdToStarInfo[tokenId] = newStar;

        mint(tokenId);

        tokenId ++;
    }

    function putStarUpForSale(uint256 _tokenId, uint256 _price) public { 
        require(this.ownerOf(tokenId) == msg.sender);

        starsForSale[_tokenId] = _price;
    }

    function buyStar(uint256 _tokenId) public payable { 
        require(starsForSale[_tokenId] > 0);

        uint256 starCost = starsForSale[_tokenId];
        address starOwner = this.ownerOf(_tokenId);

        require(msg.value >= starCost);

        clearPreviousStarState(_tokenId);

        transferFromHelper(starOwner, msg.sender, _tokenId);

        if(msg.value > starCost) { 
            msg.sender.transfer(msg.value - starCost);
        }

        starOwner.transfer(starCost);
    }

    function checkIfStarExist() public {

    }

    // function generateStarHash(string ra, string dec, string mag) private pure returns(bytes32) {
    //     return keccak256(abi.encodePacked(ra, dec, mag));
    // }

    function tokenIdToStarInfo(uint tokenId) public view returns(string starName, string starStory, string starDec, 
        string starMag, string starRa) {
        return (tokenIdToStarInfo[tokenId].name, tokenIdToStarInfo[tokenId].story, tokenIdToStarInfo[tokenId].coordinates
            .dec, tokenIdToStarInfo[tokenId].coordinates.mag, tokenIdToStarInfo[tokenId].coordinates.ra);
    }

    function clearPreviousStarState(uint256 _tokenId) private {
        //clear approvals 
        tokenToApproved[_tokenId] = address(0);
        //clear being on sale 
        starsForSale[_tokenId] = 0;
    }
}