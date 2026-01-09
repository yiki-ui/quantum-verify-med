/**
 * Consumer Portal - Verification Component
 */

import { pqcManager } from '../../../../../shared/crypto/dist';
import { CardanoVerificationService } from '../services/cardano-verification';

export class VerificationComponent {
  private container: HTMLElement;
  private cardanoService: CardanoVerificationService;

  constructor(container: HTMLElement) {
    this.container = container;

    // Initialize Cardano service
    const projectId = import.meta.env.VITE_BLOCKFROST_PROJECT_ID || 'preprodDemoKey';
    this.cardanoService = new CardanoVerificationService(projectId, 'testnet');

    this.render();
  }

  private render(): void {
    this.container.innerHTML = `
      <div class="verification-container">
        <div class="verification-card">
          <h1>🔍 Verify Medicine Authenticity</h1>
          <p class="subtitle">Check if your medicine is genuine using quantum-resistant verification</p>

          <div class="search-section">
            <div class="search-box">
              <input 
                type="text" 
                id="batch-id-input" 
                placeholder="Enter Batch ID (e.g., BATCH-2024-001)"
                class="batch-input"
              />
              <button id="verify-btn" class="btn btn-primary">
                Verify
              </button>
            </div>

            <div class="qr-option">
              <p>or</p>
              <button id="scan-qr-btn" class="btn btn-secondary">
                📷 Scan QR Code
              </button>
            </div>
          </div>

          <div class="loading" style="display: none;">
            <div class="spinner"></div>
            <p>Verifying batch on Cardano blockchain...</p>
          </div>

          <div class="result" style="display: none;">
            <!-- Result will be displayed here -->
          </div>

          <div class="error" style="display: none;"></div>

          <div class="info-section">
            <h3>How it works</h3>
            <div class="steps">
              <div class="step">
                <span class="step-number">1</span>
                <p>Enter the batch ID from your medicine package</p>
              </div>
              <div class="step">
                <span class="step-number">2</span>
                <p>We verify the batch on Cardano blockchain</p>
              </div>
              <div class="step">
                <span class="step-number">3</span>
                <p>Post-quantum signature is validated</p>
              </div>
              <div class="step">
                <span class="step-number">4</span>
                <p>You get instant authenticity confirmation</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;

    this.attachEventListeners();
  }

  private attachEventListeners(): void {
    const verifyBtn = this.container.querySelector('#verify-btn');
    const batchInput = this.container.querySelector('#batch-id-input') as HTMLInputElement;
    const scanQrBtn = this.container.querySelector('#scan-qr-btn');

    verifyBtn?.addEventListener('click', () => this.handleVerify());
    batchInput?.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') this.handleVerify();
    });
    scanQrBtn?.addEventListener('click', () => this.handleScanQR());
  }

  private async handleVerify(): Promise<void> {
    const batchInput = this.container.querySelector('#batch-id-input') as HTMLInputElement;
    const batchId = batchInput.value.trim();

    if (!batchId) {
      this.showError('Please enter a batch ID');
      return;
    }

    const loading = this.container.querySelector('.loading') as HTMLElement;
    const result = this.container.querySelector('.result') as HTMLElement;
    const error = this.container.querySelector('.error') as HTMLElement;

    try {
      // Show loading
      loading.style.display = 'block';
      result.style.display = 'none';
      error.style.display = 'none';

      // Verify on Cardano
      const verification = await this.cardanoService.verifyBatchPQC(batchId);

      if (!verification.valid || !verification.pqcData) {
        throw new Error('Batch not found or invalid');
      }

      // Verify PQC signature
      const batchData = verification.metadata['721'][Object.keys(verification.metadata['721'])[0]][batchId];
      const isSignatureValid = await this.verifyPQCSignature(
        batchData.attributes,
        verification.pqcData
      );

      // Show result
      loading.style.display = 'none';
      this.showResult(batchData, verification.pqcData, isSignatureValid);
    } catch (err: any) {
      loading.style.display = 'none';
      this.showError(err.message || 'Verification failed');
    }
  }

  private async verifyPQCSignature(batchData: any, pqcData: any): Promise<boolean> {
    try {
      // Reconstruct batch data for verification
      const dataToVerify = {
        batchId: batchData.batch_id,
        productName: batchData.product_name,
        manufacturer: batchData.manufacturer,
        quantity: batchData.quantity,
        manufacturingDate: batchData.manufacturing_date,
        expiryDate: batchData.expiry_date,
      };

      // Verify signature
      const signatureBytes = this.hexToBytes(pqcData.signature);
      const publicKeyBytes = this.hexToBytes(pqcData.publicKey);

      return await pqcManager.verify(dataToVerify, signatureBytes, publicKeyBytes);
    } catch (error) {
      console.error('Signature verification error:', error);
      return false;
    }
  }

  private showResult(batchData: any, pqcData: any, signatureValid: boolean): void {
    const result = this.container.querySelector('.result') as HTMLElement;

    const statusClass = signatureValid ? 'success' : 'warning';
    const statusIcon = signatureValid ? '✅' : '⚠️';
    const statusText = signatureValid ? 'Authentic' : 'Signature Invalid';

    result.innerHTML = `
      <div class="result-card ${statusClass}">
        <div class="result-header">
          <span class="status-icon">${statusIcon}</span>
          <h2>${statusText}</h2>
        </div>

        <div class="batch-details">
          <h3>Batch Information</h3>
          <div class="detail-grid">
            <div class="detail-item">
              <label>Batch ID:</label>
              <p>${batchData.attributes.batch_id}</p>
            </div>
            <div class="detail-item">
              <label>Product:</label>
              <p>${batchData.attributes.product_name}</p>
            </div>
            <div class="detail-item">
              <label>Manufacturer:</label>
              <p>${batchData.attributes.manufacturer}</p>
            </div>
            <div class="detail-item">
              <label>Quantity:</label>
              <p>${batchData.attributes.quantity} units</p>
            </div>
            <div class="detail-item">
              <label>Manufacturing Date:</label>
              <p>${new Date(batchData.attributes.manufacturing_date).toLocaleDateString()}</p>
            </div>
            <div class="detail-item">
              <label>Expiry Date:</label>
              <p>${new Date(batchData.attributes.expiry_date).toLocaleDateString()}</p>
            </div>
          </div>
        </div>

        <div class="pqc-details">
          <h3>🔐 Post-Quantum Security</h3>
          <div class="security-badges">
            <span class="badge">NIST Approved</span>
            <span class="badge">Quantum Resistant</span>
            <span class="badge">${pqcData.algorithm}</span>
          </div>
          <div class="detail-grid">
            <div class="detail-item full-width">
              <label>Signature Status:</label>
              <p class="${signatureValid ? 'valid' : 'invalid'}">
                ${signatureValid ? '✓ Valid Dilithium Signature' : '✗ Invalid Signature'}
              </p>
            </div>
            <div class="detail-item full-width">
              <label>Public Key:</label>
              <p class="monospace">${pqcData.publicKey.substring(0, 64)}...</p>
            </div>
            <div class="detail-item full-width">
              <label>Batch Hash:</label>
              <p class="monospace">${pqcData.batchHash}</p>
            </div>
          </div>
        </div>

        <div class="blockchain-info">
          <h3>⛓️ Blockchain Verification</h3>
          <p>✓ Verified on Cardano testnet</p>
          <p>✓ Immutable attestation recorded</p>
        </div>

        <button id="verify-another" class="btn btn-primary">
          Verify Another Batch
        </button>
      </div>
    `;

    result.style.display = 'block';

    const verifyAnotherBtn = result.querySelector('#verify-another');
    verifyAnotherBtn?.addEventListener('click', () => {
      result.style.display = 'none';
      (this.container.querySelector('#batch-id-input') as HTMLInputElement).value = '';
    });
  }

  private handleScanQR(): void {
    this.showError('QR scanning feature coming soon! Please enter batch ID manually.');
  }

  private showError(message: string): void {
    const error = this.container.querySelector('.error') as HTMLElement;
    error.textContent = message;
    error.style.display = 'block';
    setTimeout(() => {
      error.style.display = 'none';
    }, 5000);
  }

  private hexToBytes(hex: string): Uint8Array {
    const bytes = new Uint8Array(hex.length / 2);
    for (let i = 0; i < hex.length; i += 2) {
      bytes[i / 2] = parseInt(hex.substr(i, 2), 16);
    }
    return bytes;
  }
}

export default VerificationComponent;
