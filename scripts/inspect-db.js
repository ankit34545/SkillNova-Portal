const { PrismaClient } = require('@prisma/client');
require('fs');

// Load environment variables manually
const envContent = require('fs').readFileSync('.env.local', 'utf8');
envContent.split('\n').forEach(line => {
  const match = line.match(/^([^#=]+)=(.*)$/);
  if (match) {
    const key = match[1].trim();
    let val = match[2].trim();
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
      val = val.slice(1, -1);
    }
    process.env[key] = val;
  }
});

const prisma = new PrismaClient();

async function inspectDb() {
  console.log("Checking PostgreSQL database connection...");
  const raw = await prisma.$queryRaw`SELECT 1 as alive`;
  console.log("Raw query check:", raw);

  const users = await prisma.user.findMany();
  console.log("Total Users in DB:", users.length);
  users.forEach(u => console.log(` - [${u.role}] ${u.name} (${u.email})`));

  const meetings = await prisma.meeting.findMany();
  console.log("\nTotal Meetings in DB:", meetings.length);
  meetings.forEach(m => console.log(` - [${m.status}] ${m.title} (${m.roomId}, code: ${m.code})`));

  const doubts = await prisma.doubt.findMany({ include: { answers: true } });
  console.log("\nTotal Doubts in DB:", doubts.length);
  doubts.forEach(d => console.log(` - [${d.status}] ${d.question} (Answers: ${d.answers.length})`));

  const attendance = await prisma.attendance.findMany();
  console.log("\nTotal Attendance records in DB:", attendance.length);
  attendance.forEach(a => console.log(` - ${a.userName} [${a.role}] joined at ${a.joinedAt.toISOString()}`));
}

inspectDb()
  .catch(err => {
    console.error("DB inspection failed:", err);
  })
  .finally(() => prisma.$disconnect());
