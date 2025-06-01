import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// 1. Defina suas rotas públicas (que não exigem login)
const publicPaths = ['/login'];

// 2. Defina a rota para a qual redirecionar após o login (sua página de quizzes)
const homePath = '/quizzes'; 

// 3. Defina o nome do cookie que você usaria para verificar a sessão
const AUTH_COOKIE_NAME = 'sessionToken'; // Nome hipotético do seu cookie de sessão

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const sessionToken = request.cookies.get(AUTH_COOKIE_NAME)?.value;

  // Cenário 1: Usuário está logado e tenta acessar uma rota pública (ex: /login)
  // Redirecionar para a página principal de quizzes se ele já estiver logado.
  if (sessionToken && publicPaths.includes(pathname)) {
    console.log(`Middleware: Usuário logado (token: ${sessionToken ? 'sim' : 'não'}) tentando acessar rota pública ${pathname}. Redirecionando para ${homePath}.`);
    return NextResponse.redirect(new URL(homePath, request.url));
  }

  // Cenário 2: Usuário não está logado e tenta acessar uma rota protegida
  // Redirecionar para a página de login.
  if (!sessionToken && !publicPaths.includes(pathname)) {
    // Evitar redirecionar para /login se já estiver tentando acessar /login e não tiver token
    // (embora o matcher abaixo já deva cuidar disso para /login)
    // A verificação !publicPaths.includes(pathname) já cuida disso.
    
    // Não redirecionar para /login se for uma rota de API ou recurso estático (_next)
    // O matcher abaixo ajuda com isso, mas uma verificação adicional pode ser útil.
    if (pathname.startsWith('/api/') || pathname.startsWith('/_next/')) {
        return NextResponse.next();
    }

    console.log(`Middleware: Usuário não logado (token: ${sessionToken ? 'sim' : 'não'}) tentando acessar rota protegida ${pathname}. Redirecionando para /login.`);
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // Se nenhum dos cenários acima se aplicar, permite que a requisição continue.
  console.log(`Middleware: Permitindo acesso para ${pathname} (token: ${sessionToken ? 'sim' : 'não'}).`);
  return NextResponse.next();
}

// 4. Configuração do Matcher:
// Especifique em quais rotas este middleware deve ser executado.
// Evite executá-lo em rotas de API, assets estáticos (_next), etc., a menos que necessário.
export const config = {
  matcher: [
    /*
     * Corresponde a todas as rotas, exceto aquelas que começam com:
     * - api (rotas de API)
     * - _next/static (arquivos estáticos)
     * - _next/image (otimização de imagens)
     * - favicon.ico (ícone de favoritos)
     * Isso garante que o middleware foque nas páginas de navegação.
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};