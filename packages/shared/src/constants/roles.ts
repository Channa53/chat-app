export const UserRole = {
  USER: 'USER',
  MODERATOR: 'MODERATOR',
  ADMIN: 'ADMIN',
} as const;

export type UserRole = (typeof UserRole)[keyof typeof UserRole];

export const ChatRoomMemberRole = {
  MEMBER: 'MEMBER',
  ADMIN: 'ADMIN',
  OWNER: 'OWNER',
} as const;

export type ChatRoomMemberRole = (typeof ChatRoomMemberRole)[keyof typeof ChatRoomMemberRole];
