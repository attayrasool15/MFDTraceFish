// src/constants/dummyUsers.ts
export type UserRole = 'fisherman' | 'middle_man' | 'exporter' | 'mfd_staff';

export const DUMMY_USERS: Array<{
  email: string;
  password: string;
  role: UserRole;
  name: string;
}> = [
  { email: 'fish@demo.com',  password: '123456', role: 'fisherman',  name: 'Ali Fisher' },
  { email: 'mid@demo.com',   password: '123456', role: 'middle_man', name: 'Bilal Broker' },
  { email: 'exp@demo.com',   password: '123456', role: 'exporter',   name: 'Cyan Export' },
  { email: 'mfd@demo.com',   password: '123456', role: 'mfd_staff',  name: 'Dua MFD' },
];
