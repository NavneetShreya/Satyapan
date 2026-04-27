# Demo Runbook (Ganache + MetaMask + Remix)

This runbook is prepared for your exact project so you can run a live demo quickly.

## What I already prepared in code

- Frontend reads config from env-generated runtime file (`js/env.js`).
- App now supports both contract styles:
  - `addDocument(string)` + `verify(string)`
  - `addDocHash(bytes32,string)` + `findDocHash(bytes32)`
- Added a simple contract for easiest demo in Remix:
  - `Contract/DocumentVerificationSimple.sol`

## What you still need to do manually

You only need to do wallet/network/deployment/API-key steps.

## A. Start local blockchain (Ganache)

1. Open Ganache.
2. Start Quickstart Ethereum.
3. Note values:
   - RPC URL (usually `http://127.0.0.1:7545`)
   - Chain ID (usually `1337`)
4. Copy one Ganache account private key.

## B. Configure MetaMask for Ganache

1. In MetaMask, add custom network:
   - Network Name: `Ganache Local`
   - RPC URL: `http://127.0.0.1:7545`
   - Chain ID: `1337`
   - Currency Symbol: `ETH`
2. Import account using Ganache private key.
3. Select `Ganache Local` network in MetaMask.

## C. Deploy contract in Remix (web)

Recommended for easiest demo: `DocumentVerificationSimple.sol`.

1. Open Remix: `https://remix.ethereum.org`.
2. Open file `Contract/DocumentVerificationSimple.sol`.
3. Compile using Solidity `0.8.20`.
4. Go to Deploy & Run tab.
5. Environment: `Injected Provider - MetaMask`.
6. Confirm MetaMask connection on Ganache Local.
7. Click Deploy and confirm transaction.
8. Copy deployed contract address.
9. Copy ABI JSON from Remix compilation details.

## D. Create Pinata API keys (free)

1. Login to Pinata.
2. Create API key with pinning permissions.
3. Copy:
   - `PINATA_API_KEY`
   - `PINATA_SECRET_API_KEY`

## E. Fill local env and generate runtime config

1. Edit `.env` in project root.
2. Set:

```env
PINATA_API_KEY=YOUR_PINATA_API_KEY
PINATA_SECRET_API_KEY=YOUR_PINATA_SECRET_API_KEY
CONTRACT_ADDRESS=YOUR_DEPLOYED_CONTRACT_ADDRESS
CONTRACT_ABI_JSON=[PASTE_FULL_ABI_JSON_ARRAY]
```

3. Run:

```bash
npm install
npm run build:env
```

This generates `js/env.js` used by the frontend.

## F. Start app and run demo

1. Start static server from project root:

```bash
npx http-server . -p 8080
```

2. Open `http://127.0.0.1:8080`.
3. Click `Connect MetaMask`.
4. Choose file -> `Upload to Pinata`.
5. Click `Store CID On-Chain` and approve tx.
6. Paste same CID in verify input -> `Verify Document`.

## G. Demo script for presentation

1. "This file is uploaded to IPFS and gets a unique CID."
2. "CID is stored on blockchain through wallet-signed transaction."
3. "Any verifier can check authenticity by querying the same CID."
4. "If CID exists on-chain, document is authentic."

## H. If something fails

- MetaMask not detected: extension disabled or wrong browser profile.
- Wrong network: ensure Ganache Local is selected.
- Upload error: Pinata keys invalid or missing permission.
- Contract call error: address/ABI mismatch in `.env`; regenerate env using `npm run build:env`.
- If using old `Verification` contract, owner/exporter restrictions may block adds.

## I. Best contract choice for your demo

Use `DocumentVerificationSimple.sol` for clean and reliable classroom demo.
