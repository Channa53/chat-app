import { type UserRole } from '../constants/roles.ts';

export interface User {
  id: string;
  email: string;
  username: string;
  role: UserRole;
  avatar: string | null;
  createdAt: string;
  updatedAt: string;
}
