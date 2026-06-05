import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import SEO from '@/components/common/SEO'

export default function PrivacyPage() {
  const sections = [
    { id: 'collection', title: '1. Information We Collect' },
    { id: 'use', title: '2. How We Use Information' },
    { id: 'sharing', title: '3. Data Sharing & Disclosures' },
    { id: 'security', title: '4. Information Security' },
    { id: 'gdpr-ccpa', title: '5. GDPR & CCPA Rights' },
    { id: 'retention', title: '6. Data Retention' },
    { id: 'changes', title: '7. Policy Changes' }
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
        title="Privacy Notice"
        description="Learn how Ticketapoint handles and protects your personal data. Read our GDPR and CCPA compliant Privacy Policy."
      />

      {/* Header */}
      <div className="text-center max-w-3xl mx-auto mb-16">
        <Badge variant="outline" className="mb-4 text-primary border-primary/30 px-3 py-1 font-semibold">
          Data Privacy
        </Badge>
        <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl mb-4">
          Privacy Notice
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

        {/* Right Side: Privacy Clauses */}
        <div className="lg:col-span-8 space-y-10 text-sm leading-relaxed text-muted-foreground">
          
          <p>
            At Ticketapoint, we take your privacy seriously. This Privacy Notice describes how we collect, use, process, and disclose your personal information when you use our ticket marketplace platform, in accordance with global regulations including the General Data Protection Regulation (GDPR) and the California Consumer Privacy Act (CCPA).
          </p>

          {/* Section 1 */}
          <section id="collection" className="space-y-3 scroll-mt-24">
            <h2 className="text-lg font-bold text-foreground">1. Information We Collect</h2>
            <p>
              We collect information you provide directly to us when registering, buying tickets, listing seats, or communicating with customer service:
            </p>
            <ul className="list-disc pl-6 space-y-1">
              <li><strong>Account Profile:</strong> Name, email address, password, phone number, and billing/mailing coordinates.</li>
              <li><strong>Financial Data:</strong> Secure payment card hashes and banking information (collected directly by Stripe).</li>
              <li><strong>Ticketing Information:</strong> Electronic ticket files (PDFs), barcodes, and seat coordinates.</li>
            </ul>
          </section>

          {/* Section 2 */}
          <section id="use" className="space-y-3 scroll-mt-24">
            <h2 className="text-lg font-bold text-foreground">2. How We Use Information</h2>
            <p>
              We process personal information to operate, improve, and secure our Platform, specifically:
            </p>
            <ul className="list-disc pl-6 space-y-1">
              <li>Facilitating orders, processing payments, and issuing electronic ticket deliveries.</li>
              <li>Providing 24/7 hotline customer support.</li>
              <li>Preventing secondary-market bots, resale fraud, and dual-spend ticket listings.</li>
              <li>Sending transactional receipts, service updates, and marketing communications (where permitted).</li>
            </ul>
          </section>

          {/* Section 3 */}
          <section id="sharing" className="space-y-3 scroll-mt-24">
            <h2 className="text-lg font-bold text-foreground">3. Data Sharing & Disclosures</h2>
            <p>
              Ticketapoint does not sell your personal data. We share your information only under the following circumstances:
            </p>
            <ul className="list-disc pl-6 space-y-1">
              <li><strong>With Payment Processors:</strong> We use Stripe to process all debit/credit cards securely.</li>
              <li><strong>Between Buyer and Seller:</strong> Limited information (e.g. transfer email) is shared to complete electronic ticket transfers.</li>
              <li><strong>For Legal Protection:</strong> To comply with valid legal processes, search warrants, or court orders from judicial authorities.</li>
            </ul>
          </section>

          {/* Section 4 */}
          <section id="security" className="space-y-3 scroll-mt-24">
            <h2 className="text-lg font-bold text-foreground">4. Information Security</h2>
            <p>
              We implement industry-standard administrative, technical, and physical security measures to shield your personal data from unauthorized access, loss, or manipulation. This includes SSL/TLS encryption for all transaction requests, strict tokenized session controls, and regular vulnerability audits of our APIs.
            </p>
          </section>

          {/* Section 5 */}
          <section id="gdpr-ccpa" className="space-y-3 scroll-mt-24">
            <h2 className="text-lg font-bold text-foreground">5. GDPR & CCPA Rights</h2>
            <p>
              Depending on your location, you have several rights regarding your data:
            </p>
            <ul className="list-disc pl-6 space-y-1">
              <li><strong>Right of Access:</strong> You can request a copy of the personal data we hold.</li>
              <li><strong>Right to Deletion:</strong> You can request that we delete your account and profile records.</li>
              <li><strong>Right to Opt-Out:</strong> California residents can opt out of any personalized advertising or marketing.</li>
            </ul>
            <p>
              To exercise any of these rights, please send an inquiry via our <a href="/contact" className="text-primary hover:underline font-semibold">Contact Us</a> form or email privacy@ticketapoint.com.
            </p>
          </section>

          {/* Section 6 */}
          <section id="retention" className="space-y-3 scroll-mt-24">
            <h2 className="text-lg font-bold text-foreground">6. Data Retention</h2>
            <p>
              We store your personal data for as long as necessary to provide our ticketing services, resolve order conflicts, and comply with tax and audit rules. Typically, financial receipts are retained for 7 years to meet standard corporate compliance audits.
            </p>
          </section>

          {/* Section 7 */}
          <section id="changes" className="space-y-3 scroll-mt-24">
            <h2 className="text-lg font-bold text-foreground">7. Policy Changes</h2>
            <p>
              We may revise this Privacy Notice from time to time. When changes are made, we will update the "Last Updated" date at the top of this page. Your continued use of the Platform after updates constitutes acceptance of the new privacy terms.
            </p>
          </section>

        </div>

      </div>
    </div>
  )
}
