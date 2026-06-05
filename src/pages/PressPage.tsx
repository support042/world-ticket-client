import { FileText, Download, Mail, Calendar, Award } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import SEO from '@/components/common/SEO'
import { toast } from 'sonner'

interface PressRelease {
  id: string
  date: string
  title: string
  category: string
  summary: string
  content: string
}

export default function PressPage() {
  const pressReleases: PressRelease[] = [
    {
      id: 'pr-1',
      date: 'May 14, 2026',
      category: 'Product Update',
      title: 'Ticketapoint Unveils Blockchain-Backed Verification System for 2026 World Cup Tournaments',
      summary: 'Introducing state-of-the-art encrypted transfer technology to eradicate ticket counterfeit and secondary market scams.',
      content: 'In preparation for the historic sporting events across North America, Ticketapoint is rolling out its proprietary secure verification network. Fans can now buy and transfer tickets with verified credentials linked directly to primary ticket offices, protecting them against digital replication and secondary resale price gauging.'
    },
    {
      id: 'pr-2',
      date: 'April 28, 2026',
      category: 'Partnership',
      title: 'Ticketapoint Partnered with European Football Associations as Official Fan Resale Partner',
      summary: 'A new multi-year deal gives millions of fans access to guaranteed, club-approved ticketing options during regional championship seasons.',
      content: 'This collaboration introduces deep API integration with major stadium gates, ensuring instant electronic tickets (e-tickets) re-issuance upon purchase, providing a stress-free transition for fans and reducing ticket fraud rates to zero.'
    },
    {
      id: 'pr-3',
      date: 'March 10, 2026',
      category: 'Milestone',
      title: 'Ticketapoint Reaches 5 Million Secure Orders and Expands Operations to Asia-Pacific Region',
      summary: 'With active listings scaling in Tokyo, Sydney, and Singapore, the fan-first ticketing hub has officially expanded across three major global zones.',
      content: 'Building on strong growth in Europe and North America, our expansion is backed by round-the-clock localized customer support and multi-currency billing structures.'
    }
  ]

  const handleDownloadBrandKit = () => {
    toast.success('Brand kit download started! (ticketapoint_brand_kit_2026.zip)')
  }

  return (
    <div className="min-h-screen py-12 md:py-20">
      <SEO 
        title="Press & Media"
        description="Get the latest news, press releases, media assets, and brand guidelines for Ticketapoint."
      />

      {/* Hero Header */}
      <div className="text-center max-w-3xl mx-auto mb-16">
        <Badge variant="outline" className="mb-4 text-primary border-primary/30 px-3 py-1 font-semibold">
          Pressroom
        </Badge>
        <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl mb-6">
          Latest news & media resources
        </h1>
        <p className="text-lg text-muted-foreground leading-relaxed">
          Stay up to date with our corporate updates, partnerships, security technology launches, and product announcements.
        </p>
      </div>

      {/* Grid: Press Releases & Brand Kit */}
      <div className="grid gap-8 lg:grid-cols-3 mb-20">
        
        {/* Left/Middle Column: Press Releases */}
        <div className="lg:col-span-2 space-y-6">
          <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" /> Press Releases
          </h2>

          {pressReleases.map((pr) => (
            <Card key={pr.id} className="border hover:border-primary/20 transition-all">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-3 mb-2">
                  <Badge variant="secondary" className="text-[10px] font-bold">
                    {pr.category}
                  </Badge>
                  <span className="text-xs text-muted-foreground flex items-center gap-1">
                    <Calendar className="h-3 w-3" /> {pr.date}
                  </span>
                </div>
                <CardTitle className="text-lg font-bold text-card-foreground">
                  {pr.title}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm font-semibold leading-relaxed text-muted-foreground">
                  {pr.summary}
                </p>
                <p className="text-sm leading-relaxed text-muted-foreground/80 border-l-2 border-primary/20 pl-4 py-1 italic">
                  {pr.content}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Right Column: Assets & Inquiries */}
        <div className="space-y-8">
          {/* Brand Assets */}
          <Card className="border border-primary/20 bg-primary/5">
            <CardHeader>
              <CardTitle className="text-lg font-bold flex items-center gap-2">
                <Award className="h-5 w-5 text-primary" /> Media & Brand Kit
              </CardTitle>
              <CardDescription className="text-xs">
                Logos, product mockups, and corporate photography assets.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-xs text-muted-foreground leading-relaxed">
                Please follow our brand guidelines when featuring the Ticketapoint name, color scheme, or official assets in media stories.
              </p>
              <Button onClick={handleDownloadBrandKit} className="w-full font-bold rounded-xl gap-2 cursor-pointer">
                <Download className="h-4 w-4" /> Download Brand Kit
              </Button>
            </CardContent>
          </Card>

          {/* Media Contacts */}
          <Card className="border border-border">
            <CardHeader>
              <CardTitle className="text-lg font-bold flex items-center gap-2">
                <Mail className="h-5 w-5 text-primary" /> PR Contacts
              </CardTitle>
              <CardDescription className="text-xs">
                Direct channel for press and media enquiries only.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-xs text-muted-foreground leading-relaxed">
                For customer support requests (refunds, transfers, bookings), please visit our <a href="/help" className="text-primary hover:underline font-semibold">Help Center</a>.
              </p>
              
              <div className="space-y-2 border-t pt-4 text-sm">
                <div>
                  <p className="text-xs text-muted-foreground font-semibold">Global PR Department</p>
                  <p className="font-bold flex items-center gap-1 text-primary">
                    press@ticketapoint.com
                  </p>
                </div>
                
                <div className="pt-2">
                  <p className="text-xs text-muted-foreground font-semibold">PR Agency (EMEA)</p>
                  <p className="font-medium text-foreground">
                    Fleming Media Group
                  </p>
                  <p className="text-xs text-muted-foreground">
                    ticketapoint@flemingmedia.com
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

      </div>
    </div>
  )
}
