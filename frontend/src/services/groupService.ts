import apiClient from '../api/client';
import groupRepository from '../repositories/groupRepository';
import authRepository from '../repositories/authRepository';
import { Group, User } from '../types';

export const groupService = {
  getGroups: async (userId: string): Promise<Group[]> => {
    const list = groupRepository.getGroupsForUser(userId);
    return apiClient.get(`/groups?userId=${userId}`, list);
  },
  
  getGroupMembers: async (groupId: string): Promise<User[]> => {
    const memberIds = groupRepository.getGroupMembers(groupId);
    const users = authRepository.getUsers();
    const members = memberIds.map((id) => users[id]).filter((u): u is User => !!u);
    return apiClient.get(`/groups/${groupId}/members`, members);
  },
  
  createGroup: async (
    name: string,
    description: string,
    creatorId: string,
    memberIds: string[],
    profilePic = '👥'
  ): Promise<Group> => {
    if (!name.trim()) {
      throw new Error('Group name cannot be empty.');
    }
    
    if (memberIds.length === 0) {
      throw new Error('Please select at least one friend to join the group.');
    }
    
    const group = groupRepository.createGroup(name, description, creatorId, memberIds, profilePic);
    return apiClient.post(`/groups`, { name, description, creatorId, memberIds, profilePic }, group);
  },
  
  transferOwnership: async (groupId: string, ownerId: string, newOwnerId: string): Promise<boolean> => {
    groupRepository.transferOwnership(groupId, ownerId, newOwnerId);
    return apiClient.patch(`/groups/${groupId}/owner`, { ownerId, newOwnerId }, true);
  }
};

export default groupService;
