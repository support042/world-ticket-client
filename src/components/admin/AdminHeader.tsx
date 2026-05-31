import { useState } from 'react'
import { Link } from 'react-router-dom'
import { LogOut, Home, Menu, X, Sun, Moon, Ticket } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useTheme } from '@/components/ThemeProvider'
import type { Admin } from '@/types'

interface AdminHeaderProps {
  admin: Admin | null
  onLogout: () => void
}

export default function AdminHeader({ admin, onLogout }: AdminHeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const { theme, setTheme } = useTheme()

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark')
  }

  return (
    <header className="bg-card border-b sticky top-0 z-50">
      <div className="container mx-auto px-4 xl:px-8 2xl:px-12">
        <div className="flex h-16 items-center justify-between gap-4">
          
          {/* Logo Section */}
          <div className="flex items-center gap-4">
            <Link to="/admin" className="flex items-center gap-2 group">
              <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary text-primary-foreground group-hover:scale-110 transition-transform">
                  <Ticket className="h-5 w-5" />
              </div>
              <div className="flex items-center">
                 <span className="text-xl font-black tracking-tight text-primary">ticket</span>
                 <span className="text-xl font-black tracking-tight text-foreground">hub</span>
              </div>
            </Link>
            <Badge variant="secondary" className="hidden sm:inline-block font-black uppercase tracking-widest text-[10px]">Admin</Badge>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-4">
            {/* Welcome Message - Hidden on smaller desktop */}
            <span className="text-sm text-muted-foreground hidden lg:inline">
              Welcome, {admin?.name}
            </span>
            
            {/* Theme Toggle */}
            <Button variant="ghost" size="icon" onClick={toggleTheme}>
              {theme === 'dark' 
                ? <Sun className="h-4 w-4" /> 
                : <Moon className="h-4 w-4" />
              }
            </Button>
            
            {/* View Site Button */}
            <Button variant="ghost" size="sm" asChild>
              <Link to="/">
                <Home className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">View Site</span>
              </Link>
            </Button>
            
            {/* Logout Button */}
            <Button variant="outline" size="sm" onClick={onLogout}>
              <LogOut className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">Logout</span>
            </Button>
          </div>

          {/* Mobile Right Side - Theme Toggle + Hamburger */}
          <div className="flex items-center gap-2 md:hidden">
            {/* Mobile Admin Badge */}
            <Badge variant="secondary" className="sm:hidden">Admin</Badge>
            
            {/* Theme Toggle */}
            <Button variant="ghost" size="icon" onClick={toggleTheme}>
              {theme === 'dark' 
                ? <Sun className="h-4 w-4" /> 
                : <Moon className="h-4 w-4" />
              }
            </Button>
            
            {/* Hamburger Menu Button */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="border-t bg-card md:hidden">
          <nav className="container mx-auto px-4 py-4 flex flex-col gap-3">
            {/* Welcome Message */}
            <div className="pb-2 border-b">
              <p className="text-sm text-muted-foreground">
                Welcome, <span className="font-semibold text-foreground">{admin?.name}</span>
              </p>
            </div>
            
            {/* View Site Link */}
            <Link 
              to="/" 
              className="flex items-center gap-2 text-sm font-medium hover:text-primary transition-colors py-1"
              onClick={() => setMobileMenuOpen(false)}
            >
              <Home className="h-4 w-4" />
              View Site
            </Link>
            
            {/* Logout Button */}
            <Button 
              variant="outline" 
              onClick={() => {
                onLogout()
                setMobileMenuOpen(false)
              }}
              className="w-full justify-center mt-2"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </nav>
        </div>
      )}
    </header>
  )
}