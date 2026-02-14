import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { connectDB } from "@/app/dbConfig/dbConfig";
import ReadingList from "@/models/ReadingList";
import { getUserFromCookie } from "@/lib/server/auth";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ listId: string }> }
) {
  await connectDB();
  const { listId } = await params;
  const userSession = await getUserFromCookie();
  if (!userSession) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }
  try {
    const list = await ReadingList.findOne({
      _id: listId,
      user_id: userSession.userId,
    }).populate({ path: "entries", populate: { path: "book_id" } });
    if (!list) {
      return NextResponse.json({ message: "List not found" }, { status: 404 });
    }
    return NextResponse.json({ list });
  } catch (err) {
    console.error("Error fetching list:", err);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}
