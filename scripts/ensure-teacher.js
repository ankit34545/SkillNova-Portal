const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

async function main() {
  const hash = await bcrypt.hash('SkillNova@2026', 12);
  const teacher = await prisma.user.upsert({
    where: { email: 'teacher@skillnova.edu' },
    update: {
      name: 'Dr. Aryan Mehta',
      role: 'TEACHER',
      passwordHash: hash,
    },
    create: {
      id: 'usr-teacher-aryan',
      email: 'teacher@skillnova.edu',
      name: 'Dr. Aryan Mehta',
      role: 'TEACHER',
      passwordHash: hash,
    },
  });

  // Assign the 4 initial courses to this teacher
  await prisma.course.updateMany({
    data: { instructorId: teacher.id },
  });

  console.log('Teacher ready:', teacher.name, teacher.email);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
