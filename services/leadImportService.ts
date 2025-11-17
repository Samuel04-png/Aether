/**
 * Lead Import Service
 * Handles CSV/Excel import and third-party integrations
 */

import { db } from './firebase';
import { collection, addDoc, writeBatch, doc } from 'firebase/firestore';
import { Lead } from '../types';

export interface ImportedLead {
  name: string;
  company: string;
  email: string;
  phone?: string;
  source?: string;
  status?: 'New' | 'Contacted' | 'Qualified' | 'Lost';
  value?: string;
  notes?: string;
}

export interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
  validLeads: ImportedLead[];
  invalidLeads: Array<{ lead: any; errors: string[] }>;
}

/**
 * Parse CSV file content
 */
export const parseCSV = (content: string): any[] => {
  const lines = content.split('\n').filter(line => line.trim());
  if (lines.length === 0) return [];

  const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
  const rows: any[] = [];

  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(',');
    const row: any = {};
    
    headers.forEach((header, index) => {
      row[header] = values[index]?.trim() || '';
    });
    
    rows.push(row);
  }

  return rows;
};

/**
 * Map CSV row to lead format
 */
const mapRowToLead = (row: any): ImportedLead => {
  // Try to map common column names
  const nameFields = ['name', 'full name', 'contact name', 'lead name', 'first name', 'firstname'];
  const companyFields = ['company', 'organization', 'business', 'company name'];
  const emailFields = ['email', 'email address', 'e-mail', 'contact email'];
  const phoneFields = ['phone', 'phone number', 'telephone', 'mobile', 'contact number'];
  const sourceFields = ['source', 'lead source', 'origin', 'referral'];
  const statusFields = ['status', 'lead status', 'stage'];
  const valueFields = ['value', 'deal value', 'potential value', 'amount'];

  const getName = () => {
    for (const field of nameFields) {
      if (row[field]) return row[field];
    }
    // Try to combine first and last name
    if (row['first name'] || row['firstname']) {
      const first = row['first name'] || row['firstname'] || '';
      const last = row['last name'] || row['lastname'] || '';
      return `${first} ${last}`.trim();
    }
    return '';
  };

  const getField = (fields: string[]) => {
    for (const field of fields) {
      if (row[field]) return row[field];
    }
    return '';
  };

  return {
    name: getName(),
    company: getField(companyFields),
    email: getField(emailFields),
    phone: getField(phoneFields),
    source: getField(sourceFields) || 'Import',
    status: (getField(statusFields) as any) || 'New',
    value: getField(valueFields),
    notes: row['notes'] || row['description'] || '',
  };
};

/**
 * Validate email format
 */
const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Validate imported leads
 */
export const validateLeads = (rows: any[]): ValidationResult => {
  const validLeads: ImportedLead[] = [];
  const invalidLeads: Array<{ lead: any; errors: string[] }> = [];
  const globalWarnings: string[] = [];

  rows.forEach((row, index) => {
    const lead = mapRowToLead(row);
    const errors: string[] = [];

    // Required field validation
    if (!lead.name || lead.name.trim().length === 0) {
      errors.push('Name is required');
    }

    if (!lead.email || lead.email.trim().length === 0) {
      errors.push('Email is required');
    } else if (!isValidEmail(lead.email)) {
      errors.push('Invalid email format');
    }

    if (!lead.company || lead.company.trim().length === 0) {
      errors.push('Company is required');
    }

    if (errors.length > 0) {
      invalidLeads.push({ lead: { ...lead, row: index + 2 }, errors });
    } else {
      validLeads.push(lead);
    }
  });

  // Global warnings
  if (validLeads.length === 0 && invalidLeads.length === 0) {
    globalWarnings.push('No data found in file');
  }

  if (invalidLeads.length > validLeads.length * 0.5 && invalidLeads.length > 5) {
    globalWarnings.push('More than 50% of leads have errors. Please check your file format.');
  }

  return {
    valid: validLeads.length > 0,
    errors: globalWarnings,
    warnings: [],
    validLeads,
    invalidLeads,
  };
};

