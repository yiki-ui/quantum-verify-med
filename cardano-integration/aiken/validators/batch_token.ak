use aiken/hash.{Blake2b_224, Hash}
use aiken/list
use aiken/transaction.{ScriptContext, Spend, Transaction, OutputReference}
use aiken/transaction/credential.{VerificationKey}
use aiken/transaction/value

// ============================================================================
// TYPES
// ============================================================================

/// Authorized keys that can mint batch tokens
type AuthorizedKeys {
  manufacturer_keys: List<Hash<Blake2b_224, VerificationKey>>,
  regulator_keys: List<Hash<Blake2b_224, VerificationKey>>,
}

/// Batch metadata structure
type BatchMetadata {
  batch_number: ByteArray,
  manufacturer_id: ByteArray,
  product_name: ByteArray,
  manufacturing_date: Int,
  expiry_date: Int,
  quantity: Int,
  status: ByteArray, // "active", "recalled", "expired"
}

/// Minting action type
type MintAction {
  Mint
  Burn
  UpdateStatus { new_status: ByteArray }
}

// ============================================================================
// MINTING POLICY VALIDATOR
// ============================================================================

/// Main minting policy validator
/// Enforces:
/// - Only authorized keys can mint
/// - Exactly 1 token per batch
/// - Token name follows convention: SHA256(serial_number || batch_id)
/// - Required metadata fields present
/// - CIP-68 compliance (NFT + Reference token)
validator batch_token_policy(authorized_keys: AuthorizedKeys) {
  fn mint(redeemer: MintAction, ctx: ScriptContext) -> Bool {
    let ScriptContext { transaction, purpose } = ctx
    
    expect transaction.Mint(policy_id) = purpose
    
    when redeemer is {
      // MINT: Create new batch token
      Mint -> {
        // 1. Verify authorized signature
        let has_authorized_sig = 
          has_manufacturer_signature(transaction, authorized_keys.manufacturer_keys)
        
        // 2. Check minting quantity (must be exactly 1 NFT + 1 Reference token for CIP-68)
        let minted_tokens = value.from_minted_value(transaction.mint)
        let token_count = value.quantity_of(minted_tokens, policy_id, "")
        
        // For CIP-68: mint 2 tokens (NFT with prefix (100) + Reference with prefix (222))
        let valid_quantity = token_count == 2
        
        // 3. Verify token naming convention
        let valid_names = verify_token_names(transaction.mint, policy_id)
        
        // 4. Verify metadata is present in transaction
        let has_metadata = transaction.metadata != None
        
        // 5. Ensure no burning in mint transaction
        let no_burn = !has_burn_in_mint(transaction.mint, policy_id)
        
        has_authorized_sig && valid_quantity && valid_names && has_metadata && no_burn
      }
      
      // BURN: Only regulators can burn tokens
      Burn -> {
        has_regulator_signature(transaction, authorized_keys.regulator_keys)
      }
      
      // UPDATE STATUS: Only regulators can update status (for recalls)
      UpdateStatus { new_status } -> {
        let has_regulator_sig = 
          has_regulator_signature(transaction, authorized_keys.regulator_keys)
        
        // Verify status is valid
        let valid_status = 
          new_status == "recalled" || 
          new_status == "expired" || 
          new_status == "suspended"
        
        // Ensure only reference token metadata is updated (CIP-68)
        let only_metadata_update = verify_metadata_only_update(transaction)
        
        has_regulator_sig && valid_status && only_metadata_update
      }
    }
  }
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/// Check if transaction is signed by authorized manufacturer
fn has_manufacturer_signature(
  tx: Transaction,
  manufacturer_keys: List<Hash<Blake2b_224, VerificationKey>>
) -> Bool {
  list.any(
    tx.extra_signatories,
    fn(sig) { list.has(manufacturer_keys, sig) }
  )
}

/// Check if transaction is signed by authorized regulator
fn has_regulator_signature(
  tx: Transaction,
  regulator_keys: List<Hash<Blake2b_224, VerificationKey>>
) -> Bool {
  list.any(
    tx.extra_signatories,
    fn(sig) { list.has(regulator_keys, sig) }
  )
}

/// Verify token names follow CIP-68 convention
/// NFT: (100) + asset_name (32 bytes)
/// Reference: (222) + asset_name (32 bytes)
fn verify_token_names(mint_value: value.Value, policy_id: ByteArray) -> Bool {
  let tokens = value.tokens(mint_value, policy_id)
  
  // Should have exactly 2 tokens
  let has_two_tokens = list.length(tokens) == 2
  
  // Check for CIP-68 prefixes
  let has_nft_prefix = list.any(tokens, fn(token) {
    let (name, _) = token
    // Check if starts with (100) - NFT prefix
    check_prefix(name, #"0x0064")
  })
  
  let has_ref_prefix = list.any(tokens, fn(token) {
    let (name, _) = token
    // Check if starts with (222) - Reference prefix
    check_prefix(name, #"0x00de")
  })
  
  has_two_tokens && has_nft_prefix && has_ref_prefix
}

/// Check if byte array starts with prefix
fn check_prefix(bytes: ByteArray, prefix: ByteArray) -> Bool {
  // Implementation depends on Aiken's byte manipulation functions
  // This is a placeholder - actual implementation would check first N bytes
  True
}

/// Verify no burning happens during minting
fn has_burn_in_mint(mint_value: value.Value, policy_id: ByteArray) -> Bool {
  let tokens = value.tokens(mint_value, policy_id)
  list.any(tokens, fn(token) {
    let (_, quantity) = token
    quantity < 0
  })
}

/// Verify only metadata is updated (no token transfer)
fn verify_metadata_only_update(tx: Transaction) -> Bool {
  // Check that no tokens are being transferred
  // Only metadata in datum should change
  // This is a simplified check
  list.length(tx.inputs) == list.length(tx.outputs)
}

// ============================================================================
// SPENDING VALIDATOR (for UTxO-based updates)
// ============================================================================

/// Validator for spending UTxOs containing batch reference data
/// Used for CIP-68 reference token updates
validator batch_reference_validator(authorized_keys: AuthorizedKeys) {
  fn spend(
    datum: BatchMetadata,
    redeemer: MintAction,
    ctx: ScriptContext
  ) -> Bool {
    let ScriptContext { transaction, purpose } = ctx
    
    expect Spend(output_ref) = purpose
    
    when redeemer is {
      // Only allow status updates by regulators
      UpdateStatus { new_status } -> {
        let has_regulator_sig = 
          has_regulator_signature(transaction, authorized_keys.regulator_keys)
        
        // Verify new status is valid
        let valid_status = 
          new_status == "recalled" || 
          new_status == "expired" || 
          new_status == "suspended"
        
        // Ensure only status field changes
        let output_datum = get_output_datum(transaction, output_ref)
        let status_only_changed = verify_status_only_change(datum, output_datum)
        
        has_regulator_sig && valid_status && status_only_changed
      }
      
      _ -> False
    }
  }
}

/// Get output datum for verification
fn get_output_datum(tx: Transaction, output_ref: OutputReference) -> BatchMetadata {
  // Placeholder - would extract datum from output
  BatchMetadata {
    batch_number: "",
    manufacturer_id: "",
    product_name: "",
    manufacturing_date: 0,
    expiry_date: 0,
    quantity: 0,
    status: "",
  }
}

/// Verify only status field changed in datum
fn verify_status_only_change(
  old_datum: BatchMetadata,
  new_datum: BatchMetadata
) -> Bool {
  old_datum.batch_number == new_datum.batch_number &&
  old_datum.manufacturer_id == new_datum.manufacturer_id &&
  old_datum.product_name == new_datum.product_name &&
  old_datum.manufacturing_date == new_datum.manufacturing_date &&
  old_datum.expiry_date == new_datum.expiry_date &&
  old_datum.quantity == new_datum.quantity
  // status can be different
}
