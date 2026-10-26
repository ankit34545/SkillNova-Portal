/**
 * Test Suite: Course Catalogue, Enrollment & Role Permissions
 */
const http = require("http");

const BASE_URL = "http://localhost:3000";

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

async function runCourseTests() {
  console.log("==========================================================");
  console.log("   SkillNova Course Catalogue & Real Enrollment Suite     ");
  console.log("==========================================================\n");

  // 1. Test public course catalogue
  console.log("--- 1. Testing Public Course Catalogue ---");
  const catRes = await request({
    hostname: "localhost",
    port: 3000,
    path: "/api/courses",
    method: "GET",
  });

  assert(catRes.status === 200, `GET /api/courses returns 200 (Status: ${catRes.status})`);
  assert(catRes.data.courses && catRes.data.courses.length === 4, `Catalogue contains exactly 4 initial courses (Got: ${catRes.data.courses?.length})`);

  const titles = catRes.data.courses.map((c) => c.title);
  assert(titles.includes("Python Programming"), `Contains 'Python Programming'`);
  assert(titles.includes("Java Programming"), `Contains 'Java Programming'`);
  assert(titles.includes("C++ Programming"), `Contains 'C++ Programming'`);
  assert(titles.includes("Web Development"), `Contains 'Web Development'`);

  // Verify modules and lessons are populated
  const python = catRes.data.courses.find((c) => c.slug === "python-programming");
  assert(python && python.moduleCount === 4, `Python course has 4 modules (Got: ${python?.moduleCount})`);
  assert(python && python.lessonCount === 12, `Python course has 12 lessons (Got: ${python?.lessonCount})`);

  // 2. Test course detail by slug
  console.log("\n--- 2. Testing Course Details & Syllabus ---");
  const detailRes = await request({
    hostname: "localhost",
    port: 3000,
    path: "/api/courses/python-programming",
    method: "GET",
  });

  assert(detailRes.status === 200, `GET /api/courses/python-programming returns 200 (Status: ${detailRes.status})`);
  assert(detailRes.data.course?.title === "Python Programming", `Returns correct title`);
  assert(detailRes.data.course?.modules?.length === 4, `Returns detailed modules list`);
  assert(detailRes.data.course?.modules[0]?.lessons?.length > 0, `Returns lessons within module`);

  // 3. Test unauthenticated enrollment rejected with 401
  console.log("\n--- 3. Testing Unauthenticated Enrollment Protection ---");
  const unauthEnroll = await request(
    {
      hostname: "localhost",
      port: 3000,
      path: "/api/courses/enroll",
      method: "POST",
      headers: { "Content-Type": "application/json" },
    },
    { courseId: python.id }
  );

  assert(unauthEnroll.status === 401, `Rejects unauthenticated enrollment with 401 (Status: ${unauthEnroll.status})`);

  // 4. Authenticate as student (Soniya)
  console.log("\n--- 4. Authenticating Student & Testing Real Enrollment ---");
  const loginRes = await request(
    {
      hostname: "localhost",
      port: 3000,
      path: "/api/auth/login",
      method: "POST",
      headers: { "Content-Type": "application/json" },
    },
    {
      email: "soniya.chauhan@skillnova.edu",
      password: "SkillNova@2026",
    }
  );

  assert(loginRes.status === 200, `Student logs in successfully with 200 (Status: ${loginRes.status})`);
  const studentCookie = extractCookie(loginRes.headers["set-cookie"], "skillnova_session");
  assert(Boolean(studentCookie), `Received session cookie for student`);

  // Enroll in Python course
  const enrollRes = await request(
    {
      hostname: "localhost",
      port: 3000,
      path: "/api/courses/enroll",
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Cookie: studentCookie,
      },
    },
    { courseId: python.id }
  );

  assert(enrollRes.status === 200, `Student enrolled successfully in Python (Status: ${enrollRes.status})`);
  assert(enrollRes.data.success === true || enrollRes.data.alreadyEnrolled === true, `Enrollment reported success or existing`);

  // 5. Test duplicate enrollment prevention
  console.log("\n--- 5. Testing Duplicate Enrollment Prevention ---");
  const dupEnrollRes = await request(
    {
      hostname: "localhost",
      port: 3000,
      path: "/api/courses/enroll",
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Cookie: studentCookie,
      },
    },
    { courseId: python.id }
  );

  assert(dupEnrollRes.status === 200, `Second enrollment request handled safely (Status: ${dupEnrollRes.status})`);
  assert(dupEnrollRes.data.alreadyEnrolled === true, `Duplicate enrollment recognized and prevented`);

  // 6. Test student enrolled courses query
  console.log("\n--- 6. Testing Student Enrolled Courses Endpoint ---");
  const studentCoursesRes = await request({
    hostname: "localhost",
    port: 3000,
    path: "/api/student/courses",
    method: "GET",
    headers: { Cookie: studentCookie },
  });

  assert(studentCoursesRes.status === 200, `GET /api/student/courses returns 200 (Status: ${studentCoursesRes.status})`);
  assert(studentCoursesRes.data.courses?.length > 0, `Returns student's enrolled courses`);
  assert(
    studentCoursesRes.data.courses.some((c) => c.slug === "python-programming"),
    `Enrolled courses list contains Python Programming`
  );

  // 7. Test Admin course permissions
  console.log("\n--- 7. Testing Admin Course Management & RBAC ---");
  // Student cannot access admin courses
  const studentAdminAttempt = await request({
    hostname: "localhost",
    port: 3000,
    path: "/api/admin/courses",
    method: "GET",
    headers: { Cookie: studentCookie },
  });
  assert(studentAdminAttempt.status === 403, `Student session blocked from /api/admin/courses with 403 (Status: ${studentAdminAttempt.status})`);

  // Login as admin
  const adminLogin = await request(
    {
      hostname: "localhost",
      port: 3000,
      path: "/api/auth/login",
      method: "POST",
      headers: { "Content-Type": "application/json" },
    },
    {
      email: "admin@skillnova.edu",
      password: "SkillNova@2026",
    }
  );

  assert(adminLogin.status === 200, `Admin logs in successfully with 200`);
  const adminCookie = extractCookie(adminLogin.headers["set-cookie"], "skillnova_session");

  const adminCoursesRes = await request({
    hostname: "localhost",
    port: 3000,
    path: "/api/admin/courses",
    method: "GET",
    headers: { Cookie: adminCookie },
  });

  assert(adminCoursesRes.status === 200, `Admin successfully queries /api/admin/courses with 200 (Status: ${adminCoursesRes.status})`);
  assert(adminCoursesRes.data.courses?.length >= 4, `Admin retrieves all courses with enrollment counts`);

  console.log("\n==========================================================");
  console.log(`Results: ${passed} Passed, ${failed} Failed`);
  console.log("==========================================================");

  if (failed > 0) process.exit(1);
}

runCourseTests().catch((e) => {
  console.error("Test execution fatal error:", e);
  process.exit(1);
});
