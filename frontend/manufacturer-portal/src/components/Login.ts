/**
 * Manufacturer Portal - Login/Registration Component
 */

import { pqcAuth } from '../services/pqc-auth';
import { walletManager, pqcManager } from '../../../shared/crypto/dist';

export class LoginComponent {
  private container: HTMLElement;
  private onLoginSuccess: (profile: any) => void;

  constructor(container: HTMLElement, onLoginSuccess: (profile: any) => void) {
    this.container = container;
    this.onLoginSuccess = onLoginSuccess;
    this.render();
  }

  private render(): void {
    this.updateWalletList();

    // Poll for wallets in case they are injected asynchronously
    let attempts = 0;
    const maxAttempts = 10;
    const interval = setInterval(() => {
      attempts++;
      const wallets = pqcAuth.getAvailableWallets();
      if (wallets.length > 0 || attempts >= maxAttempts) {
        this.updateWalletList();
        if (wallets.length > 0) clearInterval(interval);
      }
      if (attempts >= maxAttempts) clearInterval(interval);
    }, 500);
  }

  private updateWalletList(): void {
    const wallets = pqcAuth.getAvailableWallets();

    this.container.innerHTML = `
      <div class="login-container">
        <div class="login-card">
          <h1>🏭 Manufacturer Portal</h1>
          <p class="subtitle">Connect your Cardano wallet to register medicines with post-quantum signatures</p>
          
          <div class="wallet-section">
            <h2>Connect Wallet</h2>
            ${wallets.length > 0 ? `
              <div class="wallet-list">
                ${wallets.map(wallet => `
                  <button class="wallet-button" data-wallet="${wallet.name}">
                    <span class="wallet-icon">${wallet.icon}</span>
                    <span class="wallet-name">${wallet.name}</span>
                  </button>
                `).join('')}
              </div>
            ` : `
              <div class="no-wallets">
                <p>⚠️ No Cardano wallets detected</p>
                <p class="help-text">Please install a Cardano wallet extension:</p>
                <ul>
                  <li><a href="https://namiwallet.io" target="_blank">Nami Wallet</a></li>
                  <li><a href="https://eternl.io" target="_blank">Eternl Wallet</a></li>
                  <li><a href="https://flint-wallet.com" target="_blank">Flint Wallet</a></li>
                </ul>
                <button id="refresh-wallets" class="btn-secondary mt-4" style="margin-top: 1rem; padding: 0.5rem 1rem; cursor: pointer;">🔄 Refresh Wallets</button>
                <button id="dev-wallet" class="btn-secondary mt-4" style="margin-top: 1rem; margin-left: 10px; padding: 0.5rem 1rem; cursor: pointer; background: #4b5563;">🤖 Connect Dev Wallet</button>
                
                <div style="margin-top: 20px; padding: 10px; background: rgba(255, 255, 255, 0.05); border-radius: 5px; text-align: left;">
                    <strong>🛠️ Troubleshooting:</strong>
                    <ul style="margin: 5px 0; padding-left: 20px; font-size: 0.9em; color: #ccc;">
                        <li>If you have <strong>Nami</strong> installed but don't see it, try <strong>disabling Lace</strong> temporarily. They can conflict.</li>
                        <li>Ensure the extension has "Site Access" enabled for localhost.</li>
                        <li>Restart your browser if you just installed the extension.</li>
                    </ul>
                </div>

                <div style="margin-top: 20px; padding: 10px; background: rgba(0,0,0,0.2); border-radius: 5px; font-family: monospace; font-size: 12px; text-align: left;">
                    <strong>🕵️ Debug Info:</strong><br/>
                    window.cardano: ${(window as any).cardano ? '✅ Present' : '❌ Missing'}<br/>
                    Keys: ${(window as any).cardano ? Object.keys((window as any).cardano).join(', ') : 'N/A'}<br/>
                    User Agent: ${navigator.userAgent}
                </div>
              </div>
            `}
          </div>

          <div class="company-section" style="display: none;">
            <h2>Company Information (Optional)</h2>
            <input 
              type="text" 
              id="company-name" 
              placeholder="Enter your company name"
              class="company-input"
            />
          </div>

          <div class="pqc-info">
            <h3>🔐 Post-Quantum Security</h3>
            <p>Your account will be secured with CRYSTALS-Dilithium quantum-resistant signatures</p>
          </div>

          <div class="loading" style="display: none;">
            <div class="spinner"></div>
            <p>Connecting wallet...</p>
          </div>

          <div class="error" style="display: none;"></div>
        </div>
      </div>
    `;

    this.attachEventListeners();
  }

