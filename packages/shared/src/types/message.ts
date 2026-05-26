export interface Message {
  id: string;
  content: string;
  senderId: string;
  roomId: string;
  createdAt: string;
  editedAt: string | null;
  deletedAt: string | null;
}
