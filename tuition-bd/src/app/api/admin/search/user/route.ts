import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || (session.user as any).role !== "ADMIN") {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const regNum = searchParams.get("registration_number")?.trim();

    if (!regNum) {
      return new NextResponse("Registration number parameter is required", { status: 400 });
    }

    // Try parsing a numeric sequence from input
    // E.g., "TC-001", "TP-001", "001", "1"
    let parsedSeq: number | null = null;
    const match = regNum.match(/(?:TC|TP)-(\d+)/i);
    if (match) {
      parsedSeq = parseInt(match[1], 10);
    } else {
      const numericMatch = regNum.match(/^\d+$/);
      if (numericMatch) {
        parsedSeq = parseInt(regNum, 10);
      }
    }

    let user = null;

    if (parsedSeq !== null) {
      user = await prisma.user.findFirst({
        where: {
          profile: {
            tutorSeq: parsedSeq
          }
        },
        include: {
          profile: true,
          tuitionJobs: {
            include: {
              payments: true,
              tutor: {
                include: {
                  profile: true
                }
              }
            }
          },
          appliedJobs: {
            include: {
              parent: {
                include: {
                  profile: true
                }
              }
            }
          },
          reviews: true,
          receivedReviews: true
        }
      });
    }

    if (!user) {
      user = await prisma.user.findFirst({
        where: {
          OR: [
            { id: regNum },
            { email: { equals: regNum, mode: "insensitive" } },
            {
              profile: {
                phone: regNum
              }
            }
          ]
        },
        include: {
          profile: true,
          tuitionJobs: {
            include: {
              payments: true,
              tutor: {
                include: {
                  profile: true
                }
              }
            }
          },
          appliedJobs: {
            include: {
              parent: {
                include: {
                  profile: true
                }
              }
            }
          },
          reviews: true,
          receivedReviews: true
        }
      });
    }

    if (!user) {
      return new NextResponse("User not found", { status: 404 });
    }

    return NextResponse.json(user);
  } catch (error) {
    console.error("ADMIN_SEARCH_USER_ERROR", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
