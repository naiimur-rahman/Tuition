import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

async function main() {
  console.log("🚀 Starting comprehensive database seeding...");

  console.log("🧹 Purging old database entries...");
  await prisma.profile.deleteMany({});
  await prisma.payment.deleteMany({});
  await prisma.tuitionJob.deleteMany({});
  await prisma.review.deleteMany({});
  await prisma.user.deleteMany({});
  console.log("✨ Database cleared.");

  // ─── Admin ────────────────────────────────────────────────────────────────
  console.log("👤 Creating admin account...");
  await prisma.user.create({
    data: {
      name: "System Administrator",
      email: "admin@tuition-console.net",
      role: "ADMIN",
      password: await bcrypt.hash("adminpassword123", 10),
    },
  });

  // ─── Parents ──────────────────────────────────────────────────────────────
  console.log("👪 Creating parent accounts...");
  const hashedParentPass = await bcrypt.hash("securepassword123", 10);

  const parentsData = [
    {
      name: "Mrs. Farhana Rahman",
      email: "farhana.parent@tuition-console.net",
      profile: {
        phone: "+8801711556677",
        address: "House 12, Road 5, Dhanmondi, Bangladesh",
        studentClass: "Class 10 (SSC)",
        hoursRequired: "1.5 Hours",
        tutorGenderPreference: "Female",
        salary: "9000 BDT/month",
        numberOfChildren: "1",
        latitude: 23.7461, longitude: 90.3742,
        approxLatitude: 23.7485, approxLongitude: 90.3770,
      },
    },
    {
      name: "Mr. Shafiqul Islam",
      email: "shafiqul.parent@tuition-console.net",
      profile: {
        phone: "+8801811223344",
        address: "Flat 4B, Gulshan Avenue, Bangladesh",
        studentClass: "Class 12 (HSC 2nd Year)",
        hoursRequired: "2 Hours",
        tutorGenderPreference: "Male",
        salary: "12000 BDT/month",
        numberOfChildren: "2",
        latitude: 23.7925, longitude: 90.4078,
        approxLatitude: 23.7950, approxLongitude: 90.4105,
      },
    },
    {
      name: "Dr. Anika Tabassum",
      email: "anika.parent@tuition-console.net",
      profile: {
        phone: "+8801911445566",
        address: "Block G, Bashundhara R/A, Bangladesh",
        studentClass: "Class 3",
        hoursRequired: "1 Hour",
        tutorGenderPreference: "Any",
        salary: "5000 BDT/month",
        numberOfChildren: "3",
        latitude: 23.8223, longitude: 90.3654,
        approxLatitude: 23.8248, approxLongitude: 90.3680,
      },
    },
    {
      name: "Mr. Kamal Hossain",
      email: "kamal.parent@tuition-console.net",
      profile: {
        phone: "+8801511667788",
        address: "Mirpur DOHS, Bangladesh",
        studentClass: "Admission Test",
        hoursRequired: "3+ Hours",
        tutorGenderPreference: "Male",
        salary: "15000 BDT/month",
        numberOfChildren: "1",
        latitude: 23.8052, longitude: 90.3628,
        approxLatitude: 23.8080, approxLongitude: 90.3650,
      },
    },
    {
      name: "Mrs. Rokeya Begum",
      email: "rokeya.parent@tuition-console.net",
      profile: {
        phone: "+8801611334455",
        address: "Khilgaon Chowdhury Para, Bangladesh",
        studentClass: "Nursery",
        hoursRequired: "1 Hour",
        tutorGenderPreference: "Female",
        salary: "4000 BDT/month",
        numberOfChildren: "2",
        latitude: 23.7465, longitude: 90.4182,
        approxLatitude: 23.7490, approxLongitude: 90.4210,
      },
    },
  ];

  const parentRecords: any[] = [];
  for (const p of parentsData) {
    const parent = await prisma.user.create({
      data: {
        name: p.name,
        email: p.email,
        role: "PARENT",
        password: hashedParentPass,
        profile: { create: { ...p.profile } },
      },
    });
    parentRecords.push(parent);
  }

  // ─── Tuition Jobs ─────────────────────────────────────────────────────────
  console.log("📝 Inserting 12 refined tuition jobs...");
  const jobs = [
    {
      title: "Class 10 Science & Maths Tutor Needed",
      description: "Seeking an experienced tutor for a Class 10 SSC student (English Version). Main focus on Physics and Mathematics. 3 days a week, 1.5 hours per session. Female tutor preferred.",
      subject: "Physics, Mathematics",
      classLevel: "Class 10 (SSC)",
      salary: 9000,
      parentId: parentRecords[0].id,
      latitude: 23.7461, longitude: 90.3742, approxLatitude: 23.7485, approxLongitude: 90.3770,
    },
    {
      title: "HSC 2nd Year Chemistry Expert Required",
      description: "HSC 2nd Year Chemistry tutor needed in Gulshan. Looking for someone who can explain organic chemistry concepts clearly. 2 hours per day.",
      subject: "Chemistry",
      classLevel: "Class 12 (HSC 2nd Year)",
      salary: 12000,
      parentId: parentRecords[1].id,
      latitude: 23.7925, longitude: 90.4078, approxLatitude: 23.7950, approxLongitude: 90.4105,
    },
    {
      title: "Class 3 All Subjects Home Teacher",
      description: "Need a friendly and patient tutor for a Class 3 student. Help with school homework, handwriting practice, and exam preparation. 1 hour daily.",
      subject: "All Subjects",
      classLevel: "Class 3",
      salary: 5000,
      parentId: parentRecords[2].id,
      latitude: 23.8223, longitude: 90.3654, approxLatitude: 23.8248, approxLongitude: 90.3680,
    },
    {
      title: "Engineering University Admission Mentor",
      description: "Need a BUET or CUET current student to mentor for Engineering University admission tests. Focus on Higher Math and Physics problem-solving. 3+ hours a day.",
      subject: "Higher Math, Physics",
      classLevel: "Admission Test",
      salary: 15000,
      parentId: parentRecords[3].id,
      latitude: 23.8052, longitude: 90.3628, approxLatitude: 23.8080, approxLongitude: 90.3650,
    },
    {
      title: "Nursery Phonics & Activity Tutor",
      description: "Seeking a highly patient and energetic tutor to teach phonics, basic coloring, and reading to a Nursery kid. 5 days a week, 1 hour each.",
      subject: "Phonics, Basic English",
      classLevel: "Nursery",
      salary: 4000,
      parentId: parentRecords[4].id,
      latitude: 23.7465, longitude: 90.4182, approxLatitude: 23.7490, approxLongitude: 90.4210,
    },
    {
      title: "A-Level Physics & Mechanics Specialist",
      description: "Looking for an A-Level tutor with strong Edexcel syllabus experience. Afternoon/evening timing preferred. High compensation for stellar qualifications.",
      subject: "A-Level Physics",
      classLevel: "A-Level",
      salary: 15000,
      parentId: parentRecords[1].id,
      latitude: 23.7925, longitude: 90.4130, approxLatitude: 23.7955, approxLongitude: 90.4160,
    },
    {
      title: "Class 8 English Version Tutor",
      description: "Mathematics and General Science tutor needed for a Class 8 English Version student. Must be regular and professional.",
      subject: "Mathematics, General Science",
      classLevel: "Class 8",
      salary: 8000,
      parentId: parentRecords[0].id,
      latitude: 23.7480, longitude: 90.3780, approxLatitude: 23.7505, approxLongitude: 90.3808,
    },
    {
      title: "Class 6 Bangla & English Tutor",
      description: "Looking for a patient tutor for a Class 6 student. Focus on Bangla grammar and English writing skills. 2 days a week.",
      subject: "Bangla, English",
      classLevel: "Class 6",
      salary: 6000,
      parentId: parentRecords[2].id,
      latitude: 23.8240, longitude: 90.3690, approxLatitude: 23.8265, approxLongitude: 90.3715,
    },
    {
      title: "O-Level Pure Mathematics Tutor",
      description: "Require an experienced O-Level teacher for Pure Mathematics. 2 hours a day, 3 days a week. Good compensation for a proven track record.",
      subject: "Pure Mathematics",
      classLevel: "O-Level",
      salary: 10000,
      parentId: parentRecords[0].id,
      latitude: 23.7712, longitude: 90.3989, approxLatitude: 23.7740, approxLongitude: 90.4010,
    },
    {
      title: "KG Spoken English & Homework Help",
      description: "Need a fluent English speaker to have conversational sessions with a KG student and assist with small daily assignments.",
      subject: "Spoken English",
      classLevel: "KG",
      salary: 4500,
      parentId: parentRecords[4].id,
      latitude: 23.7480, longitude: 90.4220, approxLatitude: 23.7505, approxLongitude: 90.4248,
    },
    {
      title: "SSC Exam Biology & Chemistry Crash Course",
      description: "Intensive tutor needed for Biology and Chemistry for SSC board exam prep. 4 days/week. Must explain conceptual questions effectively.",
      subject: "Chemistry, Biology",
      classLevel: "Class 10 (SSC)",
      salary: 7500,
      parentId: parentRecords[0].id,
      latitude: 23.7805, longitude: 90.4267, approxLatitude: 23.7830, approxLongitude: 90.4290,
    },
    {
      title: "Class 5 PEC Exam Preparation Tutor",
      description: "Looking for a dedicated home tutor for a Class 5 student to prepare for the upcoming primary board exams. All subjects required.",
      subject: "All Subjects",
      classLevel: "Class 5",
      salary: 5500,
      parentId: parentRecords[2].id,
      latitude: 23.8260, longitude: 90.3700, approxLatitude: 23.8285, approxLongitude: 90.3725,
    },
  ];

  for (const job of jobs) {
    await prisma.tuitionJob.create({ data: { ...job, status: "OPEN" } });
  }

  // ─── Tutors ───────────────────────────────────────────────────────────────
  console.log("🎓 Seeding verified tutors with full profiles...");
  const hashedTutorPass = await bcrypt.hash("tutorpassword123", 10);

  const tutors = [
    {
      name: "Abrar Shakir",
      email: "abrar.shakir@tuition-console.net",
      profile: {
        gender: "Male",
        phone: "+8801711223344",
        address: "Road 11, Banani, Bangladesh",
        bio: "BUET graduate. Specialises in O/A-Level Math & Physics. 4+ years of home tutoring experience.",
        education: "B.Sc in Industrial & Production Engineering (BUET)",
        verificationStatus: "VERIFIED",
        latitude: 23.7915, longitude: 90.4042, approxLatitude: 23.7937, approxLongitude: 90.4066,
      },
    },
    {
      name: "Nusrat Jahan",
      email: "nusrat.jahan@tuition-console.net",
      profile: {
        gender: "Female",
        phone: "+8801811998877",
        address: "Lalmatia Block D, Bangladesh",
        bio: "DU English Literature graduate. Expert in IELTS, SAT prep, and English-medium school syllabus.",
        education: "BA & MA in English Literature (University of Bangladesh)",
        verificationStatus: "VERIFIED",
        latitude: 23.7535, longitude: 90.3654, approxLatitude: 23.7550, approxLongitude: 90.3680,
      },
    },
    {
      name: "Sajid Hasan",
      email: "sajid.hasan@tuition-console.net",
      profile: {
        gender: "Male",
        phone: "+8801912445566",
        address: "Bashundhara R/A Block C, Bangladesh",
        bio: "CSE undergraduate at NSU. Passionate about ICT, Math, and Chemistry. Lab-focused teaching style.",
        education: "B.Sc in Computer Science & Engineering (North South University)",
        verificationStatus: "VERIFIED",
        latitude: 23.8155, longitude: 90.4285, approxLatitude: 23.8180, approxLongitude: 90.4310,
      },
    },
    {
      name: "Dr. Farhan Tanvir",
      email: "farhan.tanvir@tuition-console.net",
      profile: {
        gender: "Male",
        phone: "+8801511223399",
        address: "Tejgaon near Farmgate, Bangladesh",
        bio: "MBBS student at Bangladesh Medical College. Biology and Chemistry specialist for SSC/HSC standards.",
        education: "MBBS candidate (Bangladesh Medical College)",
        verificationStatus: "VERIFIED",
        latitude: 23.7555, longitude: 90.3878, approxLatitude: 23.7580, approxLongitude: 90.3900,
      },
    },
    {
      name: "Tahmina Chowdhury",
      email: "tahmina.chowdhury@tuition-console.net",
      profile: {
        gender: "Female",
        phone: "+8801611001122",
        address: "Khilgaon Area, Bangladesh",
        bio: "Professional school teacher. Maths, Algebra, and Science coaching for Class 1–8. Caring and systematic approach.",
        education: "B.Ed in Science (National University)",
        verificationStatus: "VERIFIED",
        latitude: 23.7465, longitude: 90.4182, approxLatitude: 23.7490, approxLongitude: 90.4210,
      },
    },
    {
      name: "Rafi Ahmed",
      email: "rafi.ahmed@tuition-console.net",
      profile: {
        gender: "Male",
        phone: "+8801712334455",
        address: "Uttara Sector 7, Bangladesh",
        bio: "Bangladesh University Economics graduate. Specialises in HSC Accounting, Finance, and Business Studies.",
        education: "BBA in Accounting (University of Bangladesh)",
        verificationStatus: "VERIFIED",
        latitude: 23.8759, longitude: 90.3984, approxLatitude: 23.8784, approxLongitude: 90.4010,
      },
    },
  ];

  for (const t of tutors) {
    const user = await prisma.user.create({
      data: {
        name: t.name,
        email: t.email,
        role: "TUTOR",
        password: hashedTutorPass,
      },
    });
    await prisma.profile.create({
      data: { userId: user.id, ...t.profile },
    });
  }

  console.log("✨ Seeding completed!");
  console.log(`👥 Created: ${parentsData.length} Parents · ${jobs.length} Tuition Jobs · ${tutors.length} Verified Tutors`);
}

main()
  .catch((e) => {
    console.error("❌ Seeding error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
