import 'dotenv/config';

import { ChatRoomMemberRole, ChatRoomType, PrismaClient, UserRole } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

const BCRYPT_ROUNDS = 10;
const DEFAULT_PASSWORD = 'password123';

async function main(): Promise<void> {
  const passwordHash = await bcrypt.hash(DEFAULT_PASSWORD, BCRYPT_ROUNDS);

  const alice = await prisma.user.upsert({
    where: { email: 'alice@example.com' },
    update: {},
    create: {
      email: 'alice@example.com',
      username: 'alice',
      passwordHash,
      role: UserRole.ADMIN,
    },
  });

  const bob = await prisma.user.upsert({
    where: { email: 'bob@example.com' },
    update: {},
    create: {
      email: 'bob@example.com',
      username: 'bob',
      passwordHash,
      role: UserRole.USER,
    },
  });

  const carol = await prisma.user.upsert({
    where: { email: 'carol@example.com' },
    update: {},
    create: {
      email: 'carol@example.com',
      username: 'carol',
      passwordHash,
      role: UserRole.USER,
    },
  });

  const general = await prisma.chatRoom.upsert({
    where: { id: 'seed-room-general' },
    update: {},
    create: {
      id: 'seed-room-general',
      name: 'general',
      type: ChatRoomType.GROUP,
      members: {
        create: [
          { userId: alice.id, role: ChatRoomMemberRole.OWNER },
          { userId: bob.id, role: ChatRoomMemberRole.MEMBER },
          { userId: carol.id, role: ChatRoomMemberRole.MEMBER },
        ],
      },
    },
  });

  await prisma.message.createMany({
    data: [
      { content: 'Welcome to the general room!', senderId: alice.id, roomId: general.id },
      { content: 'Hi everyone', senderId: bob.id, roomId: general.id },
      { content: "Hey Bob, how's it going?", senderId: carol.id, roomId: general.id },
    ],
    skipDuplicates: true,
  });

  console.info('Seed complete', {
    users: [alice.username, bob.username, carol.username],
    room: general.name,
  });
}

main()
  .catch((err: unknown) => {
    console.error('Seed failed', err);
    process.exit(1);
  })
  .finally(() => {
    void prisma.$disconnect();
  });
