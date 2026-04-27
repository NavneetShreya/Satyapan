# Satyapan Viva Preparation Document

## 1. Project Introduction

### 1.1 Project Name
Satyapan - Blockchain Based Document Verification System

### 1.2 One-Line Pitch
Satyapan is a decentralized verification platform where document proof is stored as CID on blockchain and the actual file is stored on IPFS.

### 1.3 Why This Project Matters
In normal systems, documents are verified manually through email/calls and can be forged easily. Satyapan reduces fraud risk and verification time by using:
- Content-addressed storage (IPFS)
- Immutable reference storage (Blockchain)
- Wallet-signed interactions (MetaMask)

## 2. Problem Statement

Traditional document verification has major issues:
- Centralized trust dependency
- Slow manual verification cycle
- No universal audit trail
- High chance of fake/altered certificates

Satyapan solves this by moving trust from institution-only database to cryptographic proof and public verifiability.

## 3. Objectives

1. Upload documents in decentralized storage.
2. Store verification reference on-chain.
3. Allow instant verification using CID.
4. Keep UI simple for non-technical users.
5. Demonstrate end-to-end Web3 workflow for academic evaluation.

## 4. Technology Stack

- Frontend: HTML, CSS, JavaScript
- Web3 Library: ethers.js v6
- Wallet: MetaMask
- Storage: Pinata IPFS API
- Smart Contract: Solidity
- Local Network Option: Ganache
- Deploy Tool: Remix (Web)
- Runtime Config: .env + build script (`scripts/generate-env.js`)

## 5. System Architecture

## 5.1 Layered View

1. Presentation Layer
- `index.html`, `css/main.css`
- Provides upload, store, verify, and theme interactions.

2. Application Layer
- `js/App.js`
- Handles wallet connection, IPFS upload, contract calls, and error handling.

3. Configuration Layer
- `.env`, `.env.example`, `scripts/generate-env.js`, `js/env.js`
- Injects runtime API keys, ABI, and contract address.

4. Decentralized Storage Layer
- Pinata API uploads file to IPFS and returns CID.

5. Blockchain Layer
- Smart contract stores CID status/reference and verifies authenticity.

## 5.2 Data Flow

### Upload and Register Flow
1. User selects file.
2. App uploads file to Pinata.
3. Pinata returns CID.
4. User sends signed transaction to store CID on-chain.
5. Contract records it.

### Verification Flow
1. User enters CID.
2. App queries contract verify function.
3. Contract returns proof status.
4. UI shows Verified/Not Verified.

## 6. Project Working Explanation (Step-by-Step)

1. User opens app and connects MetaMask.
2. User uploads document.
3. App receives generated CID from IPFS.
4. User clicks store CID on-chain.
5. Transaction is confirmed.
6. User or verifier enters CID in verify panel.
7. Contract response determines authenticity.

## 7. What We Implemented Practically

- Pinata API integration for file pinning.
- Ethers v6 wallet and contract interaction.
- Support for two contract styles in frontend logic:
  - `addDocument(string)` / `verify(string)`
  - `addDocHash(bytes32,string)` / `findDocHash(bytes32)`
- Read-only verification mode even without manual wallet connect.
- Day/Night mode UI toggle with local persistence.
- Modern professional responsive UI.
- Demo runbook for Ganache + MetaMask + Remix.

## 8. Challenges Faced and How We Solved Them

### Challenge 1: ABI parsing from `.env`
Issue:
- Multiline ABI JSON was failing in parser.

Solution:
- Enhanced env generation script to support multiline `CONTRACT_ABI_JSON` blocks.

### Challenge 2: Contract function mismatch
Issue:
- Different contracts used different function names and signatures.

Solution:
- Added function-detection logic in frontend and fallback paths.

### Challenge 3: Verification failed when wallet not connected
Issue:
- App initially required connected signer for all actions.

Solution:
- Introduced read-only contract initialization using provider mode for verify calls.

### Challenge 4: Network mismatch (Ganache/MetaMask)
Issue:
- Contract deployed on one chain but wallet on another chain.

