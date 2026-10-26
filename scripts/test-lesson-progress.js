/**
 * Test Suite: Lesson Learning Experience, Completion Persistence & Teacher Course Boundaries
 */
const http = require("http");

function request(options, postData = null) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let data = "";
      res.on("data", (chunk) => (data += chunk));
      res.on("end", () => {
        let json = null;
        try {
          json = JSON.parse(data);
        } catch (e) {
          json = data;
        }
        resolve({
          status: res.statusCode,
          headers: res.headers,
          data: json,
        });
      });
    });

    req.on("error", reject);

    if (postData) {
      if (typeof postData === "object") {
        req.write(JSON.stringify(postData));
      } else {
        req.write(postData);
      }
    }
    req.end();
  });
}

function extractCookie(setCookieHeaders, cookieName) {
  if (!setCookieHeaders) return null;
  const headers = Array.isArray(setCookieHeaders) ? setCookieHeaders : [setCookieHeaders];
  for (const h of headers) {
    if (h.includes(`${cookieName}=`)) {
      const parts = h.split(";");
      return parts[0].trim();
    }
  }
  return null;
}

let passed = 0;
let failed = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`[PASS] ${message}`);
    passed++;
  } else {
    console.error(`[FAIL] ${message}`);
    failed++;
  }
}

async function runLessonSuite() {
  console.log("==========================================================");
  console.log("   SkillNova Lesson Experience & Boundaries Suite         ");
  console.log("==========================================================\n");

  // 1. Get python course and lesson id
  const courseRes = await request({
    hostname: "localhost",
    port: 3000,
    path: "/api/courses/python-programming",
    method: "GET",
  });
  assert(courseRes.status === 200, "Fetched Python course info successfully");
  const firstLesson = courseRes.data?.course?.modules?.[0]?.lessons?.[0];
  const secondLesson = courseRes.data?.course?.modules?.[0]?.lessons?.[1];
  assert(Boolean(firstLesson), `Found first lesson (${firstLesson?.title})`);

  // 2. Unauthenticated access blocked
  console.log("\n--- 1. Testing Unauthenticated Lesson Access ---");
  const unauthLesson = await request({
    hostname: "localhost",
    port: 3000,
    path: `/api/courses/python-programming/lessons/${firstLesson.id}`,
    method: "GET",
  });
  assert(unauthLesson.status === 401, `Unauthenticated lesson access rejected with 401 (Status: ${unauthLesson.status})`);

  // 3. Login as Student (Soniya)
  console.log("\n--- 2. Authenticating Student & Testing Enrolled Lesson Access ---");
  const studentLogin = await request(
    {
      hostname: "localhost",
      port: 3000,
      path: "/api/auth/login",
      method: "POST",
      headers: { "Content-Type": "application/json" },
    },
    { email: "soniya.chauhan@skillnova.edu", password: "SkillNova@2026" }
  );
  assert(studentLogin.status === 200, "Student logged in successfully");
  const studentCookie = extractCookie(studentLogin.headers["set-cookie"], "skillnova_session");

  // Fetch lesson with student session
  const lessonRes = await request({
    hostname: "localhost",
    port: 3000,
    path: `/api/courses/python-programming/lessons/${firstLesson.id}`,
    method: "GET",
    headers: { Cookie: studentCookie },
  });
  assert(lessonRes.status === 200, `Enrolled student can view lesson content (Status: ${lessonRes.status})`);
  assert(lessonRes.data.lesson?.title === firstLesson.title, `Received correct lesson title`);
  assert(lessonRes.data.navigation?.next?.id === secondLesson.id, `Navigation correctly identifies next lesson`);

  // 4. Mark lesson completed and verify progress calculation
  console.log("\n--- 3. Testing Persistent Lesson Progress Completion ---");
  const completeRes = await request(
    {
      hostname: "localhost",
      port: 3000,
      path: `/api/courses/python-programming/lessons/${firstLesson.id}`,
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Cookie: studentCookie,
      },
    },
    { isCompleted: true }
  );
  assert(completeRes.status === 200, `Lesson completion toggled to true (Status: ${completeRes.status})`);
  assert(completeRes.data.isCompleted === true, `Response confirms isCompleted: true`);
  assert(completeRes.data.progressPercent > 0, `Course progress recalculated: ${completeRes.data.progressPercent}%`);

  // Verify persistence on GET
  const verifyGet = await request({
    hostname: "localhost",
    port: 3000,
    path: `/api/courses/python-programming/lessons/${firstLesson.id}`,
    method: "GET",
    headers: { Cookie: studentCookie },
  });
  assert(verifyGet.data.lesson?.isCompleted === true, `Persistence check: Lesson marked isCompleted on new GET`);

  // 5. Cross-user progress isolation: Second student (Mohit) should see incomplete lesson
  console.log("\n--- 4. Testing Cross-Student Progress Isolation ---");
  const mohitLogin = await request(
    {
      hostname: "localhost",
      port: 3000,
      path: "/api/auth/login",
      method: "POST",
      headers: { "Content-Type": "application/json" },
    },
    { email: "mohit@skillnova.edu", password: "SkillNova@2026" }
  );
  assert(mohitLogin.status === 200, "Student 2 (Mohit) logged in successfully");
  const mohitCookie = extractCookie(mohitLogin.headers["set-cookie"], "skillnova_session");

  // First enroll Mohit in python
  await request(
    {
      hostname: "localhost",
      port: 3000,
      path: "/api/courses/enroll",
      method: "POST",
      headers: { "Content-Type": "application/json", Cookie: mohitCookie },
    },
    { courseId: courseRes.data.course.id }
  );

  const mohitLesson = await request({
    hostname: "localhost",
    port: 3000,
    path: `/api/courses/python-programming/lessons/${firstLesson.id}`,
    method: "GET",
    headers: { Cookie: mohitCookie },
  });
  assert(mohitLesson.data.lesson?.isCompleted === false, `Student 2 progress is isolated (isCompleted is false for Mohit)`);

  // 6. Teacher Course Boundaries
  console.log("\n--- 5. Testing Teacher Course Boundaries & Security ---");
  // Student cannot access teacher courses API
  const studentTeacherAccess = await request({
    hostname: "localhost",
    port: 3000,
    path: "/api/teacher/courses",
    method: "GET",
    headers: { Cookie: studentCookie },
  });
  assert(studentTeacherAccess.status === 403, `Student blocked from /api/teacher/courses with 403 (Status: ${studentTeacherAccess.status})`);

  // Admin access to teacher courses
  const adminLogin = await request(
    {
      hostname: "localhost",
      port: 3000,
      path: "/api/auth/login",
      method: "POST",
      headers: { "Content-Type": "application/json" },
    },
    { email: "admin@skillnova.edu", password: "SkillNova@2026" }
  );
  const adminCookie = extractCookie(adminLogin.headers["set-cookie"], "skillnova_session");

  const adminTeacherCourses = await request({
    hostname: "localhost",
    port: 3000,
    path: "/api/teacher/courses",
    method: "GET",
    headers: { Cookie: adminCookie },
  });
  assert(adminTeacherCourses.status === 200, `Admin successfully queries teacher courses with 200`);
  assert(adminTeacherCourses.data.courses?.length > 0, `Admin receives courses with student rosters`);

  console.log("\n==========================================================");
  console.log(`Results: ${passed} Passed, ${failed} Failed`);
  console.log("==========================================================");

  if (failed > 0) process.exit(1);
}

runLessonSuite().catch((e) => {
  console.error("Test failed:", e);
  process.exit(1);
});
