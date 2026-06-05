import { useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import SEO from '@/components/common/SEO'
import { toast } from 'sonner'
import { Cookie, ShieldAlert, Settings } from 'lucide-react'

export default function CookiesPage() {
  const [preferences, setPreferences] = useState({
    necessary: true, // Always true
    analytics: true,
    marketing: false
  })

  const handleSave = () => {
    toast.success('Your cookie preferences have been successfully updated.')
  }

  return (
    <div className="min-h-screen py-12 md:py-20">
      <SEO 
        title="Cookie Notice"
        description="Learn how Ticketapoint uses cookies and tracking technologies to optimize ticket checkout, maintain secure sessions, and analyze traffic."
      />

      {/* Header */}
      <div className="text-center max-w-3xl mx-auto mb-16">
        <Badge variant="outline" className="mb-4 text-primary border-primary/30 px-3 py-1 font-semibold">
          Cookie Settings
        </Badge>
        <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl mb-4">
          Cookie Notice
        </h1>
        <p className="text-sm text-muted-foreground">
          Last Updated: June 1, 2026
        </p>
      </div>

      {/* Main Grid layout */}
      <div className="grid gap-12 lg:grid-cols-12 max-w-5xl mx-auto">
        
        {/* Left Side: Policy Details (7 columns) */}
        <div className="lg:col-span-7 space-y-6 text-sm leading-relaxed text-muted-foreground">
          <p>
            Ticketapoint uses cookies, pixel tags, and local storage mechanisms to recognize you, secure your transactions, improve our features, and personalize event recommendations.
          </p>

          <h2 className="text-xl font-bold text-foreground mt-6 mb-3 flex items-center gap-2">
            <Cookie className="h-5 w-5 text-primary" /> What are Cookies?
          </h2>
          <p>
            Cookies are small text files downloaded to your device by websites you visit. They enable websites to remember your device, track session items (like tickets currently in your shopping cart), and verify account logins during navigation.
          </p>

          <h2 className="text-xl font-bold text-foreground mt-6 mb-3 flex items-center gap-2">
            <Settings className="h-5 w-5 text-primary" /> Types of Cookies We Use
          </h2>
          
          <div className="space-y-4">
            <div className="border rounded-xl p-4 bg-muted/10">
              <h3 className="font-bold text-foreground text-sm flex items-center justify-between">
                Strictly Necessary Cookies
                <Badge className="bg-primary/20 text-primary border-none">Required</Badge>
              </h3>
              <p className="text-xs text-muted-foreground mt-1">
                Essential for standard security, authenticating user profiles, managing tickets in shopping carts, and processing secure Stripe checkouts. These cannot be disabled.
              </p>
            </div>

            <div className="border rounded-xl p-4 bg-muted/10">
              <h3 className="font-bold text-foreground text-sm flex items-center justify-between">
                Analytical / Performance Cookies
                <Badge variant="outline" className="text-muted-foreground border-border/80">Preferences Opt-in</Badge>
              </h3>
              <p className="text-xs text-muted-foreground mt-1">
                Help us analyze user navigation, discover platform speed bottlenecks, and count visitor sessions. All analytical data is anonymized.
              </p>
            </div>

            <div className="border rounded-xl p-4 bg-muted/10">
              <h3 className="font-bold text-foreground text-sm flex items-center justify-between">
                Marketing & Targeting Cookies
                <Badge variant="outline" className="text-muted-foreground border-border/80">Preferences Opt-in</Badge>
              </h3>
              <p className="text-xs text-muted-foreground mt-1">
                Used to deliver relevant ads to you about upcoming sports and concert tickets, limit the number of times you see an advertisement, and measure campaign reach.
              </p>
            </div>
          </div>
        </div>

        {/* Right Side: Preference Manager (5 columns) */}
        <div className="lg:col-span-5 space-y-6">
          <Card className="border shadow-lg">
            <CardContent className="p-6 space-y-6">
              <div>
                <h3 className="font-bold text-lg mb-1 flex items-center gap-2">
                  <Settings className="h-5 w-5 text-primary" /> Manage Preferences
                </h3>
                <p className="text-xs text-muted-foreground">
                  Adjust cookie permissions. Required cookies are active by default.
                </p>
              </div>

              {/* Necessary Toggle */}
              <div className="flex items-center justify-between border-b pb-4">
                <div>
                  <Label className="font-bold text-sm block">Necessary Cookies</Label>
                  <span className="text-[10px] text-muted-foreground">Session & shopping cart safety.</span>
                </div>
                <Switch checked={preferences.necessary} disabled />
              </div>

              {/* Analytics Toggle */}
              <div className="flex items-center justify-between border-b pb-4">
                <div>
                  <Label className="font-bold text-sm block">Analytical Cookies</Label>
                  <span className="text-[10px] text-muted-foreground">Traffic statistics & site optimization.</span>
                </div>
                <Switch 
                  checked={preferences.analytics} 
                  onCheckedChange={checked => setPreferences(prev => ({ ...prev, analytics: checked }))} 
                />
              </div>

              {/* Marketing Toggle */}
              <div className="flex items-center justify-between pb-2">
                <div>
                  <Label className="font-bold text-sm block">Marketing Cookies</Label>
                  <span className="text-[10px] text-muted-foreground">Personalized event advertisements.</span>
                </div>
                <Switch 
                  checked={preferences.marketing} 
                  onCheckedChange={checked => setPreferences(prev => ({ ...prev, marketing: checked }))} 
                />
              </div>

              <Button onClick={handleSave} className="w-full font-bold rounded-xl cursor-pointer">
                Save Cookie Settings
              </Button>
            </CardContent>
          </Card>

          {/* Warning notice */}
          <div className="p-4 border border-warning/25 bg-warning/5 rounded-xl flex gap-3 text-xs leading-relaxed text-muted-foreground">
            <ShieldAlert className="h-5 w-5 text-warning shrink-0" />
            <p>
              Blocking performance or targeting cookies may limit your ability to receive tailored tour listings or stadium seat recommendations based on your favorite sports franchises.
            </p>
          </div>
        </div>

      </div>
    </div>
  )
}
