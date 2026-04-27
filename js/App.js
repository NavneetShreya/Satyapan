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
const themeToggleBtn = document.getElementById("themeToggleBtn");

function applyTheme(theme) {
  const selectedTheme = theme === "day" ? "day" : "night";
  document.body.setAttribute("data-theme", selectedTheme);
  localStorage.setItem("satyapan_theme", selectedTheme);

  if (themeToggleBtn) {
    themeToggleBtn.textContent = selectedTheme === "day" ? "Night Mode" : "Day Mode";
  }
}

function initializeTheme() {
  const savedTheme = localStorage.getItem("satyapan_theme");
  applyTheme(savedTheme || "night");
}

function hasFunction(signature) {
  if (!contract?.interface) return false;

  try {
    contract.interface.getFunction(signature);
    return true;
  } catch {
    return false;
  }
}

function cidToBytes32(ipfsHash) {
  return ethers.keccak256(ethers.toUtf8Bytes(ipfsHash));
}

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

async function initializeReadOnlyContract() {
  ensureContractConfigured();

  if (window.ethereum) {
    provider = new ethers.BrowserProvider(window.ethereum);
  } else {
    throw new Error("MetaMask not detected for contract provider.");
  }

  // Read-only mode: bind contract to provider so verify can work before wallet connect.
  contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, provider);
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

    if (!provider) {
      provider = new ethers.BrowserProvider(window.ethereum);
    }
    const accounts = await provider.send("eth_requestAccounts", []);

    if (!accounts || accounts.length === 0) {
      throw new Error("No account selected in MetaMask.");
    }

    signer = await provider.getSigner();
    connectedAddress = accounts[0];
    contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);

    walletAddressLabel.textContent = truncateAddress(connectedAddress);
    if (currentCid) {
      storeOnChainBtn.disabled = false;
    }
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
  if (!contract || !signer) {
    throw new Error("Wallet not connected for write transaction.");
  }

  let tx;
  if (hasFunction("addDocument(string)")) {
    tx = await contract.addDocument(ipfsHash);
  } else if (hasFunction("addDocHash(bytes32,string)")) {
    const bytesHash = cidToBytes32(ipfsHash);
    tx = await contract.addDocHash(bytesHash, ipfsHash);
  } else {
    throw new Error(
      "Contract is missing supported add function. Expected addDocument(string) or addDocHash(bytes32,string)."
    );
  }

  setStatus("Transaction submitted. Waiting for confirmation...", "info");
  await tx.wait();
}

async function verifyDocumentOnChain(ipfsHash) {
  if (!contract) {
    throw new Error("Contract not initialized.");
  }

  if (hasFunction("verify(string)")) {
    const result = await contract.verify(ipfsHash);
    return {
      verified: Boolean(result),
      mode: "verify(string)",
    };
  }

  if (hasFunction("findDocHash(bytes32)")) {
    const bytesHash = cidToBytes32(ipfsHash);
    const result = await contract.findDocHash(bytesHash);

    const blockNumber = Number(result?.[0] ?? 0);
    const cidFromChain = result?.[3] ?? "";
    const isVerified = blockNumber > 0 && cidFromChain === ipfsHash;

    return {
      verified: isVerified,
      mode: "findDocHash(bytes32)",
      details: result,
    };
  }

  throw new Error(
    "Contract is missing supported verify function. Expected verify(string) or findDocHash(bytes32)."
  );
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
    storeOnChainBtn.disabled = !connectedAddress;
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
    verificationResultLabel.textContent = verifyResult.verified
      ? `Verified: Document exists on-chain (${verifyResult.mode}).`
      : `Not verified: Document hash is not found (${verifyResult.mode}).`;
    setStatus("Verification complete.", verifyResult.verified ? "success" : "warning");
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

  if (themeToggleBtn) {
    themeToggleBtn.addEventListener("click", () => {
      const currentTheme = document.body.getAttribute("data-theme") || "night";
      const nextTheme = currentTheme === "day" ? "night" : "day";
      applyTheme(nextTheme);
    });
  }

  if (window.ethereum) {
    window.ethereum.on("accountsChanged", () => {
      connectedAddress = "";
      signer = null;
      walletAddressLabel.textContent = "Not connected";
      storeOnChainBtn.disabled = true;
      setStatus("Account changed. Please reconnect wallet.", "warning");

      // Keep read-only contract alive so verify remains available.
      initializeReadOnlyContract().catch(() => {
        contract = null;
      });
    });

    window.ethereum.on("chainChanged", () => {
      window.location.reload();
    });
  }
}

async function initializeApp() {
  try {
    ensureContractConfigured();
    await initializeReadOnlyContract();

    if (window.ethereum) {
      const accounts = await provider.send("eth_accounts", []);
      if (accounts && accounts.length > 0) {
        signer = await provider.getSigner();
        connectedAddress = accounts[0];
        contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
        walletAddressLabel.textContent = truncateAddress(connectedAddress);
        setStatus("Wallet detected. Ready for upload and verify.", "success");
      } else {
        setStatus("Ready. You can verify now. Connect wallet to store CID on-chain.", "info");
      }
    }
  } catch (error) {
    setStatus(error.message || "Failed to initialize app.", "error");
  }
}

initializeTheme();
registerEvents();
initializeApp();
