import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

function cleanLocationName(loc: string): string {
  let clean = loc.trim();
  const majorAreas = [
    "Gulshan",
    "Banani",
    "Dhanmondi",
    "Uttara",
    "Mirpur",
    "Mohammadpur",
    "Bashundhara",
    "Lalmatia",
    "Wari",
    "Khilgaon",
    "Tejgaon",
    "Farmgate",
    "Badda",
    "Baridhara",
    "Mogbazar",
    "Motijheel",
    "Malibagh",
    "Rampura",
    "Jatrabari",
    "Azimpur",
    "Mohakhali",
    "Nikunja",
    "Niketan",
    "Cantonment",
    "Hazaribagh",
    "Paltan",
    "Shahbagh"
  ];
  
  const lower = clean.toLowerCase();
  for (const area of majorAreas) {
    if (lower.includes(area.toLowerCase())) {
      if (area.toLowerCase() === "bashundhara") {
        return "Bashundhara R/A";
      }
      return area;
    }
  }
  
  clean = clean
    .replace(/(block|sector|road|house|flat|avenue|lane|near|appartment|holding|plot)\s+\w+/gi, "")
    .replace(/(block|sector|road|house|flat|avenue|lane|near|appartment|holding|plot)/gi, "")
    .replace(/\s+/g, " ")
    .trim();
    
  if (clean.length > 2) {
    return clean.split(" ").map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(" ");
  }
  return loc;
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const location = searchParams.get("location");
    const classLevel = searchParams.get("classLevel");
    const subject = searchParams.get("subject");
    const daysStr = searchParams.get("days");
    const days = daysStr ? parseInt(daysStr) : 3;

    // 1. Fetch all open jobs to calculate stats
    const openJobs = await prisma.tuitionJob.findMany({
      where: { status: "OPEN" },
      select: {
        id: true,
        classLevel: true,
        subject: true,
        salary: true,
        approxLatitude: true,
        approxLongitude: true,
        parent: {
          select: {
            profile: {
              select: {
                address: true,
              }
            }
          }
        }
      }
    });

    // 2. Fetch all registered tutors to calculate densities
    const registeredTutors = await prisma.user.findMany({
      where: { role: "TUTOR" },
      select: {
        id: true,
        profile: {
          select: {
            address: true,
          }
        }
      }
    });

    // Extract unique locations from jobs and tutors
    const rawLocations = new Set<string>();
    openJobs.forEach(j => {
      const addr = j.parent?.profile?.address;
      if (addr) {
        const parts = addr.split(",");
        const loc = parts[parts.length - 2]?.trim() || parts[0]?.trim();
        if (loc && loc !== "Bangladesh" && loc.length > 2) {
          rawLocations.add(cleanLocationName(loc));
        }
      }
    });
    registeredTutors.forEach(t => {
      const addr = t.profile?.address;
      if (addr) {
        const parts = addr.split(",");
        const loc = parts[parts.length - 2]?.trim() || parts[0]?.trim();
        if (loc && loc !== "Bangladesh" && loc.length > 2) {
          rawLocations.add(cleanLocationName(loc));
        }
      }
    });

    // Fallback locations if none exist yet
    if (rawLocations.size === 0) {
      ["Banani", "Gulshan", "Dhanmondi", "Uttara", "Mirpur", "Mohammadpur", "Bashundhara", "Lalmatia", "Wari"].forEach(l => rawLocations.add(l));
    }

    // Extract unique subjects and class levels from database
    const rawSubjects = new Set<string>();
    const rawClassLevels = new Set<string>();
    openJobs.forEach(j => {
      if (j.subject) {
        j.subject.split(",").forEach(s => {
          const trimmed = s.trim();
          if (trimmed && trimmed.length > 1) {
            // Capitalize first letter
            const cap = trimmed.split(" ").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
            rawSubjects.add(cap);
          }
        });
      }
      if (j.classLevel) rawClassLevels.add(j.classLevel.trim());
    });

    // Comprehensive list of classes individually from Play to Higher level
    const comprehensiveClasses = [
      "Play",
      "Nursery",
      "KG (Kindergarten)",
      "Class 1",
      "Class 2",
      "Class 3",
      "Class 4",
      "Class 5",
      "Class 6",
      "Class 7",
      "Class 8",
      "Class 9",
      "Class 10",
      "Class 11",
      "Class 12",
      "O-Levels",
      "A-Levels",
      "Admission Test",
      "University Level"
    ];
    comprehensiveClasses.forEach(c => rawClassLevels.add(c));

    // Fallbacks
    if (rawSubjects.size === 0) {
      ["All Subjects", "Mathematics", "Physics", "Chemistry", "English", "ICT", "IELTS"].forEach(s => rawSubjects.add(s));
    }

    const locationsList = Array.from(rawLocations).sort();
    const subjectsList = Array.from(rawSubjects).sort();



    const classLevelsList = Array.from(rawClassLevels).sort((a, b) => {
      const getIndex = (s: string) => {
        const lower = s.toLowerCase();
        
        // Match specific class numbers using regex to avoid substring collisions
        const match = lower.match(/class\s+(\d+)/);
        if (match) {
          const num = parseInt(match[1]);
          return 2 + num; // Class 1 is 3, Class 12 is 14
        }
        
        if (lower.includes("play")) return 0;
        if (lower.includes("nursery")) return 1;
        if (lower.includes("kg") || lower.includes("kindergarten")) return 2;
        
        // Exact O-Levels / A-Levels matching
        if (lower.includes("o-level") || lower.includes("o level")) return 15;
        if (lower.includes("a-level") || lower.includes("a level")) return 16;
        if (lower.includes("admission")) return 17;
        if (lower.includes("university")) return 18;
        
        return 99;
      };
      
      const idxA = getIndex(a);
      const idxB = getIndex(b);
      
      if (idxA !== idxB) {
        return idxA - idxB;
      }
      return a.localeCompare(b);
    });

    // Filter jobs matching query
    let filteredJobs = openJobs;
    if (location && location !== "All") {
      filteredJobs = filteredJobs.filter(j => {
        const addr = j.parent?.profile?.address;
        if (!addr) return false;
        const parts = addr.split(",");
        const loc = parts[parts.length - 2]?.trim() || parts[0]?.trim();
        return addr.toLowerCase().includes(location.toLowerCase()) || 
               cleanLocationName(loc).toLowerCase() === location.toLowerCase();
      });
    }
    if (classLevel && classLevel !== "All") {
      filteredJobs = filteredJobs.filter(j => 
        j.classLevel.toLowerCase().includes(classLevel.toLowerCase())
      );
    }
    if (subject && subject !== "All" && subject !== "All Subjects") {
      filteredJobs = filteredJobs.filter(j => 
        j.subject.toLowerCase().includes(subject.toLowerCase())
      );
    }

    // Filter tutors matching location
    let matchingTutors = registeredTutors;
    if (location && location !== "All") {
      matchingTutors = matchingTutors.filter(t => {
        const addr = t.profile?.address;
        if (!addr) return false;
        const parts = addr.split(",");
        const loc = parts[parts.length - 2]?.trim() || parts[0]?.trim();
        return addr.toLowerCase().includes(location.toLowerCase()) || 
               cleanLocationName(loc).toLowerCase() === location.toLowerCase();
      });
    }

    // Calculate dynamic real-life salary estimates
    let baseMin = 5000;
    let baseMax = 7000;

    const clLower = (classLevel || "").toLowerCase();
    if (clLower.includes("play") || clLower.includes("nursery")) {
      baseMin = 2500;
      baseMax = 4000;
    } else if (clLower.includes("kg") || clLower.includes("kindergarten")) {
      baseMin = 2500;
      baseMax = 4500;
    } else if (clLower === "class 1" || clLower === "class 2") {
      baseMin = 2500;
      baseMax = 4500;
    } else if (clLower === "class 3" || clLower === "class 4") {
      baseMin = 3000;
      baseMax = 5000;
    } else if (clLower === "class 5") {
      baseMin = 3500;
      baseMax = 5500;
    } else if (clLower === "class 6") {
      baseMin = 4000;
      baseMax = 6000;
    } else if (clLower === "class 7") {
      baseMin = 4500;
      baseMax = 6500;
    } else if (clLower === "class 8") {
      baseMin = 5000;
      baseMax = 7000;
    } else if (clLower === "class 9") {
      baseMin = 5500;
      baseMax = 8000;
    } else if (clLower === "class 10" || clLower.includes("ssc") || clLower.includes("10")) {
      baseMin = 6000;
      baseMax = 9000;
    } else if (clLower === "class 11") {
      baseMin = 7000;
      baseMax = 10000;
    } else if (clLower === "class 12" || clLower.includes("hsc") || clLower.includes("12")) {
      baseMin = 8000;
      baseMax = 12000;
    } else if (clLower.includes("o-level") || clLower.includes("o level") || clLower.includes("o-levels")) {
      baseMin = 8000;
      baseMax = 12000;
    } else if (clLower.includes("a-level") || clLower.includes("a level") || clLower.includes("a-levels")) {
      baseMin = 10000;
      baseMax = 15000;
    } else if (clLower.includes("admission") || clLower.includes("test")) {
      baseMin = 10000;
      baseMax = 15000;
    } else if (clLower.includes("university")) {
      baseMin = 8000;
      baseMax = 14000;
    }

    const multiplier = days === 2 ? 0.75 : days === 3 ? 1.0 : days === 4 ? 1.2 : 1.4;
    let minSalary = baseMin * multiplier;
    let maxSalary = baseMax * multiplier;

    // Adjust for locations
    if (location) {
      const locLower = location.toLowerCase();
      if (["gulshan", "banani", "baridhara", "bashundhara", "dhanmondi", "dohs"].some(l => locLower.includes(l))) {
        minSalary *= 1.20;
        maxSalary *= 1.20;
      } else if (["uttara", "lalmatia", "wari", "banasree"].some(l => locLower.includes(l))) {
        minSalary *= 1.08;
        maxSalary *= 1.08;
      } else if (["mirpur", "mohammadpur", "khilgaon", "badda", "jatrabari"].some(l => locLower.includes(l))) {
        minSalary *= 0.95;
        maxSalary *= 0.95;
      }
    }

    // Adjust for subject complexity
    if (subject) {
      const subLower = subject.toLowerCase();
      if (["ielts", "sat", "gre", "admission", "a-level", "a level", "o-level", "o level", "physics", "chemistry", "higher math", "science"].some(s => subLower.includes(s))) {
        minSalary *= 1.10;
        maxSalary *= 1.10;
      }
    }

    // Round to nearest 500 BDT
    minSalary = Math.round(minSalary / 500) * 500;
    maxSalary = Math.round(maxSalary / 500) * 500;

    // Tutor density
    const tutorDensity = matchingTutors.length;

    // Calculate Demand Level Index based on jobs to tutors ratio
    const jobsCountInArea = filteredJobs.length;
    let demandIndex: "critical" | "high" | "moderate" = "moderate";
    if (jobsCountInArea > 2) {
      demandIndex = "critical";
    } else if (jobsCountInArea > 0 || tutorDensity < 5) {
      demandIndex = "high";
    }

    // Match Time index
    const matchTime = demandIndex === "critical" ? "Under 30 Mins" : demandIndex === "high" ? "Under 1 Hour" : "Under 2 Hours";

    return NextResponse.json({
      locations: locationsList,
      subjects: subjectsList,
      classLevels: classLevelsList,
      minSalary,
      maxSalary,
      tutorDensity,
      demandIndex,
      matchTime,
      realJobsCount: jobsCountInArea,
    });
  } catch (error) {
    console.error("GET_MARKET_DATA_ERROR", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
