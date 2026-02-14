import { NextResponse } from "next/server";
import axios from "axios";
import type { Request } from "next/server";
import { Next } from "react-bootstrap/esm/PageItem";

export async function GET(req: Request) {
  try {
    const url = new URL(req.url, "http://localhost");
    const q = url.searchParams.get("q")?.trim();
    console.log("searching for q: ", q)
    if(!q) {
      return NextResponse.json({ items: [] });
    }

    const response = await axios.get(
      `https://www.googleapis.com/books/v1/volumes`,
      {
        params: {
          q,
          key: process.env.GOOGLE_BOOKS_API_KEY
        },
        validateStatus: (status) => status < 500 
      }
    );
    
    if(response.data.error) {
      console.error("Google Books API error: ", response.data.error);
      if(response.data.error.code === 429) {
        return NextResponse.json(
          { items: [], message: "Google Books API quota exceeded" },
          { status: 429 }
        );
      }
      return NextResponse.json(
        { items: [], message: response.data.error.message || "Google Books API error" },
        { status: 500 }
      );
    }

    return NextResponse.json({ 
      items: response.data.items || []
    });
  } catch (err) {
    console.error("Unexpect error calling Google Books API:", err);
    return NextResponse.json(
      { message: "Server error" },
      { status: 500 }
    );
  }
};