
import { UserReport } from './types';

let reports: UserReport[] = [];

export const userReporting = {
  loadFromStorage() {
    console.log('Loading user reports from storage');
    const savedReports = localStorage.getItem('reports');
    if (savedReports) {
      try {
        reports = JSON.parse(savedReports);
        console.log('Loaded reports:', reports);
      } catch (e) {
        console.error('Error parsing reports:', e);
        reports = [];
      }
    } else {
      console.log('No reports found in storage');
    }
    
    // Immediately filter out expired reports
    this.cleanupOldReports();
  },

  reportUser(
    reporterId: number,
    reporterName: string,
    reportedId: number,
    reportedName: string,
    reason: string,
    details?: string
  ) {
    console.log('Creating new report', {
      reporterId,
      reporterName,
      reportedId,
      reportedName,
      reason,
      details
    });
    
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
    console.log('Current reports:', reports);
  },

  getReports(): UserReport[] {
    console.log('Getting reports, before cleanup:', reports.length);
    // Filter out reports older than 24 hours
    this.cleanupOldReports();
    console.log('Reports after cleanup:', reports.length);
    
    return [...reports];
  },
  
  cleanupOldReports() {
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const originalCount = reports.length;
    
    reports = reports.filter(report => {
      // Convert string dates back to Date objects if needed
      const reportDate = report.timestamp instanceof Date 
        ? report.timestamp 
        : new Date(report.timestamp);
        
      return reportDate > twentyFourHoursAgo;
    });
    
    // If reports were removed, update localStorage
    if (originalCount !== reports.length) {
      localStorage.setItem('reports', JSON.stringify(reports));
      console.log(`Cleaned up ${originalCount - reports.length} old reports`);
    }
  },

  deleteReport(reportId: string) {
    console.log('Deleting report:', reportId);
    const originalLength = reports.length;
    reports = reports.filter(report => report.id !== reportId);
    
    if (originalLength !== reports.length) {
      localStorage.setItem('reports', JSON.stringify(reports));
      console.log('Report deleted successfully');
    } else {
      console.log('Report not found for deletion');
    }
  }
};
