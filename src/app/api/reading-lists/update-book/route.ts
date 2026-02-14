import { NextResponse } from "next/server";
import { connectDB } from "@/app/dbConfig/dbConfig";
import ReadingList from "@/models/ReadingList";
import ReadingListEntry from "@/models/ReadingListEntry";
import Book from "@/models/Book";
import { getUserFromCookie } from "@/lib/server/auth";

export async function PATCH(req: Request) {
  await connectDB();

  const userSession = await getUserFromCookie();
  if (!userSession) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const {
    entryId,
    status,
    date_started,
    date_finished,
    reading_notes,
  } = await req.json();

  try {
    const entry = await ReadingListEntry
      .findById(entryId)
      .populate("list_id");

    if (!entry) {
      return NextResponse.json({ message: "Entry not found" }, { status: 404 });
    }

    // Ownership check
    if (entry.list_id.user_id.toString() !== userSession.userId) {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    if (status !== undefined) entry.status = status;
    if (date_started !== undefined) entry.date_started = date_started || null;
    if (date_finished !== undefined) entry.date_finished = date_finished || null;
    if (reading_notes !== undefined) entry.reading_notes = reading_notes;

    await entry.save();
    await entry.populate("book_id");

    return NextResponse.json({ entry });
  } catch (err) {
    console.error("Update book error:", err);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}
