export enum SocketState {
  DISCONNECTED = 'Disconnected',
  CONNECTING = 'Connecting',
  CONNECTED = 'Connected',
  RECONNECTING = 'Reconnecting'
}


class SocketManager {
  private socket: WebSocket | null = null;
  private url: string = '';
  private state: SocketState = SocketState.DISCONNECTED;
  private handlers: ((event: any) => void)[] = [];
  private reconnectTimeout: any = null;
  private useMock: boolean = true; // Debug mode for local development

  connect(url: string = 'ws://localhost:8080') {
    if (this.state === SocketState.CONNECTED) return;

    this.url = url;
    this.state = SocketState.CONNECTING;
    console.log(`Socket: Спроба з'єднання з ${url}...`);

    if (this.useMock) {
      this.simulateConnection();
    } else {
      try {
        this.socket = new WebSocket(url);
        this.setupEventListeners();
      } catch (e) {
        this.handleError();
      }
    }
  }

  disconnect() {
    this.state = SocketState.DISCONNECTED;
    if (this.socket) {
      this.socket.close();
      this.socket = null;
    }
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
    }
    console.log("Socket: З'єднання розірвано вручну.");
  }


  send(message: any) {
    if (this.state === SocketState.CONNECTED) {
      const payload = JSON.stringify(message);
      if (this.useMock) {
        console.log("Socket: Message sent:", payload);
      } else {
        this.socket?.send(payload);
      }
    } else {
      console.warn("Socket: Неможливо надіслати повідомлення, немає з'єднання.");
    }
  }

  /**
   * Підписка на події
   */
  onMessage(handler: (event: any) => void) {
    this.handlers.push(handler);
    return () => {
      this.handlers = this.handlers.filter(h => h !== handler);
    };
  }

  /**
   * Отримання поточного стану
   */
  getState(): SocketState {
    return this.state;
  }

  private setupEventListeners() {
    if (!this.socket) return;

    this.socket.onopen = () => {
      this.state = SocketState.CONNECTED;
      console.log("Socket: З'єднано успішно.");
    };

    this.socket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        this.notifyHandlers(data);
      } catch (e) {
        console.error("Socket: Помилка парсингу JSON", e);
      }
    };

    this.socket.onclose = () => {
      if (this.state !== SocketState.DISCONNECTED) {
        this.handleError();
      }
    };
  }

  private handleError() {
    console.log("Socket: Помилка з'єднання. Спроба перепідключення через 3 сек...");
    this.state = SocketState.RECONNECTING;
    this.reconnectTimeout = setTimeout(() => {
      this.connect(this.url);
    }, 3000);
  }

  private notifyHandlers(data: any) {
    this.handlers.forEach(handler => handler(data));
  }

  /**
   * Internal simulation for development
   */
  private simulateConnection() {
    setTimeout(() => {
      this.state = SocketState.CONNECTED;
      console.log("Socket: Connected (Simulation)");

      // Імітуємо вхідні події кожні 5 секунд
      setInterval(() => {
        if (this.state === SocketState.CONNECTED) {
          const mockEvents = [
            { type: 'ORDER_UPDATE', status: 'preparing', orderId: '32801' },
            { type: 'PROMO_ALERT', message: 'Знижка -20% на XXL шаурму до кінця дня!', id: 101 },
            { type: 'ORDER_UPDATE', status: 'delivering', orderId: '32801' }
          ];
          const randomEvent = mockEvents[Math.floor(Math.random() * mockEvents.length)];
          this.notifyHandlers(randomEvent);
        }
      }, 5000);
    }, 1000);
  }
}

export const socketManager = new SocketManager();
