
import { HubConnection } from '@microsoft/signalr';

// Create a mock SignalR connection for testing/demo purposes
export const createMockConnection = (): HubConnection => {
  // Create a mock HubConnection object that implements the minimal interface
  const mockConnection: Partial<HubConnection> = {
    // Add mock implementation of key methods
    start: () => Promise.resolve(),
    stop: () => Promise.resolve(),
    on: (methodName: string, newMethod: (...args: any[]) => void) => {
      console.log(`Mock connection registered handler for ${methodName}`);
      return mockConnection as HubConnection;
    },
    invoke: (methodName: string, ...args: any[]) => {
      console.log(`Mock connection invoked ${methodName} with args:`, args);
      return Promise.resolve();
    },
    off: (methodName: string, method?: (...args: any[]) => void) => {
      console.log(`Mock connection removed handler for ${methodName}`);
      return mockConnection as HubConnection;
    },
    onclose: (callback: (error?: Error) => void) => {
      console.log('Mock connection registered onclose handler');
      return mockConnection as HubConnection;
    }
  };
  
  return mockConnection as HubConnection;
};

export default createMockConnection;
