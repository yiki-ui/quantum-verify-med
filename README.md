# Quantum Verify Med — Blockchain-Powered Pharmaceutical Verification

A **unified** pharmaceutical verification platform using **Cardano blockchain**, **post-quantum cryptography (PQC)**, and a **Groq-powered AI assistant** for quantum-resistant, tamper-proof medicine authentication.

---

## ✨ Key Features

| Feature | Description |
|---|---|
| **Post-Quantum Security** | CRYSTALS-Dilithium (ML-DSA-65) signatures — NIST FIPS 204 approved |
| **Cardano NFT Attestation** | Each batch is minted as a CIP-25 NFT with embedded PQC signatures |
| **Three-Role Unified Portal** | Manufacturer, Consumer (Pharmacy), and Regulator portals in one app |
| **Context-Aware AI Assistant** | Groq LLaMA 3.3 70B — aware of the active medicine or batch in view |
| **PDF Report Generation** | Downloadable verification/batch reports via native jsPDF rendering |
| **QR Code Integration** | Auto-generates QR codes for product packaging during batch minting |
| **Web3Auth (Google OAuth)** | Passwordless Google Sign-In for consumers via Web3Auth |
| **Cardano Wallet Auth** | Connect with Nami, Eternl, or any CIP-30 compatible wallet |
| **Zero Docker** | No containers, no orchestration — runs with a single shell script |

---

## Architecture

```
┌──────────────────────────────────────────────────────────────────────┐
│                     Unified Portal (Vite + React + TypeScript)        │
├────────────────────┬──────────────────────┬──────────────────────────┤
│  Manufacturer      │  Consumer (Pharmacy)  │  Regulator               │
│  - Batch Register  │  - QR/Batch Verify    │  - Supply Chain Audit    │
│  - PQC Signing     │  - AI Medicine Chat   │  - Counterfeit Alerts    │
│  - NFT Minting     │  - PDF Report DL      │  - Regulatory Analysis   │
│  - Batch Dashboard │  - Blockchain Proof   │  - AI Regulator Mode     │
│  - AI Batch Chat   │                       │                          │
│  - PDF Report DL   │                       │                          │
└────────────────────┴──────────────────────┴──────────────────────────┘
           │                      │                       │
           └──────────────────────┴───────────────────────┘
                                  │
                  ┌───────────────┴───────────────┐
                  │   Shared PQC Crypto Library    │
                  │   - CRYSTALS-Dilithium         │
                  │   - IndexedDB Key Storage      │
                  │   - Cardano Wallet CIP-30      │
                  └───────────────┬───────────────┘
                                  │
           ┌──────────────────────┴───────────────────────┐
           │             External Services                  │
           ├──────────────────────┬───────────────────────┤
           │  Cardano Blockchain  │   Groq AI API          │
           │  (Testnet/Mainnet)   │   (LLaMA 3.3 70B)     │
           │  - Blockfrost API    │   - Direct browser     │
           │  - NFT Minting       │     requests           │
           └──────────────────────┴───────────────────────┘
```

---

## 🚀 Quick Start

### Prerequisites
- **Node.js 20+**
- A Cardano wallet extension (Nami, Eternl, or any CIP-30 wallet) — optional for demo mode
- API Keys (see Environment Variables below)

### One-Command Start ✅ (Recommended)

```bash
./start-all.sh
```

This builds the shared PQC crypto library and starts the unified portal.

### Manual Start

```bash
# 1. Build the shared PQC crypto library
cd frontend/shared/crypto
npm install && npm run build

# 2. Install & start the unified portal
cd ../unified-portal
npm install
npm run dev
```

App opens at **http://localhost:5173**

---

## 🔧 Environment Variables

Create `frontend/unified-portal/.env` with the following:

