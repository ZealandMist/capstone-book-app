import { NextResponse } from "next/server";
import ReadingList from "@/models/ReadingList";
import { connectDB } from "@/app/dbConfig/dbConfig";
import { getUserFromCookie } from "@/lib/server/auth";

export async function POST(req: Request) {
  await connectDB();

  const userSession = await getUserFromCookie();
  if (!userSession) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
  }

  const { name, description } = await req.json();

  try {
    const list = await ReadingList.create({
    user_id: userSession.userId,
    name,
    description,
    created_at: new Date()
  });
  return NextResponse.json({ message: "List created", list });
  } catch (err) {
    console.error("Error creating list:", err);
    return NextResponse.json({ message: "Server error"}, { status: 500 })
  }
}