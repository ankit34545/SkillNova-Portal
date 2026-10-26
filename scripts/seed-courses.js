/**
 * Seed script for the four initial production courses:
 * 1. Python Programming
 * 2. Java Programming
 * 3. C++ Programming
 * 4. Web Development
 */
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const INITIAL_COURSES = [
  {
    slug: "python-programming",
    title: "Python Programming",
    description: "Master Python fundamentals to advanced paradigms: data structures, object-oriented programming, standard libraries, asynchronous I/O, and real-world system scripting.",
    level: "Beginner",
    durationWeeks: 8,
    category: "Programming Languages",
    isPublished: true,
    modules: [
      {
        title: "Module 1: Core Syntax, Data Types & Flow Control",
        orderIndex: 0,
        description: "Variables, primitive types, conditional execution, loops, and comprehension syntax.",
        lessons: [
          { title: "Introduction & Python Runtime Environment", durationMinutes: 25, orderIndex: 0, content: "Setting up virtual environments, understanding python bytecode, execution pipeline, and REPL." },
          { title: "Primitive Types, Operators & Strings", durationMinutes: 30, orderIndex: 1, content: "Integers, floats, string methods, immutability, format strings, and operator precedence." },
          { title: "Control Flow: Conditionals & Iterators", durationMinutes: 35, orderIndex: 2, content: "if/elif/else constructs, while loops, for loops with enumerate and zip." },
        ],
      },
      {
        title: "Module 2: Collections & Data Structures",
        orderIndex: 1,
        description: "Lists, tuples, dictionaries, sets, and collections module efficiency.",
        lessons: [
          { title: "Lists, Tuples & Slicing Semantics", durationMinutes: 30, orderIndex: 0, content: "Indexing, negative indexing, slice assignments, and shallow vs deep copies." },
          { title: "Dictionaries, Hash Maps & Set Operations", durationMinutes: 35, orderIndex: 1, content: "Dictionary hashing, hash collisions, set operations, union, intersection, and lookups." },
          { title: "List & Dict Comprehensions", durationMinutes: 25, orderIndex: 2, content: "Writing clean, pythonic generator expressions and nested comprehensions." },
        ],
      },
      {
        title: "Module 3: Functions, Scopes & Modules",
        orderIndex: 2,
        description: "Pure functions, closures, decorators, and module organization.",
        lessons: [
          { title: "Function Signatures, *args & **kwargs", durationMinutes: 30, orderIndex: 0, content: "Parameter unpacking, default argument traps, type hints, and docstrings." },
          { title: "Closures, First-Class Functions & Decorators", durationMinutes: 40, orderIndex: 1, content: "Function factories, stateful decorators, functools.wraps, and memoization." },
          { title: "Package Architecture & __init__.py", durationMinutes: 25, orderIndex: 2, content: "Namespaces, relative imports, PyPI packaging, and dependency isolation." },
        ],
      },
      {
        title: "Module 4: OOP, Exceptions & Production Capstone",
        orderIndex: 3,
        description: "Object-oriented modeling, custom exceptions, and CLI capstone utility.",
        lessons: [
          { title: "Classes, Dunder Methods & Inheritance", durationMinutes: 45, orderIndex: 0, content: "__init__, __str__, __repr__, inheritance, super(), and composition patterns." },
          { title: "Robust Error Handling & Custom Exceptions", durationMinutes: 30, orderIndex: 1, content: "try/except/finally patterns, custom exception hierarchies, and logging." },
          { title: "Capstone Project: Production File Analysis Engine", durationMinutes: 60, orderIndex: 2, content: "Building a multi-threaded CLI utility to parse log telemetry and generate JSON reports." },
        ],
      },
    ],
  },
  {
    slug: "java-programming",
    title: "Java Programming",
    description: "Comprehensive modern Java from basic JVM architecture to object-oriented domain modeling, Java Collections Framework, Streams API, and multithreading.",
    level: "Intermediate",
    durationWeeks: 10,
    category: "Software Engineering",
    isPublished: true,
    modules: [
      {
        title: "Module 1: JVM Architecture & Java Fundamentals",
        orderIndex: 0,
        description: "JVM internal memory model, classloaders, bytecodes, and primitive types.",
        lessons: [
          { title: "The Java Virtual Machine (JVM, JRE & JDK)", durationMinutes: 35, orderIndex: 0, content: "Understanding classloading, Bytecode verification, JIT compilation, and Heap vs Stack." },
          { title: "Type System, Variables & Expressions", durationMinutes: 30, orderIndex: 1, content: "Strong typing, autoboxing, type casting, arithmetic, and logical operators." },
          { title: "Methods, Overloading & Memory Layout", durationMinutes: 35, orderIndex: 2, content: "Pass-by-value semantics, method signatures, call stack frames, and recursion." },
        ],
      },
      {
        title: "Module 2: Object-Oriented Design in Java",
        orderIndex: 1,
        description: "Encapsulation, inheritance, polymorphism, and abstract contracts.",
        lessons: [
          { title: "Classes, Constructors & Encapsulation", durationMinutes: 40, orderIndex: 0, content: "Access modifiers, getters/setters, immutable objects, and record types." },
          { title: "Interfaces, Abstract Classes & Polymorphism", durationMinutes: 45, orderIndex: 1, content: "Designing interfaces, default methods, dynamic method dispatch, and contracts." },
          { title: "SOLID Principles in Practice", durationMinutes: 40, orderIndex: 2, content: "Applying Single Responsibility, Open/Closed, and Dependency Inversion in Java." },
        ],
      },
      {
        title: "Module 3: Generics, Collections & Streams API",
        orderIndex: 2,
        description: "Type safety with Generics, Collections hierarchy, and functional Streams.",
        lessons: [
          { title: "Generics & Bounded Type Parameters", durationMinutes: 40, orderIndex: 0, content: "Generic classes, wildcard parameters (? extends T), type erasure, and safety." },
          { title: "Java Collections Framework Deep-Dive", durationMinutes: 45, orderIndex: 1, content: "ArrayList, LinkedList, HashMap internal collision bucketing, and TreeSet." },
          { title: "Lambdas & Functional Streams Pipeline", durationMinutes: 50, orderIndex: 2, content: "Predicates, Functions, Consumers, map/filter/reduce, and collectors." },
        ],
      },
      {
        title: "Module 4: Concurrency & Enterprise Capstone",
        orderIndex: 3,
        description: "Threads, synchronized blocks, ExecutorService, and backend application.",
        lessons: [
          { title: "Thread Lifecycle, Synchronization & Locks", durationMinutes: 45, orderIndex: 0, content: "Thread creation, race conditions, synchronized blocks, and ReentrantLock." },
          { title: "Concurrent Collections & Thread Pools", durationMinutes: 40, orderIndex: 1, content: "ConcurrentHashMap, BlockingQueue, and ThreadPoolExecutor configuration." },
          { title: "Capstone: High-Throughput In-Memory Task Scheduler", durationMinutes: 60, orderIndex: 2, content: "Developing a thread-safe priority task execution engine with metrics." },
        ],
      },
    ],
  },
  {
    slug: "cpp-programming",
    title: "C++ Programming",
    description: "Deep dive into Modern C++ (C++17/20), manual memory management, RAII, pointers, references, Object-Oriented mechanisms, Templates, and the Standard Template Library (STL).",
    level: "Advanced",
    durationWeeks: 10,
    category: "Systems Programming",
    isPublished: true,
    modules: [
      {
        title: "Module 1: C++ Compilation & Memory Foundations",
        orderIndex: 0,
        description: "Compilation pipeline, pointers, references, and stack vs heap allocation.",
        lessons: [
          { title: "Compiler Pipeline, Linkers & Header Guards", durationMinutes: 30, orderIndex: 0, content: "Preprocessing, compilation, object files, linkers, and translation units." },
          { title: "Pointers, References & Address Arithmetic", durationMinutes: 40, orderIndex: 1, content: "Memory addressing, dereferencing, void pointers, nullptr, and references." },
          { title: "Dynamic Memory Allocation (new & delete)", durationMinutes: 35, orderIndex: 2, content: "Heap allocation, memory fragmentation, dangling pointers, and memory leaks." },
        ],
      },
      {
        title: "Module 2: RAII & Smart Pointers",
        orderIndex: 1,
        description: "Resource Acquisition Is Initialization, unique_ptr, shared_ptr, and weak_ptr.",
        lessons: [
          { title: "The RAII Idiom & Deterministic Destructors", durationMinutes: 40, orderIndex: 0, content: "Managing sockets, file handles, and mutexes through object lifetime." },
          { title: "Smart Pointers: std::unique_ptr & std::shared_ptr", durationMinutes: 45, orderIndex: 1, content: "Exclusive ownership vs reference-counted shared ownership, std::weak_ptr cyclic avoidance." },
          { title: "Move Semantics & Rvalue References", durationMinutes: 50, orderIndex: 2, content: "Lvalues vs Rvalues, std::move, copy elision, and rule of 5." },
        ],
      },
      {
        title: "Module 3: Templates, Metaprogramming & STL",
        orderIndex: 2,
        description: "Template specialization, iterators, containers, and STL algorithms.",
        lessons: [
          { title: "Function & Class Templates", durationMinutes: 45, orderIndex: 0, content: "Generic programming, template instantiations, and non-type template parameters." },
          { title: "STL Sequence & Associative Containers", durationMinutes: 45, orderIndex: 1, content: "std::vector capacity doubling, std::deque, std::unordered_map hashing." },
          { title: "STL Algorithms & Lambda Expressions", durationMinutes: 40, orderIndex: 2, content: "std::sort, std::find_if, std::transform with custom comparator lambdas." },
        ],
      },
      {
        title: "Module 4: Concurrency & High-Performance Capstone",
        orderIndex: 3,
        description: "std::thread, mutexes, atomic operations, and custom memory allocator.",
        lessons: [
          { title: "Multithreading, std::mutex & std::atomic", durationMinutes: 45, orderIndex: 0, content: "Lock guards, deadlock prevention, atomic variables, and memory orders." },
          { title: "Cache Locality & Benchmarking", durationMinutes: 40, orderIndex: 1, content: "Hardware cache lines, false sharing, struct alignment, and profiling." },
          { title: "Capstone: High-Performance Custom Ring Buffer", durationMinutes: 65, orderIndex: 2, content: "Building a lock-free circular queue for low-latency inter-thread messaging." },
        ],
      },
    ],
  },
  {
    slug: "web-development",
    title: "Web Development",
    description: "Modern full-stack web architecture from foundational semantic HTML, modern CSS layouts, JavaScript ESNext, to full-stack Next.js, RESTful APIs, and database persistence.",
    level: "Beginner",
    durationWeeks: 12,
    category: "Full-Stack Development",
    isPublished: true,
    modules: [
      {
        title: "Module 1: Semantic Web, Layouts & Modern CSS",
        orderIndex: 0,
        description: "HTML5 semantic elements, responsive layouts with Flexbox and CSS Grid.",
        lessons: [
          { title: "Semantic HTML5, Accessibility & DOM Tree", durationMinutes: 30, orderIndex: 0, content: "Document object model, accessible ARIA attributes, semantic landmarks." },
          { title: "Modern CSS: Flexbox & CSS Grid Mastery", durationMinutes: 40, orderIndex: 1, content: "1D layout with Flexbox, 2D layout with CSS Grid, auto-fit, and minmax." },
          { title: "Responsive Design, CSS Variables & Media Queries", durationMinutes: 35, orderIndex: 2, content: "Mobile-first philosophy, breakpoint design, and dynamic theming." },
        ],
      },
      {
        title: "Module 2: JavaScript ESNext & Async Programming",
        orderIndex: 1,
        description: "Modern JavaScript, event loop, promises, and fetch API.",
        lessons: [
          { title: "JavaScript Core, Closures & Event Loop", durationMinutes: 45, orderIndex: 0, content: "Execution contexts, call stack, microtask vs macrotask queue." },
          { title: "Asynchronous JavaScript: Promises & Async/Await", durationMinutes: 40, orderIndex: 1, content: "Promise chaining, Promise.all, error handling with try/catch." },
          { title: "DOM Manipulation & Browser Events", durationMinutes: 35, orderIndex: 2, content: "Event delegation, bubbling, capturing, and dynamic UI updates." },
        ],
      },
      {
        title: "Module 3: React & Component-Driven Architecture",
        orderIndex: 2,
        description: "JSX, props, state, lifecycle hooks, and performant component trees.",
        lessons: [
          { title: "React Fundamentals: JSX & Props", durationMinutes: 35, orderIndex: 0, content: "Component composition, unidirectional data flow, and pure rendering." },
          { title: "State Management & React Hooks", durationMinutes: 45, orderIndex: 1, content: "useState, useEffect dependency arrays, useMemo, and useCallback." },
          { title: "Custom Hooks & Context API", durationMinutes: 40, orderIndex: 2, content: "Extracting reusable stateful logic and global theme/auth contexts." },
        ],
      },
      {
        title: "Module 4: Full-Stack Next.js, APIs & Database Capstone",
        orderIndex: 3,
        description: "Next.js App Router, server-side data fetching, REST APIs, and database integration.",
        lessons: [
          { title: "Next.js App Router & Server Components", durationMinutes: 45, orderIndex: 0, content: "Server vs Client components, streaming with Suspense, and SEO tags." },
          { title: "API Routes, Authentication & Prisma ORM", durationMinutes: 50, orderIndex: 1, content: "Building secure REST endpoints, session verification, and database queries." },
          { title: "Capstone: Production E-Commerce Platform", durationMinutes: 70, orderIndex: 2, content: "End-to-end fullstack platform with cart state, checkout APIs, and admin dashboard." },
        ],
      },
    ],
  },
];