  private attachEventListeners(): void {
    const walletButtons = this.container.querySelectorAll('.wallet-button');
    const refreshBtn = this.container.querySelector('#refresh-wallets');
    const devBtn = this.container.querySelector('#dev-wallet');

    walletButtons.forEach(button => {
      button.addEventListener('click', async (e) => {
        const walletName = (e.currentTarget as HTMLElement).dataset.wallet;
        if (walletName) {
          await this.handleWalletConnect(walletName);
        }
      });
    });

    refreshBtn?.addEventListener('click', () => {
      this.updateWalletList();
    });

    devBtn?.addEventListener('click', async () => {
      await this.handleDevWalletConnect();
    });
  }

  private async handleDevWalletConnect(): Promise<void> {
    const loading = this.container.querySelector('.loading') as HTMLElement;
    const loadingText = loading.querySelector('p') as HTMLElement;
    const error = this.container.querySelector('.error') as HTMLElement;
    const companyInput = this.container.querySelector('#company-name') as HTMLInputElement;

    try {
      loading.style.display = 'block';
      error.style.display = 'none';
      loadingText.textContent = 'Connecting to Dev Wallet...';

      const companyName = companyInput?.value || 'Dev Company';

      // Simulate delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Mock wallet
      const wallet = {
        address: 'addr_test1mockdevwalletaddress123456789',
        walletName: 'Dev Wallet',
        balance: '1000000000'
      };

      loadingText.textContent = 'Generating PQC Keypair...';
      const keyPair = await pqcManager.generateKeyPair('manufacturer');
      const publicKeyHex = await pqcManager.exportPublicKey(keyPair.keyId);

      // Create Profile
      const profile = {
        walletAddress: wallet.address,
        walletName: wallet.walletName,
        pqcKeyId: keyPair.keyId,
        pqcPublicKey: publicKeyHex,
        companyName,
        registeredAt: new Date().toISOString(),
      };

      localStorage.setItem('manufacturer_profile', JSON.stringify(profile));
      this.onLoginSuccess(profile);

    } catch (err: any) {
      error.textContent = err.message;
      error.style.display = 'block';
      loading.style.display = 'none';
    }
  }

  private async handleWalletConnect(walletName: string): Promise<void> {
    const loading = this.container.querySelector('.loading') as HTMLElement;
    const loadingText = loading.querySelector('p') as HTMLElement;
    const error = this.container.querySelector('.error') as HTMLElement;
    const companyInput = this.container.querySelector('#company-name') as HTMLInputElement;

    try {
      // Show loading
      loading.style.display = 'block';
      error.style.display = 'none';
      loadingText.innerHTML = `Connecting to ${walletName}...<br/><small>Please approve the connection in your wallet extension popup.</small>`;

      // Get company name if provided
      const companyName = companyInput?.value || undefined;

      // 1. Connect Wallet
      const wallet = await walletManager.connectWallet(walletName);

      // 2. Generate Keypair
      loadingText.textContent = 'Generating PQC Keypair (this may take a moment)...';
      console.log('Generating PQC Keypair...');

      // Check if profile exists first to avoid re-generating if not needed
      const existingProfile = pqcAuth.getProfile();
      if (existingProfile && existingProfile.walletAddress === wallet.address) {
        console.log('Profile already exists');
        this.onLoginSuccess(existingProfile);
        return;
      }

      const keyPair = await pqcManager.generateKeyPair('manufacturer');
      const publicKeyHex = await pqcManager.exportPublicKey(keyPair.keyId);

      // 3. Create Profile
      const profile = {
        walletAddress: wallet.address,
        walletName: wallet.walletName,
        pqcKeyId: keyPair.keyId,
        pqcPublicKey: publicKeyHex,
        companyName,
        registeredAt: new Date().toISOString(),
      };

      // Store it using a private method hack or just localStorage directly since we are in the same app
      localStorage.setItem('manufacturer_profile', JSON.stringify(profile));

      // Success
      this.onLoginSuccess(profile);
    } catch (err: any) {
      console.error(err);
      // Show error
      error.textContent = err.message || 'Failed to connect wallet';
      error.style.display = 'block';
      loading.style.display = 'none';
    }
  }
}

export default LoginComponent;
