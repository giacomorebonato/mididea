import { Link, Outlet } from '@tanstack/react-router'
import { Button } from '@/components/ui/button'
import { AuthButton } from '../components/auth-button'

export function RootLayout() {
  return (
    <div className="min-h-screen w-full">
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <nav className="container mx-auto flex items-center gap-2 px-3 py-2 sm:px-4 sm:py-3">
          <Link to="/" className="font-bold text-lg mr-auto">
            Mididea
          </Link>
          <Link to="/creations">
            <Button variant="ghost" size="sm">
              Creations
            </Button>
          </Link>
          <AuthButton />
        </nav>
      </header>
      <main className="container mx-auto px-3 py-4 sm:p-8">
        <Outlet />
      </main>
    </div>
  )
}
