
import { UserReport } from './types';

let reports: UserReport[] = [];

export const userReporting = {
  loadFromStorage() {
    const savedReports = localStorage.getItem('reports');
    if (savedReports) {
      try {
        reports = JSON.parse(savedReports);
        
        // Filter out reports older than 24 hours whenever we load
        const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
        reports = reports.filter(report => {
          const reportDate = new Date(report.timestamp);
          return reportDate > twentyFourHoursAgo;
        });
        
        // Save the filtered reports back to storage
        localStorage.setItem('reports', JSON.stringify(reports));
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
    // Always load from storage first to make sure we have the latest data
    this.loadFromStorage();
    
    // Filter out reports older than 24 hours
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    reports = reports.filter(report => {
      const reportDate = new Date(report.timestamp);
      return reportDate > twentyFourHoursAgo;
    });
    
    // Save updated reports to localStorage
    localStorage.setItem('reports', JSON.stringify(reports));
    
    return [...reports];
  },

  deleteReport(reportId: string) {
    reports = reports.filter(report => report.id !== reportId);
    localStorage.setItem('reports', JSON.stringify(reports));
  }
};
