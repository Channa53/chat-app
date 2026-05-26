import { type ChatRoomType } from '../constants/message-types.ts';

export interface ChatRoom {
  id: string;
  name: string | null;
  type: ChatRoomType;
  createdAt: string;
}
