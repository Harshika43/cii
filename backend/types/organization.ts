export interface Organization {
  id: string;
  name: string;
  industry: string;
  admin_email: string;
  admin_password?: string;
  invite_code: string;
  created_at: string;
}

export interface OrgContext {
  org: Organization;
  department: string;
  isAdmin: boolean;
}

export interface DeptStats {
  dept: string;
  count: number;
  avgCII: number;
  avgDims: number[];
}
