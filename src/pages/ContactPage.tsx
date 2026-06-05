import { useState } from 'react'
import { Mail, Phone, MapPin, Send, MessageSquare } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import SEO from '@/components/common/SEO'
import { toast } from 'sonner'

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    orderNumber: '',
    subject: 'General Inquiry',
    message: ''
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.name || !formData.email || !formData.message) {
      toast.error('Please fill in all required fields.')
      return
    }

    setIsSubmitting(true)
    
    // Simulate API request
    setTimeout(() => {
      setIsSubmitting(false)
      toast.success('Your message has been sent. We will respond within 2-4 hours.')
      setFormData({
        name: '',
        email: '',
        orderNumber: '',
        subject: 'General Inquiry',
        message: ''
      })
    }, 1200)
  }

  const officeHours = [
    { zone: 'USA Support Desk', hours: '24/7 Hotline Coverage', phone: '+1 (800) 555-0199' },
    { zone: 'EMEA Support Desk', hours: '24/7 Hotline Coverage', phone: '+44 20 7946 0911' },
    { zone: 'Global Support Email', hours: 'Average response: <2h', phone: 'support@ticketapoint.com' }
  ]

  return (
    <div className="min-h-screen py-12 md:py-20">
      <SEO 
        title="Contact Us"
        description="Get in touch with the Ticketapoint support team. Submit support inquiries about ticket deliveries, refunds, or orders."
      />

      {/* Header */}
      <div className="text-center max-w-3xl mx-auto mb-16">
        <Badge variant="outline" className="mb-4 text-primary border-primary/30 px-3 py-1 font-semibold">
          Get in Touch
        </Badge>
        <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl mb-6">
          We are here to support you
        </h1>
        <p className="text-lg text-muted-foreground leading-relaxed">
          Have questions about your order, tickets transfer, or listing status? Drop us a line and our dedicated team will assist you immediately.
        </p>
      </div>

      {/* Main Grid layout */}
      <div className="grid gap-12 lg:grid-cols-12 max-w-6xl mx-auto">
        
        {/* Left Side: Contact Form (7 columns) */}
        <div className="lg:col-span-7 space-y-6">
          <Card className="border shadow-lg">
            <CardHeader className="pb-6">
              <CardTitle className="text-xl font-bold flex items-center gap-2">
                <MessageSquare className="h-5 w-5 text-primary" /> Send a Message
              </CardTitle>
              <CardDescription>
                Fill out the form below and we will route it to the appropriate regional department.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <Label htmlFor="contact-name">Full Name <span className="text-destructive">*</span></Label>
                    <Input 
                      id="contact-name" 
                      placeholder="Jane Doe" 
                      required 
                      value={formData.name}
                      onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="contact-email">Email Address <span className="text-destructive">*</span></Label>
                    <Input 
                      id="contact-email" 
                      type="email" 
                      placeholder="jane.doe@example.com" 
                      required 
                      value={formData.email}
                      onChange={e => setFormData(prev => ({ ...prev, email: e.target.value }))}
                    />
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <Label htmlFor="order-number">Order Number (Optional)</Label>
                    <Input 
                      id="order-number" 
                      placeholder="e.g. TH-8921-39" 
                      value={formData.orderNumber}
                      onChange={e => setFormData(prev => ({ ...prev, orderNumber: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="contact-subject">Inquiry Department <span className="text-destructive">*</span></Label>
                    <select
                      id="contact-subject"
                      className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs placeholder:text-muted-foreground focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-ring"
                      value={formData.subject}
                      onChange={e => setFormData(prev => ({ ...prev, subject: e.target.value }))}
                    >
                      <option className="bg-background" value="General Inquiry">General Inquiry</option>
                      <option className="bg-background" value="Ticket Delivery">Ticket Delivery & Verification</option>
                      <option className="bg-background" value="Refund Request">Refunds & Postponed Events</option>
                      <option className="bg-background" value="Selling Support">Selling Tickets Help</option>
                      <option className="bg-background" value="Partnership Request">Partnerships & Corporate</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="contact-message">Message Details <span className="text-destructive">*</span></Label>
                  <textarea 
                    id="contact-message" 
                    placeholder="Describe your issue or question in detail..." 
                    required 
                    rows={6}
                    className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs placeholder:text-muted-foreground focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-ring"
                    value={formData.message}
                    onChange={e => setFormData(prev => ({ ...prev, message: e.target.value }))}
                  />
                </div>

                <Button type="submit" disabled={isSubmitting} className="w-full font-bold rounded-xl gap-2 cursor-pointer mt-4">
                  {isSubmitting ? (
                    <>
                      <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Sending...</span>
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4" /> Send Ticket Request
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Right Side: Contact info (5 columns) */}
        <div className="lg:col-span-5 space-y-8">
          
          {/* Quick Support Channels */}
          <Card className="border">
            <CardHeader>
              <CardTitle className="text-lg font-bold">Quick Inquiries</CardTitle>
              <CardDescription>
                Reach our customer experience team immediately via phone or email support.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {officeHours.map((item, i) => (
                <div key={i} className="flex gap-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary shrink-0">
                    {i === 2 ? <Mail className="h-5 w-5" /> : <Phone className="h-5 w-5" />}
                  </div>
                  <div>
                    <h4 className="font-bold text-sm">{item.zone}</h4>
                    <p className="text-xs text-muted-foreground mt-0.5">{item.hours}</p>
                    <p className="text-sm font-bold text-primary mt-1">{item.phone}</p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Headquarters Info */}
          <Card className="border">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg font-bold flex items-center gap-2">
                <MapPin className="h-5 w-5 text-primary" /> Corporate Locations
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-xs text-muted-foreground leading-relaxed">
              <div>
                <p className="font-bold text-foreground mb-1 text-sm">North America Headquarters</p>
                <p>Ticketapoint Technologies Inc.</p>
                <p>1200 Market Street, Suite 400</p>
                <p>San Francisco, CA 94103</p>
              </div>
              <div className="pt-2 border-t">
                <p className="font-bold text-foreground mb-1 text-sm">European Office</p>
                <p>Ticketapoint Limited</p>
                <p>85 Great Portland St, First Floor</p>
                <p>London, W1W 7LT, United Kingdom</p>
              </div>
            </CardContent>
          </Card>
          
        </div>

      </div>
    </div>
  )
}
