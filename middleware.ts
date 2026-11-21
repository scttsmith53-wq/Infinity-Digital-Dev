import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const APEX_HOST = 'infinitydigitaldev.com'
const WWW_HOST = `www.${APEX_HOST}`

function requestHosts(request: NextRequest): string[] {
  return [request.headers.get('x-forwarded-host'), request.headers.get('host')]
    .flatMap((value) => (value ? value.split(',') : []))
    .map((value) => value.trim().split(':')[0].toLowerCase())
    .filter(Boolean)
}

export function middleware(request: NextRequest) {
  if (!requestHosts(request).includes(WWW_HOST)) {
    return NextResponse.next()
  }

  const url = request.nextUrl
  const path = url.pathname === '/' ? (url.search ? '/' : '') : url.pathname
  const location = `https://${APEX_HOST}${path}${url.search}`.replace(/[\r\n]/g, '')

  // Next.js permanent redirects are 308. Write the 301 here so www resolves to the apex.
  return new NextResponse(null, {
    status: 301,
    headers: { Location: location },
  })
}

export const config = {
  matcher: '/:path*',
}
