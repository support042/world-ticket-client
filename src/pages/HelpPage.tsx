import { useState } from 'react'
import { Search, ShoppingBag, ShieldCheck, UserCheck, RefreshCw, AlertTriangle, ArrowRight, HelpCircle } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import SEO from '@/components/common/SEO'
import { Link } from 'react-router-dom'

interface SupportCategory {
  icon: React.ReactNode
  title: string
  description: string
  articleCount: number
  link: string
}

interface PopularArticle {
  title: string
  category: string
  link: string
}

export default function HelpPage() {
  const [searchQuery, setSearchQuery] = useState('')

  const categories: SupportCategory[] = [
    {
      icon: <ShoppingBag className="h-6 w-6 text-primary" />,
      title: 'Buying Tickets',
      description: 'Understanding payment methods, orders, mobile tickets delivery, and ticket fees.',
      articleCount: 14,
      link: '/faq'
    },
    {
      icon: <ShieldCheck className="h-6 w-6 text-primary" />,
      title: 'Ticketapoint Guarantee',
      description: 'Find out how we cover every purchase, guarantee authenticity, and handle disputes.',
      articleCount: 6,
      link: '/faq'
    },
    {
      icon: <UserCheck className="h-6 w-6 text-primary" />,
      title: 'Account & Verification',
      description: 'Managing password resets, authentication, updating phone numbers, and security settings.',
      articleCount: 9,
      link: '/profile'
    },
    {
      icon: <RefreshCw className="h-6 w-6 text-primary" />,
      title: 'Refunds & Returns',
      description: 'Policies on postponed games, cancelled concerts, and selling tickets you can no longer use.',
      articleCount: 11,
      link: '/faq'
    },
    {
      icon: <AlertTriangle className="h-6 w-6 text-primary" />,
      title: 'Postponed & Cancelled Events',
      description: 'What happens to your tickets if an event is delayed, matches rescheduled, or completely cancelled.',
      articleCount: 8,
      link: '/faq'
    }
  ]

  const popularArticles: PopularArticle[] = [
    { title: 'When will I receive my World Cup 2026 tickets?', category: 'Buying Tickets', link: '/faq' },
    { title: 'How does the Ticketapoint 100% Guarantee protect buyers?', category: 'Guarantee', link: '/faq' },
    { title: 'How can I sell tickets I purchased but cannot use?', category: 'Refunds', link: '/faq' },
    { title: 'What payment options does Ticketapoint support?', category: 'Buying Tickets', link: '/faq' },
    { title: 'How to change the name on my e-ticket?', category: 'Account', link: '/profile' }
  ]

  const filteredArticles = popularArticles.filter(art => 
    art.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    art.category.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="min-h-screen py-12 md:py-20">
      <SEO 
        title="Help Center"
        description="Search support topics, browse buying/selling guides, and find help for your Ticketapoint orders."
      />

      {/* Hero Search Header */}
      <div className="relative overflow-hidden rounded-3xl bg-linear-to-br from-primary/10 via-primary/5 to-transparent border border-primary/20 p-8 md:p-16 mb-16 text-center">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -z-10" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl -z-10" />

        <Badge variant="outline" className="mb-4 text-primary border-primary/30 px-3 py-1 font-semibold">
          Customer Support
        </Badge>
        <h1 className="text-3xl font-extrabold tracking-tight sm:text-5xl mb-6">
          How can we help you today?
        </h1>
        
        {/* Support Search Bar */}
        <div className="relative max-w-xl mx-auto group">
          <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors" />
          <Input
            type="search"
            placeholder="Search help articles (e.g. refund, World Cup tickets...)"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-6 bg-background border-border/80 focus:border-primary rounded-2xl shadow-sm transition-all"
          />
        </div>
      </div>

      {/* Main Content Layout */}
      <div className="grid gap-12 lg:grid-cols-3">
        
        {/* Left/Middle Column: Support Categories */}
        <div className="lg:col-span-2 space-y-6">
          <h2 className="text-2xl font-bold tracking-tight mb-6">Browse by Topic</h2>
          
          <div className="grid gap-6 sm:grid-cols-2">
            {categories.map((cat, i) => (
              <Link key={i} to={cat.link} className="block group">
                <Card className="h-full border border-border/60 hover:border-primary/45 hover:shadow-md transition-all">
                  <CardHeader className="pb-3 flex flex-row items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 group-hover:scale-105 transition-transform">
                      {cat.icon}
                    </div>
                    <div>
                      <CardTitle className="text-base font-bold group-hover:text-primary transition-colors">
                        {cat.title}
                      </CardTitle>
                      <CardDescription className="text-xs">
                        {cat.articleCount} articles
                      </CardDescription>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      {cat.description}
                    </p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>

        {/* Right Column: Popular / Filtered Articles */}
        <div className="space-y-6">
          <h2 className="text-2xl font-bold tracking-tight mb-6 flex items-center gap-2">
            <HelpCircle className="h-5 w-5 text-primary" /> 
            {searchQuery ? 'Search Results' : 'Popular Articles'}
          </h2>

          <Card className="border border-border">
            <CardContent className="p-6">
              <div className="divide-y space-y-4">
                {filteredArticles.length > 0 ? (
                  filteredArticles.map((art, i) => (
                    <div key={i} className={`${i > 0 ? 'pt-4' : ''} group`}>
                      <span className="text-[10px] text-primary font-bold uppercase tracking-wider block mb-1">
                        {art.category}
                      </span>
                      <Link to={art.link} className="font-semibold text-sm leading-snug hover:text-primary transition-colors block flex justify-between items-center gap-2">
                        {art.title}
                        <ArrowRight className="h-3.5 w-3.5 shrink-0 opacity-0 group-hover:opacity-100 transition-all text-primary" />
                      </Link>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground py-4 text-center">
                    No articles matching "{searchQuery}"
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Direct Support Callout */}
          <Card className="border border-primary/20 bg-primary/5 p-6 rounded-2xl">
            <h3 className="font-bold text-base mb-2">Still need help?</h3>
            <p className="text-xs text-muted-foreground leading-relaxed mb-4">
              Can't find the answers you're looking for? Our friendly global customer team is available 24 hours a day, 7 days a week.
            </p>
            <Link to="/contact">
              <button className="w-full inline-flex items-center justify-center gap-2 px-4 py-2 text-xs font-bold text-white bg-primary rounded-lg hover:bg-primary/95 transition-all cursor-pointer">
                Contact Support Desk
              </button>
            </Link>
          </Card>
        </div>

      </div>
    </div>
  )
}
