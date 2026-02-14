import { NextResponse } from "next/server";
import { connectDB } from "@/app/dbConfig/dbConfig";
import ReadingList from "@/models/ReadingList";
import ReadingListEntry from "@/models/ReadingListEntry";
import Book from "@/models/Book";
import { getUserFromCookie } from "@/lib/server/auth";

export async function POST(req: Request) {
  await connectDB();
  const userSession = await getUserFromCookie();
  if (!userSession) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const { list_id, book } = await req.json();

    if (!list_id || !book?.id) {
      return NextResponse.json({ message: "Invalid request data" }, { status: 400 });
    }

    const list = await ReadingList.findOne({ _id: list_id, user_id: userSession.userId });
    if (!list) return NextResponse.json({ message: "Reading list not found" }, { status: 404 });

    const dbBook = await Book.findOneAndUpdate(
      { google_books_id: book.id },
      {
        google_books_id: book.id,
        title: book.volumeInfo.title,
        authors: book.volumeInfo.authors || [],
        description: book.volumeInfo.description,
        thumbnail: book.volumeInfo.imageLinks?.smallThumbnail,
        page_count: book.volumeInfo.page_count,
        publication_date: book.volumeInfo.publication_date
      },
      { upsert: true, new: true }
    );

    const existingEntry = await ReadingListEntry.findOne({ list_id, book_id: dbBook._id });
    if (existingEntry) return NextResponse.json({ message: "Book already in list" }, { status: 200 });

    await ReadingListEntry.create({ list_id, book_id: dbBook._id });

    return NextResponse.json({ message: "Book added successfully" });
  } catch (err) {
    console.error("Error adding book:", err);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}
