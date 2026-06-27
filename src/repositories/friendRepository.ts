import { Friendship, User } from '../types';
import authRepository from './authRepository';

const FRIENDSHIPS_KEY = 'lifeos_friendships_db';

const DEFAULT_FRIENDSHIPS: Friendship[] = [
  { id: 'f1', user1_id: 'ak', user2_id: 'rp', status: 'active', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: 'f2', user1_id: 'ak', user2_id: 'km', status: 'active', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: 'f3', user1_id: 'ak', user2_id: 'ps', status: 'active', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: 'f4', user1_id: 'ak', user2_id: 'rj', status: 'active', created_at: new Date().toISOString(), updated_at: new Date().toISOString() }
];

export const friendRepository = {
  getFriendships: (): Friendship[] => {
    const data = localStorage.getItem(FRIENDSHIPS_KEY);
    if (!data) {
      localStorage.setItem(FRIENDSHIPS_KEY, JSON.stringify(DEFAULT_FRIENDSHIPS));
      return DEFAULT_FRIENDSHIPS;
    }
    return JSON.parse(data);
  },
  
  saveFriendships: (friendships: Friendship[]): void => {
    localStorage.setItem(FRIENDSHIPS_KEY, JSON.stringify(friendships));
  },
  
  getFriendsForUser: (userId: string): User[] => {
    const friendships = friendRepository.getFriendships();
    const users = authRepository.getUsers();
    
    return friendships
      .filter((f) => (f.user1_id === userId || f.user2_id === userId) && f.status === 'active')
      .map((f) => {
        const friendId = f.user1_id === userId ? f.user2_id : f.user1_id;
        return users[friendId];
      })
      .filter((u): u is User => !!u && !u.deleted_at);
  },
  
  addFriendship: (userId: string, friendId: string): Friendship => {
    const friendships = friendRepository.getFriendships();
    
    // Sort keys alphabetically to enforce user1_id < user2_id
    const user1_id = userId < friendId ? userId : friendId;
    const user2_id = userId < friendId ? friendId : userId;
    
    const existing = friendships.find((f) => f.user1_id === user1_id && f.user2_id === user2_id);
    if (existing) {
      if (existing.status === 'active') {
        throw new Error('You are already friends with this user.');
      } else {
        existing.status = 'active';
        existing.updated_at = new Date().toISOString();
        friendRepository.saveFriendships(friendships);
        return existing;
      }
    }
    
    const newFriendship: Friendship = {
      id: Math.random().toString(36).substring(2, 9),
      user1_id,
      user2_id,
      status: 'active',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    friendships.push(newFriendship);
    friendRepository.saveFriendships(friendships);
    return newFriendship;
  }
};

export default friendRepository;
