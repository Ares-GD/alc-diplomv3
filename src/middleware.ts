import { withAuth } from "next-auth/middleware"
import { NextResponse } from "next/server"

export default withAuth(
  async function middleware(req) {
    const pathname = req.nextUrl.pathname
    const token = req.nextauth.token
    const userRole = token?.role
    
    // Защита админских маршрутов с учетом ролей
    if (pathname.startsWith("/admin")) {
      if (!token) {
        return NextResponse.redirect(new URL("/", req.url))
      }

      // Маппинг путей к необходимым ролям
      const roleMap: Record<string, string[]> = {
        "/admin/dashboard": [ "stmanager", "director", "manager"],
        "/admin/orders": ["stmanager", "director", "manager"],
        "/admin/packings": [ "stmanager", "director"],
        "/admin/categories": [ "stmanager", "director"],
        "/admin/users": ["director"],
        "/admin/questions": [ "stmanager", "director", "manager"],
        "/admin/products": ["stmanager", "director"]
      }

      // Проверка прав доступа
      const matchedPath = Object.keys(roleMap).find(path => 
        pathname.startsWith(path)
      )

      if (matchedPath && !roleMap[matchedPath].includes(userRole)) {
        return NextResponse.redirect(new URL("/", req.url))
      }
    }
    
    // Защита профиля
    if (pathname === "/profile" && !token) {
      return NextResponse.redirect(new URL("/", req.url))
    }
    
    return NextResponse.next()
  },
  {
    callbacks: {
      authorized: ({ token }) => {
        return true
      }
    },
    pages: {
      signIn: "/", 
      error: "/auth/error"
    }
  }
)

export const config = {
  matcher: [
    "/admin/:path*",          
    "/profile",               
    "/catalog/cart/:path*",   
    "/catalog/orders/:path*", 
    
    "/((?!auth|_next/static|_next/image|favicon.ico|/|api/auth).*)"
  ]
}