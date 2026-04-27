// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract DocumentVerificationSimple {
    address public owner;
    mapping(string => bool) private verifiedDocuments;

    event DocumentAdded(string ipfsHash, address indexed addedBy);

    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can add document");
        _;
    }

    constructor() {
        owner = msg.sender;
    }

    function addDocument(string memory _ipfsHash) external onlyOwner {
        require(bytes(_ipfsHash).length > 0, "Empty IPFS hash");
        verifiedDocuments[_ipfsHash] = true;
        emit DocumentAdded(_ipfsHash, msg.sender);
    }

    function verify(string memory _ipfsHash) external view returns (bool) {
        return verifiedDocuments[_ipfsHash];
    }
}
