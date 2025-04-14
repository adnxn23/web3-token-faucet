import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import './App.css';
import faucetABI from './abi/Faucet.json';
import tokenABI from './abi/TestToken.json';

function App() {
  // State variables
  const [account, setAccount] = useState('');
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [faucetContract, setFaucetContract] = useState(null);
  const [tokenContract, setTokenContract] = useState(null);
  const [balance, setBalance] = useState('0');
  const [isPaused, setIsPaused] = useState(false);
  const [nextClaimTime, setNextClaimTime] = useState(0);
  const [canClaim, setCanClaim] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Contract addresses - replace with your deployed contract addresses
  const faucetAddress = "0xeF7A3F7A4C04659166268Df388Df4982a0B2e642";
  const tokenAddress = "0xE3E1e472b4685406316F69D4195c0C9b60706182";

  // Connect to wallet
  const connectWallet = async () => {
    console.log("Connect wallet button clicked");
    try {
      if (window.ethereum) {
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        const provider = new ethers.BrowserProvider(window.ethereum);
        const network = await provider.getNetwork();
        
        // Check if on Sepolia network (chainId 11155111)
        if (network.chainId !== 11155111n) {
          setErrorMessage('Please connect to Sepolia network');
          return;
        }
        
        const signer = await provider.getSigner();
        const faucet = new ethers.Contract(faucetAddress, faucetABI.abi, signer);
        const token = new ethers.Contract(tokenAddress, tokenABI.abi, signer);
        
        setAccount(accounts[0]);
        setProvider(provider);
        setSigner(signer);
        setFaucetContract(faucet);
        setTokenContract(token);
        
        // Clear any previous messages
        setErrorMessage('');
        setSuccessMessage('Connect successful');
        
        // Initial data fetch
        fetchFaucetData(accounts[0], faucet, token);
      } else {
        setErrorMessage('Please install MetaMask!');
      }
    } catch (error) {
      console.error("Error connecting wallet:", error);
      setErrorMessage('Failed to connect wallet');
    }
  };

  // Fetch faucet data
  const fetchFaucetData = async (userAccount, faucet, token) => {
    try {
      if (!faucet || !token) return;
      
      const isPausedStatus = await faucet.isPaused();
      const tokenBalance = await token.balanceOf(userAccount);
      const userCanClaim = await faucet.canClaimTokens(userAccount);
      const nextClaim = await faucet.getNextClaimTime(userAccount);
      
      setIsPaused(isPausedStatus);
      setBalance(ethers.formatUnits(tokenBalance, 18));
      setCanClaim(userCanClaim);
      setNextClaimTime(Number(nextClaim) * 1000); // Convert to milliseconds
    } catch (error) {
      console.error("Error fetching faucet data:", error);
      setErrorMessage('Failed to fetch faucet data');
    }
  };

  // Request tokens from faucet
  const requestTokens = async () => {
    try {
      setIsLoading(true);
      setErrorMessage('');
      setSuccessMessage('');
      
      if (!faucetContract) {
        setErrorMessage('Please connect your wallet first');
        setIsLoading(false);
        return;
      }
      
      const tx = await faucetContract.requestTokens();
      await tx.wait();
      
      setSuccessMessage('Tokens claimed successfully!');
      fetchFaucetData(account, faucetContract, tokenContract);
    } catch (error) {
      console.error("Error requesting tokens:", error);
      if (error.reason) {
        setErrorMessage(`Failed to claim tokens: ${error.reason}`);
      } else {
        setErrorMessage('Failed to claim tokens');
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Format timestamp to readable date
  const formatDate = (timestamp) => {
    if (!timestamp) return 'N/A';
    return new Date(timestamp).toLocaleString();
  };

  // Initialize wallet connection if ethereum is available
  useEffect(() => {
    const checkWalletConnection = async () => {
      if (window.ethereum) {
        try {
          const accounts = await window.ethereum.request({ method: 'eth_accounts' });
          if (accounts.length > 0) {
            connectWallet();
          }
        } catch (error) {
          console.error("Error checking wallet connection:", error);
        }
      }
    };
    
    checkWalletConnection();
    
    const handleAccountsChanged = async (accounts) => {
      if (accounts.length > 0) {
        setAccount(accounts[0]);
        
        // Completely reinitialize all connections
        try {
          const provider = new ethers.BrowserProvider(window.ethereum);
          const signer = await provider.getSigner();
          const faucet = new ethers.Contract(faucetAddress, faucetABI.abi, signer);
          const token = new ethers.Contract(tokenAddress, tokenABI.abi, signer);
          
          setProvider(provider);
          setSigner(signer);
          setFaucetContract(faucet);
          setTokenContract(token);
          
          // Fetch data with the new account
          fetchFaucetData(accounts[0], faucet, token);
        } catch (error) {
          console.error("Error reinitializing after account change:", error);
          setErrorMessage('Error connecting with new account');
        }
      } else {
        // User disconnected all accounts
        setAccount('');
        setSigner(null);
        setFaucetContract(null);
        setTokenContract(null);
      }
    };
    
    if (window.ethereum) {
      window.ethereum.on('accountsChanged', handleAccountsChanged);
    }
    
    return () => {
      if (window.ethereum) {
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
      }
    };
  }, []);

  // Periodically refresh data
  useEffect(() => {
    if (account && faucetContract && tokenContract) {
      const interval = setInterval(() => {
        fetchFaucetData(account, faucetContract, tokenContract);
      }, 30000); // Every 30 seconds
      
      return () => clearInterval(interval);
    }
  }, [account, faucetContract, tokenContract]);

  return (
    <div className="app-container">
      <header className="app-header">
        <h1>Token Faucet</h1>
        <div className="wallet-connection">
          {account ? (
            <div className="account-info">
              <span className="account-address">
                {account.slice(0, 6)}...{account.slice(-4)}
              </span>
              <div className="connection-status connected">Connected</div>
            </div>
          ) : (
            <button className="connect-button" onClick={connectWallet}>
              Connect Wallet
            </button>
          )}
        </div>
      </header>

      <main className="app-main">
        {errorMessage && <div className="error-message">{errorMessage}</div>}
        {successMessage && <div className="success-message">{successMessage}</div>}
        
        <div className="faucet-status">
          <h2>Faucet Status</h2>
          <div className={`status-indicator ${isPaused ? "paused" : "active"}`}>
            {isPaused ? "Paused" : "Active"}
          </div>
        </div>
        
        <div className="user-info">
          <h2>User Information</h2>
          <div className="info-grid">
            <div className="info-item">
              <span className="label">Token Balance:</span>
              <span className="value">{balance} TST</span>
            </div>
            <div className="info-item">
              <span className="label">Can Claim:</span>
              <span className="value">{canClaim ? "Yes" : "No"}</span>
            </div>
            <div className="info-item">
              <span className="label">Next Claim Time:</span>
              <span className="value">{formatDate(nextClaimTime)}</span>
            </div>
          </div>
        </div>
        
        <div className="claim-section">
          <button 
            className={`claim-button ${!canClaim || isPaused || isLoading ? "disabled" : ""}`}
            onClick={requestTokens}
            disabled={!canClaim || isPaused || isLoading}
          >
            {isLoading ? "Processing..." : "Claim Tokens"}
          </button>
          {!canClaim && nextClaimTime > Date.now() && (
            <div className="cooldown-notice">
              Cooldown active. You can claim again at {formatDate(nextClaimTime)}
            </div>
          )}
          {isPaused && (
            <div className="paused-notice">
              The faucet is currently paused by the admin.
            </div>
          )}
        </div>
      </main>
      
      <footer className="app-footer">
        <p>Deployed on Sepolia Testnet</p>
      </footer>
    </div>
  );
}

export default App;