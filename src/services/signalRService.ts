
import { HubConnection, HubConnectionBuilder, LogLevel } from '@microsoft/signalr';
import { SignalRService as SignalRServiceType } from './signalR/types';
import mockConnection from './signalR/mockConnection';

// This is using the mock connection for now, but can be replaced with a real connection
class SignalRService implements SignalRServiceType {
  private connection: any = null;
  private userId: number | null = null;
  private username: string | null = null;
  private bannedWords: string[] = [];
  private connectedUsersCount = 0;

  public initialize(userId: number, username: string) {
    this.userId = userId;
    this.username = username;
    
    // Load banned words from localStorage if available
    const savedBannedWords = localStorage.getItem('bannedWords');
    if (savedBannedWords) {
      try {
        this.bannedWords = JSON.parse(savedBannedWords);
      } catch (e) {
        console.error('Error parsing banned words:', e);
        this.bannedWords = [];
      }
    }
    
    this.connection = mockConnection;
    this.connectedUsersCount = Math.floor(Math.random() * 100) + 50; // Random number of users for mock
    
    console.log(`SignalR initialized for user ${username} (ID: ${userId})`);
  }
  
  public disconnect() {
    if (this.connection) {
      this.connection = null;
      this.userId = null;
      this.username = null;
      console.log('SignalR disconnected');
    }
  }
  
  public onConnectedUsersCountChanged(callback: (count: number) => void) {
    // For mock purposes, just return the stored count
    callback(this.connectedUsersCount);
  }
  
  // Banned words management
  public getBannedWords(): string[] {
    return this.bannedWords;
  }
  
  public addBannedWord(word: string) {
    if (!this.bannedWords.includes(word.toLowerCase())) {
      this.bannedWords.push(word.toLowerCase());
      // Save to localStorage
      localStorage.setItem('bannedWords', JSON.stringify(this.bannedWords));
    }
  }
  
  public removeBannedWord(word: string) {
    this.bannedWords = this.bannedWords.filter(w => w !== word.toLowerCase());
    // Save to localStorage
    localStorage.setItem('bannedWords', JSON.stringify(this.bannedWords));
  }
  
  public setBannedWords(words: string[]) {
    this.bannedWords = words.map(word => word.toLowerCase());
    // Save to localStorage
    localStorage.setItem('bannedWords', JSON.stringify(this.bannedWords));
  }
}

export const signalRService = new SignalRService();
