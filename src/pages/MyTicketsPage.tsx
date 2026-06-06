import { useEffect } from 'react'
import { ChevronLeft, CreditCard, ExternalLink, Loader2, AlertCircle, RefreshCw, CheckCircle2, Calendar } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'
import { usePaymentStore } from '@/store/paymentStore'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import SEO from '@/components/common/SEO'
import { formatDate } from '@/lib/utils'

export default function MyTicketsPage() {
  const navigate = useNavigate()
  const { isAuthenticated } = useAuthStore()
  const {
    myInitiatedPayments,
    isLoadingMyPayments,
    myPaymentsError,
    fetchMyInitiatedPayments
  } = usePaymentStore()

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/')
      return
    }
    fetchMyInitiatedPayments()
  }, [isAuthenticated, fetchMyInitiatedPayments, navigate])

  const handleRefresh = () => {
    fetchMyInitiatedPayments()
  }

  if (!isAuthenticated) return null

  return (
    <div className="min-h-screen bg-muted/20 pb-20">
      <SEO title="My Reservations" />
      
      <div className="container mx-auto px-4 py-8 max-w-5xl">
        {/* Navigation & Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-3">
            <Link to="/">
              <Button variant="ghost" size="icon" className="shrink-0 hover:bg-background shadow-sm border">
                <ChevronLeft className="h-5 w-5" />
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">My Reservations</h1>
              <p className="text-muted-foreground mt-1">View your initiated payments and verify booking statuses.</p>
            </div>
          </div>
          
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleRefresh} 
            disabled={isLoadingMyPayments}
            className="self-start sm:self-auto shadow-sm"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoadingMyPayments ? 'animate-spin' : ''}`} />
            Refresh Status
          </Button>
        </div>

        {/* Content Area */}
        {isLoadingMyPayments && myInitiatedPayments.length === 0 ? (
          <div className="flex justify-center items-center py-24 bg-card rounded-[2rem] border shadow-sm">
            <div className="flex flex-col items-center gap-3">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="text-sm text-muted-foreground font-medium">Updating reservation details...</p>
            </div>
          </div>
        ) : myPaymentsError ? (
          <div className="flex flex-col items-center justify-center py-20 text-center border border-dashed border-border/60 rounded-[2rem] bg-muted/10">
            <AlertCircle className="h-10 w-10 text-destructive mb-4" />
            <h3 className="text-lg font-bold mb-1">Failed to load reservations</h3>
            <p className="text-sm text-muted-foreground mb-6 px-4 max-w-sm">{myPaymentsError}</p>
            <Button onClick={fetchMyInitiatedPayments} size="sm">Retry</Button>
          </div>
        ) : myInitiatedPayments.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {myInitiatedPayments.map((record) => {
              const isPaid = record.status?.toLowerCase() === 'paid'
              const isPending = record.status?.toLowerCase() === 'initiated' || record.status?.toLowerCase() === 'pending'
              
              return (
                <div 
                  key={record.initiationId} 
                  className={`flex flex-col justify-between p-6 border rounded-[2rem] bg-card shadow-sm hover:shadow-md transition-all duration-300 border-l-4 ${
                    isPaid ? 'border-l-emerald-500' : isPending ? 'border-l-amber-500' : 'border-l-red-500'
                  }`}
                >
                  <div>
                    {/* Badge Status */}
                    <div className="flex items-center justify-between gap-4 mb-4">
                      <Badge 
                        variant={isPaid ? "default" : isPending ? "secondary" : "destructive"}
                        className={`font-semibold capitalize text-xs tracking-wide px-2.5 py-0.5 ${
                          isPaid ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20' : 
                          isPending ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20' : 
                          'bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20'
                        }`}
                      >
                        {record.status || 'initiated'}
                      </Badge>
                      
                      {isPaid && (
                        <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0" />
                      )}
                    </div>

                    {/* Reservation Main Details */}
                    <h3 className="font-bold text-xl leading-snug">
                      Section {record.section?.name || record.sectionId}
                    </h3>
                    
                    {record.section?.eventTitle && (
                      <p className="text-sm text-muted-foreground mt-1 font-medium">
                        {record.section.eventTitle}
                      </p>
                    )}
                    
                    {/* Info rows */}
                    <div className="space-y-2.5 mt-6 pt-4 border-t border-muted text-xs text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-3.5 w-3.5" />
                        <span>Reserved: <strong>{record.createdAt ? formatDate(record.createdAt) : 'Recently'}</strong></span>
                      </div>
                      
                      <div className="flex flex-col gap-0.5">
                        <span className="text-[10px] uppercase tracking-wider text-muted-foreground/60 font-semibold">Reservation ID</span>
                        <code className="bg-muted px-2 py-1 rounded font-mono text-[10px] text-foreground block w-fit truncate max-w-full">
                          {record.initiationId}
                        </code>
                      </div>
                    </div>
                  </div>
                  
                  {/* Action Button */}
                  <div className="mt-6">
                    {isPending && record.paymentLink ? (
                      <a 
                        href={record.paymentLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full block"
                      >
                        <Button className="w-full text-xs font-semibold gap-1.5 rounded-full" variant="outline" size="sm">
                          Resume Payment
                          <ExternalLink className="h-3 w-3" />
                        </Button>
                      </a>
                    ) : isPaid ? (
                      <div className="bg-emerald-500/5 text-emerald-600 dark:text-emerald-400 text-xs font-semibold text-center py-2.5 rounded-full border border-emerald-500/10 flex items-center justify-center gap-1.5">
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        Verification Complete
                      </div>
                    ) : (
                      <div className="bg-red-500/5 text-red-600 dark:text-red-400 text-xs font-semibold text-center py-2.5 rounded-full border border-red-500/10">
                        Payment Failed / Expired
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-24 text-center bg-card rounded-[2rem] border shadow-sm">
            <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
              <CreditCard className="h-7 w-7 text-muted-foreground/55" />
            </div>
            <h3 className="text-xl font-bold mb-1">No reservations found</h3>
            <p className="text-sm text-muted-foreground mb-6 max-w-sm px-4 font-medium text-muted-foreground">
              You haven't initiated any payment reservations yet. Explore our events to secure your tickets!
            </p>
            <Link to="/">
              <Button className="rounded-full px-8 shadow-sm">Explore Events</Button>
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}