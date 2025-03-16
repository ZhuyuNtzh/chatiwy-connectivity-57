
import type { UserReport } from './types';

// Store reports in localStorage
const REPORTS_STORAGE_KEY = 'user_reports';

// Get all reports
export function getReports(): UserReport[] {
  try {
    const storedReports = localStorage.getItem(REPORTS_STORAGE_KEY);
    if (storedReports) {
      const reports = JSON.parse(storedReports);
      // Parse dates
      return reports.map((report: any) => ({
        ...report,
        timestamp: new Date(report.timestamp)
      }));
    }
  } catch (error) {
    console.error('Error loading reports:', error);
  }
  
  return [];
}

// Add a new report
export function addReport(report: UserReport): boolean {
  try {
    const reports = getReports();
    
    // Add the new report
    reports.push(report);
    
    // Save to localStorage
    localStorage.setItem(REPORTS_STORAGE_KEY, JSON.stringify(reports));
    
    return true;
  } catch (error) {
    console.error('Error adding report:', error);
    return false;
  }
}

// Report a user
export function reportUser(
  reporterId: number,
  reporterName: string,
  reportedId: number,
  reportedName: string,
  reason: string,
  details?: string
): boolean {
  try {
    const reportId = `report_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    
    const newReport: UserReport = {
      id: reportId,
      reporterId,
      reporterName,
      reportedId,
      reportedName,
      reason,
      details,
      timestamp: new Date(),
      status: 'pending'
    };
    
    console.log(`Reporting user for ${reason}:`, details);
    
    // Add the report
    return addReport(newReport);
  } catch (error) {
    console.error('Error reporting user:', error);
    return false;
  }
}

// Delete a report
export function deleteReport(reportId: string): boolean {
  try {
    const reports = getReports();
    
    // Filter out the report to delete
    const updatedReports = reports.filter(report => report.id !== reportId);
    
    // Save to localStorage
    localStorage.setItem(REPORTS_STORAGE_KEY, JSON.stringify(updatedReports));
    
    return true;
  } catch (error) {
    console.error('Error deleting report:', error);
    return false;
  }
}
