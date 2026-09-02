import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { checkRateLimit } from "@/lib/security/rate-limiter";
import { SECURITY_HEADERS } from "@/lib/security/headers";

export async function middleware(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0] || "127.0.0.1";
  const path = req.nextUrl.pathname;

  // 1. Rate limiting on public API endpoints
  if (path.startsWith("/api/")) {
    const rateLimit = await checkRateLimit({
      identifier: ip,
      limit: 120, // 120 reqs/min per IP
      windowMs: 60000,
    });

    if (!rateLimit.success) {
      return new NextResponse(
        JSON.stringify({
          error: "Rate limit exceeded. Please retry in a few moments.",
          retryAfter: rateLimit.reset,
        }),
        {
          status: 429,
          headers: {
            "Content-Type": "application/json",
            "Retry-After": rateLimit.reset.toString(),
            ...SECURITY_HEADERS,
          },
        }
      );
    }
  }

  const response = NextResponse.next();

  // 2. Apply Security Headers
  for (const [key, value] of Object.entries(SECURITY_HEADERS)) {
    response.headers.set(key, value);
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
