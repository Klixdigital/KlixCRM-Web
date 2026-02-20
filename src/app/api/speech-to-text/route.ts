// This API route is no longer used - voice recording feature was removed
// Keeping file as empty stub to prevent build errors if referenced

import { NextResponse } from "next/server";

export async function POST() {
  return NextResponse.json(
    { error: "This endpoint has been disabled" },
    { status: 410 }
  );
}
