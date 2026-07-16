import { ChatRoomMemberRole, ChatRoomType, type Prisma } from '@prisma/client';

import { type AddMemberInput, type CreateRoomInput } from '@/schemas/room-schemas.js';
import { AppError } from '@/utils/app-error.js';
import { prisma } from '@/utils/prisma.js';

const DEFAULT_PAGE_SIZE = 20;
const MAX_PAGE_SIZE = 50;

// Roles allowed to manage a room (rename, add/remove members).
const MANAGER_ROLES: ChatRoomMemberRole[] = [ChatRoomMemberRole.OWNER, ChatRoomMemberRole.ADMIN];

// Shape returned to clients: room + members with their public user info.
const roomWithMembers = {
  include: {
    members: {
      include: {
        user: { select: { id: true, username: true, avatar: true, role: true } },
      },
      orderBy: { joinedAt: 'asc' },
    },
  },
} satisfies Prisma.ChatRoomDefaultArgs;

export type RoomWithMembers = Prisma.ChatRoomGetPayload<typeof roomWithMembers>;

export interface ListRoomsOptions {
  cursor?: string;
  limit?: number;
}

export interface PaginatedRooms {
  items: RoomWithMembers[];
  nextCursor: string | null;
}

/** Load the caller's membership for a room, or throw 404/403. */
async function requireMembership(roomId: string, userId: string) {
  const room = await prisma.chatRoom.findUnique({ where: { id: roomId } });
  if (!room) {
    throw AppError.notFound('Room not found', 'ROOM_NOT_FOUND');
  }

  const membership = await prisma.chatRoomMember.findUnique({
    where: { userId_roomId: { userId, roomId } },
  });
  if (!membership) {
    throw AppError.forbidden('You are not a member of this room', 'NOT_A_MEMBER');
  }

  return { room, membership };
}

async function findRoomWithMembers(roomId: string): Promise<RoomWithMembers> {
  const room = await prisma.chatRoom.findUnique({ where: { id: roomId }, ...roomWithMembers });
  if (!room) {
    throw AppError.notFound('Room not found', 'ROOM_NOT_FOUND');
  }
  return room;
}

export async function createRoom(userId: string, input: CreateRoomInput): Promise<RoomWithMembers> {
  // Never trust the caller to include themselves; de-dupe and drop self.
  const otherMemberIds = [...new Set(input.memberIds)].filter((id) => id !== userId);

  const existingUsers = await prisma.user.findMany({
    where: { id: { in: otherMemberIds } },
    select: { id: true },
  });
  if (existingUsers.length !== otherMemberIds.length) {
    throw AppError.badRequest('One or more members do not exist', 'INVALID_MEMBER');
  }

  if (input.type === ChatRoomType.DIRECT) {
    const otherId = otherMemberIds[0];
    if (!otherId) {
      throw AppError.badRequest('A direct room requires another member', 'INVALID_MEMBER');
    }

    // Reuse an existing direct room between the same two users instead of duplicating.
    const existing = await prisma.chatRoom.findFirst({
      where: {
        type: ChatRoomType.DIRECT,
        AND: [{ members: { some: { userId } } }, { members: { some: { userId: otherId } } }],
      },
      ...roomWithMembers,
    });
    if (existing) {
      return existing;
    }

    return prisma.chatRoom.create({
      data: {
        type: ChatRoomType.DIRECT,
        members: {
          create: [
            { userId, role: ChatRoomMemberRole.MEMBER },
            { userId: otherId, role: ChatRoomMemberRole.MEMBER },
          ],
        },
      },
      ...roomWithMembers,
    });
  }

  return prisma.chatRoom.create({
    data: {
      type: ChatRoomType.GROUP,
      name: input.name,
      members: {
        create: [
          { userId, role: ChatRoomMemberRole.OWNER },
          ...otherMemberIds.map((id) => ({ userId: id, role: ChatRoomMemberRole.MEMBER })),
        ],
      },
    },
    ...roomWithMembers,
  });
}

