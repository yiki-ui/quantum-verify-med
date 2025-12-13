/**
 * Manufacturer Portal Main Application
 */

import './style.css';
import { pqcAuth } from './services/pqc-auth';
import LoginComponent from './components/Login';
import RegisterMedicineComponent from './components/RegisterMedicine';

class ManufacturerApp {
  private appContainer: HTMLElement;

  constructor() {
    this.appContainer = document.querySelector<HTMLDivElement>('#app')!;
    this.init();
  }

  private init(): void {
    // Check if already authenticated
    if (pqcAuth.isAuthenticated()) {
      this.showDashboard();
    } else {
      this.showLogin();
    }
  }

  private showLogin(): void {
    new LoginComponent(this.appContainer, (profile) => {
      console.log('Login successful:', profile);
      this.showDashboard();
    });
  }

  private showDashboard(): void {
    const profile = pqcAuth.getProfile();

    this.appContainer.innerHTML = `
      <div class="dashboard">
        <header class="dashboard-header">
          <div class="header-left">
            <h1>🏭 Pharma Verify - Manufacturer Portal</h1>
            <p class="subtitle">Quantum-Resistant Medicine Authentication</p>
          </div>
          <div class="header-right">
            <div class="profile-badge">
              <span class="wallet-icon">👤</span>
              <div class="profile-info">
                <p class="company-name">${profile?.companyName || 'Manufacturer'}</p>
                <p class="wallet-address">${profile?.walletAddress.substring(0, 12)}...</p>
              </div>
            </div>
            <button id="logout-btn" class="btn btn-secondary">Logout</button>
          </div>
        </header>

        <nav class="dashboard-nav">
          <button class="nav-item active" data-view="register">
            📦 Register Medicine
          </button>
          <button class="nav-item" data-view="batches">
            📋 My Batches
          </button>
          <button class="nav-item" data-view="profile">
            🔐 PQC Profile
          </button>
        </nav>

        <main class="dashboard-content" id="content">
          <!-- Content will be loaded here -->
        </main>
      </div>
    `;

    this.attachDashboardListeners();
    this.loadView('register');
  }

  private attachDashboardListeners(): void {
    const logoutBtn = this.appContainer.querySelector('#logout-btn');
    logoutBtn?.addEventListener('click', () => {
      pqcAuth.logout();
      this.showLogin();
    });

    const navItems = this.appContainer.querySelectorAll('.nav-item');
    navItems.forEach(item => {
      item.addEventListener('click', (e) => {
        const view = (e.currentTarget as HTMLElement).dataset.view;
        if (view) {
          // Update active state
          navItems.forEach(nav => nav.classList.remove('active'));
          (e.currentTarget as HTMLElement).classList.add('active');

          this.loadView(view);
        }
      });
    });
  }

  private loadView(view: string): void {
    const content = this.appContainer.querySelector('#content') as HTMLElement;

    switch (view) {
      case 'register':
        new RegisterMedicineComponent(content);
        break;
      case 'batches':
        this.showBatches(content);
        break;
      case 'profile':
        this.showProfile(content);
        break;
    }
  }

  private showBatches(container: HTMLElement): void {
    container.innerHTML = `
      <div class="batches-view">
        <h2>📋 My Registered Batches</h2>
        <p class="coming-soon">Coming soon: View all your registered medicine batches</p>
        <div class="batch-list">
          <div class="empty-state">
            <p>No batches registered yet</p>
            <p>Register your first medicine batch to see it here</p>
          </div>
        </div>
      </div>
    `;
  }

  private showProfile(container: HTMLElement): void {
    const profile = pqcAuth.getProfile();

    container.innerHTML = `
      <div class="profile-view">
        <h2>🔐 Post-Quantum Cryptography Profile</h2>
        
        <div class="profile-section">
          <h3>Company Information</h3>
          <div class="info-grid">
            <div class="info-item">
              <label>Company Name:</label>
              <p>${profile?.companyName || 'Not set'}</p>
            </div>
            <div class="info-item">
              <label>Registered:</label>
              <p>${new Date(profile?.registeredAt || '').toLocaleDateString()}</p>
            </div>
          </div>
        </div>

        <div class="profile-section">
          <h3>Cardano Wallet</h3>
          <div class="info-grid">
            <div class="info-item">
              <label>Wallet:</label>
              <p>${profile?.walletName}</p>
            </div>
            <div class="info-item">
              <label>Address:</label>
              <p class="monospace">${profile?.walletAddress}</p>
            </div>
          </div>
        </div>

        <div class="profile-section">
          <h3>Post-Quantum Keypair</h3>
          <div class="info-grid">
            <div class="info-item">
              <label>Algorithm:</label>
              <p>CRYSTALS-Dilithium-2 (NIST-approved)</p>
            </div>
            <div class="info-item">
              <label>Key ID:</label>
              <p class="monospace">${profile?.pqcKeyId}</p>
            </div>
            <div class="info-item full-width">
              <label>Public Key:</label>
              <textarea readonly class="pubkey-display">${profile?.pqcPublicKey}</textarea>
            </div>
          </div>
        </div>

        <div class="profile-section">
          <h3>Security Information</h3>
          <div class="security-info">
            <p>✅ Quantum-resistant signatures using Dilithium</p>
            <p>✅ Keys stored securely in browser IndexedDB</p>
            <p>✅ Signatures embedded in Cardano NFT metadata</p>
            <p>⚠️ Keep your wallet seed phrase secure</p>
          </div>
        </div>
      </div>
    `;
  }
}

// Initialize app
new ManufacturerApp();
