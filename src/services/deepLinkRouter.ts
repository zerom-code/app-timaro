
export type Destination = 
  | { type: 'Home' }
  | { type: 'Detail', id: string }
  | { type: 'Catalog', filter?: string }
  | { type: 'Invite', token: string }
  | { type: 'Notifications' };

class DeepLinkRouter {
  private customScheme = 'shawarma://';
  private httpsScheme = 'https://shawarma-express.com/';
  private navigateCallback: ((path: string) => void) | null = null;

  /**
   * Реєстрація функції навігації (зазвичай від React Router)
   */
  init(callback: (path: string) => void) {
    this.navigateCallback = callback;
  }

  /**
   * Точка входу: парсить URL і виконує навігацію
   */
  handle(url: string) {
    console.log(`DeepLink: Отримано URL - ${url}`);
    const destination = this.parseURL(url);
    
    if (destination) {
      this.navigate(destination);
    } else {
      console.warn("DeepLink: Невідомий або некоректний URL");
    }
  }

  /**
   * Розбір рядка URL у типізований маршрут
   */
  parseURL(url: string): Destination | null {
    if (!url) return null;

    let path = '';
    if (url.startsWith(this.customScheme)) {
      path = url.replace(this.customScheme, '');
    } else if (url.startsWith(this.httpsScheme)) {
      path = url.replace(this.httpsScheme, '');
    } else {
      return null;
    }

    // Розбираємо шлях та параметри
    const [routePart, queryPart] = path.split('?');
    const params = new URLSearchParams(queryPart || '');
    const segments = routePart.split('/').filter(s => s.length > 0);

    if (segments[0] === 'home') return { type: 'Home' };

    if (segments[0] === 'items' && segments[1]) {
      return { type: 'Detail', id: segments[1] };
    }

    if (segments[0] === 'catalog') {
      return { type: 'Catalog', filter: params.get('filter') || undefined };
    }

    if (segments[0] === 'invite' && segments[1]) {
      return { type: 'Invite', token: segments[1] };
    }

    if (segments[0] === 'notifications') return { type: 'Notifications' };

    return null;
  }

  /**
   * Перетворення Destination у шлях для React Router
   */
  private navigate(dest: Destination) {
    if (!this.navigateCallback) {
      console.error("DeepLinkRouter не ініціалізовано навігаційним колбеком");
      return;
    }

    let targetPath = '/';
    switch (dest.type) {
      case 'Home': targetPath = '/'; break;
      case 'Detail': targetPath = `/product/${dest.id}`; break;
      case 'Catalog': targetPath = dest.filter ? `/menu?category=${dest.filter}` : '/menu'; break;
      case 'Invite': targetPath = `/invite/${dest.token}`; break;
      case 'Notifications': targetPath = '/notifications'; break;
    }

    console.log(`DeepLink: Навігація до ${targetPath}`);
    this.navigateCallback(targetPath);
  }

  /**
   * Генерація Deep Link (для кнопки "Поділитись")
   */
  generateItemLink(id: number | string): string {
    return `${this.customScheme}items/${id}`;
  }
}

export const deepLinkRouter = new DeepLinkRouter();
