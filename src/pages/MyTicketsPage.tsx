import { useState, useMemo } from 'react'
import { Ticket, History, Inbox, ChevronLeft } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'
import { useOrdersStore } from '@/store/ordersStore'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import TicketCard from '@/components/tickets/TicketCard'
import SEO from '@/components/common/SEO'

export default function MyTicketsPage() {
  const { user, isAuthenticated } = useAuthStore()
  const { getUserOrders } = useOrdersStore()
  const [activeTab, setActiveTab] = useState('upcoming')

  const userOrders = useMemo(() => {
    return isAuthenticated && user ? getUserOrders(user.id) : []
  }, [user, isAuthenticated, getUserOrders])

  const upcomingTickets = useMemo(() => {
    const now = new Date()
    return userOrders.filter(order => new Date(`${order.event.date}T${order.event.time}`) >= now)
  }, [userOrders])

  const pastTickets = useMemo(() => {
    const now = new Date()
    return userOrders.filter(order => new Date(`${order.event.date}T${order.event.time}`) < now)
  }, [userOrders])

  if (!isAuthenticated) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center container mx-auto px-4 text-center">
        <SEO title="Sign In" />
        <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mb-6">
          <Ticket className="h-10 w-10 text-muted-foreground" />
        </div>
        <h1 className="text-3xl font-bold mb-3">Sign in to view your tickets</h1>
        <p className="text-muted-foreground mb-8 max-w-md mx-auto">
          Access your upcoming events, past purchases, and manage your ticket inventory securely from your account.
        </p>
        <Link to="/">
           <Button size="lg">Explore Events</Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
       <SEO title="My Tickets" />
       <div className="flex items-center gap-4 mb-8">
          <Link to="/">
             <Button variant="ghost" size="icon" className="shrink-0">
               <ChevronLeft className="h-5 w-5" />
             </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">My Tickets</h1>
            <p className="text-muted-foreground mt-1">Manage and view all your event passes</p>
          </div>
       </div>

       <Tabs defaultValue="upcoming" value={activeTab} onValueChange={setActiveTab} className="w-full">
         <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-6">
            <TabsList className="inline-flex h-9 items-center justify-center rounded-lg bg-muted p-1 text-muted-foreground w-full sm:w-auto">
               <TabsTrigger 
                 value="upcoming" 
                 className="inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-1 text-xs font-bold ring-offset-background transition-all focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm"
               >
                  Upcoming
               </TabsTrigger>
               <TabsTrigger 
                 value="past" 
                 className="inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-1 text-xs font-bold ring-offset-background transition-all focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm"
               >
                  Past Events
               </TabsTrigger>
            </TabsList>
            
            {/* <div className="flex items-center justify-between sm:justify-end gap-3 px-1 sm:px-0">
               <div className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">
                 {activeTab === 'upcoming' ? upcomingTickets.length : pastTickets.length} Tickets Found
               </div>
            </div> */}
         </div>

         <TabsContent value="upcoming" className="mt-0 focus-visible:outline-hidden">
            {upcomingTickets.length > 0 ? (
               <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 pb-12">
                  {upcomingTickets.map(order => (
                     <div key={order.id} className="w-full px-2 sm:px-0">
                        <TicketCard order={order} />
                     </div>
                  ))}
               </div>
            ) : (
               <div className="flex flex-col items-center justify-center py-16 text-center border border-dashed border-border/60 rounded-[2rem] bg-muted/10 mx-2 sm:mx-0">
                  <Inbox className="h-10 w-10 text-muted-foreground/40 mb-4" />
                  <h3 className="text-lg font-bold mb-1">No upcoming events</h3>
                  <p className="text-sm text-muted-foreground mb-6 max-w-[240px] px-4 font-medium">
                    You don't have any upcoming tickets yet.
                  </p>
                  <Link to="/">
                     <Button className="rounded-full px-8 shadow-lg shadow-primary/20">Browse Events</Button>
                  </Link>
               </div>
            )}
         </TabsContent>

         <TabsContent value="past" className="mt-0 focus-visible:outline-hidden">
            {pastTickets.length > 0 ? (
               <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 pb-12">
                  {pastTickets.map(order => (
                     <div key={order.id} className="w-full px-2 sm:px-0">
                        <TicketCard order={order} />
                     </div>
                  ))}
               </div>
            ) : (
               <div className="flex flex-col items-center justify-center py-16 text-center border border-dashed border-border/60 rounded-[2rem] bg-muted/10 mx-2 sm:mx-0">
                  <History className="h-10 w-10 text-muted-foreground/40 mb-4" />
                  <h3 className="text-lg font-bold mb-1">No past events</h3>
                  <p className="text-sm text-muted-foreground mb-4 max-w-[240px] px-4 font-medium">
                    Events you have attended will appear here.
                  </p>
               </div>
            )}
         </TabsContent>
       </Tabs>
    </div>
  )
}