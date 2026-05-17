import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { createMember } from "@/lib/members";

function isEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

export async function POST(req) {
  try {
    const body = await req.json();
    const name = body?.name?.trim();
    const email = body?.email?.trim();
    const username = body?.username?.trim();
    const password = body?.password;

    if (!name || !email || !username || !password) {
      return NextResponse.json(
        { error: "Name, email, username, and password are required." },
        { status: 400 }
      );
    }

    if (!isEmail(email)) {
      return NextResponse.json({ error: "Invalid email address." }, { status: 400 });
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: "Password must be at least 6 characters." },
        { status: 400 }
      );
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const member = await createMember({
      name,
      email,
      username,
      passwordHash,
      platforms: {
        cf_username: body?.cf_username,
        lc_username: body?.lc_username,
        cc_username: body?.cc_username,
        cses_id: body?.cses_id,
      },
      year: body?.year ?? null,
    });

    return NextResponse.json(
      {
        ok: true,
        member: {
          _id: member._id,
          name: member.name,
          email: member.email,
          username: member.username,
          platforms: member.platforms,
          year: member.year ?? null,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    return NextResponse.json(
      { error: error?.message || "Signup failed." },
      { status: 500 }
    );
  }
}
