const fs = require('fs');
const env = fs.readFileSync('.env.local', 'utf8');
env.split('\n').forEach(l => {
  const m = l.match(/^([^#=]+)=(.*)$/);
  if (m) process.env[m[1].trim()] = m[2].trim().replace(/^['"]|['"]$/g, '');
});

const bcrypt = require('bcryptjs');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function seedAccounts() {
  console.log("Seeding Admin and Students (Soniya & Mohit) into PostgreSQL...");
  const passwordHash = await bcrypt.hash("SkillNova@2026", 12);

  // 1. Admin Account
  const admin = await prisma.user.upsert({
    where: { email: "admin@skillnova.edu" },
    update: {
      name: "SkillNova Administrator",
      role: "ADMIN",
      passwordHash,
    },
    create: {
      id: "usr-admin-01",
      email: "admin@skillnova.edu",
      name: "SkillNova Administrator",
      role: "ADMIN",
      passwordHash,
    },
  });
  console.log(`[ADMIN CREATED/UPDATED]: ${admin.name} (${admin.email}, Role: ${admin.role})`);

  // 2. Student Soniya Chauhan Account
  let soniya = await prisma.user.findFirst({
    where: {
      OR: [
        { id: "usr-student-soniya" },
        { email: "soniya.chauhan@skillnova.edu" },
        { email: "soniya@skillnova.edu" },
      ],
    },
  });

  if (soniya) {
    soniya = await prisma.user.update({
      where: { id: soniya.id },
      data: {
        name: "Soniya Chauhan",
        email: "soniya.chauhan@skillnova.edu",
        role: "STUDENT",
        passwordHash,
      },
    });
  } else {
    soniya = await prisma.user.create({
      data: {
        id: "usr-student-soniya",
        email: "soniya.chauhan@skillnova.edu",
        name: "Soniya Chauhan",
        role: "STUDENT",
        passwordHash,
      },
    });
  }
  console.log(`[STUDENT CREATED/UPDATED]: ${soniya.name} (${soniya.email}, Role: ${soniya.role})`);

  // 3. Student Mohit Account
  let mohit = await prisma.user.findFirst({
    where: {
      OR: [
        { id: "usr-student-mohit" },
        { email: "mohit@skillnova.edu" },
      ],
    },
  });

  if (mohit) {
    mohit = await prisma.user.update({
      where: { id: mohit.id },
      data: {
        name: "Mohit",
        email: "mohit@skillnova.edu",
        role: "STUDENT",
        passwordHash,
      },
    });
  } else {
    mohit = await prisma.user.create({
      data: {
        id: "usr-student-mohit",
        email: "mohit@skillnova.edu",
        name: "Mohit",
        role: "STUDENT",
        passwordHash,
      },
    });
  }
  console.log(`[STUDENT CREATED/UPDATED]: ${mohit.name} (${mohit.email}, Role: ${mohit.role})`);

  // Enroll both students in default AI course track meeting if present
  const meeting = await prisma.meeting.findFirst({
    where: { roomId: "ai-eng-live" },
  });

  if (meeting) {
    await prisma.membership.upsert({
      where: {
        userId_meetingId: {
          userId: soniya.id,
          meetingId: meeting.id,
        },
      },
      update: { role: "STUDENT" },
      create: {
        userId: soniya.id,
        meetingId: meeting.id,
        role: "STUDENT",
      },
    });

    await prisma.membership.upsert({
      where: {
        userId_meetingId: {
          userId: mohit.id,
          meetingId: meeting.id,
        },
      },
      update: { role: "STUDENT" },
      create: {
        userId: mohit.id,
        meetingId: meeting.id,
        role: "STUDENT",
      },
    });
    console.log("Enrolled Soniya and Mohit into cohort: ai-eng-live");
  }
}

seedAccounts()
  .catch(err => {
    console.error("Failed to seed accounts:", err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
