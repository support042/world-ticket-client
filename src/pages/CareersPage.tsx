import { useState } from 'react'
import { Briefcase, MapPin, DollarSign, Check, Star, ArrowRight } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import SEO from '@/components/common/SEO'
import { toast } from 'sonner'

interface Job {
  id: string
  title: string
  department: string
  location: string
  type: string
  salary: string
  description: string
}

export default function CareersPage() {
  const [selectedDept, setSelectedDept] = useState<string>('All')
  const [applyingJob, setApplyingJob] = useState<Job | null>(null)
  const [formData, setFormData] = useState({ name: '', email: '', resume: '', coverLetter: '' })

  const departments = ['All', 'Engineering', 'Product', 'Design', 'Operations', 'Customer Experience']

  const jobs: Job[] = [
    {
      id: 'eng-1',
      title: 'Senior Frontend Engineer (React/TypeScript)',
      department: 'Engineering',
      location: 'Remote (GMT-5 to GMT+2)',
      type: 'Full-time',
      salary: '$130k - $160k',
      description: 'Own the user-facing web applications. You will work on real-time seat mapping, high-concurrency event load optimization, and refining checkout pipelines using modern React techniques.'
    },
    {
      id: 'eng-2',
      title: 'Backend Engineer (Node.js/Go)',
      department: 'Engineering',
      location: 'Remote (GMT-8 to GMT-3)',
      type: 'Full-time',
      salary: '$120k - $150k',
      description: 'Architect scalable event listing APIs, anti-bot ticketing systems, and transactional inventory handlers using Redis, PostgreSQL, and distributed database services.'
    },
    {
      id: 'prod-1',
      title: 'Senior Product Manager - Event Lifecycle',
      department: 'Product',
      location: 'Remote (GMT-5 to GMT+1)',
      type: 'Full-time',
      salary: '$140k - $170k',
      description: 'Lead the strategy and roadmap for our event listing, ticket verification, and host dashboard features, scaling from professional leagues to minor local festivals.'
    },
    {
      id: 'des-1',
      title: 'Product Designer (UX/UI)',
      department: 'Design',
      location: 'Remote (Global)',
      type: 'Full-time',
      salary: '$100k - $130k',
      description: 'Design smooth mobile-first ticket-purchasing journeys, dynamic seat selection modules, and dashboards for venue managers.'
    },
    {
      id: 'cx-1',
      title: 'Customer Experience Lead',
      department: 'Customer Experience',
      location: 'London, UK / Hybrid',
      type: 'Full-time',
      salary: '£45k - £60k',
      description: 'Lead our EMEA customer support operations. Establish guidelines for event cancellation support and managing ticketing disputes with 100% guarantee promises.'
    },
    {
      id: 'ops-1',
      title: 'Director of Business Development',
      department: 'Operations',
      location: 'New York, USA / Hybrid',
      type: 'Full-time',
      salary: '$150k - $190k + Equity',
      description: 'Form long-term ticketing partnerships with stadium operators, tournament coordinators, music venues, and global sports associations.'
    }
  ]

  const filteredJobs = selectedDept === 'All' 
    ? jobs 
    : jobs.filter(j => j.department === selectedDept)

  const handleApplySubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.name || !formData.email || !formData.resume) {
      toast.error('Please fill in all required fields.')
      return
    }
    
    // Simulate API request
    toast.success(`Application for ${applyingJob?.title} submitted successfully! Our team will contact you soon.`)
    setApplyingJob(null)
    setFormData({ name: '', email: '', resume: '', coverLetter: '' })
  }

  const perks = [
    { title: 'Work from Anywhere', desc: 'Our team is 100% remote across 15+ countries. Work where you are most productive.' },
    { title: 'Competitive Salary & Equity', desc: 'We offer tier-1 compensation packages along with early-employee stock options.' },
    { title: 'Professional Development', desc: '$3,000 annual learning budget for courses, conferences, and materials.' },
    { title: 'Premium Health Coverage', desc: 'Full medical, dental, and vision cover for you and your dependents.' },
    { title: 'Home Office Stipend', desc: '$2,500 to kit out your perfect ergonomic workstation.' },
    { title: 'Annual Team Retreats', desc: 'Past locations include Spain, Costa Rica, and Japan. Next up is Portugal!' }
  ]

  return (
    <div className="min-h-screen py-12 md:py-20">
      <SEO 
        title="Careers"
        description="Join the Ticketapoint team. Browse our remote-first job openings in engineering, design, operations, and product."
      />

      {/* Hero Header */}
      <div className="text-center max-w-3xl mx-auto mb-16">
        <Badge variant="secondary" className="mb-4 bg-primary/10 text-primary hover:bg-primary/20 px-3 py-1 font-semibold">
          We are Hiring!
        </Badge>
        <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl mb-6">
          Build the future of live events ticketing
        </h1>
        <p className="text-lg text-muted-foreground leading-relaxed">
          At Ticketapoint, we are building technology that empowers fans globally. Join a fast-growing, remote-first team committed to making the live event marketplace fair, secure, and delightful.
        </p>
      </div>

      {/* Perks Section */}
      <div className="mb-20">
        <h2 className="text-2xl md:text-3xl font-bold text-center mb-10">Perks & Benefits</h2>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {perks.map((perk, i) => (
            <Card key={i} className="border border-border/50 bg-card/40">
              <CardContent className="pt-6">
                <div className="flex items-center gap-2 mb-3">
                  <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <Check className="h-4 w-4" />
                  </div>
                  <h3 className="font-bold text-base">{perk.title}</h3>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">{perk.desc}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Jobs Listing Section */}
      <div id="jobs-section" className="mb-16">
        <h2 className="text-2xl md:text-3xl font-bold text-center mb-6">Open Positions</h2>
        <p className="text-center text-muted-foreground max-w-xl mx-auto mb-8">
          Find your next challenge. Select a department to filter active job openings.
        </p>

        {/* Filter Buttons */}
        <div className="flex flex-wrap justify-center gap-2 mb-10">
          {departments.map((dept) => (
            <Button
              key={dept}
              variant={selectedDept === dept ? 'default' : 'outline'}
              onClick={() => setSelectedDept(dept)}
              className="rounded-full px-5 font-semibold"
            >
              {dept}
            </Button>
          ))}
        </div>

        {/* Jobs Grid */}
        <div className="grid gap-6 max-w-4xl mx-auto">
          {filteredJobs.length > 0 ? (
            filteredJobs.map((job) => (
              <Card key={job.id} className="border hover:border-primary/45 transition-colors">
                <CardHeader className="pb-3">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                    <div>
                      <CardTitle className="text-xl font-bold">{job.title}</CardTitle>
                      <CardDescription className="text-xs text-primary mt-1 font-semibold flex items-center gap-1">
                        <Star className="h-3 w-3 fill-primary" /> {job.department}
                      </CardDescription>
                    </div>
                    <Badge variant="outline" className="w-fit border-primary/20 text-primary bg-primary/5">
                      {job.type}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex flex-wrap gap-4 text-xs text-muted-foreground font-medium">
                    <span className="flex items-center gap-1">
                      <MapPin className="h-3.5 w-3.5" /> {job.location}
                    </span>
                    <span className="flex items-center gap-1">
                      <DollarSign className="h-3.5 w-3.5" /> {job.salary}
                    </span>
                  </div>
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    {job.description}
                  </p>
                  <Button 
                    className="w-full sm:w-fit font-bold rounded-xl mt-2 cursor-pointer"
                    onClick={() => {
                      setApplyingJob(job)
                      const formElement = document.getElementById('application-form-container')
                      if (formElement) {
                        formElement.scrollIntoView({ behavior: 'smooth' })
                      }
                    }}
                  >
                    Apply Now
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </CardContent>
              </Card>
            ))
          ) : (
            <div className="text-center py-12 border rounded-2xl bg-muted/20">
              <Briefcase className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
              <p className="font-bold">No open roles in this department right now.</p>
              <p className="text-sm text-muted-foreground mt-1">Check back later or view other departments.</p>
            </div>
          )}
        </div>
      </div>

      {/* Application Form Container */}
      {applyingJob && (
        <div id="application-form-container" className="max-w-xl mx-auto p-8 border rounded-3xl bg-card/60 backdrop-blur-md shadow-2xl ring-1 ring-primary/10">
          <h3 className="text-xl font-bold mb-1">Apply for Position</h3>
          <p className="text-sm text-primary font-semibold mb-6">{applyingJob.title}</p>
          
          <form onSubmit={handleApplySubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="name">Full Name <span className="text-destructive">*</span></Label>
              <Input 
                id="name" 
                placeholder="John Doe" 
                required 
                value={formData.name} 
                onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))}
              />
            </div>
            
            <div className="space-y-1.5">
              <Label htmlFor="email">Email Address <span className="text-destructive">*</span></Label>
              <Input 
                id="email" 
                type="email" 
                placeholder="john.doe@example.com" 
                required 
                value={formData.email} 
                onChange={e => setFormData(prev => ({ ...prev, email: e.target.value }))}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="resume">Resume / CV Link <span className="text-destructive">*</span></Label>
              <Input 
                id="resume" 
                placeholder="https://drive.google.com/..." 
                required 
                value={formData.resume} 
                onChange={e => setFormData(prev => ({ ...prev, resume: e.target.value }))}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="coverLetter">Cover Letter (Optional)</Label>
              <textarea 
                id="coverLetter" 
                placeholder="Why do you want to join Ticketapoint?" 
                rows={4}
                className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs placeholder:text-muted-foreground focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-ring"
                value={formData.coverLetter} 
                onChange={e => setFormData(prev => ({ ...prev, coverLetter: e.target.value }))}
              />
            </div>

            <div className="flex gap-3 pt-2">
              <Button type="submit" className="flex-1 font-bold rounded-xl cursor-pointer">Submit Application</Button>
              <Button type="button" variant="outline" className="rounded-xl cursor-pointer" onClick={() => setApplyingJob(null)}>Cancel</Button>
            </div>
          </form>
        </div>
      )}
    </div>
  )
}
