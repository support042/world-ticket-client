import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, CreditCard, Search, Loader2, CheckCircle, ExternalLink, RefreshCw, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import AdminHeader from '@/components/admin/AdminHeader'
import { useAdminStore } from '@/store/authStore'
import { usePaymentStore } from '@/store/paymentStore'
import { formatDate } from '@/lib/utils'
import { toast } from 'sonner'

export default function AdminPaymentsPage() {
  const navigate = useNavigate()
  const { admin, isAdminAuthenticated, adminLogout } = useAdminStore()
  
  const {
    initiatedUsers,
    isLoadingUsers,
    usersError,
    currentPage,
    totalPages,
    totalUsers,
    limit,
    isMarkingPaid,
    fetchInitiatedUsers,
    markAsPaid
  } = usePaymentStore()

  const [searchQuery, setSearchQuery] = useState('')
  const [processingId, setProcessingId] = useState<string | number | null>(null)

  useEffect(() => {
    if (!isAdminAuthenticated) {
      navigate('/admin/login')
      return
    }

    fetchInitiatedUsers(1, 50)
  }, [isAdminAuthenticated, navigate, fetchInitiatedUsers])

  if (!isAdminAuthenticated) return null

  const handleLogout = () => {
    adminLogout()
    navigate('/admin/login')
  }

  const handleBack = () => {
    navigate('/admin')
  }

  const handleRefresh = () => {
    fetchInitiatedUsers(currentPage, limit)
    toast.success('Payment lists refreshed')
  }

  const handleMarkAsPaid = async (initiationId: string | number) => {
    setProcessingId(initiationId)
    try {
      await markAsPaid(initiationId)
      toast.success('Payment successfully marked as paid!')
    } catch (err: any) {
      toast.error(err?.message || 'Failed to mark payment as paid')
    } finally {
      setProcessingId(null)
    }
  }

  const handlePageChange = (page: number) => {
    fetchInitiatedUsers(page, limit)
  }

  // Filter initiated users locally based on search query
  const filteredUsers = initiatedUsers.filter((record) => {
    const email = record.user?.email || record.userId || ''
    const sectionName = record.section?.name || record.sectionId || ''
    const eventTitle = record.section?.eventTitle || ''
    const status = record.status || ''
    const query = searchQuery.toLowerCase()
    return (
      email.toLowerCase().includes(query) ||
      sectionName.toLowerCase().includes(query) ||
      eventTitle.toLowerCase().includes(query) ||
      status.toLowerCase().includes(query)
    )
  })

  return (
    <div className="min-h-screen bg-muted/30 pb-20">
      <AdminHeader admin={admin} onLogout={handleLogout} />

      <main className="container mx-auto px-4 xl:px-8 2xl:px-12 py-8">
        {/* Navigation / Header */}
        <div className="mb-6">
          <Button variant="ghost" onClick={handleBack} className="mb-4 -ml-2 text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Payments</h1>
              <p className="text-muted-foreground mt-1">
                Manage and verify customer ticket reservation payment initiations.
              </p>
            </div>
            
            <Button variant="outline" size="sm" onClick={handleRefresh} disabled={isLoadingUsers} className="shadow-sm">
              <RefreshCw className={`h-4 w-4 mr-2 ${isLoadingUsers ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </div>

        {/* Filters and Counters */}
        <div className="flex flex-col md:flex-row items-center gap-4 mb-6">
          <div className="relative flex-1 w-full group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
            <Input
              placeholder="Search by user email, section ID or status..."
              className="pl-10 h-11 bg-card border-muted-foreground/20 focus-visible:ring-primary shadow-sm"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground whitespace-nowrap bg-card px-4 py-2.5 rounded-lg border shadow-sm">
            <span>Total: <strong>{totalUsers}</strong> Initiations</span>
          </div>
        </div>

        {/* Main Payments Content Card */}
        <Card className="border-none shadow-md overflow-hidden bg-card/50 backdrop-blur-sm">
          <CardHeader className="bg-muted/30 border-b">
            <CardTitle className="flex items-center justify-between text-lg">
              <span className="flex items-center gap-2">
                <CreditCard className="h-5 w-5 text-primary" />
                Initiated Transactions
              </span>
              {isLoadingUsers && <Loader2 className="h-5 w-5 animate-spin text-primary" />}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {usersError && (
              <div className="p-6 text-center">
                <div className="flex flex-col items-center gap-3 max-w-md mx-auto">
                  <AlertCircle className="h-10 w-10 text-destructive animate-pulse" />
                  <h3 className="font-semibold text-lg">Failed to Load Payments</h3>
                  <p className="text-sm text-muted-foreground">{usersError}</p>
                  <Button onClick={handleRefresh} className="mt-2">Try Again</Button>
                </div>
              </div>
            )}

            {!usersError && isLoadingUsers && initiatedUsers.length === 0 && (
              <div className="p-6 space-y-4">
                {Array.from({ length: 5 }).map((_, idx) => (
                  <div key={idx} className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 border rounded-xl animate-pulse bg-muted/20">
                    <div className="space-y-2 flex-1">
                      <Skeleton className="h-5 w-48" />
                      <Skeleton className="h-4 w-32" />
                    </div>
                    <div className="flex gap-2">
                      <Skeleton className="h-8 w-24 rounded-lg" />
                      <Skeleton className="h-8 w-28 rounded-lg" />
                    </div>
                  </div>
                ))}
              </div>
            )}

            {!usersError && !isLoadingUsers && filteredUsers.length === 0 && (
              <div className="text-center py-20 bg-muted/10">
                <div className="flex flex-col items-center gap-4">
                  <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center">
                    <CreditCard className="h-8 w-8 text-muted-foreground/40" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold">No initiated payments found</h3>
                    <p className="text-muted-foreground mt-1 max-w-sm mx-auto text-sm">
                      {searchQuery ? 'Adjust your search queries to find matching records.' : 'No users have initiated payment transactions yet.'}
                    </p>
                  </div>
                  {searchQuery && (
                    <Button onClick={() => setSearchQuery('')} variant="ghost" size="sm">
                      Clear Search
                    </Button>
                  )}
                </div>
              </div>
            )}

            {!usersError && filteredUsers.length > 0 && (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b bg-muted/20 text-muted-foreground text-xs uppercase font-semibold">
                      <th className="p-4 sm:p-5">User</th>
                      <th className="p-4 sm:p-5">Section & Event</th>
                      <th className="p-4 sm:p-5">Status</th>
                      <th className="p-4 sm:p-5">Date Initiated</th>
                      <th className="p-4 sm:p-5">Payment Link</th>
                      <th className="p-4 sm:p-5 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-muted-foreground/10">
                    {filteredUsers.map((record) => {
                      const email = record.user?.email || record.userId || 'N/A'
                      const name = record.user?.name || 'Customer'
                      const isPaid = record.status?.toLowerCase() === 'paid'
                      const isPending = record.status?.toLowerCase() === 'initiated' || record.status?.toLowerCase() === 'pending'
                      
                      return (
                        <tr key={record.initiationId} className="hover:bg-muted/10 transition-colors">
                          <td className="p-4 sm:p-5">
                            <div>
                              <div className="font-semibold text-sm">{name}</div>
                              <div className="text-xs text-muted-foreground">{email}</div>
                            </div>
                          </td>
                          <td className="p-4 sm:p-5">
                            <div>
                              <div className="font-semibold text-sm">
                                Section {record.section?.name || record.sectionId}
                              </div>
                              {record.section?.eventTitle && (
                                <div className="text-xs text-muted-foreground mt-0.5">
                                  {record.section.eventTitle}
                                </div>
                              )}
                            </div>
                          </td>
                          <td className="p-4 sm:p-5">
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
                          </td>
                          <td className="p-4 sm:p-5 text-sm text-muted-foreground">
                            {record.createdAt ? formatDate(record.createdAt) : 'Recently'}
                          </td>
                          <td className="p-4 sm:p-5">
                            {record.paymentLink ? (
                              <a 
                                href={record.paymentLink} 
                                target="_blank" 
                                rel="noopener noreferrer" 
                                className="inline-flex items-center text-xs text-primary hover:underline gap-1 font-medium"
                              >
                                View Checkout
                                <ExternalLink className="h-3 w-3" />
                              </a>
                            ) : (
                              <span className="text-xs text-muted-foreground">None</span>
                            )}
                          </td>
                          <td className="p-4 sm:p-5 text-right">
                            {isPaid ? (
                              <Badge variant="outline" className="text-emerald-500 border-emerald-500/30 gap-1 bg-emerald-500/5">
                                <CheckCircle className="h-3 w-3" />
                                Verified Paid
                              </Badge>
                            ) : (
                              <Button
                                size="sm"
                                variant="default"
                                disabled={isMarkingPaid && processingId === record.initiationId}
                                onClick={() => handleMarkAsPaid(record.initiationId)}
                                className="shadow-sm hover:shadow transition-all text-xs bg-emerald-600 hover:bg-emerald-700 text-white font-medium"
                              >
                                {isMarkingPaid && processingId === record.initiationId ? (
                                  <>
                                    <Loader2 className="h-3 w-3 animate-spin mr-1.5" />
                                    Confirming...
                                  </>
                                ) : (
                                  'Mark as Paid'
                                )}
                              </Button>
                            )}
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            )}

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="p-4 border-t flex flex-col sm:flex-row items-center justify-between gap-4 bg-muted/10">
                <div className="text-sm text-muted-foreground">
                  Page <strong>{currentPage}</strong> of <strong>{totalPages}</strong>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={currentPage <= 1 || isLoadingUsers}
                    onClick={() => handlePageChange(currentPage - 1)}
                  >
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={currentPage >= totalPages || isLoadingUsers}
                    onClick={() => handlePageChange(currentPage + 1)}
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
