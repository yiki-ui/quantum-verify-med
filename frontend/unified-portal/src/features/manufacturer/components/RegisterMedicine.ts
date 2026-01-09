/**
 * Medicine Registration Component with PQC Signatures
 */

import { pqcAuth } from '../services/pqc-auth';
import type { BatchData } from '../../../../../shared/crypto/dist';

export class RegisterMedicineComponent {
  private container: HTMLElement;

  constructor(container: HTMLElement) {
    this.container = container;
    this.render();
  }

  private render(): void {
    const profile = pqcAuth.getProfile();

    this.container.innerHTML = `
      <div class="register-medicine-container">
        <div class="header">
          <h1>📦 Register New Medicine Batch</h1>
          <p>Create a quantum-resistant attestation on Cardano blockchain</p>
        </div>

        <div class="profile-info">
          <p><strong>Manufacturer:</strong> ${profile?.companyName || 'Not set'}</p>
          <p><strong>Wallet:</strong> ${profile?.walletAddress.substring(0, 20)}...</p>
          <p><strong>PQC Key:</strong> ${profile?.pqcKeyId.substring(0, 16)}...</p>
        </div>

        <form id="batch-form" class="batch-form">
          <div class="form-group">
            <label for="batch-id">Batch ID *</label>
            <input 
              type="text" 
              id="batch-id" 
              required 
              placeholder="e.g., BATCH-2024-001"
            />
          </div>

          <div class="form-group">
            <label for="product-name">Product Name *</label>
            <input 
              type="text" 
              id="product-name" 
              required 
              placeholder="e.g., Aspirin 500mg"
            />
          </div>

          <div class="form-row">
            <div class="form-group">
              <label for="quantity">Quantity *</label>
              <input 
                type="number" 
                id="quantity" 
                required 
                min="1"
                placeholder="e.g., 10000"
              />
            </div>

            <div class="form-group">
              <label for="manufacturing-date">Manufacturing Date *</label>
              <input 
                type="date" 
                id="manufacturing-date" 
                required 
              />
            </div>

            <div class="form-group">
              <label for="expiry-date">Expiry Date *</label>
              <input 
                type="date" 
                id="expiry-date" 
                required 
              />
            </div>
          </div>

          <div class="form-group">
            <label for="description">Description (Optional)</label>
            <textarea 
              id="description" 
              rows="3"
              placeholder="Additional information about this batch"
            ></textarea>
          </div>

          <div class="pqc-section">
            <h3>🔐 Post-Quantum Signature</h3>
            <p>This batch will be signed with CRYSTALS-Dilithium and registered on Cardano</p>
            <div class="signature-preview" id="signature-preview" style="display: none;">
              <p><strong>Signature:</strong> <code id="signature-value"></code></p>
              <p><strong>Public Key:</strong> <code id="pubkey-value"></code></p>
              <p><strong>Batch Hash:</strong> <code id="hash-value"></code></p>
            </div>
          </div>

          <div class="form-actions">
            <button type="button" id="preview-btn" class="btn btn-secondary">
              Preview Signature
            </button>
            <button type="submit" class="btn btn-primary">
              Register on Cardano
            </button>
          </div>
        </form>

        <div class="loading" style="display: none;">
          <div class="spinner"></div>
          <p id="loading-text">Processing...</p>
        </div>

        <div class="success" style="display: none;">
          <h2>✅ Batch Registered Successfully!</h2>
          <p>Transaction Hash: <code id="tx-hash"></code></p>
          <p>Your medicine batch has been registered on Cardano with a quantum-resistant signature.</p>
          <button id="register-another" class="btn btn-primary">Register Another Batch</button>
        </div>

        <div class="error" style="display: none;"></div>
      </div>
    `;

    this.attachEventListeners();
  }

  private attachEventListeners(): void {
    const form = this.container.querySelector('#batch-form') as HTMLFormElement;
    const previewBtn = this.container.querySelector('#preview-btn') as HTMLButtonElement;

    previewBtn?.addEventListener('click', () => this.handlePreview());
    form?.addEventListener('submit', (e) => this.handleSubmit(e));

    const registerAnotherBtn = this.container.querySelector('#register-another');
    registerAnotherBtn?.addEventListener('click', () => this.resetForm());
  }

