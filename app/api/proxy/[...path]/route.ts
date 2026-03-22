import { NextRequest, NextResponse } from 'next/server';

const EPISOD_API_KEY = process.env.EPISOD_API_KEY ?? '';
const EPISOD_BASE_URL = (process.env.EPISOD_BASE_URL ?? 'https://video.xophie.ai').replace(/\/+$/, '');
const ALLOWED_ORIGINS = (process.env.ALLOWED_ORIGINS ?? '')
  .split(',')
  .map((o) => o.trim())
  .filter(Boolean);

function isOriginAllowed(origin: string | null): boolean {
  if (!origin) return false;
  if (ALLOWED_ORIGINS.length === 0) return true;
  return ALLOWED_ORIGINS.includes(origin);
}

function corsHeaders(origin: string | null): Record<string, string> {
  const headers: Record<string, string> = {
    'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Max-Age': '86400',
  };
  if (origin && isOriginAllowed(origin)) {
    headers['Access-Control-Allow-Origin'] = origin;
  }
  return headers;
}

export async function OPTIONS(request: NextRequest) {
  const origin = request.headers.get('origin');
  if (!isOriginAllowed(origin)) {
    return new NextResponse(null, { status: 403 });
  }
  return new NextResponse(null, { status: 204, headers: corsHeaders(origin) });
}

async function proxyRequest(request: NextRequest, context: { params: Promise<{ path: string[] }> }) {
  const origin = request.headers.get('origin');

  if (origin && !isOriginAllowed(origin)) {
    return NextResponse.json(
      { error: 'Origin not allowed' },
      { status: 403, headers: corsHeaders(origin) },
    );
  }

  let backendUrl = '';

  try {
    const { path } = await context.params;
    const backendPath = `/${path.join('/')}`;
    const search = request.nextUrl.search;
    backendUrl = `${EPISOD_BASE_URL}${backendPath}${search}`;

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (EPISOD_API_KEY) {
      headers['X-API-Key'] = EPISOD_API_KEY;
    }

    const fetchOptions: RequestInit = {
      method: request.method,
      headers,
    };

    if (request.method !== 'GET' && request.method !== 'HEAD') {
      const body = await request.text();
      if (body) {
        fetchOptions.body = body;
      }
    }

    const isDownload = backendPath.endsWith('/download');

    const backendResponse = await fetch(backendUrl, {
      ...fetchOptions,
      redirect: isDownload ? 'manual' : 'follow',
    });

    if (isDownload && backendResponse.status === 307) {
      const location = backendResponse.headers.get('Location') ?? '';
      return NextResponse.json(
        { url: location },
        { status: 200, headers: corsHeaders(origin) },
      );
    }

    const responseBody = await backendResponse.text();

    if (!backendResponse.ok) {
      console.error(`[proxy] ${request.method} ${backendUrl} -> ${backendResponse.status}`, responseBody);
    }

    return new NextResponse(responseBody, {
      status: backendResponse.status,
      headers: {
        'Content-Type': backendResponse.headers.get('Content-Type') ?? 'application/json',
        ...corsHeaders(origin),
      },
    });
  } catch (error) {
    console.error(`[proxy] ${request.method} ${backendUrl} error:`, error);
    const message = error instanceof Error ? error.message : 'Proxy request failed';
    return NextResponse.json(
      { error: message },
      { status: 502, headers: corsHeaders(origin) },
    );
  }
}

export const GET = proxyRequest;
export const POST = proxyRequest;
export const PUT = proxyRequest;
export const PATCH = proxyRequest;
export const DELETE = proxyRequest;
