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

  // 2. Student Soniya Account
  const soniya = await prisma.user.upsert({
    where: { email: "soniya@skillnova.edu" },
    update: {
      name: "Soniya Sharma",
      role: "STUDENT",
      passwordHash,
    },
    create: {
      id: "usr-student-soniya",
      email: "soniya@skillnova.edu",
      name: "Soniya Sharma",
      role: "STUDENT",
      passwordHash,
    },
  });
  console.log(`[STUDENT CREATED/UPDATED]: ${soniya.name} (${soniya.email}, Role: ${soniya.role})`);

  // 3. Student Mohit Account
  const mohit = await prisma.user.upsert({
    where: { email: "mohit@skillnova.edu" },
    update: {
      name: "Mohit Kumar",
      role: "STUDENT",
      passwordHash,
    },
    create: {
      id: "usr-student-mohit",
      email: "mohit@skillnova.edu",
      name: "Mohit Kumar",
      role: "STUDENT",
      passwordHash,
    },
  });
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
