import { ethers } from 'ethers';

// Contract ABI matching Solidity contract contracts/RenewCredCarbon.sol
export const RENEWCRED_ABI = [
  "function submitVerifiedRecord(string _projectId, string _deviceId, uint256 _energyKWh, uint256 _co2ReducedKg, uint256 _credits, string _certificateHash, address _recipient) public returns (uint256)",
  "function transferCredit(uint256 _id, address _to) public",
  "function retireCredit(uint256 _id, string _reason) public",
  "function getCredit(uint256 _id) public view returns (tuple(uint256 id, string projectId, string deviceId, uint256 energyKWh, uint256 co2ReducedKg, uint256 credits, uint256 timestamp, string certificateHash, bool verified, bool retired, string retirementReason, address owner))",
  "event VerifiedRecordSubmitted(uint256 indexed id, string projectId, string certificateHash)",
  "event CarbonCreditMinted(uint256 indexed id, address indexed owner, uint256 credits)"
];

export const CONTRACT_ADDRESS = "0x83A92F45B3d1912A098Efa92C912bF5C45B932F1";

export async function connectWallet() {
  if (typeof window !== 'undefined' && window.ethereum) {
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      await provider.send("eth_requestAccounts", []);
      const signer = await provider.getSigner();
      const address = await signer.getAddress();
      return { provider, signer, address, error: null };
    } catch (err) {
      return { provider: null, signer: null, address: null, error: err.message };
    }
  } else {
    return {
      provider: null,
      signer: null,
      address: "0x71C7656EC7ab88b098defB751B7401B5f6d8976F",
      error: "MetaMask not detected. Operating in simulated Web3 mode."
    };
  }
}
