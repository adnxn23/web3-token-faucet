# Web3 Token Faucet

The **Web3 Token Faucet** is a decentralized application (dApp) that allows users to request and receive small amounts of ERC-20 tokens on an Ethereum testnet. It's designed for developers, educators, and projects needing test tokens for development, experimentation, or learning.

---

## Features

### Smart Contract

- Mint or transfer ERC-20 tokens to user addresses.
- Enforce rate limits per wallet (e.g., 1 claim per 24 hours).
- Owner-only admin controls (pause faucet, change limits, etc.).

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
| Backend (optional) | Node.js + Express (not used)    |
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

## Project Status

- [x] Contract written and deployed
- [x] Frontend connected and working
- [ ] Deployed to hosting (Vercel, Netlify, etc.)
- [ ] Backend API with rate limits (optional)
- [ ] reCAPTCHA (optional)

---

## Potential Features (Future Work)

- Admin dashboard for faucet controls
- reCAPTCHA for bot prevention
- Real ERC-20 token faucet with branding
- Discord or Twitter login integration

---

## License

MIT

---

## Acknowledgments

- [OpenZeppelin Contracts](https://github.com/OpenZeppelin/openzeppelin-contracts)
- [Ethers.js](https://docs.ethers.io/)
- [Hardhat](https://hardhat.org/)

```

---
```
