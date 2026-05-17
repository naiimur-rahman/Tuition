import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🚀 Starting database job seeding...");

  // 1. Find or create a dummy Parent User
  let parent = await prisma.user.findFirst({
    where: { role: "PARENT" },
  });

  if (!parent) {
    console.log("👤 Creating a default dummy parent account...");
    parent = await prisma.user.create({
      data: {
        name: "Mrs. Farhana Rahman",
        email: "farhana.parent@tuition-console.net",
        role: "PARENT",
        password: "securepassword123", // Dummy hashed password placeholder
      },
    });
  } else {
    console.log(`👤 Using existing parent: ${parent.name} (${parent.email})`);
  }

  // 2. Clear out any existing open open jobs to avoid pollution
  await prisma.tuitionJob.deleteMany({
    where: { parentId: parent.id },
  });
  console.log("🧹 Cleaned existing open open jobs for this parent.");

  // 3. Define 5 premium localized Dhaka tuition jobs
  const dummyJobs = [
    {
      title: "Class 10 Science & Math Tutor Needed",
      description: "Seeking an experienced tutor from BUET/DU for a Class 10 student (English Version). Main focus on Physics and Mathematics. 3 days a week, 1.5 hours per session.",
      subject: "Physics, Mathematics",
      classLevel: "Class 10",
      salary: 9000,
      parentId: parent.id,
      latitude: 23.7461,
      longitude: 90.3742,
      approxLatitude: 23.7485,
      approxLongitude: 90.3770,
      status: "OPEN",
    },
    {
      title: "A-Level Physics & Mechanics Specialist",
      description: "Looking for a specialist A-Level tutor. Must have strong experience with Edexcel syllabus. Tuition scheduled for afternoon/evening. High reward for stellar qualifications.",
      subject: "A-Level Physics",
      classLevel: "A-Level",
      salary: 15000,
      parentId: parent.id,
      latitude: 23.7925,
      longitude: 90.4078,
      approxLatitude: 23.7950,
      approxLongitude: 90.4105,
      status: "OPEN",
    },
    {
      title: "Class 5 All Subjects Home Teacher",
      description: "Need a friendly and supportive female tutor for a Class 5 girl. Help with school homework, handwriting, and terminal school exam preparations.",
      subject: "All Subjects",
      classLevel: "Class 5",
      salary: 5500,
      parentId: parent.id,
      latitude: 23.8223,
      longitude: 90.3654,
      approxLatitude: 23.8248,
      approxLongitude: 90.3680,
      status: "OPEN",
    },
    {
      title: "Class 8 English Version Tutor",
      description: "Mathematics and General Science tutor needed for a Class 8 English version student. Must be highly regular, disciplined, and professional.",
      subject: "Mathematics, General Science",
      classLevel: "Class 8",
      salary: 8000,
      parentId: parent.id,
      latitude: 23.8650,
      longitude: 90.4001,
      approxLatitude: 23.8680,
      approxLongitude: 90.4025,
      status: "OPEN",
    },
    {
      title: "SSC Exam Preparation Crash Course",
      description: "Looking for an intensive teacher for Chemistry and Biology for SSC exam preparation. 4 days/week. Excellent explanation of conceptual points required.",
      subject: "Chemistry, Biology",
      classLevel: "Class 10",
      salary: 7500,
      parentId: parent.id,
      latitude: 23.7805,
      longitude: 90.4267,
      approxLatitude: 23.7830,
      approxLongitude: 90.4290,
      status: "OPEN",
    },
  ];

  console.log("📝 Inserting 5 localized dummy jobs into database...");
  for (const job of dummyJobs) {
    await prisma.tuitionJob.create({
      data: job,
    });
  }

  console.log("✨ Seeding completed successfully! 5 open jobs populated!");
}

main()
  .catch((e) => {
    console.error("❌ Error during database seeding:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
