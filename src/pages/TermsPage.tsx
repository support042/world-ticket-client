import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import SEO from '@/components/common/SEO'

export default function TermsPage() {
  const sections = [
    { id: 'intro', title: '1. Introduction & Scope' },
    { id: 'accounts', title: '2. User Accounts & Security' },
    { id: 'buying', title: '3. Ticket Buying Policy' },
    { id: 'selling', title: '4. Ticket Selling & Transfers' },
    { id: 'guarantee', title: '5. Ticketapoint 100% Guarantee' },
    { id: 'refunds', title: '6. Cancelled & Rescheduled Events' },
    { id: 'liability', title: '7. Limitation of Liability' },
    { id: 'governance', title: '8. Governing Law & Disputes' }
  ]

  const handleSectionScroll = (id: string) => {
    const el = document.getElementById(id)
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }

  return (
    <div className="min-h-screen py-12 md:py-20">
      <SEO 
        title="User Agreement"
        description="Read the Ticketapoint User Agreement and Terms of Service. Understand buyer protections, seller payouts, and platform rules."
      />

      {/* Header */}
      <div className="text-center max-w-3xl mx-auto mb-16">
        <Badge variant="outline" className="mb-4 text-primary border-primary/30 px-3 py-1 font-semibold">
          Legal Agreement
        </Badge>
        <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl mb-4">
          User Agreement
        </h1>
        <p className="text-sm text-muted-foreground">
          Last Updated: June 1, 2026
        </p>
      </div>

      {/* Content Layout */}
      <div className="grid gap-10 lg:grid-cols-12 max-w-5xl mx-auto">
        
        {/* Left Sticky Sidebar (Table of Contents) */}
        <aside className="hidden lg:block lg:col-span-4">
          <Card className="sticky top-24 border">
            <CardContent className="p-6">
              <h3 className="font-bold text-sm mb-4 text-foreground uppercase tracking-wider">
                Table of Contents
              </h3>
              <nav className="space-y-2">
                {sections.map((sec) => (
                  <button
                    key={sec.id}
                    onClick={() => handleSectionScroll(sec.id)}
                    className="w-full text-left text-xs font-semibold text-muted-foreground hover:text-primary transition-colors py-1 block cursor-pointer"
                  >
                    {sec.title}
                  </button>
                ))}
              </nav>
            </CardContent>
          </Card>
        </aside>

        {/* Right Side: Legal Text Content */}
        <div className="lg:col-span-8 space-y-10 text-sm leading-relaxed text-muted-foreground">
          
          <div className="p-6 border rounded-2xl bg-muted/20">
            <p className="font-semibold text-foreground mb-2">Important Notice:</p>
            Please read this agreement carefully. It contains important details regarding your legal rights, ticket purchase protection, transaction fees, and arbitration agreements in the event of disputes.
          </div>

          {/* Section 1 */}
          <section id="intro" className="space-y-3 scroll-mt-24">
            <h2 className="text-lg font-bold text-foreground">1. Introduction & Scope</h2>
            <p>
              Welcome to Ticketapoint (the "Platform"). This User Agreement ("Agreement") governs your access to and use of our websites, mobile applications, and services. By registering an account, buying tickets, or listing tickets for sale on Ticketapoint, you agree to comply with and be legally bound by these terms.
            </p>
            <p>
              Ticketapoint operates as an intermediary marketplace. We provide a secure environment where users can purchase and sell secondary-market tickets for live entertainment, concerts, and major global sporting events, including the FIFA World Cup 2026. Ticketapoint does not set ticket prices or guarantee ticket availability prior to listing.
            </p>
          </section>

          {/* Section 2 */}
          <section id="accounts" className="space-y-3 scroll-mt-24">
            <h2 className="text-lg font-bold text-foreground">2. User Accounts & Security</h2>
            <p>
              To purchase or list tickets on Ticketapoint, you must create a verified account. You agree to provide accurate, current, and complete information during registration. You are solely responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your password.
            </p>
            <p>
              We reserve the right to suspend or terminate accounts that violate security rules, engage in suspicious transaction histories, or use bot networks to scrape event data or complete fraudulent listings.
            </p>
          </section>

          {/* Section 3 */}
          <section id="buying" className="space-y-3 scroll-mt-24">
            <h2 className="text-lg font-bold text-foreground">3. Ticket Buying Policy</h2>
            <p>
              All purchases on Ticketapoint are final. Once an order is confirmed, it cannot be cancelled, modified, or refunded by the buyer, except as provided under our Cancelled Events policy.
            </p>
            <p>
              Ticket prices are set by the individual sellers and may exceed the face value printed on the physical or electronic ticket. In addition to the ticket listing price, Ticketapoint collects service, delivery, and transactional fees, which are presented clearly before checkout.
            </p>
          </section>

          {/* Section 4 */}
          <section id="selling" className="space-y-3 scroll-mt-24">
            <h2 className="text-lg font-bold text-foreground">4. Ticket Selling & Transfers</h2>
            <p>
              Sellers are legally responsible for the accuracy of their listings. When you list a ticket, you warrant that you hold valid title to the ticket and will fulfill the sale once purchased. 
            </p>
            <p>
              Upon receiving a sale notification, the seller must transfer the ticket electronically to the buyer within the designated timeframe. If a seller fails to deliver the promised tickets, lists counterfeit tickets, or fails to complete a transfer, Ticketapoint reserves the right to charge penalties to the seller's registered credit card to cover replacement ticket costs.
            </p>
          </section>

          {/* Section 5 */}
          <section id="guarantee" className="space-y-3 scroll-mt-24">
            <h2 className="text-lg font-bold text-foreground">5. Ticketapoint 100% Guarantee</h2>
            <p>
              We protect our buyers through the Ticketapoint Guarantee. If you purchase tickets from us, we guarantee:
            </p>
            <ul className="list-disc pl-6 space-y-1.5">
              <li>Your tickets will be 100% authentic and grant entry to the event.</li>
              <li>Your tickets will be delivered electronically in time for the gate opening.</li>
              <li>If the event is cancelled and not rescheduled, you will receive a full cash refund.</li>
            </ul>
          </section>

          {/* Section 6 */}
          <section id="refunds" className="space-y-3 scroll-mt-24">
            <h2 className="text-lg font-bold text-foreground">6. Cancelled & Rescheduled Events</h2>
            <p>
              If an event is postponed or rescheduled, the tickets remain valid for the new date and time. No refunds will be issued for postponed events.
            </p>
            <p>
              If an event is officially cancelled in its entirety, Ticketapoint will notify buyers and process a full refund to the original payment card within 14 business days.
            </p>
          </section>

          {/* Section 7 */}
          <section id="liability" className="space-y-3 scroll-mt-24">
            <h2 className="text-lg font-bold text-foreground">7. Limitation of Liability</h2>
            <p>
              To the maximum extent permitted by law, Ticketapoint shall not be liable for any indirect, incidental, special, consequential, or punitive damages, or any loss of profits or revenues, whether incurred directly or indirectly, or any loss of data, use, goodwill, or other intangible losses, resulting from your use of the Platform.
            </p>
          </section>

          {/* Section 8 */}
          <section id="governance" className="space-y-3 scroll-mt-24">
            <h2 className="text-lg font-bold text-foreground">8. Governing Law & Disputes</h2>
            <p>
              This Agreement and any dispute arising out of your use of the platform shall be governed by and construed in accordance with the laws of the State of California, United States, without regard to its conflict of law provisions. Any legal claims must be settled through binding individual arbitration rather than court litigation.
            </p>
          </section>

        </div>

      </div>
    </div>
  )
}
