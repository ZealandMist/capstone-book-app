import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import User from "@/models/User";
import { connectDB } from "@/app/dbConfig/dbConfig";
import { signToken } from "@/lib/server/jwt";

export async function POST(req: Request) {
  await connectDB();

  const { username, email, password } = await req.json();

  try {
    const existing = await User.findOne({ email });
    if(existing) {
      return NextResponse.json({ message: "Email already exists"}, { status: 400 });
    }

    const hashed = await bcrypt.hash(password, 10);

    const user = await User.create({
      username,
      email,
      password: hashed
    });


    const token = signToken(user._id.toString());

    const response = NextResponse.json({ message: "User created", user: { id: user._id, username, email } }, { status: 201 });

    response.cookies.set("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 *24 *7,
      sameSite: "lax",
    })

    return response;
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
};
