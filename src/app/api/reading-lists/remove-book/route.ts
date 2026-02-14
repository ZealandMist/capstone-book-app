import { NextResponse } from "next/server";
import { connectDB } from "@/app/dbConfig/dbConfig";
import ReadingList from "@/models/ReadingList";
import ReadingListEntry from "@/models/ReadingListEntry";
import { getUserFromCookie } from "@/lib/server/auth";

export async function POST(req: Request) {
  await connectDB();

  const userSession = await getUserFromCookie();
  if (!userSession) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const { listId, entryId } = await req.json();

  try {
    // Remove the entry
    const removed = await ReadingListEntry.findOneAndDelete({
      _id: entryId,
      list_id: listId,
    });

    if (!removed) {
      return NextResponse.json({ message: "Entry not found" }, { status: 404 });
    }

    // Fetch updated entries for this list
    const entries = await ReadingListEntry.find({ list_id: listId }).populate("book_id");

    // Fetch the list itself
    const list = await ReadingList.findById(listId).lean();

    return NextResponse.json({ list: { ...list, entries } });
  } catch (err) {
    console.error("Remove book error:", err);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}
