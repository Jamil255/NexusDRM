export interface CreateUserFormData {
  email: string;
  firstName: string;
  lastName: string;
  password: string;
  confirmPassword: string;
  roleId?: string;
  permissions?: string[];
  organizationId?: string;
}

export interface CreateOrgWithAdminFormData {
  orgName: string;
  plan: string;
  adminEmail: string;
  adminFirstName: string;
  adminLastName: string;
  adminPassword: string;
  confirmPassword: string;
}