```env
# Cardano / Blockfrost
VITE_BLOCKFROST_PROJECT_ID=preprodYourBlockfrostKeyHere
VITE_CARDANO_NETWORK=testnet

# Groq AI Assistant (get free key at console.groq.com)
VITE_GROQ_API_KEY=gsk_YourGroqApiKeyHere

# Web3Auth Google OAuth (optional — for Google login)
# Get client ID from dashboard.web3auth.io
VITE_WEB3AUTH_CLIENT_ID=your_web3auth_client_id_here
```

> **Note:** Without `VITE_GROQ_API_KEY`, the AI assistant will not respond. Without `VITE_WEB3AUTH_CLIENT_ID`, the Google login button will be disabled — demo logins will still work.

---

## 📱 Usage

### Login Options

| Method | Role Assigned | Notes |
|---|---|---|
| Demo Manufacturer | Manufacturer | No wallet needed |
| Demo Consumer | Pharmacy / Consumer | No wallet needed |
| Demo Regulator | Regulator | No wallet needed |
| Nami / Eternl Wallet | Pharmacy / Consumer | CIP-30 wallet required |
| Google (Web3Auth) | Pharmacy / Consumer | Requires `VITE_WEB3AUTH_CLIENT_ID` |

---

### 🏭 Manufacturer Portal

1. **Register Batch** — Select a medicine, enter quantity and dates, generate a PQC (Dilithium) quantum signature
2. **Mint to Cardano** — Mint the signed batch as a CIP-25 NFT on the Cardano blockchain
3. **Download QR Code** — Print QR code on packaging for consumer scanning
4. **Download PDF Report** — Get a complete batch attestation PDF with blockchain details
5. **Batch Dashboard** — Monitor all registered batches and their on-chain status
6. **AI Batch Assistant** — Context-aware AI that knows the selected medicine you are registering

### 💊 Consumer Portal

1. **Scan or Enter Batch ID** — Use camera QR scan or manually type the batch number
2. **View Verification Result** — See authenticity status, product details, and blockchain proof
3. **AI Medicine Assistant** — Ask the AI about the specific verified medicine (dosage, interactions, storage)
4. **Download PDF Report** — Save or share a verification report with all authentication details

### 🏛️ Regulator Portal

1. **Supply Chain Dashboard** — Monitor all batches and flag suspicious patterns
2. **Counterfeit Detection** — Identify batches with invalid PQC signatures
3. **AI Regulator Assistant** — Risk-focused, data-driven pharmaceutical analysis AI

---

## 🤖 AI Assistant

The AI assistant is powered by **Groq's LLaMA 3.3 70B** model, running entirely from direct browser requests (no server middleware).

### Modes
| Context | AI Behaviour |
|---|---|
| No medicine selected | General pharmaceutical knowledge assistant |
| After batch selected (Manufacturer) | GMP, batch registration, and supply chain expert |
| After medicine verified (Consumer) | Answers questions about the specific verified medicine |
| Regulator portal | Risk analysis, pharmacovigilance, and regulatory compliance focus |

### Context Injection
The AI is given a hidden system prompt that automatically includes medicine data (name, active ingredient, dosage, batch number, verification status) from the currently active page — no manual input required.

---

## 📄 PDF Report Generation

Both portals generate professional PDF reports using native **jsPDF** drawing (no html2canvas):

| Portal | Report Contains |
|---|---|
| **Consumer** | Verification status, product info, batch details, blockchain TX hash, quantum signature validity |
| **Manufacturer** | Batch number, blockchain details, policy ID, TX hash, embedded QR code, security attestations |

> Reports are fully text-searchable and render instantly without any CSS compatibility issues.

---

## ⚛️ Post-Quantum Cryptography

**Algorithm:** CRYSTALS-Dilithium (ML-DSA-65)

- **Standard**: NIST FIPS 204
- **Security Level**: 128-bit quantum security
- **Library**: `@noble/post-quantum`

### Flow
```
[Manufacturer]                    [Cardano Blockchain]          [Consumer]
Generate Dilithium Keypair ──►    Mint NFT with embedded   ──► Retrieve NFT Metadata
Sign Batch Data                   PQC Signature + Metadata      Verify Dilithium Sig
Store Private Key (IndexedDB)                                    Display Result
```

