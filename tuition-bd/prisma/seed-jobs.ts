import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

async function main() {
  console.log("🚀 Starting comprehensive database seeding...");

  // 1. Clean existing data in order of relations
  console.log("🧹 Purging old database entries...");
  await prisma.profile.deleteMany({});
  await prisma.payment.deleteMany({});
  await prisma.tuitionJob.deleteMany({});
  await prisma.review.deleteMany({});
  await prisma.user.deleteMany({});
  console.log("✨ Database cleared.");

  // 2. Create default parent user
  console.log("👤 Creating premium dummy parent account...");
  const hashedParentPassword = await bcrypt.hash("securepassword123", 10);
  const parent = await prisma.user.create({
    data: {
      name: "Mrs. Farhana Rahman",
      email: "farhana.parent@tuition-console.net",
      role: "PARENT",
      password: hashedParentPassword,
    },
  });

  // Create default admin user
  console.log("👤 Creating default admin account...");
  const hashedAdminPassword = await bcrypt.hash("adminpassword123", 10);
  await prisma.user.create({
    data: {
      name: "System Administrator",
      email: "admin@tuition-console.net",
      role: "ADMIN",
      password: hashedAdminPassword,
    },
  });

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

  console.log("📝 Inserting 5 localized dummy jobs...");
  for (const job of dummyJobs) {
    await prisma.tuitionJob.create({
      data: job,
    });
  }

  // 4. Create 5 verified premium dummy Tutors with high-fidelity profiles
  console.log("🎓 Seeding 5 premium verified educators with coordinates...");
  
  const dummyTutors = [
    {
      name: "Abrar Shakir",
      email: "abrar.shakir@tuition-console.net",
      role: "TUTOR",
      password: "tutorpassword123",
      profile: {
        phone: "+8801711223344",
        address: "Road 11, Banani, Dhaka",
        bio: "IEM Graduate from BUET. Specializes in O/A Level Math & Physics. 4+ years of active home tutoring experience.",
        education: "B.Sc in Industrial & Production Engineering (BUET)",
        verificationStatus: "VERIFIED",
        latitude: 23.7915,
        longitude: 90.4042,
        approxLatitude: 23.7937,
        approxLongitude: 90.4066,
      }
    },
    {
      name: "Nusrat Jahan",
      email: "nusrat.jahan@tuition-console.net",
      role: "TUTOR",
      password: "tutorpassword123",
      profile: {
        phone: "+8801811998877",
        address: "Lalmatia Block D, Dhaka",
        bio: "English Literature graduate from DU. Expert in IELTS, SAT prep, and school-level English medium syllabus coaching.",
        education: "BA & MA in English Literature (University of Dhaka)",
        verificationStatus: "VERIFIED",
        latitude: 23.7535,
        longitude: 90.3654,
        approxLatitude: 23.7550,
        approxLongitude: 90.3680,
      }
    },
    {
      name: "Sajid Hasan",
      email: "sajid.hasan@tuition-console.net",
      role: "TUTOR",
      password: "tutorpassword123",
      profile: {
        phone: "+8801912445566",
        address: "Bashundhara R/A Block C, Dhaka",
        bio: "Computer Science undergraduate at NSU. Passionate about teaching ICT, Math, and Chemistry. Practical labs focus.",
        education: "B.Sc in Computer Science & Engineering (North South University)",
        verificationStatus: "VERIFIED",
        latitude: 23.8155,
        longitude: 90.4285,
        approxLatitude: 23.8180,
        approxLongitude: 90.4310,
      }
    },
    {
      name: "Dr. Farhan Tanvir",
      email: "farhan.tanvir@tuition-console.net",
      role: "TUTOR",
      password: "tutorpassword123",
      profile: {
        phone: "+8801511223399",
        address: "Tejgaon near Farmgate, Dhaka",
        bio: "Medical student from Dhaka Medical College. Biology and Chemistry specialist for SSC/HSC board standards.",
        education: "MBBS candidate (Dhaka Medical College)",
        verificationStatus: "VERIFIED",
        latitude: 23.7555,
        longitude: 90.3878,
        approxLatitude: 23.7580,
        approxLongitude: 90.3900,
      }
    },
    {
      name: "Tahmina Chowdhury",
      email: "tahmina.chowdhury@tuition-console.net",
      role: "TUTOR",
      password: "tutorpassword123",
      profile: {
        phone: "+8801611001122",
        address: "Khilgaon Area, Dhaka",
        bio: "Professional high-school math teacher. Mathematics, Algebra, and General Science coaching for Class 1-8.",
        education: "B.Ed in Science (National University)",
        verificationStatus: "VERIFIED",
        latitude: 23.7465,
        longitude: 90.4182,
        approxLatitude: 23.7490,
        approxLongitude: 90.4210,
      }
    }
  ];

  for (const t of dummyTutors) {
    const hashedTutorPassword = await bcrypt.hash(t.password, 10);
    const user = await prisma.user.create({
      data: {
        name: t.name,
        email: t.email,
        role: t.role,
        password: hashedTutorPassword,
      }
    });

    await prisma.profile.create({
      data: {
        userId: user.id,
        phone: t.profile.phone,
        address: t.profile.address,
        bio: t.profile.bio,
        education: t.profile.education,
        verificationStatus: t.profile.verificationStatus,
        latitude: t.profile.latitude,
        longitude: t.profile.longitude,
        approxLatitude: t.profile.approxLatitude,
        approxLongitude: t.profile.approxLongitude,
      }
    });
  }

  console.log("✨ Seeding completed successfully!");
  console.log("👥 Populated: 1 Parent, 5 Tuition Jobs, 5 Verified Tutors with dynamic Dhaka profiles!");
}

main()
  .catch((e) => {
    console.error("❌ Error during database seeding:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
