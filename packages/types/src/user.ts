export type UserRole = 'ADMIN' | 'MANAGER' | 'USER' | 'VIEWER';

export interface User {
  id: string;
  email: string;
  name?: string;
  avatar?: string;
  role: UserRole;
  status: boolean;
  createdAt: Date;
  updatedAt: Date;
}
