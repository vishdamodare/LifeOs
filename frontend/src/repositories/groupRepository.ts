import { Group, GroupMember } from '../types';

const GROUPS_KEY = 'lifeos_groups_db';
const MEMBERS_KEY = 'lifeos_group_members_db';

const DEFAULT_GROUPS: Group[] = [
  {
    id: 'g1',
    name: 'Goa Trip',
    description: 'Annual college reunion trip to Goa',
    profile_picture: '🌴',
    created_by: 'ak',
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7).toISOString(), // 7 days ago
    updated_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7).toISOString()
  },
  {
    id: 'g2',
    name: 'Friends',
    description: 'Daily hangouts and dinners',
    profile_picture: '🍔',
    created_by: 'rp',
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 30).toISOString(), // 30 days ago
    updated_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 30).toISOString()
  }
];

const DEFAULT_MEMBERS: GroupMember[] = [
  // Goa Trip members
  { id: 'm1', group_id: 'g1', user_id: 'ak', joined_at: new Date().toISOString() },
  { id: 'm2', group_id: 'g1', user_id: 'rp', joined_at: new Date().toISOString() },
  { id: 'm3', group_id: 'g1', user_id: 'km', joined_at: new Date().toISOString() },
  { id: 'm4', group_id: 'g1', user_id: 'ps', joined_at: new Date().toISOString() },
  
  // Friends members
  { id: 'm5', group_id: 'g2', user_id: 'ak', joined_at: new Date().toISOString() },
  { id: 'm6', group_id: 'g2', user_id: 'rp', joined_at: new Date().toISOString() },
  { id: 'm7', group_id: 'g2', user_id: 'km', joined_at: new Date().toISOString() }
];

export const groupRepository = {
  getGroups: (): Group[] => {
    const data = localStorage.getItem(GROUPS_KEY);
    if (!data) {
      localStorage.setItem(GROUPS_KEY, JSON.stringify(DEFAULT_GROUPS));
      return DEFAULT_GROUPS;
    }
    return JSON.parse(data);
  },
  
  saveGroups: (groups: Group[]): void => {
    localStorage.setItem(GROUPS_KEY, JSON.stringify(groups));
  },
  
  getMembers: (): GroupMember[] => {
    const data = localStorage.getItem(MEMBERS_KEY);
    if (!data) {
      localStorage.setItem(MEMBERS_KEY, JSON.stringify(DEFAULT_MEMBERS));
      return DEFAULT_MEMBERS;
    }
    return JSON.parse(data);
  },
  
  saveMembers: (members: GroupMember[]): void => {
    localStorage.setItem(MEMBERS_KEY, JSON.stringify(members));
  },
  
  getGroupMembers: (groupId: string): string[] => {
    const members = groupRepository.getMembers();
    return members.filter((m) => m.group_id === groupId).map((m) => m.user_id);
  },
  
  getGroupsForUser: (userId: string): Group[] => {
    const groups = groupRepository.getGroups();
    const members = groupRepository.getMembers();
    const userGroupIds = members.filter((m) => m.user_id === userId).map((m) => m.group_id);
    
    return groups.filter((g) => userGroupIds.includes(g.id) && !g.deleted_at);
  },
  
  createGroup: (name: string, description: string, creatorId: string, memberIds: string[], profilePic = '👥'): Group => {
    const groups = groupRepository.getGroups();
    const members = groupRepository.getMembers();
    
    const newGroup: Group = {
      id: Math.random().toString(36).substring(2, 9),
      name,
      description,
      profile_picture: profilePic,
      created_by: creatorId,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    groups.push(newGroup);
    groupRepository.saveGroups(groups);
    
    // Add members (including creator if not present)
    const uniqueMembers = Array.from(new Set([creatorId, ...memberIds]));
    uniqueMembers.forEach((userId) => {
      members.push({
        id: Math.random().toString(36).substring(2, 9),
        group_id: newGroup.id,
        user_id: userId,
        joined_at: new Date().toISOString()
      });
    });
    
    groupRepository.saveMembers(members);
    return newGroup;
  },
  
  transferOwnership: (groupId: string, currentOwnerId: string, newOwnerId: string): void => {
    const groups = groupRepository.getGroups();
    const group = groups.find((g) => g.id === groupId && !g.deleted_at);
    if (!group) throw new Error('Group not found');
    if (group.created_by !== currentOwnerId) throw new Error('Only the group owner can transfer ownership');
    
    const members = groupRepository.getGroupMembers(groupId);
    if (!members.includes(newOwnerId)) throw new Error('New owner must be a member of the group');
    
    group.created_by = newOwnerId;
    group.updated_at = new Date().toISOString();
    groupRepository.saveGroups(groups);
  }
};

export default groupRepository;