export async function listRooms(
  userId: string,
  options: ListRoomsOptions = {}
): Promise<PaginatedRooms> {
  const limit = Math.min(Math.max(options.limit ?? DEFAULT_PAGE_SIZE, 1), MAX_PAGE_SIZE);

  const rooms = await prisma.chatRoom.findMany({
    where: { members: { some: { userId } } },
    orderBy: { createdAt: 'desc' },
    take: limit + 1, // fetch one extra to detect whether another page exists
    ...(options.cursor ? { cursor: { id: options.cursor }, skip: 1 } : {}),
    ...roomWithMembers,
  });

  const hasMore = rooms.length > limit;
  const items = hasMore ? rooms.slice(0, limit) : rooms;
  const nextCursor = hasMore ? (items.at(-1)?.id ?? null) : null;

  return { items, nextCursor };
}

export async function getRoom(userId: string, roomId: string): Promise<RoomWithMembers> {
  await requireMembership(roomId, userId);
  return findRoomWithMembers(roomId);
}

export async function updateRoom(
  userId: string,
  roomId: string,
  name: string
): Promise<RoomWithMembers> {
  const { room, membership } = await requireMembership(roomId, userId);

  if (room.type !== ChatRoomType.GROUP) {
    throw AppError.badRequest('Only group rooms can be renamed', 'NOT_A_GROUP');
  }
  if (!MANAGER_ROLES.includes(membership.role)) {
    throw AppError.forbidden('Only a room admin or owner can rename it', 'INSUFFICIENT_ROOM_ROLE');
  }

  await prisma.chatRoom.update({ where: { id: roomId }, data: { name } });
  return findRoomWithMembers(roomId);
}

export async function addMember(
  userId: string,
  roomId: string,
  input: AddMemberInput
): Promise<RoomWithMembers> {
  const { room, membership } = await requireMembership(roomId, userId);

  if (room.type !== ChatRoomType.GROUP) {
    throw AppError.badRequest('Members can only be added to group rooms', 'NOT_A_GROUP');
  }
  if (!MANAGER_ROLES.includes(membership.role)) {
    throw AppError.forbidden(
      'Only a room admin or owner can add members',
      'INSUFFICIENT_ROOM_ROLE'
    );
  }

  const target = await prisma.user.findUnique({ where: { id: input.userId }, select: { id: true } });
  if (!target) {
    throw AppError.badRequest('User does not exist', 'INVALID_MEMBER');
  }

  const alreadyMember = await prisma.chatRoomMember.findUnique({
    where: { userId_roomId: { userId: input.userId, roomId } },
  });
  if (alreadyMember) {
    throw AppError.conflict('User is already a member of this room', 'ALREADY_MEMBER');
  }

  await prisma.chatRoomMember.create({
    data: { userId: input.userId, roomId, role: ChatRoomMemberRole[input.role] },
  });
  return findRoomWithMembers(roomId);
}

export async function removeMember(
  userId: string,
  roomId: string,
  targetUserId: string
): Promise<RoomWithMembers> {
  const { membership } = await requireMembership(roomId, userId);

  const target = await prisma.chatRoomMember.findUnique({
    where: { userId_roomId: { userId: targetUserId, roomId } },
  });
  if (!target) {
    throw AppError.notFound('That user is not a member of this room', 'NOT_A_MEMBER');
  }

  const isSelf = targetUserId === userId;
  if (!isSelf && !MANAGER_ROLES.includes(membership.role)) {
    throw AppError.forbidden(
      'Only a room admin or owner can remove other members',
      'INSUFFICIENT_ROOM_ROLE'
    );
  }
  // The owner cannot be removed by anyone (they may leave only after transferring ownership).
  if (target.role === ChatRoomMemberRole.OWNER) {
    throw AppError.forbidden('The room owner cannot be removed', 'CANNOT_REMOVE_OWNER');
  }

  await prisma.chatRoomMember.delete({
    where: { userId_roomId: { userId: targetUserId, roomId } },
  });
  return findRoomWithMembers(roomId);
}
