//SPDX-License-Identifier:UNLICENSED
    pragma solidity ^0.8.0;
    import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
    import "@openzeppelin/contracts/utils/Counters.sol";
    import "@openzeppelin/contracts/access/Ownable.sol";
    import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
    
    contract ThetaCharityNFT is ERC721URIStorage, Ownable {
        // Utils
        using Counters for Counters.Counter;
        Counters.Counter private _tokenIds;
    
        // Stucts
        struct tokenMetaData {
            uint256 tokenId;
            uint256 timeStamp;
            string tokenURI;
        }
    
        // Maps
        mapping(address => tokenMetaData[]) public ownershipRecord;
    
        // Contructors
        constructor() ERC721("ThetaCharity", "Streamer"){}
        
        // Functions
        function mintToken(address recipient, string memory tokenURI) public onlyOwner returns (uint256){
            uint256 newItemId = _tokenIds.current();
            _safeMint(recipient, newItemId);
            _setTokenURI(newItemId, tokenURI);
            ownershipRecord[recipient].push(
                tokenMetaData(
                    newItemId,
                    block.timestamp,
                    tokenURI
                )
            );
            _tokenIds.increment();
            return newItemId;
        }
    }