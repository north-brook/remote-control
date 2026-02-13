import { NextResponse } from "next/server";
import { readFileSync } from "fs";
import { join } from "path";

// Embed the install script at build time
const INSTALL_SCRIPT = readFileSync(
  join(process.cwd(), "install-script.sh"),
  "utf-8"
);

export async function GET() {
  return new NextResponse(INSTALL_SCRIPT, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=300",
    },
  });
}
