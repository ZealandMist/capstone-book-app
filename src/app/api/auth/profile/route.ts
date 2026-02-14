import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import User from "@/models/User";
import { connectDB } from "@/app/dbConfig/dbConfig"
import { getUserFromCookie } from "@/lib/server/auth";


export async function GET() {
  await connectDB();

  const userData = await getUserFromCookie();
  if (!userData) {
    return NextResponse.json({ message: "Not authenticated" }, { status: 401 })
  }

  const user = await User.findById(userData.userId).select("-password");
  return NextResponse.json(user);
}

export async function PUT(req: Request) {
  await connectDB();

  const userData = await getUserFromCookie();
  if (!userData) {
    return NextResponse.json({ message: "Not authenticated" }, { status: 401 });
  }
 
  const body = await req.json();
  const user = await User.findById(userData.userId);

  if (!user) {
    return NextResponse.json({ message: "User not found" }, { status: 404 });
  }

  if (body.username) user.username = body.username;
  if (body.email) user.email = body.email;

  if (body.password) {
    user.password = await bcrypt.hash(body.password, 10);
  }

  await user.save()
  return NextResponse.json({ message: "Profile updated" });
}