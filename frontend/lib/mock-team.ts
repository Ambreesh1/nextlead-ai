export interface TeamMember {
  id: string;
  name: string;
  role: string;
  email: string;
  status: 'active' | 'invited';
  leadsHandled: number;
  initials: string;
}

/**
 * Static illustrative data - the assignment's backend has no team/user
 * management endpoints, so this page is presentational only, showing how
 * a full CRM's team view would look.
 */
export const MOCK_TEAM: TeamMember[] = [
  { id: '1', name: 'Aditi Rao', role: 'Sales Lead', email: 'aditi@nextlead.io', status: 'active', leadsHandled: 128, initials: 'AR' },
  { id: '2', name: 'Marcus Chen', role: 'Account Executive', email: 'marcus@nextlead.io', status: 'active', leadsHandled: 94, initials: 'MC' },
  { id: '3', name: 'Priya Nair', role: 'Account Executive', email: 'priya@nextlead.io', status: 'active', leadsHandled: 76, initials: 'PN' },
  { id: '4', name: 'Sam Okafor', role: 'SDR', email: 'sam@nextlead.io', status: 'invited', leadsHandled: 0, initials: 'SO' },
  { id: '5', name: 'Elena Petrova', role: 'Operations', email: 'elena@nextlead.io', status: 'active', leadsHandled: 41, initials: 'EP' },
];
