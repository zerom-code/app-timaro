
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { deepLinkRouter } from '../services/deepLinkRouter';

describe('Тести Deep Links та маршрутизації', () => {
  
  const mockNavigate = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    deepLinkRouter.init(mockNavigate);
  });

  it('1. parseURL("shawarma://items/123") повинен повертати Detail(id: "123")', () => {
    const result = deepLinkRouter.parseURL("shawarma://items/123");
    expect(result).toEqual({ type: 'Detail', id: '123' });
  });

  it('2. parseURL("shawarma://catalog?filter=Шаурма") повинен повертати Catalog(filter: "Шаурма")', () => {
    const result = deepLinkRouter.parseURL("shawarma://catalog?filter=Шаурма");
    expect(result).toEqual({ type: 'Catalog', filter: 'Шаурма' });
  });

  it('3. parseURL("shawarma://catalog") повинен повертати Catalog без фільтра', () => {
    const result = deepLinkRouter.parseURL("shawarma://catalog");
    expect(result).toEqual({ type: 'Catalog', filter: undefined });
  });

  it('4. parseURL("shawarma://invite/VIP2024") повинен повертати Invite("VIP2024")', () => {
    const result = deepLinkRouter.parseURL("shawarma://invite/VIP2024");
    expect(result).toEqual({ type: 'Invite', token: 'VIP2024' });
  });

  it('5. parseURL з HTTPS-схемою повинен розпізнаватися так само', () => {
    const result = deepLinkRouter.parseURL("https://shawarma-express.com/items/999");
    expect(result).toEqual({ type: 'Detail', id: '999' });
  });

  it('6. parseURL для невідомого шляху повинен повертати null', () => {
    const result = deepLinkRouter.parseURL("shawarma://unknown/route");
    expect(result).toBeNull();
  });

  it('7. parseURL з порожнім рядком не повинен кидати помилку', () => {
    const result = deepLinkRouter.parseURL("");
    expect(result).toBeNull();
  });


  it('8. handle("shawarma://items/1") повинен викликати функцію навігації', () => {
    deepLinkRouter.handle("shawarma://items/1");
    expect(mockNavigate).toHaveBeenCalledWith('/product/1');
  });

  it('9. handle("shawarma://invalid") не повинен викликати навігацію', () => {
    deepLinkRouter.handle("shawarma://invalid");
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it('10. generateItemLink повинен створювати коректний кастомний URL', () => {
    const url = deepLinkRouter.generateItemLink(5);
    expect(url).toBe('shawarma://items/5');
  });

  it('11. handle("shawarma://home") повинен вести на головну', () => {
    deepLinkRouter.handle("shawarma://home");
    expect(mockNavigate).toHaveBeenCalledWith('/');
  });

  it('12. handle з HTTPS-схемою для каталогу', () => {
    deepLinkRouter.handle("https://shawarma-express.com/catalog?filter=Напої");
    expect(mockNavigate).toHaveBeenCalledWith('/menu?category=Напої');
  });

});
