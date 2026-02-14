import ReadingList from "@/models/ReadingList";
import "@/models/ReadingListEntry";
import "@/models/Book"; 
import { connectDB } from "@/app/dbConfig/dbConfig";
import { getUserFromCookie } from "@/lib/server/auth";
import { NextResponse } from "next/server";

export async function GET() {
  await connectDB();

  const userSession = await getUserFromCookie();
  if (!userSession) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    // use .lean() to get plain JS objects (avoids Mongoose document circular refs)
    const lists = await ReadingList
      .find({ user_id: userSession.userId })
      .populate({
        path: "entries",
        populate: { path: "book_id" }
      })
      .lean();

    return NextResponse.json({ lists });
  } catch (err) {
    console.error("Error fetching reading lists", err);
    return NextResponse.json(
      { message: "Server error" },
      { status: 500 }
    );
  }
}