---

## ⛓️ Cardano NFT Metadata (CIP-25 + PQC Extension)

```json
{
  "721": {
    "<policy_id>": {
      "<batch_id>": {
        "name": "Aspirin 500mg - BT-1717000000000",
        "description": "Batch attestation — PharmaVerify",
        "attributes": {
          "batch_id": "BT-1717000000000",
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
          "nist_approved": true,
          "quantum_resistant": true
        }
      }
    }
  }
}
```

---

## 🗂️ Project Structure

```
quantum-verify-med/
├── start-all.sh                        # One-command launcher
│
├── frontend/
│   ├── shared/
│   │   └── crypto/                     # Shared PQC crypto library
│   │       ├── src/
│   │       │   ├── pqc-lib.ts          # Dilithium implementation
│   │       │   ├── wallet.ts           # Cardano wallet CIP-30
│   │       │   └── index.ts
│   │       └── package.json
│   │
│   └── unified-portal/                 # Main React application
│       ├── src/
│       │   ├── components/
│       │   │   ├── ChatWidget.tsx       # Context-aware AI assistant
│       │   │   └── ProtectedRoute.tsx   # Role-based route guard
│       │   ├── features/
│       │   │   ├── manufacturer/        # Manufacturer portal
│       │   │   │   ├── components/
│       │   │   │   │   ├── BatchRegistration.tsx
│       │   │   │   │   ├── BatchDashboard.tsx
│       │   │   │   │   ├── CardanoMintingFlow.tsx  # PDF + QR generation
│       │   │   │   │   └── QuantumSignatureDisplay.tsx
│       │   │   │   └── ManufacturerEntry.tsx
│       │   │   ├── consumer/            # Consumer portal
│       │   │   │   ├── components/
│       │   │   │   │   ├── VerificationResultDisplay.tsx  # PDF generation
│       │   │   │   │   └── QRScanner.tsx
│       │   │   │   └── ConsumerEntry.tsx
│       │   │   └── regulator/           # Regulator portal
│       │   │       └── RegulatorEntry.tsx
│       │   ├── lib/
│       │   │   └── auth.ts              # Auth context & session management
│       │   └── App.tsx                  # Router + Auth provider
│       ├── .env                         # API keys (gitignored)
│       └── package.json
│
└── README.md
```

---

## 🔒 Security Notes

### Strengths
- Quantum-resistant digital signatures (NIST-approved Dilithium)
- Immutable on-chain batch records
- No centralized backend database to attack
- AI API key is client-side — use a restricted Groq key in production

### ⚠️ Limitations
- Private keys stored in browser IndexedDB (not HSM)
- No key recovery mechanism — wallet seed phrase is critical
- Groq API key is exposed in the browser bundle — restrict via Groq dashboard in production

### Production Recommendations
- Use a hardware security module (HSM) for private key storage
- Route AI requests through a secure backend proxy to hide the API key
- Implement key rotation and recovery mechanisms

---

## 🧪 Demo Mode

No wallet or API key needed to explore the app. Use the demo buttons on the login page:
- **Demo Manufacturer** — Full batch registration and minting flow
- **Demo Consumer** — Medicine verification and AI assistant
- **Demo Regulator** — Supply chain monitoring dashboard

---

## 🎓 References

- [CRYSTALS-Dilithium](https://pq-crystals.org/dilithium/)
- [NIST Post-Quantum Cryptography — FIPS 204](https://csrc.nist.gov/pubs/fips/204/final)
- [Cardano CIP-25 NFT Standard](https://cips.cardano.org/cips/cip25/)
- [Blockfrost API](https://blockfrost.io/)
- [Groq API](https://console.groq.com/)
- [Web3Auth](https://web3auth.io/)

---

## 📄 License

MIT License — see LICENSE file for details.

---

**Built with ❤️ using Cardano, Post-Quantum Cryptography, Groq AI, and TypeScript**

> Contact: prodyiki@gmail.com
