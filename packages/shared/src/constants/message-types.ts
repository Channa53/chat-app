export const ChatRoomType = {
  DIRECT: 'DIRECT',
  GROUP: 'GROUP',
} as const;

export type ChatRoomType = (typeof ChatRoomType)[keyof typeof ChatRoomType];

export const MessageType = {
  TEXT: 'TEXT',
} as const;

export type MessageType = (typeof MessageType)[keyof typeof MessageType];
