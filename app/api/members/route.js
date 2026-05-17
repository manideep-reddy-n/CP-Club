import { NextResponse } from "next/server";
import { getMembers } from "@/lib/members";

export async function GET() {
  try {
    const members = await getMembers();
    return NextResponse.json(members);
  } catch (error) {
    return NextResponse.json(
      { error: error?.message || "Failed to load members." },
      { status: 500 }
    );
  }
}
