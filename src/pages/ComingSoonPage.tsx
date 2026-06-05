import { useState } from 'react'
import { useLocation, Link } from 'react-router-dom'
import { Music, Trophy, Bell, ArrowLeft, Calendar, ShieldCheck, Ticket } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import SEO from '@/components/common/SEO'
import { toast } from 'sonner'

export default function ComingSoonPage() {
  const location = useLocation()
  const [email, setEmail] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const isConcerts = location.pathname.includes('concert')
  
  const content = {
    title: isConcerts ? 'Live Concerts & Music Festivals' : 'Global Sports Championships & Leagues',
    badge: isConcerts ? 'Music & Festivals' : 'Athletic & Sports Events',
    description: isConcerts 
      ? 'Get ready for stadium tours, indie showcases, and legendary global festivals. We are currently integrating verified ticket inventories for upcoming music events.'
      : 'Secure your spot at key league fixtures, regional tennis opens, motorsport races, and world championships. Verified tickets will be live shortly.',
    icon: isConcerts 
      ? <Music className="h-8 w-8 text-primary animate-pulse" /> 
      : <Trophy className="h-8 w-8 text-primary animate-pulse" />
  }

  const handleNotifyMe = (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) {
      toast.error('Please enter a valid email address.')
      return
    }

    setIsSubmitting(true)
    setTimeout(() => {
      setIsSubmitting(false)
      toast.success(`Success! We will notify ${email} as soon as ticket bookings open.`)
      setEmail('')
    }, 1000)
  }

  const features = [
    { icon: <ShieldCheck className="h-5 w-5 text-primary" />, text: '100% Verified Resellers' },
    { icon: <Ticket className="h-5 w-5 text-primary" />, text: 'Electronic Ticket Transfer' },
    { icon: <Calendar className="h-5 w-5 text-primary" />, text: 'Calendar Integration & Alerts' }
  ]

  return (
    <div className="min-h-screen flex items-center justify-center py-12 md:py-20 relative overflow-hidden">
      <SEO 
        title={isConcerts ? "Concerts - Coming Soon" : "Sports - Coming Soon"}
        description={content.description}
      />

      {/* Decorative Glow Elements */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl -z-10" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl -z-10" />

      <div className="max-w-2xl w-full px-4 text-center">
        
        {/* Category Icon Badge */}
        <div className="mx-auto w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-6 border border-primary/20 shadow-xs">
          {content.icon}
        </div>

        <Badge variant="outline" className="mb-4 text-primary border-primary/30 px-3 py-1 font-semibold">
          {content.badge} — Coming Soon
        </Badge>

        <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl mb-6 text-foreground">
          {content.title}
        </h1>

        <p className="text-base md:text-lg text-muted-foreground leading-relaxed max-w-xl mx-auto mb-10">
          {content.description}
        </p>

        {/* Email Notification Form */}
        <Card className="border border-border/80 bg-card/60 backdrop-blur-xs max-w-md mx-auto mb-10 shadow-lg">
          <CardContent className="pt-6">
            <h3 className="font-bold text-sm mb-2 flex items-center justify-center gap-1.5">
              <Bell className="h-4 w-4 text-primary" /> Get notified when listings open
            </h3>
            <p className="text-xs text-muted-foreground mb-4">
              Be the first to secure early-bird ticket releases and hot seat allocations.
            </p>

            <form onSubmit={handleNotifyMe} className="flex gap-2">
              <Input 
                type="email" 
                placeholder="your.email@example.com" 
                required 
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="bg-background flex-1"
              />
              <Button type="submit" disabled={isSubmitting} className="font-bold rounded-xl cursor-pointer px-5">
                {isSubmitting ? (
                  <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <span>Notify Me</span>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Teaser Perks Grid */}
        <div className="flex flex-wrap justify-center gap-6 text-xs text-muted-foreground font-medium mb-12">
          {features.map((feat, i) => (
            <div key={i} className="flex items-center gap-1.5 border border-border/50 bg-muted/15 px-3.5 py-1.5 rounded-full">
              {feat.icon}
              <span>{feat.text}</span>
            </div>
          ))}
        </div>

        {/* Back navigation */}
        <Link to="/">
          <Button variant="ghost" className="gap-2 cursor-pointer text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-4 w-4" /> Back to Home
          </Button>
        </Link>

      </div>
    </div>
  )
}
