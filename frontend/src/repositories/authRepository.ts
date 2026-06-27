import { User } from '../types';

const USERS_KEY = 'lifeos_users_db';

const DEFAULT_USERS: Record<string, User> = {
  ak: {
    id: 'ak',
    name: 'Arjun Kumar',
    phone: '+91 99999 88888',
    upi_id: 'arjun@upi',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    last_login_at: new Date().toISOString()
  },
  rp: {
    id: 'rp',
    name: 'Rahul Patel',
    phone: '+91 98765 43210',
    upi_id: 'rahul@upi',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    last_login_at: new Date().toISOString()
  },
  km: {
    id: 'km',
    name: 'Karan Mehta',
    phone: '+91 87654 32109',
    upi_id: 'karan@upi',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    last_login_at: new Date().toISOString()
  },
  ps: {
    id: 'ps',
    name: 'Priya Sharma',
    phone: '+91 76543 21098',
    upi_id: 'priya@upi',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    last_login_at: new Date().toISOString()
  },
  rj: {
    id: 'rj',
    name: 'Riya Joshi',
    phone: '+91 65432 10987',
    upi_id: 'riya@upi',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    last_login_at: new Date().toISOString()
  }
};

export const authRepository = {
  getUsers: (): Record<string, User> => {
    const data = localStorage.getItem(USERS_KEY);
    if (!data) {
      localStorage.setItem(USERS_KEY, JSON.stringify(DEFAULT_USERS));
      return DEFAULT_USERS;
    }
    return JSON.parse(data);
  },
  
  saveUser: (user: User): void => {
    const users = authRepository.getUsers();
    users[user.id] = user;
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
  },
  
  findUserByPhone: (phone: string): User | null => {
    const users = authRepository.getUsers();
    const found = Object.values(users).find(u => u.phone === phone && !u.deleted_at);
    return found || null;
  },
  
  findUserById: (id: string): User | null => {
    const users = authRepository.getUsers();
    return users[id] || null;
  }
};

export default authRepository;
