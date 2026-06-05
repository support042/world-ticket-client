import { useState } from 'react'
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from '@/components/ui/accordion'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Search, Info, HelpCircle } from 'lucide-react'
import SEO from '@/components/common/SEO'

interface FAQ {
  id: string
  question: string
  answer: string
  category: string
}

export default function FAQPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [activeCategory, setActiveCategory] = useState('All')

  const categories = ['All', 'Buying', 'Selling', 'Refunds', 'Guarantee']

  const faqs: FAQ[] = [
    {
      id: 'faq-1',
      category: 'Buying',
      question: 'When and how will I receive my tickets?',
      answer: 'Tickets are usually delivered electronically (e-tickets) closer to the event date. In most cases, you will receive an email containing a link to download your mobile-entry ticket or transfer instructions. For high-profile matches like the World Cup 2026, tickets are usually disbursed 2-4 weeks before the matches in coordination with primary ticket distributors.'
    },
    {
      id: 'faq-2',
      category: 'Guarantee',
      question: 'What is the Ticketapoint 100% Guarantee?',
      answer: 'Our 100% Guarantee ensures that: 1. Your tickets will be authentic and valid for entry. 2. They will be delivered before the event. 3. If an event is cancelled and not rescheduled, you will receive a full refund. 4. If there is any issue at the gates, we will provide comparable replacement tickets or a full refund immediately.'
    },
    {
      id: 'faq-3',
      category: 'Selling',
      question: 'How do I list my ticket for sale?',
      answer: 'To list a ticket: click "Sell" (when active) or go to your "My Tickets" tab. Select the event, enter the seat details (section, row, quantity), and set your desired price. Once a buyer purchases your ticket, you will receive instructions on how to transfer the tickets electronically. Payments are processed and sent to your bank account after the event is successfully completed.'
    },
    {
      id: 'faq-4',
      category: 'Refunds',
      question: 'What happens if my event is postponed, rescheduled, or cancelled?',
      answer: 'If an event is postponed or rescheduled, your tickets remain valid for the new date. You do not need to do anything. If the event is completely cancelled, we will issue a full refund (including all fees) back to your original payment method. Alternatively, you can opt for store credit if desired.'
    },
    {
      id: 'faq-5',
      category: 'Buying',
      question: 'Are seats next to each other?',
      answer: 'Yes! Unless stated otherwise in the listing descriptions, all tickets purchased in a single transaction are guaranteed to be side-by-side (adjacent seats) so you can enjoy the event with your group.'
    },
    {
      id: 'faq-6',
      category: 'Buying',
      question: 'What fees are added to the ticket price?',
      answer: 'Ticketapoint charges transparent service and delivery fees to maintain our secure transaction infrastructure, verify seller tickets, and support our 24/7 hotline. All fees are displayed clearly in your order breakdown during checkout, with no hidden costs.'
    },
    {
      id: 'faq-7',
      category: 'Selling',
      question: 'When do I get paid for the tickets I sold?',
      answer: 'To protect buyers against invalid tickets, seller payouts are released 5-8 business days after the event takes place. The payment will be sent directly to the bank account or payout method you registered on your Profile page.'
    }
  ]

  const filteredFaqs = faqs.filter(faq => {
    const matchesSearch = faq.question.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = activeCategory === 'All' || faq.category === activeCategory
    return matchesSearch && matchesCategory
  })

  return (
    <div className="min-h-screen py-12 md:py-20">
      <SEO 
        title="Frequently Asked Questions"
        description="Find answers to common questions about ticket delivery, refunds, seller payouts, and buying safety on Ticketapoint."
      />

      {/* Header */}
      <div className="text-center max-w-3xl mx-auto mb-12">
        <Badge variant="outline" className="mb-4 text-primary border-primary/30 px-3 py-1 font-semibold">
          Knowledge Base
        </Badge>
        <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl mb-6">
          Frequently Asked Questions
        </h1>
        <p className="text-lg text-muted-foreground leading-relaxed">
          Need quick answers? Search our FAQs or select a category below.
        </p>
      </div>

      {/* Search and Filters */}
      <div className="max-w-2xl mx-auto mb-12 space-y-6">
        <div className="relative group">
          <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors" />
          <Input 
            placeholder="Search questions or terms..." 
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-6 bg-background rounded-2xl border-border/80 focus:border-primary shadow-xs transition-all"
          />
        </div>

        {/* Category filters */}
        <div className="flex flex-wrap justify-center gap-2">
          {categories.map(cat => (
            <Button
              key={cat}
              variant={activeCategory === cat ? 'default' : 'outline'}
              onClick={() => setActiveCategory(cat)}
              className="rounded-full px-5 font-semibold text-xs py-1 h-8 cursor-pointer"
            >
              {cat}
            </Button>
          ))}
        </div>
      </div>

      {/* Accordion List */}
      <div className="max-w-3xl mx-auto border rounded-2xl bg-card p-6 shadow-sm">
        {filteredFaqs.length > 0 ? (
          <Accordion type="single" collapsible className="space-y-4">
            {filteredFaqs.map((faq) => (
              <AccordionItem key={faq.id} value={faq.id} className="border-b pb-4">
                <AccordionTrigger className="text-base font-bold hover:text-primary hover:no-underline py-2">
                  <div className="flex items-center gap-2 text-left">
                    <HelpCircle className="h-4 w-4 text-primary shrink-0" />
                    <span>{faq.question}</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground leading-relaxed pl-6 pt-2 text-sm">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        ) : (
          <div className="text-center py-12">
            <Info className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
            <p className="font-bold text-foreground">No questions found matching your criteria.</p>
            <p className="text-xs text-muted-foreground mt-1">Try clearing filters or search for another topic.</p>
          </div>
        )}
      </div>

      {/* Guarantee Notice */}
      <div className="max-w-xl mx-auto mt-16 p-6 border rounded-2xl bg-primary/5 border-primary/10 text-center">
        <h3 className="font-bold text-base mb-2">Our Fan Protection Pledge</h3>
        <p className="text-xs text-muted-foreground leading-relaxed">
          We believe you should buy and sell tickets with absolute peace of mind. Every transaction is covered under our security guarantee. If any issues arise, reach our support team immediately.
        </p>
      </div>
    </div>
  )
}
