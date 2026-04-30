
export enum BiometricState {
  IDLE = 'Idle',
  AUTHENTICATING = 'Authenticating',
  SUCCESS = 'Success',
  FAILED = 'Failed'
}

export type BiometricType = 'Fingerprint' | 'FaceID' | 'None';

class SecurityManager {
  private pinKey = 'shawarma_pin_code';
  private bioEnabledKey = 'shawarma_biometrics_enabled';
  private lockTimeoutKey = 'shawarma_lock_timeout';
  private state: BiometricState = BiometricState.IDLE;

  setPin(pin: string): void {
    localStorage.setItem(this.pinKey, pin);
  }

  hasPin(): boolean {
    return !!localStorage.getItem(this.pinKey);
  }

  verifyPin(pin: string): boolean {
    return localStorage.getItem(this.pinKey) === pin;
  }

  isBiometricsEnabled(): boolean {
    return localStorage.getItem(this.bioEnabledKey) === 'true';
  }

  setBiometricsEnabled(enabled: boolean): void {
    localStorage.setItem(this.bioEnabledKey, String(enabled));
  }

  async authenticate(reason: string = 'Будь ласка, прикладіть палець до датчика'): Promise<boolean> {
    this.state = BiometricState.AUTHENTICATING;
    
    return new Promise((resolve) => {
      const Fingerprint = (window as any).Fingerprint;

      if (!Fingerprint) {
        console.error("Fingerprint plugin not found");
        // Fallback для веба (якщо випадково відкрили в браузері)
        setTimeout(() => {
          this.state = BiometricState.SUCCESS;
          resolve(true);
        }, 1000);
        return;
      }

      Fingerprint.show({
        title: 'Біометрична автентифікація',
        subtitle: 'Shawarma TiMaRo',
        description: reason,
        fallbackButtonTitle: 'Використати PIN-код',
        disableBackup: false,
      }, (result: any) => {
        console.log("Fingerprint Success:", result);
        this.state = BiometricState.SUCCESS;
        // Даємо 300мс на закриття системного вікна перед тим, як пустити далі
        setTimeout(() => resolve(true), 300);
      }, (err: any) => {
        console.error("Fingerprint Error:", err);
        this.state = BiometricState.FAILED;
        resolve(false);
      });
    });
  }

  getState(): BiometricState {
    return this.state;
  }

  resetState() {
    this.state = BiometricState.IDLE;
  }

  getLockTimeout(): number {
    const val = localStorage.getItem(this.lockTimeoutKey);
    return val ? parseInt(val, 10) : 30; // 30 секунд за замовчуванням
  }

  setLockTimeout(seconds: number): void {
    localStorage.setItem(this.lockTimeoutKey, String(seconds));
  }

  // Для зворотної сумісності
  isEnabledByUser() { return this.isBiometricsEnabled(); }
  setEnabled(e: boolean) { this.setBiometricsEnabled(e); }
  async checkAvailability() { return { available: true, type: 'Fingerprint' as const }; }
}

export const securityManager = new SecurityManager();
export const biometricManager = securityManager;
