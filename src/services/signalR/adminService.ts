
import { userReporting } from './userReporting';
import { contentModeration } from './contentModeration';
import { UserReport } from './types';

// Admin-specific functionality
export const adminService = {
  // Reporting functionality
  reportUser(
    reporterId: number,
    reporterName: string,
    reportedId: number,
    reportedName: string,
    reason: string,
    details?: string
  ): void {
    userReporting.reportUser(reporterId, reporterName, reportedId, reportedName, reason, details);
  },
  
  getReports(): UserReport[] {
    return userReporting.getReports();
  },
  
  deleteReport(reportId: string): void {
    userReporting.deleteReport(reportId);
  },
  
  // Content moderation
  getBannedWords(): string[] {
    return contentModeration.getBannedWords();
  },
  
  addBannedWord(word: string): void {
    contentModeration.addBannedWord(word);
  },
  
  removeBannedWord(word: string): void {
    contentModeration.removeBannedWord(word);
  },
  
  setBannedWords(words: string[]): void {
    contentModeration.setBannedWords(words);
  }
}
