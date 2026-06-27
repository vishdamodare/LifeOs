import apiClient from '../api/client';
import friendRepository from '../repositories/friendRepository';
import authRepository from '../repositories/authRepository';
import { User, Friendship } from '../types';

export const friendService = {
  getFriends: async (userId: string): Promise<User[]> => {
    const list = friendRepository.getFriendsForUser(userId);
    return apiClient.get(`/friends?userId=${userId}`, list);
  },
  
  addFriend: async (userId: string, friendPhone: string): Promise<Friendship> => {
    const friend = authRepository.findUserByPhone(friendPhone);
    if (!friend) {
      throw new Error('No registered user found with this phone number. Ask them to download LifeOS!');
    }
    
    if (friend.id === userId) {
      throw new Error('You cannot add yourself as a friend.');
    }
    
    const friendship = friendRepository.addFriendship(userId, friend.id);
    return apiClient.post(`/friends`, { userId, friendId: friend.id }, friendship);
  }
};

export default friendService;
