
import { UserReport } from './types';

let reports: UserReport[] = [];

export const userReporting = {
  loadFromStorage() {
    const savedReports = localStorage.getItem('reports');
    if (savedReports) {
      try {
        reports = JSON.parse(savedReports);
      } catch (e) {
        console.error('Error parsing reports:', e);
        reports = [];
      }
    }
  },

  reportUser(
    reporterId: number,
    reporterName: string,
    reportedId: number,
    reportedName: string,
    reason: string,
    details?: string
  ) {
    const newReport: UserReport = {
      id: `report_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
      reporterId,
      reporterName,
      reportedId,
      reportedName,
      reason,
      details,
      timestamp: new Date(),
      status: 'pending'
    };
    
    reports.push(newReport);
    
    // Save to localStorage
    localStorage.setItem('reports', JSON.stringify(reports));
    console.log('Report submitted:', newReport);
  },

  getReports(): UserReport[] {
    // Filter out reports older than 24 hours
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    reports = reports.filter(report => new Date(report.timestamp) > twentyFourHoursAgo);
    
    // Save updated reports to localStorage
    localStorage.setItem('reports', JSON.stringify(reports));
    
    return [...reports];
  },

  deleteReport(reportId: string) {
    reports = reports.filter(report => report.id !== reportId);
    localStorage.setItem('reports', JSON.stringify(reports));
  }
};
