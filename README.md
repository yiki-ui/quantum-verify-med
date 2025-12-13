# Pharma Verify - Simplified Architecture with Post-Quantum Cryptography

A **simplified** pharmaceutical verification platform using **Cardano blockchain** and **post-quantum cryptography** (PQC) for quantum-resistant medicine authentication.

## Key Features

- **Post-Quantum Security** - CRYSTALS-Dilithium signatures (NIST-approved)
- **Cardano Blockchain** - Immutable batch attestations via NFTs
- **Wallet-Based Auth** - Connect with Nami, Eternl, Flint, or Typhon
- **Zero Docker** - No container orchestration needed

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Frontend Applications                     │
├──────────────────────────┬──────────────────────────────────┤
│  Manufacturer Portal     │     Consumer Portal              │
│  - Cardano Wallet Login  │     - Batch Verification         │
│  - PQC Keypair Gen       │     - PQC Signature Check        │
│  - Medicine Registration │     - Blockchain Query           │
└──────────────────────────┴──────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│              Shared PQC Crypto Library                       │
│  - CRYSTALS-Dilithium (ML-DSA-65)                           │
│  - IndexedDB Key Storage                                     │
│  - Cardano Wallet Integration                                │
└─────────────────────────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│              Cardano Blockchain (Testnet/Mainnet)           │
│  - NFT Minting with PQC Signatures                          │
│  - CIP-25 Metadata + PQC Extension                          │
│  - Blockfrost API Integration                                │
└─────────────────────────────────────────────────────────────┘
```

## Quick Start

### Prerequisites
- Node.js 20+
- A Cardano wallet extension (Nami, Eternl, Flint, or Typhon)
- Blockfrost API key (for Cardano testnet/mainnet)

### One-Command Start (Recommended)

The easiest way to run the entire project (builds crypto lib + starts both portals) is:

```bash
./start-all.sh
```

### Manual Installation

1. **Install Dependencies**
```bash
# Install PQC crypto library
cd frontend/shared/crypto
npm install

# Install manufacturer portal
cd ../manufacturer-portal
npm install

# Install consumer portal
cd ../consumer-portal
npm install
```

2. **Configure Environment**
```bash
# Manufacturer Portal
cd frontend/manufacturer-portal
cp .env.example .env
# Edit .env and add your Blockfrost key

# Consumer Portal
cd ../consumer-portal
cp .env.example .env
# Edit .env and add your Blockfrost key
```

3. **Run Applications (if not using start-all.sh)**
```bash
# Terminal 1: Manufacturer Portal
cd frontend/manufacturer-portal
npm run dev
# Opens on http://localhost:5173

