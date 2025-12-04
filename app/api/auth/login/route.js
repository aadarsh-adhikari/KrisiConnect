import ConnectDB from "@/lib/connect";
import User from "@/app/models/user";
import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";
export async function POST(request) {
  try {
    const { email, password } = await request.json();
    await ConnectDB();

    const user = await User.findOne({ email });
    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return NextResponse.json({ message: "Invalid password" }, { status: 401 });
    }

    return NextResponse.json({ message: "Login successful", user: { name: user.name, email: user.email, role: user.role } }, { status: 200 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}
