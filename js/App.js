const APP_CONFIG = window.APP_CONFIG || {};

const PINATA_API_KEY = APP_CONFIG.PINATA_API_KEY || "";
const PINATA_SECRET_API_KEY = APP_CONFIG.PINATA_SECRET_API_KEY || "";
const CONTRACT_ADDRESS = APP_CONFIG.CONTRACT_ADDRESS || "";
const CONTRACT_ABI = APP_CONFIG.CONTRACT_ABI || [];

let provider;
let signer;
let contract;
let connectedAddress = "";
let currentCid = "";

const connectWalletBtn = document.getElementById("connectWalletBtn");
const walletAddressLabel = document.getElementById("walletAddress");
const documentFileInput = document.getElementById("documentFile");
const uploadToIpfsBtn = document.getElementById("uploadToIpfsBtn");
const storeOnChainBtn = document.getElementById("storeOnChainBtn");
const verifyCidInput = document.getElementById("verifyCidInput");
const verifyOnChainBtn = document.getElementById("verifyOnChainBtn");
const uploadedCidLabel = document.getElementById("uploadedCid");
const verificationResultLabel = document.getElementById("verificationResult");
const appStatus = document.getElementById("appStatus");

function truncateAddress(address) {
  if (!address || address.length < 10) return address;
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

function setStatus(message, type = "info") {
  const colorMap = {
    info: "#cfdaf5",
    success: "#58c891",
    warning: "#f0b26d",
    error: "#f06d82",
  };

  appStatus.textContent = message;
  appStatus.style.color = colorMap[type] || colorMap.info;
}

function ensureEthereum() {
  if (!window.ethereum) {
    setStatus("MetaMask not detected. Install MetaMask extension first.", "error");
    throw new Error("MetaMask is not installed");
  }
}

function ensureContractConfigured() {
  if (!CONTRACT_ADDRESS.startsWith("0x") || CONTRACT_ADDRESS.length !== 42) {
    throw new Error("Invalid CONTRACT_ADDRESS. Paste your deployed contract address.");
  }

  if (!Array.isArray(CONTRACT_ABI) || CONTRACT_ABI.length === 0) {
    throw new Error("Invalid CONTRACT_ABI. Paste your contract ABI array.");
  }
}

function ensurePinataConfigured() {
  if (
    PINATA_API_KEY.includes("PASTE") ||
    PINATA_SECRET_API_KEY.includes("PASTE") ||
    !PINATA_API_KEY ||
    !PINATA_SECRET_API_KEY
  ) {
    throw new Error("Pinata API credentials are missing. Update your .env and regenerate js/env.js.");
  }
}

async function connectWallet() {
  try {
    ensureEthereum();
    ensureContractConfigured();

    provider = new ethers.BrowserProvider(window.ethereum);
    const accounts = await provider.send("eth_requestAccounts", []);

    if (!accounts || accounts.length === 0) {
      throw new Error("No account selected in MetaMask.");
    }

    signer = await provider.getSigner();
    connectedAddress = accounts[0];
    contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);

    walletAddressLabel.textContent = truncateAddress(connectedAddress);
    setStatus("Wallet connected. You can now upload and verify documents.", "success");
  } catch (error) {
    if (error?.code === 4001) {
      setStatus("Connection request rejected in MetaMask.", "warning");
      return;
    }

    setStatus(error.message || "Failed to connect wallet.", "error");
  }
}

async function uploadToPinata(file) {
  ensurePinataConfigured();

  const formData = new FormData();
  formData.append("file", file);

  const metadata = JSON.stringify({
    name: `doc-${Date.now()}-${file.name}`,
  });
  formData.append("pinataMetadata", metadata);

  const response = await fetch("https://api.pinata.cloud/pinning/pinFileToIPFS", {
    method: "POST",
    headers: {
      pinata_api_key: PINATA_API_KEY,
      pinata_secret_api_key: PINATA_SECRET_API_KEY,
    },
    body: formData,
  });

  const result = await response.json();

  if (!response.ok) {
    const details = result?.error?.details || result?.error || "Unknown Pinata error";
    throw new Error(`Pinata upload failed: ${details}`);
  }

  if (!result?.IpfsHash) {
    throw new Error("Pinata response does not include IpfsHash.");
  }

  return result.IpfsHash;
}

async function addDocumentOnChain(ipfsHash) {
  if (!contract) {
    throw new Error("Wallet not connected.");
  }

  const tx = await contract.addDocument(ipfsHash);
  setStatus("Transaction submitted. Waiting for confirmation...", "info");
  await tx.wait();
}

async function verifyDocumentOnChain(ipfsHash) {
  if (!contract) {
    throw new Error("Wallet not connected.");
  }

  return contract.verify(ipfsHash);
}

async function handleUploadToIpfs() {
  try {
    const selectedFile = documentFileInput.files[0];

    if (!selectedFile) {
      throw new Error("Please choose a document file before uploading.");
    }

    setStatus("Uploading document to Pinata IPFS...", "info");
    currentCid = await uploadToPinata(selectedFile);
    uploadedCidLabel.textContent = currentCid;
    storeOnChainBtn.disabled = false;
    setStatus("Upload successful. CID generated and ready for blockchain storage.", "success");
  } catch (error) {
    setStatus(error.message || "Failed to upload document.", "error");
  }
}

async function handleStoreOnChain() {
  try {
    if (!currentCid) {
      throw new Error("Upload a document first to generate CID.");
    }

    setStatus("Storing CID on blockchain...", "info");
    await addDocumentOnChain(currentCid);
    setStatus("CID stored successfully in the smart contract.", "success");
  } catch (error) {
    if (error?.code === 4001) {
      setStatus("Transaction rejected in MetaMask.", "warning");
      return;
    }

    setStatus(error.message || "Failed to store CID on blockchain.", "error");
  }
}

async function handleVerify() {
  try {
    const ipfsHash = verifyCidInput.value.trim();

    if (!ipfsHash) {
      throw new Error("Enter a CID to verify.");
    }

    setStatus("Checking verification status on-chain...", "info");
    const verifyResult = await verifyDocumentOnChain(ipfsHash);

    if (typeof verifyResult === "boolean") {
      verificationResultLabel.textContent = verifyResult
        ? "Verified: Document exists on-chain."
        : "Not verified: Document hash is not found.";
      setStatus("Verification complete.", verifyResult ? "success" : "warning");
      return;
    }

    verificationResultLabel.textContent = JSON.stringify(verifyResult);
    setStatus("Verification complete. Returned non-boolean result from contract.", "success");
  } catch (error) {
    verificationResultLabel.textContent = "Verification failed.";

    if (error?.code === 4001) {
      setStatus("Request rejected in MetaMask.", "warning");
      return;
    }

    setStatus(error.message || "Failed to verify document.", "error");
  }
}

function registerEvents() {
  connectWalletBtn.addEventListener("click", connectWallet);
  uploadToIpfsBtn.addEventListener("click", handleUploadToIpfs);
  storeOnChainBtn.addEventListener("click", handleStoreOnChain);
  verifyOnChainBtn.addEventListener("click", handleVerify);

  if (window.ethereum) {
    window.ethereum.on("accountsChanged", () => {
      connectedAddress = "";
      contract = null;
      walletAddressLabel.textContent = "Not connected";
      storeOnChainBtn.disabled = true;
      setStatus("Account changed. Please reconnect wallet.", "warning");
    });

    window.ethereum.on("chainChanged", () => {
      window.location.reload();
    });
  }
}

registerEvents();
