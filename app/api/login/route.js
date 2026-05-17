import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { getMemberForLogin } from "@/lib/members";

export async function POST(req) {
  try {
    const body = await req.json();
    const usernameOrEmail = body?.username?.trim();
    const password = body?.password;

    if (!usernameOrEmail || !password) {
      return NextResponse.json(
        { error: "Username/email and password are required." },
        { status: 400 }
      );
    }

    const member = await getMemberForLogin(usernameOrEmail);

    if (!member) {
      return NextResponse.json(
        { error: "Invalid username/email or password." },
        { status: 401 }
      );
    }

    // Compare password with hash
    const isPasswordValid = await bcrypt.compare(password, member.passwordHash);

    if (!isPasswordValid) {
      return NextResponse.json(
        { error: "Invalid username/email or password." },
        { status: 401 }
      );
    }

    // Return user data without password hash
    const { passwordHash, ...memberData } = member;

    return NextResponse.json({
      ok: true,
      member: {
        _id: memberData._id,
        name: memberData.name,
        email: memberData.email,
        username: memberData.username,
        platforms: memberData.platforms,
        year: memberData.year,
        inClub: memberData.inClub,
      },
    });
  } catch (error) {
    return NextResponse.json(
      { error: error?.message || "Login failed." },
      { status: 500 }
    );
  }
}
