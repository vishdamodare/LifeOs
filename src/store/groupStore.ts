import { create } from 'zustand';
import { Group, User } from '../types';
import groupService from '../services/groupService';

interface GroupState {
  groups: Group[];
  activeGroupMembers: User[];
  isLoading: boolean;
  error: string | null;
  fetchGroups: (userId: string) => Promise<void>;
  fetchGroupMembers: (groupId: string) => Promise<void>;
  createGroup: (
    name: string,
    description: string,
    creatorId: string,
    memberIds: string[],
    profilePic?: string
  ) => Promise<boolean>;
  transferOwnership: (groupId: string, ownerId: string, newOwnerId: string) => Promise<boolean>;
}

export const useGroupStore = create<GroupState>((set) => ({
  groups: [],
  activeGroupMembers: [],
  isLoading: false,
  error: null,
  
  fetchGroups: async (userId) => {
    set({ isLoading: true, error: null });
    try {
      const groups = await groupService.getGroups(userId);
      set({ groups, isLoading: false });
    } catch (err: any) {
      set({ error: err.message || 'Failed to fetch groups', isLoading: false });
    }
  },
  
  fetchGroupMembers: async (groupId) => {
    set({ isLoading: true, error: null });
    try {
      const activeGroupMembers = await groupService.getGroupMembers(groupId);
      set({ activeGroupMembers, isLoading: false });
    } catch (err: any) {
      set({ error: err.message || 'Failed to fetch group members', isLoading: false });
    }
  },
  
  createGroup: async (name, description, creatorId, memberIds, profilePic) => {
    set({ isLoading: true, error: null });
    try {
      await groupService.createGroup(name, description, creatorId, memberIds, profilePic);
      // Refresh groups list
      const groups = await groupService.getGroups(creatorId);
      set({ groups, isLoading: false });
      return true;
    } catch (err: any) {
      set({ error: err.message || 'Failed to create group', isLoading: false });
      return false;
    }
  },
  
  transferOwnership: async (groupId, ownerId, newOwnerId) => {
    set({ isLoading: true, error: null });
    try {
      const success = await groupService.transferOwnership(groupId, ownerId, newOwnerId);
      if (success) {
        // Refresh groups
        const groups = await groupService.getGroups(ownerId);
        set({ groups, isLoading: false });
      }
      return success;
    } catch (err: any) {
      set({ error: err.message || 'Failed to transfer ownership', isLoading: false });
      return false;
    }
  }
}));
export default useGroupStore;
