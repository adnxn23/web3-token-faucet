# Web3 Token Faucet

The **Web3 Token Faucet** is a decentralized application (dApp) that allows users to request and receive small amounts of ERC-20 tokens on an Ethereum testnet. It's designed for developers, educators, and projects needing test tokens for development, experimentation, or learning.

**Live Demo:**  
[https://web3-token-faucet-2joq.vercel.app](https://web3-token-faucet-2joq.vercel.app)

---

## Features

### Smart Contract

- Mint or transfer ERC-20 tokens to user addresses.
- Enforce rate limits per wallet (1 claim per wallet per 24 hours).
- Owner-only admin controls for pausing the faucet and config changes.

### Frontend

- Connect MetaMask wallet.
- Display token balance and faucet status.
- Request tokens with a single click.
- Show transaction feedback (loading, success, error).

### Security

- Rate-limit users to prevent abuse.
- Protect against reentrancy attacks.
- Allow only verified testnet wallet interactions.

---

## Tech Stack

| Layer              | Stack                           |
| ------------------ | ------------------------------- |
| Blockchain         | Ethereum (Sepolia testnet)      |
| Smart Contract     | Solidity + OpenZeppelin         |
| Dev Tools          | Hardhat                         |
| Frontend           | Vite + React + Ethers.js        |
| Styling            | Tailwind CSS                    |
| Libraries          | Ethers.js, dotenv, OpenZeppelin |

---

## Folder Structure

```
token-faucet/
├── contracts/           # Faucet.sol contract
├── scripts/             # Deployment and usage scripts
├── test/                # Hardhat tests
├── frontend/
│   ├── src/
│   │   ├── App.jsx
│   │   ├── FaucetButton.jsx
│   │   └── utils/
│   └── index.html
├── backend/ (optional)
│   ├── server.js
│   └── limiter.js
├── hardhat.config.js
├── package.json
├── .env
└── README.md
```

---

## How to Run Locally

### Prerequisites

- Node.js
- MetaMask (or similar wallet)
- Sepolia ETH for testing

### 1. Clone and install

```bash
git clone https://github.com/your-username/token-faucet.git
cd token-faucet
npm install
```

### 2. Set up environment variables

Create a `.env` file:

```env
PRIVATE_KEY=your_private_key_here
API_URL=https://sepolia.infura.io/v3/your_infura_project_id
TOKEN_CONTRACT_ADDRESS=deployed_contract_address_here
```

### 3. Deploy contract to Sepolia

```bash
npx hardhat run scripts/deploy.js --network sepolia
```

### 4. Run frontend

```bash
cd frontend
npm install
npm run dev
```

---

## Smart Contract

- Written in Solidity
- Based on OpenZeppelin ERC-20
- Includes faucet logic and cooldown period

---

## Future Improvements (Not Yet Implemented)

- Google reCAPTCHA to prevent bots.
- Real ERC-20 token faucet with branding
- IP-based or wallet-based rate limiting via backend.
- Admin dashboard for managing faucet config.
- Twitter/Discord login for verification

---

## License

MIT. Free to use, fork, or improve.

---

## Acknowledgments

- [OpenZeppelin Contracts](https://github.com/OpenZeppelin/openzeppelin-contracts)
- [Ethers.js](https://docs.ethers.io/)
- [Hardhat](https://hardhat.org/)

```

---
```
