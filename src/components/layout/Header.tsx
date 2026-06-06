import { useState } from "react";
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Search, User, Menu, X, Sun, Moon, Ticket, LogOut } from "lucide-react";
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useAuthStore } from "@/store/authStore";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import AuthForm from "@/components/auth/AuthForm";
import { useTheme } from "@/components/ThemeProvider";
import type { AuthMode } from "@/types";
// import { useCartStore } from "@/store/cartStore";
import { useEventsStore } from "@/store/eventsStore";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export default function Header() {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [authDialogOpen, setAuthDialogOpen] = useState(false);
    const [authMode, setAuthMode] = useState<AuthMode>('signin');

    const navigate = useNavigate();
    const location = useLocation();
    const { user, isAuthenticated, logout } = useAuthStore();
    const { theme, setTheme } = useTheme();
    // const { items, selectedEvent } = useCartStore();
    const { searchQuery, setSearchQuery } = useEventsStore()

    // Only show search bar on the home page
    const isHomePage = location.pathname === '/'

    const toggleTheme = () => {
        setTheme(theme === 'dark' ? 'light' : 'dark')
    }
    
    const handleSearch = (e: { preventDefault: () => void; }) => {
        e.preventDefault()
        navigate('/')
    }

    const handleAuthSuccess = () => {
        setAuthDialogOpen(false)
    }

    return (
        <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
            <div className="container mx-auto px-4">
                <div className="flex h-16 items-center justify-between gap-4">
                    {/* Logo */}
                     <Link to="/" className="flex items-center gap-2 group">
                        <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary text-primary-foreground group-hover:scale-110 transition-transform">
                            <Ticket className="h-5 w-5" />
                        </div>
                        <div className="flex items-center">
                           <span className="text-xl font-black tracking-tight text-primary">ticket</span>
                           <span className="text-xl font-black tracking-tight text-foreground">apoint</span>
                        </div>
                     </Link>

                     {/* Search - Desktop: only on homepage */}
                     {isHomePage && (
                     <form onSubmit={handleSearch} className="hidden flex-1 max-w-xl md:flex">
                        <div className="relative w-full group">
                        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors" />
                        <Input
                            type="search"
                            placeholder="Search events, teams and more"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 bg-muted/20 border-border/40 focus:bg-background transition-all duration-300 ring-offset-background"
                        />
                        </div>
                     </form>
                     )}

                     {/* Navigation - Desktop */}
                     <nav className="hidden items-center gap-6 md:flex">
                        <Link 
                            to="/my-tickets" 
                            className={`relative text-sm font-bold transition-colors hover:text-primary flex items-center h-16 ${location.pathname === '/my-tickets' ? 'text-primary' : 'text-muted-foreground'}`}
                        >
                            My Reservations
                            {location.pathname === '/my-tickets' && (
                                <span className="absolute bottom-0 left-0 w-full h-0.5 bg-primary rounded-full" />
                            )}
                        </Link>

                         {/* Theme Toggle */}
                        <Button variant="ghost" size="icon" onClick={toggleTheme} className="rounded-full w-9 h-9">
                            {theme === 'dark' 
                                ? <Sun className="h-4 w-4" /> 
                                : <Moon className="h-4 w-4" />
                            }
                        </Button>

                        <div className="flex items-center gap-3">
                           {/* Cart Icon - Commented out for reservation focus */}
                           {/* {(items.length > 0 || selectedEvent) && (
                               <Link to="/cart" className="relative p-2 rounded-full hover:bg-muted transition-colors mr-1">
                                   <ShoppingCart className={`h-5 w-5 ${location.pathname === '/cart' ? 'text-primary' : ''}`} />
                                   {items.length > 0 && (
                                       <span className="absolute top-1 right-1 h-4 w-4 rounded-full bg-primary text-[10px] font-black text-primary-foreground flex items-center justify-center">
                                           {items.length}
                                       </span>
                                   )}
                                   {location.pathname === '/cart' && (
                                       <span className="absolute bottom-0 left-[20%] w-[60%] h-0.5 bg-primary rounded-full transition-all" />
                                   )}
                               </Link>
                           )} */}

                           {isAuthenticated ? (
                               <DropdownMenu>
                                   <DropdownMenuTrigger asChild>
                                       <Button variant="ghost" size="sm" className="gap-2 px-2 hover:bg-muted/50 rounded-full">
                                           <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs ring-1 ring-primary/20">
                                               {user?.firstName?.[0].toUpperCase()}
                                           </div>
                                           <span className="hidden lg:inline text-xs font-bold">{user?.firstName}</span>
                                       </Button>
                                   </DropdownMenuTrigger>
                                   <DropdownMenuContent align="end" className="w-56 mt-1 p-2 rounded-xl shadow-xl border-border/50">
                                       <DropdownMenuLabel className="font-normal p-2">
                                           <div className="flex flex-col space-y-1">
                                               <p className="text-sm font-bold leading-none">{user?.firstName} {user?.lastName}</p>
                                               <p className="text-xs leading-none text-muted-foreground">{user?.email}</p>
                                           </div>
                                       </DropdownMenuLabel>
                                       <DropdownMenuSeparator className="my-2" />
                                       <DropdownMenuItem onClick={() => navigate('/profile')} className="rounded-lg cursor-pointer py-2 px-3 focus:bg-primary/5">
                                           <User className="mr-2 h-4 w-4" />
                                           <span>Profile</span>
                                       </DropdownMenuItem>
                                       <DropdownMenuItem onClick={() => navigate('/my-tickets')} className="rounded-lg cursor-pointer py-2 px-3 focus:bg-primary/5">
                                           <Ticket className="mr-2 h-4 w-4" />
                                           <span>My Reservations</span>
                                       </DropdownMenuItem>
                                       <DropdownMenuSeparator className="my-2" />
                                       <DropdownMenuItem onClick={logout} className="rounded-lg cursor-pointer py-2 px-3 text-destructive focus:bg-destructive/5 focus:text-destructive">
                                           <LogOut className="mr-2 h-4 w-4" />
                                           <span>Log out</span>
                                       </DropdownMenuItem>
                                   </DropdownMenuContent>
                               </DropdownMenu>
                           ) : (
                               <div className="flex items-center gap-2">
                                   <Button
                                       variant="ghost"
                                       size="sm"
                                       className="font-bold text-xs px-4"
                                       onClick={() => {
                                           setAuthMode('signin')
                                           setAuthDialogOpen(true)
                                       }}
                                   >
                                       Sign In
                                   </Button>
                                   <Button
                                       size="sm"
                                       className="font-bold text-xs px-4 rounded-full"
                                       onClick={() => {
                                           setAuthMode('signup')
                                           setAuthDialogOpen(true)
                                       }}
                                   >
                                       Sign Up
                                   </Button>
                               </div>
                           )}
                        </div>
                     </nav>
                     {/* Mobile right side - cart + theme toggle + hamburger */}
                     <div className="flex items-center gap-1 md:hidden">
                        {/* Cart Icon - Commented out for reservation focus */}
                        {/* {(items.length > 0 || selectedEvent) && (
                            <Link to="/cart" className="relative p-2 rounded-full hover:bg-muted transition-colors">
                                <ShoppingCart className={`h-5 w-5 ${location.pathname === '/cart' ? 'text-primary' : ''}`} />
                                {items.length > 0 && (
                                    <span className="absolute top-1 right-1 h-3.5 w-3.5 rounded-full bg-primary text-[8px] font-black text-primary-foreground flex items-center justify-center">
                                        {items.length}
                                    </span>
                                )}
                            </Link>
                        )} */}
                        <Button variant="ghost" size="icon" onClick={toggleTheme} className="w-9 h-9">
                            {theme === 'dark' 
                                ? <Sun className="h-4 w-4" /> 
                                : <Moon className="h-4 w-4" />
                            }
                        </Button>
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                            className="w-9 h-9"
                        >
                            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                        </Button>
                     </div>
                </div>

                {/* Mobile Search: only on homepage */}
                {isHomePage && (
                <div className="pb-4 md:hidden">
                <form onSubmit={handleSearch}>
                    <div className="relative">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                        type="search"
                        placeholder="Search events..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10"
                    />
                    </div>
                </form>
                </div>
                )}
            </div>

            {/* Mobile Menu */}
            {mobileMenuOpen && (
                <div className="border-t bg-background md:hidden">
                <nav className="container mx-auto px-4 py-4 flex flex-col gap-4">
                    {/* Explore - Coming Soon */}
                    {/* <Link to="/" className="text-sm font-medium hover:text-primary" onClick={() => setMobileMenuOpen(false)}>Explore</Link> */}

                    {/* Sell - Coming Soon */}
                    {/* <Link to="/sell" className="text-sm font-medium hover:text-primary" onClick={() => setMobileMenuOpen(false)}>Sell</Link> */}

                    {/* Favorites - Coming Soon */}
                    {/* <Link to="/favorites" className="text-sm font-medium hover:text-primary" onClick={() => setMobileMenuOpen(false)}>Favorites</Link> */}

                    <Link to="/my-tickets" className="text-sm font-medium hover:text-primary" onClick={() => setMobileMenuOpen(false)}>
                    My Reservations
                    </Link>

                    {isAuthenticated ? (
                    <>
                        <Link to="/profile" className="text-sm font-medium hover:text-primary" onClick={() => setMobileMenuOpen(false)}>
                        Profile
                        </Link>
                        <Button variant="outline" onClick={() => { logout(); setMobileMenuOpen(false) }}>
                        Logout
                        </Button>
                    </>
                    ) : (
                    <div className="flex gap-2">
                        <Button
                        variant="outline"
                        className="flex-1"
                        onClick={() => {
                            setAuthMode('signin')
                            setAuthDialogOpen(true)
                            setMobileMenuOpen(false)
                        }}
                        >
                        Sign In
                        </Button>
                        <Button
                        className="flex-1"
                        onClick={() => {
                            setAuthMode('signup')
                            setAuthDialogOpen(true)
                            setMobileMenuOpen(false)
                        }}
                        >
                        Sign Up
                        </Button>
                    </div>
                    )}
                </nav>
                </div>
            )}

            {/* Auth Dialog */}
            <Dialog open={authDialogOpen} onOpenChange={setAuthDialogOpen}>
                <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>
                    {authMode === 'signin' ? 'Sign In' : 'Create Account'}
                    </DialogTitle>
                </DialogHeader>
                <AuthForm
                    mode={authMode}
                    onToggleMode={() => setAuthMode(authMode === 'signin' ? 'signup' : 'signin')}
                    onSuccess={handleAuthSuccess}
                />
                </DialogContent>
            </Dialog>
        </header>
    )
}
