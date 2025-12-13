# Aiken Validator Setup Guide

## Prerequisites

1. **Install Aiken**
```bash
# On Linux/macOS
curl --proto '=https' --tlsv1.2 -LsSf https://install.aiken-lang.org | sh

# On Windows (using WSL)
wsl curl --proto '=https' --tlsv1.2 -LsSf https://install.aiken-lang.org | sh
```

2. **Verify Installation**
```bash
aiken --version
```

## Building the Validators

### 1. Navigate to Aiken Directory
```bash
cd cardano-integration/aiken
```

### 2. Configure Authorized Keys

Edit `aiken.toml` and add your authorized keys:

```toml
[[config.parameters]]
title = "manufacturer_keys"
description = "List of authorized manufacturer public key hashes"
type = "List<ByteArray>"
value = [
  "abcd1234...",  # Manufacturer 1 key hash
  "efgh5678...",  # Manufacturer 2 key hash
]

[[config.parameters]]
title = "regulator_keys"
description = "List of authorized regulator public key hashes"
type = "List<ByteArray>"
value = [
  "ijkl9012...",  # Regulator 1 key hash
  "mnop3456...",  # Regulator 2 key hash
]
```

### 3. Build Validators
```bash
aiken build
```

This generates `plutus.json` with compiled validators.

### 4. Run Tests
```bash
aiken check
```

## Extracting Policy ID

After building, extract the policy ID:

```bash
# The policy ID is in plutus.json
cat plutus.json | jq '.validators[] | select(.title == "batch_token_policy.mint") | .hash'
```

## Integration with Backend

### 1. Update Environment Variables

Add to `.env`:
```env
# Aiken Validator
AIKEN_POLICY_ID=<policy_id_from_plutus_json>
MANUFACTURER_WALLET_MNEMONIC=word1 word2 word3 ... word24
REGULATOR_WALLET_MNEMONIC=word1 word2 word3 ... word24
```

### 2. Use in Backend

```typescript
import { AikenTokenStrategy } from './aiken-token-strategy';

const tokenStrategy = new AikenTokenStrategy(
  process.env.BLOCKFROST_PROJECT_ID!,
  'testnet',
  process.env.MANUFACTURER_WALLET_MNEMONIC
);

// Mint batch token
const result = await tokenStrategy.mintBatchToken(
  'BATCH-2024-001',
  {
    name: 'Aspirin 500mg - Batch 001',
    description: 'Pharmaceutical batch',
    image: 'ipfs://...',
    batchId: 'BATCH-2024-001',
    manufacturer: 'PharmaCorp',
    manufacturingDate: '2024-12-01',
    expiryDate: '2026-12-01',
    quantity: 10000,
    status: 'active',
  },
  manufacturerKeyHash
);
```

## Validator Logic

### Minting Rules
✅ Only authorized manufacturer keys can mint
✅ Exactly 2 tokens minted (NFT + Reference for CIP-68)
✅ Token names follow CIP-68 convention:
  - NFT: `(100)` + SHA256(serial || batch_id)
  - Reference: `(222)` + SHA256(serial || batch_id)
✅ Metadata must be present
✅ No burning during mint

### Update Rules
✅ Only regulator keys can update status
✅ Valid statuses: `recalled`, `expired`, `suspended`
✅ Only status field can change (immutable batch data)
✅ Reference token datum updated

### Burn Rules
✅ Only regulators can burn tokens
✅ Used for permanent removal from circulation

## CIP-68 Token Structure

### NFT Token (User-Facing)
- **Prefix**: `(100)` = `0x0064`
- **Name**: `0064` + SHA256(serial || batch_id)
- **Quantity**: 1
- **Metadata**: CIP-25 format (name, image, description)

### Reference Token (Data Storage)
- **Prefix**: `(222)` = `0x00de`
- **Name**: `0x00de` + SHA256(serial || batch_id)
- **Quantity**: 1
- **Datum**: Batch metadata (mutable status field)

## Testing Validators

### Unit Tests
```bash
cd cardano-integration/aiken
aiken check
```

### Integration Tests
```bash
# Test minting
npm run test:mint

# Test status update
npm run test:update

# Test verification
npm run test:verify
```

## Deployment Checklist

- [ ] Build Aiken validators
- [ ] Extract policy ID
- [ ] Configure authorized keys
- [ ] Test on testnet
- [ ] Verify CIP-68 compliance
- [ ] Test recall flow
- [ ] Deploy to mainnet
- [ ] Update frontend with policy ID

## Troubleshooting

### Validator Not Found
```bash
# Rebuild validators
cd cardano-integration/aiken
aiken build
```

### Invalid Signature Error
- Verify manufacturer/regulator key hash is in authorized list
- Check that transaction includes required signer

### CIP-68 Naming Error
- Ensure asset names have correct prefixes
- Verify SHA256 hash generation

## Resources

- [Aiken Documentation](https://aiken-lang.org)
- [CIP-68 Specification](https://cips.cardano.org/cips/cip68/)
- [MeshJS Documentation](https://meshjs.dev)
- [Blockfrost API](https://blockfrost.io)
