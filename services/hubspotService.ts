/**
 * HubSpot Integration Service
 * Handles contact/lead import from HubSpot CRM
 */

import { db } from './firebase';
import { collection, writeBatch, doc } from 'firebase/firestore';

const HUBSPOT_API_KEY = import.meta.env.VITE_HUBSPOT_API_KEY || '';
const HUBSPOT_API_BASE = 'https://api.hubapi.com';

export interface HubSpotContact {
  id: string;
  properties: {
    firstname?: string;
    lastname?: string;
    email?: string;
    company?: string;
    phone?: string;
    lifecyclestage?: string;
    createdate?: string;
    hs_lead_status?: string;
  };
}

export interface HubSpotImportResult {
  success: boolean;
  imported: number;
  total: number;
  errors: string[];
}

/**
 * Test HubSpot API connection
 */
export const testHubSpotConnection = async (): Promise<boolean> => {
  if (!HUBSPOT_API_KEY) {
    throw new Error('HubSpot API key not configured');
  }

  try {
    const response = await fetch(`${HUBSPOT_API_BASE}/crm/v3/objects/contacts?limit=1`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${HUBSPOT_API_KEY}`,
        'Content-Type': 'application/json',
      },
    });

    return response.ok;
  } catch (error) {
    console.error('Error testing HubSpot connection:', error);
    return false;
  }
};

/**
 * Get contacts from HubSpot
 */
export const getHubSpotContacts = async (limit: number = 100): Promise<HubSpotContact[]> => {
  if (!HUBSPOT_API_KEY) {
    throw new Error('HubSpot API key not configured. Please add VITE_HUBSPOT_API_KEY to your .env file.');
  }

  try {
    const response = await fetch(
      `${HUBSPOT_API_BASE}/crm/v3/objects/contacts?limit=${limit}&properties=firstname,lastname,email,company,phone,lifecyclestage,createdate,hs_lead_status`,
      {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${HUBSPOT_API_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HubSpot API error: ${response.status}`);
    }

    const data = await response.json();
    return data.results || [];
  } catch (error: any) {
    console.error('Error fetching HubSpot contacts:', error);
    throw new Error(error.message || 'Failed to fetch contacts from HubSpot');
  }
};

/**
 * Map HubSpot contact to Aether lead
 */
const mapHubSpotContactToLead = (contact: HubSpotContact) => {
  const props = contact.properties;
  
  // Combine first and last name
  const name = [props.firstname, props.lastname]
    .filter(Boolean)
    .join(' ') || 'Unknown';

  // Map lifecycle stage to lead status
  const statusMap: Record<string, 'New' | 'Contacted' | 'Qualified' | 'Lost'> = {
    'lead': 'New',
    'marketingqualifiedlead': 'Qualified',
    'salesqualifiedlead': 'Qualified',
    'opportunity': 'Contacted',
    'customer': 'Qualified',
    'evangelist': 'Qualified',
    'other': 'New',
  };

  const status = statusMap[props.lifecyclestage?.toLowerCase() || ''] || 'New';

  return {
    name,
    company: props.company || 'Unknown Company',
    email: props.email || '',
    phone: props.phone || '',
    status,
    source: 'HubSpot',
    createdAt: props.createdate || new Date().toISOString(),
    hubspotId: contact.id,
  };
};

/**
 * Import contacts from HubSpot to Aether
 */
export const importHubSpotContacts = async (
  userId: string,
  limit: number = 100
): Promise<HubSpotImportResult> => {
  const errors: string[] = [];
  let imported = 0;

  try {
    // Fetch contacts from HubSpot
    const contacts = await getHubSpotContacts(limit);
    
    if (contacts.length === 0) {
      return {
        success: true,
        imported: 0,
        total: 0,
        errors: ['No contacts found in HubSpot'],
      };
    }

    // Batch write to Firestore
    const batch = writeBatch(db);
    const leadsRef = collection(db, 'leads');

    for (const contact of contacts) {
      try {
        // Skip contacts without email
        if (!contact.properties.email) {
          errors.push(`Skipped contact ${contact.id}: No email address`);
          continue;
        }

        const lead = mapHubSpotContactToLead(contact);
        const newLeadRef = doc(leadsRef);
        
        batch.set(newLeadRef, {
          ...lead,
          userId,
          importedAt: new Date().toISOString(),
        });
        
        imported++;
      } catch (error: any) {
        errors.push(`Error processing contact ${contact.id}: ${error.message}`);
      }
    }

    // Commit batch
    await batch.commit();

    return {
      success: true,
      imported,
      total: contacts.length,
      errors,
    };
  } catch (error: any) {
    console.error('Error importing HubSpot contacts:', error);
    return {
      success: false,
      imported: 0,
      total: 0,
      errors: [error.message || 'Failed to import contacts'],
    };
  }
};

/**
 * Get HubSpot account info
 */
export const getHubSpotAccountInfo = async () => {
  if (!HUBSPOT_API_KEY) {
    throw new Error('HubSpot API key not configured');
  }

  try {
    const response = await fetch(`${HUBSPOT_API_BASE}/account-info/v3/api-usage/daily`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${HUBSPOT_API_KEY}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch account info: ${response.status}`);
    }

    return await response.json();
  } catch (error: any) {
    console.error('Error fetching HubSpot account info:', error);
    throw error;
  }
};

/**
 * Sync a single contact from HubSpot
 */
export const syncHubSpotContact = async (
  userId: string,
  contactId: string
): Promise<{ success: boolean; error?: string }> => {
  if (!HUBSPOT_API_KEY) {
    return { success: false, error: 'HubSpot API key not configured' };
  }

  try {
    const response = await fetch(
      `${HUBSPOT_API_BASE}/crm/v3/objects/contacts/${contactId}?properties=firstname,lastname,email,company,phone,lifecyclestage,createdate`,
      {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${HUBSPOT_API_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch contact: ${response.status}`);
    }

    const contact: HubSpotContact = await response.json();
    const lead = mapHubSpotContactToLead(contact);

    // Save to Firestore
    const leadsRef = collection(db, 'leads');
    const newLeadRef = doc(leadsRef);
    
    await newLeadRef.set({
      ...lead,
      userId,
      importedAt: new Date().toISOString(),
    });

    return { success: true };
  } catch (error: any) {
    console.error('Error syncing HubSpot contact:', error);
    return { success: false, error: error.message };
  }
};

