# DocuLedger: Blockchain Based Academic Document Verification


This project demonstrates a complete workflow to:

1. Upload student/institution documents to IPFS through Pinata.
2. Store the generated CID hash on an Ethereum-compatible smart contract.
3. Verify on-chain document authenticity by querying the CID.

## Project Objective

Traditional document verification is slow, centralized, and vulnerable to tampering. DocuLedger addresses this by combining:

- Immutable verification records on blockchain.
- Decentralized document storage with IPFS.
- Wallet-based access through MetaMask.

This architecture improves trust, transparency, and auditability for academic credentials.



## Tech Stack

- Frontend: HTML5, CSS3, Vanilla JavaScript
- Web3: ethers.js v6
- Wallet: MetaMask
- Decentralized Storage: Pinata IPFS API
- Smart Contract: Solidity (Ethereum-compatible chain)

## Repository Structure

- index.html: Main single-page interface
- css/main.css: New academic dark theme styling
- js/App.js: Pinata + ethers.js business logic
- js/env.js: Generated runtime config from .env
- Contract/Verfication.sol: Solidity contract source

## Prerequisites

- Node.js (latest LTS recommended)
- MetaMask browser extension
- Pinata account with API Key and Secret
- Deployed smart contract with:
  - addDocument(string memory _ipfsHash)
  - verify(string memory _ipfsHash)

## Setup Instructions

1. Clone the repository.
2. Open the project folder in VS Code.
3. Create a local .env file (or copy from .env.example) and set:
  - PINATA_API_KEY
  - PINATA_SECRET_API_KEY
  - CONTRACT_ADDRESS
  - CONTRACT_ABI_JSON
4. Run npm run build:env to generate js/env.js from your .env values.
5. Ensure your MetaMask network matches the chain where the contract is deployed.
6. Run with Live Server (or any static server).

## Demo Flow (For Submission)

1. Click Connect MetaMask.
2. Select a document and click Upload to Pinata.
3. Copy/confirm generated CID in the interface.
4. Click Store CID On-Chain and approve transaction in MetaMask.
5. Enter the same CID in verification box and click Verify Document.
6. Show the verification result to examiner.

## Security Notes

- Do not commit real Pinata API secrets in public repositories.
- For production systems, use a backend relay to protect API credentials.
- Validate file types and size limits before upload.

## Suggested Future Enhancements

- Role-based access control for university admins.
- QR-based certificate verification pages.
- Batch upload and verification history dashboard.
- Backend proxy for secure API key management.

## Academic Submission Metadata

- Project Title: Blockchain Based Academic Document Verification
- Category: Minor Project / Web3 + Security
- Submission Type: Group Implementation
- Frontend Theme: Dark academic interface

## License

This project is provided for educational and academic demonstration purposes.
