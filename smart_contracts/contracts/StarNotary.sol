pragma solidity ^0.4.24;

//import "./ERC721Token.sol";
import "../node_modules/openzeppelin-solidity/contracts/token/ERC721/ERC721.sol";
//import "github.com/OpenZeppelin/zeppelin-solidity/contracts/token/ERC721/ERC721.sol";

contract StarNotary is ERC721 { 

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

        bytes memory tempName = bytes(_name);
        bytes memory tempStory = bytes(_story);
        bytes memory tempDec = bytes(_dec);
        bytes memory tempMag = bytes(_mag);
        bytes memory tempRa = bytes(_ra);

        require(tempName.length != 0);
        require(tempStory.length != 0);
        require(tempDec.length != 0);
        require(tempMag.length != 0);
        require(tempRa.length != 0);

        require(!checkIfStarExist(_dec, _mag, _ra));

        Coordinates memory coord = Coordinates(_dec, _mag, _ra);

        Star memory newStar = Star(_name, _story, coord);

        tokenIdToStarInfo[tokenId] = newStar;

        _mint(msg.sender, tokenId);

        tokenId ++;
    }

    function mint(uint256 _tokenId) public {
        super._mint(msg.sender, _tokenId);
    }

    function putStarUpForSale(uint256 _tokenId, uint256 _price) public { 
        require(this.ownerOf(_tokenId) == msg.sender);

        starsForSale[_tokenId] = _price;
    }

    function buyStar(uint256 _tokenId) public payable { 
        require(starsForSale[_tokenId] > 0);

        uint256 starCost = starsForSale[_tokenId];
        address starOwner = this.ownerOf(_tokenId);

        require(msg.value >= starCost);

        //clearPreviousStarState(starOwner, _tokenId);
        _removeTokenFrom(starOwner, _tokenId);

        //transferFromHelper(starOwner, msg.sender, _tokenId);
        _addTokenTo(msg.sender, _tokenId);

        if(msg.value > starCost) { 
            msg.sender.transfer(msg.value - starCost);
        }

        starOwner.transfer(starCost);
    }

    function checkIfStarExist(string _dec, string _mag, string _ra) public view returns (bool flag) {
        
        for (uint i = 1; i < tokenId; i++) {
            if (keccak256(abi.encodePacked(tokenIdToStarInfo[i].coordinates.dec)) == keccak256(abi.encodePacked(_dec))
                && keccak256(abi.encodePacked(tokenIdToStarInfo[i].coordinates.mag)) == keccak256(abi.encodePacked(_mag))
                && keccak256(abi.encodePacked(tokenIdToStarInfo[i].coordinates.ra)) == keccak256(abi.encodePacked(_ra))) {
                return true;
            }
        }

        return false;
    }

    function tokenIdToStarInfo(uint _tokenId) public view returns(string starName, string starStory, string starDec, 
        string starMag, string starRa) {
        return (tokenIdToStarInfo[_tokenId].name, tokenIdToStarInfo[_tokenId].story, tokenIdToStarInfo[_tokenId].coordinates
            .dec, tokenIdToStarInfo[_tokenId].coordinates.mag, tokenIdToStarInfo[_tokenId].coordinates.ra);
    }
}