Solution:
- Standardized demo on Ganache local network with explicit chain checks.

### Challenge 5: Keys hardcoded in JS
Issue:
- Security and maintainability concerns.

Solution:
- Migrated to env-based runtime config and ignored sensitive local files.

## 9. Demo Script for Viva (What to Say While Showing)

1. "This is Satyapan, a decentralized document verification portal."
2. "I upload a document to IPFS; IPFS returns a CID."
3. "Now I store this CID on blockchain through MetaMask-signed transaction."
4. "To verify, I enter CID and query contract state."
5. "If CID exists on-chain, document is authentic."
6. "This removes dependency on manual email-based verification."

## 10. Typical Viva Questions with Model Answers

### Q1. Why blockchain for document verification?
A:
Because blockchain provides immutability and transparency. Once reference is stored, it cannot be silently altered.

### Q2. Why store CID on-chain and not full file?
A:
On-chain storage is expensive. IPFS stores large files efficiently, while blockchain stores lightweight proof (CID/reference).

### Q3. What is CID?
A:
CID is content identifier generated from file content in IPFS. Any change in content produces a different CID.

### Q4. Can someone upload fake document and get CID?
A:
Yes, any file can get CID. Authenticity comes from whether that CID is registered by trusted issuer in contract.

### Q5. Why MetaMask is needed?
A:
MetaMask provides wallet identity and transaction signing for on-chain write operations.

### Q6. Difference between read and write in your dApp?
A:
Read calls do not cost gas and can be done in provider/read-only mode. Write calls require signed transaction and gas.

### Q7. Why Pinata and not raw IPFS node?
A:
Pinata offers easy managed pinning API and reliable availability for demo and prototype deployment.

### Q8. What happens if API keys leak?
A:
Anyone can misuse upload API. For production, keys must be moved to backend proxy with auth and rate limits.

### Q9. How is your project better than centralized DB verification?
A:
No single point of trust, public auditability, tamper evidence, and faster verifier-side validation.

### Q10. Main limitation currently?
A:
Issuer trust model is simple and secret handling is frontend-oriented for demo. Production needs role control + backend security.

## 11. Security Discussion (Viva Ready)

Current prototype risks:
- Frontend exposure of API keys in runtime config.
- No full access control model in simple contract path.

Production recommendations:
- Backend upload relay with secure key vault.
- Issuer role management and revocation logic.
- Input validation, file-size checks, audit logs.

## 12. Performance and Cost Notes

- Verification is lightweight (read call).
- Main cost is transaction gas during on-chain registration.
- Storing CID instead of whole file minimizes blockchain cost.

## 13. Testing/Validation Performed

- Wallet connection and account-change handling.
- IPFS upload success/failure handling.
- On-chain transaction flow and receipt confirmation.
- Verification using known stored CID.
- Failure case for unknown CID.
- UI responsiveness and day/night mode behavior.

## 14. Future Scope

1. Role-based issuer and verifier permissions.
2. University admin dashboard and issuer onboarding.
3. QR code certificate verification endpoint.
4. Batch verification for recruiters.
5. Revocation and expiry metadata for credentials.
6. Backend secure services for API keys and logs.
7. Multi-chain deployment support.
8. DID/VC standards integration for interoperable digital identity.

## 15. Conclusion (Viva Closing Statement)

Satyapan demonstrates a practical and scalable model for document authenticity verification using blockchain and IPFS. It reduces manual effort, improves trust, and provides tamper-evident records. The current prototype is demo-ready and can be extended into production with stronger access control and backend security layers.

---

## Quick Revision Sheet (1-minute)

- Problem: Fake documents + slow manual verification.
- Core Idea: File on IPFS, proof on blockchain.
- Stack: JS + ethers + MetaMask + Pinata + Solidity.
- Key Flow: Upload -> CID -> Store on-chain -> Verify.
- Major Challenge Solved: Contract/ABI mismatch and read-only verification fallback.
- Future Scope: Role-based trust, backend security, QR verification, dashboards.
