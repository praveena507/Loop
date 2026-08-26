/**
 * Utility function to convert complaints list to CSV and trigger browser download
 */
export function exportComplaintsToCSV(complaintsList, filename = 'LOOP_Complaints_Report_2026.csv') {
  if (!complaintsList || complaintsList.length === 0) {
    alert('No complaint records available to export.');
    return;
  }

  const headers = [
    'Complaint ID',
    'Customer Name',
    'Customer Email',
    'Submission Date',
    'Category',
    'Location / Store',
    'Priority',
    'Sentiment',
    'Status',
    'Assigned Analyst',
    'Complaint Reason',
    'Description',
    'AI Summary'
  ];

  const escapeCSV = (str) => {
    if (str === null || str === undefined) return '""';
    const cleanStr = String(str).replace(/"/g, '""');
    return `"${cleanStr}"`;
  };

  const rows = complaintsList.map(c => [
    escapeCSV(c.complaintNumber || c.id),
    escapeCSV(c.name),
    escapeCSV(c.email),
    escapeCSV(c.createdAt ? new Date(c.createdAt).toLocaleString() : ''),
    escapeCSV(c.category),
    escapeCSV(c.place),
    escapeCSV(c.priority),
    escapeCSV(c.sentiment),
    escapeCSV(c.status),
    escapeCSV(c.assignedAnalystName || 'Unassigned'),
    escapeCSV(c.reason),
    escapeCSV(c.description),
    escapeCSV(c.aiSummary || c.summary)
  ]);

  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.join(','))
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