/**
 * Import leads from CSV file
 */
export const importLeadsFromCSV = async (
  file: File
): Promise<{ rows: any[]; error?: string }> => {
  try {
    const content = await file.text();
    const rows = parseCSV(content);
    
    if (rows.length === 0) {
      return { rows: [], error: 'No data found in CSV file' };
    }

    return { rows };
  } catch (error: any) {
    console.error('Error reading CSV file:', error);
    return { rows: [], error: error.message || 'Failed to read CSV file' };
  }
};

/**
 * Save validated leads to Firestore
 */
export const saveImportedLeads = async (
  userId: string,
  leads: ImportedLead[]
): Promise<{ success: boolean; imported: number; error?: string }> => {
  try {
    if (leads.length === 0) {
      return { success: false, imported: 0, error: 'No leads to import' };
    }

    // Use batch write for better performance
    const batch = writeBatch(db);
    const leadsRef = collection(db, 'leads');

    let imported = 0;
    for (const lead of leads) {
      const newLeadRef = doc(leadsRef);
      batch.set(newLeadRef, {
        ...lead,
        userId,
        createdAt: new Date().toISOString(),
        importedAt: new Date().toISOString(),
      });
      imported++;
    }

    await batch.commit();

    return { success: true, imported };
  } catch (error: any) {
    console.error('Error saving leads:', error);
    return { success: false, imported: 0, error: error.message || 'Failed to save leads' };
  }
};

/**
 * Third-party integration templates
 */
export const integrationTemplates = {
  hubspot: {
    name: 'HubSpot',
    fields: ['firstname', 'lastname', 'email', 'company', 'phone', 'lead_status'],
    apiEndpoint: 'https://api.hubapi.com/contacts/v1/lists/all/contacts/all',
    requiresAuth: true,
  },
  salesforce: {
    name: 'Salesforce',
    fields: ['FirstName', 'LastName', 'Email', 'Company', 'Phone', 'Status'],
    apiEndpoint: '/services/data/v52.0/query',
    requiresAuth: true,
  },
  pipedrive: {
    name: 'Pipedrive',
    fields: ['name', 'email', 'phone', 'org_name', 'status'],
    apiEndpoint: 'https://api.pipedrive.com/v1/persons',
    requiresAuth: true,
  },
};

/**
 * Connect to third-party CRM (placeholder for OAuth flow)
 */
export const connectThirdPartyCRM = async (
  provider: 'hubspot' | 'salesforce' | 'pipedrive',
  userId: string
): Promise<{ success: boolean; error?: string }> => {
  // This would initiate OAuth flow in production
  console.log(`Connecting to ${provider} for user ${userId}`);
  
  // Placeholder - in production, this would:
  // 1. Redirect to OAuth provider
  // 2. Handle callback
  // 3. Store access token
  // 4. Fetch and import leads
  
  return { 
    success: false, 
    error: 'Third-party integrations require API keys. Please contact support to set up your integration.' 
  };
};

/**
 * Export sample CSV template
 */
export const generateSampleCSV = (): string => {
  const headers = ['name', 'company', 'email', 'phone', 'source', 'status', 'value', 'notes'];
  const sampleRows = [
    ['John Doe', 'Acme Corp', 'john@acme.com', '+1-555-0100', 'Website', 'New', '$5000', 'Interested in Enterprise plan'],
    ['Jane Smith', 'TechStart Inc', 'jane@techstart.io', '+1-555-0101', 'Referral', 'Contacted', '$10000', 'Follow up next week'],
    ['Bob Johnson', 'Global Solutions', 'bob@globalsolutions.com', '+1-555-0102', 'LinkedIn', 'Qualified', '$15000', 'Ready to demo'],
  ];

  const csv = [
    headers.join(','),
    ...sampleRows.map(row => row.join(','))
  ].join('\n');

  return csv;
};

/**
 * Download sample CSV
 */
export const downloadSampleCSV = () => {
  const csv = generateSampleCSV();
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'lead_import_template.csv';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