  private async handlePreview(): Promise<void> {
    const batchData = this.getBatchDataFromForm();
    if (!batchData) return;

    try {
      const signatureData = await pqcAuth.signBatchData(batchData);

      // Show signature preview
      const preview = this.container.querySelector('#signature-preview') as HTMLElement;
      const sigValue = this.container.querySelector('#signature-value') as HTMLElement;
      const pubkeyValue = this.container.querySelector('#pubkey-value') as HTMLElement;
      const hashValue = this.container.querySelector('#hash-value') as HTMLElement;

      sigValue.textContent = signatureData.signature.substring(0, 64) + '...';
      pubkeyValue.textContent = signatureData.publicKey.substring(0, 64) + '...';
      hashValue.textContent = signatureData.batchHash;

      preview.style.display = 'block';
    } catch (err: any) {
      this.showError(err.message || 'Failed to generate signature');
    }
  }

  private async handleSubmit(e: Event): Promise<void> {
    e.preventDefault();

    const batchData = this.getBatchDataFromForm();
    if (!batchData) return;

    const loading = this.container.querySelector('.loading') as HTMLElement;
    const loadingText = this.container.querySelector('#loading-text') as HTMLElement;
    const form = this.container.querySelector('#batch-form') as HTMLElement;
    const success = this.container.querySelector('.success') as HTMLElement;

    try {
      // Show loading
      form.style.display = 'none';
      loading.style.display = 'block';
      loadingText.textContent = 'Generating PQC signature...';

      // Sign batch data
      const signatureData = await pqcAuth.signBatchData(batchData);

      // TODO: Integrate with Cardano minting
      loadingText.textContent = 'Minting NFT on Cardano...';
      await this.mintOnCardano(batchData, signatureData);

      // Show success
      loading.style.display = 'none';
      success.style.display = 'block';

      const txHash = this.container.querySelector('#tx-hash') as HTMLElement;
      txHash.textContent = 'mock-tx-' + Date.now(); // Replace with real tx hash
    } catch (err: any) {
      loading.style.display = 'none';
      form.style.display = 'block';
      this.showError(err.message || 'Failed to register batch');
    }
  }

  private getBatchDataFromForm(): BatchData | null {
    const batchId = (this.container.querySelector('#batch-id') as HTMLInputElement)?.value;
    const productName = (this.container.querySelector('#product-name') as HTMLInputElement)?.value;
    const quantity = parseInt((this.container.querySelector('#quantity') as HTMLInputElement)?.value);
    const manufacturingDate = (this.container.querySelector('#manufacturing-date') as HTMLInputElement)?.value;
    const expiryDate = (this.container.querySelector('#expiry-date') as HTMLInputElement)?.value;
    const description = (this.container.querySelector('#description') as HTMLTextAreaElement)?.value;

    if (!batchId || !productName || !quantity || !manufacturingDate || !expiryDate) {
      this.showError('Please fill in all required fields');
      return null;
    }

    const profile = pqcAuth.getProfile();

    return {
      batchId,
      productName,
      manufacturer: profile?.companyName || profile?.walletAddress || 'Unknown',
      quantity,
      manufacturingDate,
      expiryDate,
      description,
    };
  }

  private async mintOnCardano(batchData: BatchData, signatureData: any): Promise<void> {
    // TODO: Implement actual Cardano minting
    // This will be integrated with the Cardano token strategy
    console.log('Minting on Cardano:', { batchData, signatureData });

    // Simulate minting delay
    await new Promise(resolve => setTimeout(resolve, 2000));
  }

  private showError(message: string): void {
    const error = this.container.querySelector('.error') as HTMLElement;
    error.textContent = message;
    error.style.display = 'block';
    setTimeout(() => {
      error.style.display = 'none';
    }, 5000);
  }

  private resetForm(): void {
    const form = this.container.querySelector('#batch-form') as HTMLFormElement;
    const success = this.container.querySelector('.success') as HTMLElement;

    form.reset();
    form.style.display = 'block';
    success.style.display = 'none';

    const preview = this.container.querySelector('#signature-preview') as HTMLElement;
    preview.style.display = 'none';
  }
}

export default RegisterMedicineComponent;
