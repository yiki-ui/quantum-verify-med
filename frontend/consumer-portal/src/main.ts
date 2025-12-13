/**
 * Consumer Portal Main Application
 */

import './style.css';
import VerificationComponent from './components/Verification';

class ConsumerApp {
  private appContainer: HTMLElement;

  constructor() {
    this.appContainer = document.querySelector<HTMLDivElement>('#app')!;
    this.init();
  }

  private init(): void {
    this.appContainer.innerHTML = `
      <div class="app-container">
        <header class="app-header">
          <div class="header-content">
            <h1>💊 Pharma Verify</h1>
            <p>Quantum-Resistant Medicine Authentication</p>
          </div>
        </header>

        <main id="main-content">
          <!-- Verification component will be loaded here -->
        </main>

        <footer class="app-footer">
          <p>Powered by Cardano Blockchain & Post-Quantum Cryptography</p>
          <div class="security-badges">
            <span class="badge">🔐 NIST-Approved PQC</span>
            <span class="badge">⛓️ Cardano Verified</span>
            <span class="badge">🛡️ Quantum-Resistant</span>
          </div>
        </footer>
      </div>
    `;

    this.loadVerification();
  }

  private loadVerification(): void {
    const content = this.appContainer.querySelector('#main-content') as HTMLElement;
    new VerificationComponent(content);
  }
}

// Initialize app
new ConsumerApp();
