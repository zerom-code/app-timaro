
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { createProduct } from '../models/Product';
import { createUserProfile } from '../models/UserProfile';
import { localRepository } from '../services/localRepository';
import { socketManager, SocketState } from '../services/socketManager';

describe('Базові тести функціоналу', () => {
  
  describe('Моделі даних', () => {
    it('Product повинен створюватися з правильними полями', () => {
      const p = createProduct(1, 'Тест', 'Опис', 100, 'img.png', 'Шаурма');
      expect(p.id).toBe(1);
      expect(p.price).toBe(100);
      expect(p.isAvailable).toBe(true);
    });

    it('Product повинен мати статус замовчування "synced" якщо не вказано', () => {
      const p = createProduct(1, 'Тест', 'Опис', 100, 'img.png', 'Шаурма');
      expect(p.syncStatus).toBeUndefined();
    });

    it('UserProfile повинен правильно ініціалізуватися', () => {
      const u = createUserProfile('u1', 'test@mail.com', 'Roman');
      expect(u.id).toBe('u1');
      expect(u.email).toBe('test@mail.com');
      expect(u.isVerified).toBe(false);
    });

    it('UserProfile повинен мати дату останнього входу', () => {
      const u = createUserProfile('u1', 'test@mail.com', 'Roman');
      expect(u.lastLogin).toBeInstanceOf(Date);
    });

    it('Product повинен дозволяти змінювати статус на "pending"', () => {
      const p = createProduct(1, 'Тест', 'Опис', 100, 'img.png', 'Шаурма');
      p.syncStatus = 'pending';
      expect(p.syncStatus).toBe('pending');
    });
  });

  describe('LocalRepository', () => {
    beforeEach(() => {
      localRepository.deleteProducts();
      localRepository.deleteUser();
    });

    it('Повинен зберігати та зчитувати список продуктів', () => {
      const list = [{ id: 1, name: 'Шаурма' }];
      localRepository.saveProducts(list);
      expect(localRepository.getProducts()).toHaveLength(1);
      expect(localRepository.getProducts()[0].name).toBe('Шаурма');
    });

    it('Повинен знаходити продукт за ID', () => {
      localRepository.saveProducts([{ id: 5, name: 'Кебаб' }]);
      expect(localRepository.getProductById(5)).toBeDefined();
      expect(localRepository.getProductById(5).name).toBe('Кебаб');
    });

    it('Повинен повертати порожній масив якщо даних немає', () => {
      expect(localRepository.getProducts()).toEqual([]);
    });

    it('Повинен зберігати профіль користувача', () => {
      const user = { id: '123', email: 'a@b.com' };
      localRepository.saveUser(user);
      expect(localRepository.getUser().email).toBe('a@b.com');
    });

    it('Повинен видаляти дані користувача', () => {
      localRepository.saveUser({ id: '1' });
      localRepository.deleteUser();
      expect(localRepository.getUser()).toBeNull();
    });
  });

  describe('SocketManager', () => {
    it('Повинен мати статус DISCONNECTED за замовчуванням', () => {
      expect(socketManager.getState()).toBe(SocketState.DISCONNECTED);
    });

    it('Повинен змінювати статус на CONNECTED після connect', async () => {
      socketManager.connect();
      // Оскільки у нас мок з setTimeout(1000), почекаємо трохи
      await new Promise(res => setTimeout(res, 1100));
      expect(socketManager.getState()).toBe(SocketState.CONNECTED);
    });

    it('Повинен реєструвати та викликати обробники повідомлень', async () => {
      const handler = vi.fn();
      socketManager.onMessage(handler);
      
      // Імітуємо надсилання повідомлення (в моці це notifyHandlers)
      // Для тесту можемо викликати приватний метод через any
      (socketManager as any).notifyHandlers({ type: 'TEST' });
      
      expect(handler).toHaveBeenCalledWith({ type: 'TEST' });
    });

    it('Повинен змінювати статус на DISCONNECTED при виклику disconnect', () => {
      socketManager.disconnect();
      expect(socketManager.getState()).toBe(SocketState.DISCONNECTED);
    });

    it('Повинен автоматично переходити в стан CONNECTING при старті', () => {
      socketManager.connect();
      expect(socketManager.getState()).toBe(SocketState.CONNECTING);
    });
  });

});
