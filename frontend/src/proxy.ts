import { NextResponse, type NextRequest } from "next/server";
import {
  CSP_HEADER,
  buildContentSecurityPolicy,
  generateNonce,
} from "@/lib/securityHeaders";

/**
 * Per-request CSP nonce (#1540).
 *
 * A CSP that omits 'unsafe-inline' only works if every inline script the app
 * emits carries the same nonce as the response header. The static headers hook
 * cannot provide a fresh nonce per request, so use Next.js 16's proxy convention.
 */
export function proxy(request: NextRequest) {
  const nonce = generateNonce();
  const policy = buildContentSecurityPolicy(nonce);

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set(CSP_HEADER, policy);

  const response = NextResponse.next({
    request: { headers: requestHeaders },
  });
  response.headers.set(CSP_HEADER, policy);

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};
