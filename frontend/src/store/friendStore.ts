import { create } from 'zustand';
import { User } from '../types';
import friendService from '../services/friendService';

interface FriendState {
  friends: User[];
  isLoading: boolean;
  error: string | null;
  fetchFriends: (userId: string) => Promise<void>;
  addFriend: (userId: string, phone: string) => Promise<boolean>;
}

export const useFriendStore = create<FriendState>((set) => ({
  friends: [],
  isLoading: false,
  error: null,
  
  fetchFriends: async (userId) => {
    set({ isLoading: true, error: null });
    try {
      const friends = await friendService.getFriends(userId);
      set({ friends, isLoading: false });
    } catch (err: any) {
      set({ error: err.message || 'Failed to fetch friends', isLoading: false });
    }
  },
  
  addFriend: async (userId, phone) => {
    set({ isLoading: true, error: null });
    try {
      await friendService.addFriend(userId, phone);
      // Refresh friends list
      const friends = await friendService.getFriends(userId);
      set({ friends, isLoading: false });
      return true;
    } catch (err: any) {
      set({ error: err.message || 'Failed to add friend', isLoading: false });
      return false;
    }
  }
}));
export default useFriendStore;
