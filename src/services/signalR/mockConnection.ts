
import * as signalR from '@microsoft/signalr';

export class MockHubConnection {
  private callbacks: Record<string, ((...args: any[]) => void)[]> = {};
  
  on(methodName: string, newMethod: (...args: any[]) => void): void {
    if (!this.callbacks[methodName]) {
      this.callbacks[methodName] = [];
    }
    this.callbacks[methodName].push(newMethod);
  }

  off(methodName: string, method?: (...args: any[]) => void): void {
    if (!method) {
      delete this.callbacks[methodName];
      return;
    }
    
    if (!this.callbacks[methodName]) return;
    this.callbacks[methodName] = this.callbacks[methodName].filter(m => m !== method);
  }

  invoke<T = any>(methodName: string, ...args: any[]): Promise<T> {
    console.log(`Mock invoking: ${methodName}`, args);
    return Promise.resolve({} as T);
  }
  
  send(methodName: string, ...args: any[]): Promise<void> {
    console.log(`Mock sending: ${methodName}`, args);
    return Promise.resolve();
  }
  
  start(): Promise<void> {
    console.log('Mock connection started');
    return Promise.resolve();
  }
  
  stop(): Promise<void> {
    console.log('Mock connection stopped');
    return Promise.resolve();
  }
  
  get state(): signalR.HubConnectionState {
    return signalR.HubConnectionState.Connected;
  }
  
  get connectionId(): string | null {
    return 'mock-connection-id';
  }
  
  get baseUrl(): string {
    return 'https://mock-signalr-server.com/hub';
  }
  
  serverTimeoutInMilliseconds: number = 30000;
  keepAliveIntervalInMilliseconds: number = 15000;
  
  onclose(callback: (error?: Error) => void): void {
    console.log('Mock onclose registered');
  }
  
  onreconnecting(callback: (error?: Error) => void): void {
    console.log('Mock onreconnecting registered');
  }
  
  onreconnected(callback: (connectionId?: string) => void): void {
    console.log('Mock onreconnected registered');
  }
  
  stream<T>(methodName: string, ...args: any[]): signalR.IStreamResult<T> {
    console.log(`Mock streaming: ${methodName}`, args);
    return {
      subscribe: () => ({ dispose: () => console.log('Mock stream disposed') })
    };
  }
}

// Create a single instance as the default export
const mockConnection = new MockHubConnection();
export default mockConnection;