async function seedCourses() {
  console.log("Seeding initial 4 courses...");
  
  // Find Dr. Aryan Mehta or fallback teacher
  const teacher = await prisma.user.findFirst({
    where: {
      role: { in: ["TEACHER", "HOST"] },
    },
  });

  const instructorId = teacher ? teacher.id : null;
  console.log("Assigning initial courses to instructor:", teacher?.name, "(ID:", instructorId, ")");

  for (const c of INITIAL_COURSES) {
    const existing = await prisma.course.findUnique({
      where: { slug: c.slug },
      include: { modules: true },
    });

    if (existing) {
      console.log(`Course ${c.slug} already exists. Updating metadata...`);
      await prisma.course.update({
        where: { slug: c.slug },
        data: {
          title: c.title,
          description: c.description,
          level: c.level,
          durationWeeks: c.durationWeeks,
          category: c.category,
          isPublished: true,
          instructorId,
        },
      });
    } else {
      console.log(`Creating course ${c.slug}...`);
      await prisma.course.create({
        data: {
          slug: c.slug,
          title: c.title,
          description: c.description,
          level: c.level,
          durationWeeks: c.durationWeeks,
          category: c.category,
          isPublished: true,
          instructorId,
          modules: {
            create: c.modules.map((m) => ({
              title: m.title,
              description: m.description,
              orderIndex: m.orderIndex,
              lessons: {
                create: m.lessons.map((l) => ({
                  title: l.title,
                  durationMinutes: l.durationMinutes,
                  orderIndex: l.orderIndex,
                  content: l.content,
                })),
              },
            })),
          },
        },
      });
    }
  }

  const allCourses = await prisma.course.findMany({
    include: {
      modules: {
        include: { lessons: true },
      },
      instructor: true,
    },
  });

  console.log("Course seed finished successfully!");
  console.log(`Total courses in database: ${allCourses.length}`);
  allCourses.forEach((crs) => {
    const lessonCount = crs.modules.reduce((acc, mod) => acc + mod.lessons.length, 0);
    console.log(` - [${crs.slug}] "${crs.title}" (${crs.level}): ${crs.modules.length} modules, ${lessonCount} lessons. Instructor: ${crs.instructor?.name || "Unassigned"}`);
  });
}

seedCourses()
  .catch((e) => {
    console.error("Error seeding courses:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
