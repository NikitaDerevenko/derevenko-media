import { NextResponse, type NextRequest } from 'next/server';

// "/" → /ru или /en по языку браузера (по умолчанию /ru). Параметры (utm_*) сохраняются.
export function middleware(req: NextRequest) {
  const lang = req.headers.get('accept-language')?.toLowerCase() ?? '';
  const prefersEn = lang.startsWith('en') && !lang.includes('ru');
  const url = req.nextUrl.clone();
  url.pathname = prefersEn ? '/en' : '/ru';
  return NextResponse.redirect(url);
}

export const config = { matcher: '/' };
