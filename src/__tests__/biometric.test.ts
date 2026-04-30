
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { biometricManager, BiometricState } from '../services/biometricManager';

describe('Тести безпеки та біометрії', () => {

  beforeEach(() => {
    localStorage.clear();
    biometricManager.resetState();
  });

  it('checkAvailability() повинен повертати об’єкт з доступністю', async () => {
    const result = await biometricManager.checkAvailability();
    expect(result).toHaveProperty('available');
    expect(result).toHaveProperty('type');
  });

  it('isEnabledByUser() за замовчуванням має бути false', () => {
    expect(biometricManager.isEnabledByUser()).toBe(false);
  });

  it('setEnabled(true) повинен зберігати значення в LocalStorage', () => {
    biometricManager.setEnabled(true);
    expect(biometricManager.isEnabledByUser()).toBe(true);
    expect(localStorage.getItem('shawarma_biometrics_enabled')).toBe('true');
  });

  it('getState() на старті повинен бути IDLE', () => {
    expect(biometricManager.getState()).toBe(BiometricState.IDLE);
  });

  it('authenticate() повинен змінювати стан на AUTHENTICATING', async () => {
    const authPromise = biometricManager.authenticate("Test");
    expect(biometricManager.getState()).toBe(BiometricState.AUTHENTICATING);
    await authPromise;
  });

  it('authenticate() повинен повертати true при успіху', async () => {
    const result = await biometricManager.authenticate("Test");
    expect(result).toBe(true);
    expect(biometricManager.getState()).toBe(BiometricState.SUCCESS);
  });

  it('getLockTimeout() повинен повертати 30 за замовчуванням', () => {
    expect(biometricManager.getLockTimeout()).toBe(30);
  });

  it('setLockTimeout() повинен змінювати значення', () => {
    biometricManager.setLockTimeout(60);
    expect(biometricManager.getLockTimeout()).toBe(60);
  });

  it('UI-стан SUCCESS повинен встановлюватися після завершення', async () => {
    await biometricManager.authenticate("Reason");
    expect(biometricManager.getState()).toBe(BiometricState.SUCCESS);
  });

  it('resetState() повинен повертати стан в IDLE', async () => {
    await biometricManager.authenticate("Reason");
    biometricManager.resetState();
    expect(biometricManager.getState()).toBe(BiometricState.IDLE);
  });

  it('checkAvailability() повинен імітувати тип Fingerprint на емуляторі', async () => {
    const result = await biometricManager.checkAvailability();
    expect(result.type).toBe('Fingerprint');
  });

  it('Автентифікація повинна працювати асинхронно', async () => {
    const start = Date.now();
    await biometricManager.authenticate("Reason");
    const end = Date.now();
    expect(end - start).toBeGreaterThanOrEqual(1000); // Очікуємо затримку mock
  });

});
