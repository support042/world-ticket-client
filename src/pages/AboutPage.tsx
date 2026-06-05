import { ShieldCheck, Users, Clock, Award, ArrowRight } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import SEO from '@/components/common/SEO'
import { Link } from 'react-router-dom'

export default function AboutPage() {
  const stats = [
    { label: 'Tickets Sold', value: '5M+', description: 'Secured entries to world-class events' },
    { label: 'Guarantee Rate', value: '100%', description: 'Every single order backed by Ticketapoint guarantee' },
    { label: 'Global Coverage', value: '120+', description: 'Countries with active live events' },
    { label: 'Support Inquiries Resolved', value: '99.8%', description: 'Industry-leading customer satisfaction' },
  ]

  const values = [
    {
      icon: <ShieldCheck className="h-6 w-6 text-primary" />,
      title: 'Uncompromised Security',
      description: 'We believe ticket buying should be worry-free. Our advanced blockchain-backed validation and secure transfer mechanisms make fraud a thing of the past.'
    },
    {
      icon: <Users className="h-6 w-6 text-primary" />,
      title: 'Fan-First Marketplace',
      description: 'Built for fans, by fans. We keep fees transparent and fight ticket hoarding, ensuring true enthusiasts get fair access to the events they love.'
    },
    {
      icon: <Clock className="h-6 w-6 text-primary" />,
      title: 'Always-On Support',
      description: 'Live events happen around the clock, and so does our support. We are here to help you before, during, and after the event.'
    },
    {
      icon: <Award className="h-6 w-6 text-primary" />,
      title: '100% Guaranteed',
      description: 'Every ticket is guaranteed to be authentic and delivered on time. If an event is cancelled, we ensure hassle-free refunds or comparable replacements.'
    }
  ]

  return (
    <div className="min-h-screen py-12 md:py-20">
      <SEO 
        title="About Us"
        description="Learn more about Ticketapoint, the most secure ticket marketplace for global events and sports, including World Cup 2026."
      />

      {/* Hero Header */}
      <div className="text-center max-w-3xl mx-auto mb-16">
        <Badge variant="outline" className="mb-4 text-primary border-primary/30 px-3 py-1">
          Our Journey
        </Badge>
        <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl mb-6">
          Connecting fans to the world's greatest spectacles
        </h1>
        <p className="text-lg text-muted-foreground leading-relaxed">
          Ticketapoint was founded with a singular, powerful mission: to build the most secure, transparent, and user-friendly ticket marketplace on the planet. From local gigs to the final matches of the World Cup 2026, we ensure you never miss a beat.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-20">
        {stats.map((stat, i) => (
          <Card key={i} className="border border-border/50 bg-card/50 backdrop-blur-xs hover:border-primary/45 hover:shadow-lg transition-all duration-300">
            <CardContent className="pt-6">
              <div className="text-4xl font-black text-primary mb-2">{stat.value}</div>
              <h3 className="font-bold text-base mb-1">{stat.label}</h3>
              <p className="text-xs text-muted-foreground">{stat.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Core Values Section */}
      <div className="mb-20">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2 className="text-3xl font-bold tracking-tight mb-4">Our Core Values</h2>
          <p className="text-muted-foreground">
            The principles that guide our product, engineering, and customer support decisions every day.
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-2">
          {values.map((value, i) => (
            <div key={i} className="flex gap-4 p-6 border rounded-2xl bg-card hover:bg-muted/10 transition-colors">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 shrink-0">
                {value.icon}
              </div>
              <div>
                <h3 className="text-lg font-bold mb-2">{value.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {value.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Mission / Callout Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-linear-to-br from-primary/10 via-primary/5 to-transparent border border-primary/20 p-8 md:p-12 text-center max-w-4xl mx-auto">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -z-10" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl -z-10" />
        
        <h2 className="text-2xl md:text-3xl font-bold mb-4">Ready to experience your next memory?</h2>
        <p className="text-muted-foreground max-w-xl mx-auto mb-8">
          Browse our secure inventory of sports matches, music concerts, and theatrical performances.
        </p>
        <div className="flex justify-center gap-4">
          <Link to="/">
            <button className="inline-flex items-center justify-center gap-2 px-6 py-3 font-bold text-white transition-all bg-primary rounded-xl hover:bg-primary/95 shadow-md shadow-primary/20 cursor-pointer">
              Explore Events
              <ArrowRight className="h-4 w-4" />
            </button>
          </Link>
          <Link to="/contact">
            <button className="px-6 py-3 font-bold border rounded-xl hover:bg-muted/50 transition-colors cursor-pointer">
              Contact Team
            </button>
          </Link>
        </div>
      </div>
    </div>
  )
}
