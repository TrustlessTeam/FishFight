//SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Burnable.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";


contract FishFactory is ERC721Enumerable, Ownable {
	
    struct Fish {
        string name;
        uint birth;
        bytes32 traits;
    }

    // Private members
    mapping(uint256 => Fish) private m_FishDetails;


    // Public members
    string public _baseTokenURI;

    constructor(string memory baseURI) ERC721("Fish", "FSH") {
        _baseTokenURI = baseURI;
    }

    function createFish(string memory name) public payable {
        uint mintIndex = totalSupply();
        uint256 timeOfMint = block.timestamp;
        _safeMint(msg.sender, mintIndex);
        m_FishDetails[mintIndex] = Fish(name, timeOfMint, vrf());
    }

	function riskyCreateFish(string memory name) public payable {
		uint mintIndex = totalSupply();
        uint256 timeOfMint = block.timestamp;
		bytes32 rollTheDice = vrf();
		uint diceNum = uint(rollTheDice) % 2; // 50% chance
		// unlucky, paid but no mint :(
		if(diceNum == 0) {
			_safeMint(msg.sender, mintIndex);
        	m_FishDetails[mintIndex] = Fish(name, timeOfMint, vrf());
		}
	}

    function getFishInfo(uint256 tokenId) public view returns(Fish memory info) {
        require(_exists(tokenId), "That fish has not been minted yet.");
        return m_FishDetails[tokenId];
    }

    function vrf() public view returns (bytes32 result) {
  	bytes32 input;
  	assembly {
  		let memPtr := mload(0x40)
        if iszero(staticcall(not(0), 0xff, input, 32, memPtr, 32)) {
        	invalid()
        }
        result := mload(memPtr)
    }
  }
}