# Terminal 2: Consumer Portal
cd frontend/consumer-portal
npm run dev
# Opens on http://localhost:5174
```

## 📱 Usage

### For Manufacturers

1. **Connect Wallet**
   - Open manufacturer portal
   - Click on your Cardano wallet (Nami/Eternl/Flint/Typhon)
   - Approve connection

2. **Generate PQC Keypair**
   - Automatically generated on first login
   - Stored securely in browser IndexedDB
   - Public key displayed in profile

3. **Register Medicine Batch**
   - Navigate to "Register Medicine"
   - Fill in batch details (ID, product, quantity, dates)
   - Click "Preview Signature" to see PQC signature
   - Click "Register on Cardano" to mint NFT
   - Transaction submitted to Cardano blockchain

### For Consumers

1. **Verify Medicine**
   - Open consumer portal
   - Enter batch ID from medicine package
   - Click "Verify"

2. **View Results**
   - Batch information from blockchain
   - PQC signature validation status
   - Manufacturer details
   - Expiry date check

## Post-Quantum Cryptography

### Algorithm: CRYSTALS-Dilithium

- **Standard**: NIST FIPS 204 (ML-DSA)
- **Variant**: Dilithium-2 (ML-DSA-65)
- **Security Level**: 128-bit quantum security
- **Library**: `@noble/post-quantum`

### How It Works

1. **Manufacturer Registration**
   - Generates Dilithium keypair
   - Private key stored in IndexedDB
   - Public key shared in profile

2. **Batch Registration**
   - Batch data signed with Dilithium private key
   - Signature embedded in Cardano NFT metadata
   - Immutable record on blockchain

3. **Consumer Verification**
   - Retrieves NFT metadata from Cardano
   - Extracts PQC signature and public key
   - Verifies signature using Dilithium algorithm
   - Displays authenticity result

## ⛓️ Cardano Integration

### NFT Metadata Structure (CIP-25 + PQC Extension)

```json
{
  "721": {
    "<policy_id>": {
      "<batch_id>": {
        "name": "Product Name - Batch ID",
        "description": "Batch attestation",
        "attributes": {
          "batch_id": "BATCH-2024-001",
          "product_name": "Aspirin 500mg",
          "manufacturer": "PharmaCorp",
          "quantity": 10000,
          "manufacturing_date": "2024-12-01",
          "expiry_date": "2026-12-01"
        },
        "pqc_signature": {
          "signature": "<dilithium_signature_hex>",
          "public_key": "<dilithium_pubkey_hex>",
          "algorithm": "dilithium2",
          "batch_hash": "<sha256_hash>",
          "timestamp": "2024-12-13T14:00:00Z",
          "nist_approved": true,
          "quantum_resistant": true
        }
      }
    }
  }
}
```

## Project Structure

```
pharma-verify(v3)/
├── frontend/
│   ├── shared/
│   │   └── crypto/                    # PQC library
│   │       ├── src/
│   │       │   ├── pqc-lib.ts        # Dilithium implementation
│   │       │   ├── wallet.ts         # Cardano wallet integration
│   │       │   └── index.ts
│   │       └── package.json
│   │
│   ├── manufacturer-portal/           # Manufacturer app
│   │   ├── src/
│   │   │   ├── components/
│   │   │   │   ├── Login.ts          # Wallet connection
│   │   │   │   └── RegisterMedicine.ts
│   │   │   ├── services/
│   │   │   │   └── pqc-auth.ts       # PQC authentication
│   │   │   ├── main.ts
│   │   │   └── style.css
│   │   └── package.json
│   │
│   └── consumer-portal/               # Consumer app
│       ├── src/
│       │   ├── components/
│       │   │   └── Verification.ts   # Batch verification
│       │   ├── main.ts
│       │   └── style.css
│       └── package.json
│
├── cardano-integration/
│   └── src/
│       └── pqc-cardano.ts            # PQC + Cardano bridge
│
└── README.md
```

## 🔧 Configuration

### Environment Variables

**Manufacturer Portal** (`.env`):
```env
VITE_BLOCKFROST_PROJECT_ID=preprod_your_key_here
VITE_CARDANO_NETWORK=testnet
```

**Consumer Portal** (`.env`):
```env
VITE_BLOCKFROST_PROJECT_ID=preprod_your_key_here
VITE_CARDANO_NETWORK=testnet
```

## 🧪 Testing

### Manual Testing

1. **Manufacturer Flow**
   - Connect wallet → Generate keypair → Register batch
   - Check IndexedDB for stored keypair
   - Verify transaction on Cardanoscan

2. **Consumer Flow**
   - Enter batch ID → Verify
   - Check signature validation
   - Verify blockchain data matches

### Browser Compatibility

- Chrome/Edge (recommended)
- Firefox
- Brave
- ⚠️ Safari (IndexedDB limitations)

## 🚨 Security Considerations

### Strengths
- Quantum-resistant signatures (Dilithium)
- Immutable blockchain records
- No centralized backend to attack

### ⚠️ Limitations
- Keys stored in browser (not HSM)
- Wallet seed phrase security critical
- No key recovery mechanism

### 🔒 Best Practices
- Use hardware wallet for production
- Regular key rotation
- Backup wallet seed phrase securely

## Comparison: Old vs New Architecture

| Feature | Old (Microservices) | New (Simplified) |
|---------|-------------------|------------------|
| Backend Services | 6+ Node.js services | 0 |
| Docker Containers | Required | Not needed |
| Database | PostgreSQL + Redis | IndexedDB only |
| Authentication | JWT + OAuth2 | Cardano Wallet |
| PQC Implementation | Python service | JavaScript library |
| Deployment | Complex K8s | Static hosting |
| Communication | REST/GraphQL | Direct blockchain |

## 🎓 Learn More

- [CRYSTALS-Dilithium](https://pq-crystals.org/dilithium/)
- [NIST Post-Quantum Cryptography](https://csrc.nist.gov/projects/post-quantum-cryptography)
- [Cardano CIP-25](https://cips.cardano.org/cips/cip25/)
- [Blockfrost API](https://blockfrost.io/)

## 📄 License

MIT License - see LICENSE file for details

## Contributing

This is a simplified architecture for demonstration. For production:
- Implement proper key management (HSM)
- Add comprehensive error handling
- Implement key recovery mechanisms
- Add batch management features
- Integrate with real minting policies

## 📞 Support

For issues or questions, please open a GitHub issue.

email: prodyiki@gmail.com

**Built with ❤️ using Cardano, Post-Quantum Cryptography, and TypeScript**
