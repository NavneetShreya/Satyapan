# Project Documentation: Satyapan

## 1. Project Summary

Satyapan is a blockchain-based academic document verification platform.
It enables institutions and verifiers to prove the authenticity of a document using two decentralized layers:

- IPFS (via Pinata) to store the document file
- Ethereum-compatible smart contract to store and verify the document reference

The platform solves a core trust problem in credential verification by making document proof immutable, transparent, and independently verifiable.

## 2. Problem Statement

Traditional document verification workflows are often:

- Slow and manual
- Dependent on centralized databases
- Difficult to audit across organizations
- Vulnerable to tampering or duplicate records

Satyapan addresses this by using a CID-based verification model where each document uploaded to IPFS receives a content hash, and that hash is recorded on-chain.

## 3. System Objectives

1. Provide a simple interface for uploading and verifying documents.
2. Store document content in decentralized storage.
3. Store proof references in an immutable ledger.
4. Allow verifiers to validate documents by CID without depending on a single authority.

## 4. Functional Scope

### 4.1 Wallet Connection

- Connect user wallet using MetaMask.
- Detect account and chain changes.
- Restrict on-chain write actions until wallet is connected.

### 4.2 Document Upload to IPFS

- Accept document file from browser input.
- Upload file to Pinata using REST API.
- Receive and display IPFS CID (`IpfsHash`).

### 4.3 On-Chain Storage

- Send CID to the smart contract using `addDocument(string _ipfsHash)`.
- Wait for transaction confirmation.
- Report status in UI.

### 4.4 Verification

- Accept CID from user.
- Query contract function `verify(string _ipfsHash)`.
- Display whether the document is verified or not verified.

## 5. Architecture

### 5.1 Layered Architecture

1. Presentation Layer
- File: `index.html`, `css/main.css`
- Provides upload form, verify form, wallet connect action, and status/result views.

2. Application Layer
- File: `js/App.js`
- Implements input validation, wallet handling, IPFS upload call, and smart contract calls.

3. Configuration Layer
- Files: `.env`, `.env.example`, `scripts/generate-env.js`, `js/env.js`
- Manages runtime values for Pinata API keys, contract address, and ABI.

4. Storage Layer
- Pinata IPFS API stores binary file and returns CID.

5. Blockchain Layer
- Solidity contract stores and verifies CID references.

### 5.2 End-to-End Data Flow

#### Flow A: Upload and Register

1. User selects a document.
2. Frontend uploads it to Pinata.
3. Pinata returns `IpfsHash` CID.
4. Frontend submits CID to smart contract via wallet-signed transaction.
5. Contract stores the reference.
6. UI confirms completion.

#### Flow B: Verify

1. User enters CID.
2. Frontend calls contract verify function.
3. Contract returns verification status.
4. UI displays result.

## 6. Technology Stack

- Frontend: HTML5, CSS3, Vanilla JavaScript
- Web3 Library: ethers.js v6
- Wallet Integration: MetaMask (`window.ethereum`)
- Decentralized Storage: Pinata IPFS API
- Smart Contract: Solidity (Ethereum-compatible network)
- Build Utility: Node.js script for environment generation

## 7. Project Structure and Responsibility

- `index.html`: single-page UI with upload/verify/wallet modules
- `css/main.css`: dark academic theme, layout, responsive behavior
- `js/App.js`: application logic and all external integrations
- `scripts/generate-env.js`: converts `.env` to browser runtime config
- `.env.example`: required environment template
- `Contract/Verfication.sol`: contract source used for on-chain verification
- `README.md`: quick start and setup instructions

## 8. Configuration and Deployment Workflow

1. Add required values to `.env`:
- `PINATA_API_KEY`
- `PINATA_SECRET_API_KEY`
- `CONTRACT_ADDRESS`
- `CONTRACT_ABI_JSON`

2. Generate runtime config:
- Run `npm run build:env`
- This produces `js/env.js` as `window.APP_CONFIG`

3. Serve application:
- Use Live Server or any static hosting method

4. Connect MetaMask and use upload/verify flow

## 9. Reliability and Error Handling

The implementation includes handling for:

- Missing MetaMask
- Wallet rejection during account access or transaction signing
- Missing file/CID inputs
- Invalid contract configuration (address/ABI)
- Pinata API failures and malformed responses

## 10. Security Considerations

Current setup is suitable for academic demonstration.

Important considerations:

- Browser-delivered runtime config may expose API keys.
- For production, IPFS upload should be proxied through backend services.
- Secrets must be server-side in production deployment.

## 11. Operational Usage (Submission Demo)

1. Connect MetaMask.
2. Select and upload a document to IPFS.
3. Store returned CID on-chain.
4. Verify using the same CID.
5. Show verification status as proof of authenticity workflow.

## 12. Limitations and Future Enhancements

### Current Limitations

- No role-based access control in frontend workflow.
- No backend token protection for API secrets.
- Verification output is CID-based and contract-dependent.

### Future Enhancements

- Role-based issuer/verifier/admin permissions
- QR-based certificate verification links
- Verification history dashboard and analytics
- Backend API layer for secure key management
- Optional document encryption before IPFS upload

## 13. Conclusion

Satyapan provides a functional and demonstrable decentralized verification pipeline for academic documents.
It integrates IPFS storage, wallet-driven blockchain transactions, and CID-based authenticity checks in a single web interface, making it suitable for academic project submission and technical evaluation.
