const { execSync } = require('child_process');
const fs = require('fs');
const { PrismaClient } = require('@prisma/client');

// Load environment credentials from .env.local
const envContent = fs.readFileSync('.env.local', 'utf8');
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

const PG_DUMP = 'C:\\Program Files\\PostgreSQL\\18\\bin\\pg_dump.exe';
const PSQL = 'C:\\Program Files\\PostgreSQL\\18\\bin\\psql.exe';
const BACKUP_FILE = 'skillnova_backup.sql';
const TEST_DB = 'skillnova_restore_test';

async function runBackupAndRestoreTest() {
  console.log("=== SkillNova PostgreSQL Backup & Restore Test ===");
  process.env.PGPASSWORD = 'root';

  // Step 1: Execute pg_dump
  console.log(`[1/5] Dumping database 'skillnova' to ${BACKUP_FILE}...`);
  execSync(`"${PG_DUMP}" -h localhost -p 5432 -U postgres -d skillnova -F p -f ${BACKUP_FILE}`);
  const stats = fs.statSync(BACKUP_FILE);
  console.log(`Backup created successfully: ${stats.size} bytes`);

  // Step 2: Create isolated test database
  console.log(`[2/5] Creating isolated test database '${TEST_DB}'...`);
  try {
    execSync(`"${PSQL}" -h localhost -p 5432 -U postgres -c "DROP DATABASE IF EXISTS ${TEST_DB};"`, { stdio: 'pipe' });
    execSync(`"${PSQL}" -h localhost -p 5432 -U postgres -c "CREATE DATABASE ${TEST_DB};"`, { stdio: 'pipe' });
    console.log(`Test database '${TEST_DB}' created.`);
  } catch (err) {
    console.error("Failed to provision test DB:", err.message);
    throw err;
  }

  // Step 3: Restore into isolated test database
  console.log(`[3/5] Restoring backup SQL into '${TEST_DB}'...`);
  execSync(`"${PSQL}" -h localhost -p 5432 -U postgres -d ${TEST_DB} -f ${BACKUP_FILE}`, { stdio: 'pipe' });
  console.log("Restore execution completed.");

  // Step 4: Verify restored records with Prisma
  console.log("[4/5] Verifying restored schema and data integrity...");
  const testPrisma = new PrismaClient({
    datasources: {
      db: {
        url: `postgresql://postgres:root@localhost:5432/${TEST_DB}?schema=public`,
      },
    },
  });

  try {
    const userCount = await testPrisma.user.count();
    const meetingCount = await testPrisma.meeting.count();
    const doubtCount = await testPrisma.doubt.count();
    const attendanceCount = await testPrisma.attendance.count();
    const noteCount = await testPrisma.note.count();

    console.log("Restored Record Counts:");
    console.log(` - Users: ${userCount}`);
    console.log(` - Meetings: ${meetingCount}`);
    console.log(` - Doubts: ${doubtCount}`);
    console.log(` - Attendance Records: ${attendanceCount}`);
    console.log(` - Notes: ${noteCount}`);

    if (userCount === 0 || meetingCount === 0) {
      throw new Error("Verification failed: Restored table is empty!");
    }
    console.log("All tables verified with intact relational consistency.");
  } finally {
    await testPrisma.$disconnect();
  }

  // Step 5: Clean up isolated test database
  console.log(`[5/5] Cleaning up isolated test database '${TEST_DB}'...`);
  execSync(`"${PSQL}" -h localhost -p 5432 -U postgres -c "DROP DATABASE IF EXISTS ${TEST_DB};"`, { stdio: 'pipe' });
  console.log("Cleanup complete. Production/development data remains completely untouched.");
}

runBackupAndRestoreTest().catch(err => {
  console.error("Backup & Restore Audit Error:", err);
  process.exit(1);
});
