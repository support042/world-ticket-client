import { useState } from 'react'
import { User, Mail, Phone, MapPin, Calendar, Shield, Ticket, ChevronRight, Edit3, Lock, LogOut } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'
import { useOrdersStore } from '@/store/ordersStore'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { formatDate } from '@/lib/utils'
import SEO from '@/components/common/SEO'

export default function ProfilePage() {
  const navigate = useNavigate()
  const { user, isAuthenticated, logout } = useAuthStore()
  const { getUserOrders } = useOrdersStore()
  const [isEditing, setIsEditing] = useState(false)
  const [form, setForm] = useState({
    firstName: user?.firstName ?? '',
    lastName: user?.lastName ?? '',
    email: user?.email ?? '',
    phone: user?.phone ?? '',
  })

  const orders = user ? getUserOrders(user.id) : []
  const completedOrders = orders.filter(o => o.status === 'completed')

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  // Not logged in guard
  if (!isAuthenticated || !user) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center text-center px-4">
        <SEO title="Profile" />
        <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mb-6">
          <User className="h-10 w-10 text-muted-foreground" />
        </div>
        <h1 className="text-3xl font-bold mb-3">Sign in to view your profile</h1>
        <p className="text-muted-foreground mb-8 max-w-sm">
          Access your account details, manage your information, and view your purchase history.
        </p>
        <Link to="/">
          <Button size="lg">Back to Events</Button>
        </Link>
      </div>
    )
  }

  const initials = `${user.firstName?.[0] ?? ''}${user.lastName?.[0] ?? ''}`.toUpperCase()

  return (
    <div className="max-w-3xl mx-auto py-10 px-4 space-y-6">
      <SEO title="Profile" />

      {/* Header Banner */}
      <div className="relative rounded-2xl overflow-hidden bg-linear-to-br from-primary/20 via-primary/5 to-background border border-border p-8 flex flex-col sm:flex-row items-center sm:items-start gap-6">
        {/* Avatar */}
        <div className="w-20 h-20 rounded-2xl bg-primary flex items-center justify-center text-primary-foreground text-2xl font-black shrink-0 shadow-lg">
          {initials}
        </div>
        <div className="flex-1 text-center sm:text-left">
          <h1 className="text-2xl font-bold">{user.firstName} {user.lastName}</h1>
          <p className="text-muted-foreground text-sm mt-1">{user.email}</p>
          <div className="flex flex-wrap gap-2 mt-3 justify-center sm:justify-start">
            <Badge variant="secondary" className="text-xs">
              <Shield className="w-3 h-3 mr-1" />
              Verified Member
            </Badge>
            <Badge variant="outline" className="text-xs">
              <Ticket className="w-3 h-3 mr-1" />
              {completedOrders.length} Ticket{completedOrders.length !== 1 ? 's' : ''} Purchased
            </Badge>
            {user.createdAt && (
              <Badge variant="outline" className="text-xs">
                <Calendar className="w-3 h-3 mr-1" />
                Member since {formatDate(user.createdAt.substring(0, 10))}
              </Badge>
            )}
          </div>
        </div>
        <Button
          variant="outline"
          size="sm"
          className="shrink-0"
          onClick={() => setIsEditing(!isEditing)}
        >
          <Edit3 className="w-3.5 h-3.5 mr-1.5" />
          {isEditing ? 'Cancel' : 'Edit Profile'}
        </Button>
      </div>

      {/* Profile Details */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base font-semibold">Personal Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {isEditing ? (
            // Edit Form
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label>First Name</Label>
                  <Input
                    value={form.firstName}
                    onChange={e => setForm(p => ({ ...p, firstName: e.target.value }))}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>Last Name</Label>
                  <Input
                    value={form.lastName}
                    onChange={e => setForm(p => ({ ...p, lastName: e.target.value }))}
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label>Email Address</Label>
                <Input
                  type="email"
                  value={form.email}
                  onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
                />
              </div>
              <div className="space-y-1.5">
                <Label>Phone Number</Label>
                <Input
                  value={form.phone}
                  onChange={e => setForm(p => ({ ...p, phone: e.target.value }))}
                />
              </div>
              <div className="flex gap-3 pt-2">
                <Button size="sm" onClick={() => setIsEditing(false)}>
                  Save Changes
                  {/* TODO: wire to PATCH /api/users/me when backend ready */}
                </Button>
                <Button size="sm" variant="ghost" onClick={() => setIsEditing(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            // View Mode
            <div className="space-y-4">
              <InfoRow icon={<User className="w-4 h-4" />} label="Full Name" value={`${user.firstName} ${user.lastName}`} />
              <Separator />
              <InfoRow icon={<Mail className="w-4 h-4" />} label="Email Address" value={user.email} />
              <Separator />
              <InfoRow
                icon={<Phone className="w-4 h-4" />}
                label="Phone Number"
                value={user.phone ? `${user.countryCode ?? ''} ${user.phone}` : 'Not provided'}
              />
              <Separator />
              <InfoRow icon={<MapPin className="w-4 h-4" />} label="Country" value={user.countryCode === '+1' ? 'United States' : 'Not specified'} />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Links */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base font-semibold">Account</CardTitle>
        </CardHeader>
        <CardContent className="space-y-1 p-2">
          <QuickLink
            icon={<Ticket className="w-4 h-4 text-primary" />}
            label="My Tickets"
            description={`${completedOrders.length} active purchase${completedOrders.length !== 1 ? 's' : ''}`}
            onClick={() => navigate('/my-tickets')}
          />
          <QuickLink
            icon={<Lock className="w-4 h-4 text-muted-foreground" />}
            label="Change Password"
            description="Update your account password"
            onClick={() => {}}
            disabled
            badge="Coming Soon"
          />
        </CardContent>
      </Card>

      {/* Danger Zone */}
      <Card className="border-destructive/30">
        <CardContent className="p-4 flex items-center justify-between">
          <div>
            <p className="font-medium text-sm">Sign out of your account</p>
            <p className="text-xs text-muted-foreground mt-0.5">You can sign back in at any time.</p>
          </div>
          <Button variant="destructive" size="sm" onClick={handleLogout}>
            <LogOut className="w-3.5 h-3.5 mr-1.5" />
            Sign Out
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}

// Helper sub-components
function InfoRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-center gap-3">
      <div className="text-muted-foreground shrink-0">{icon}</div>
      <div className="flex-1 min-w-0">
        <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">{label}</p>
        <p className="text-sm font-medium mt-0.5 truncate">{value}</p>
      </div>
    </div>
  )
}

function QuickLink({
  icon, label, description, onClick, disabled, badge
}: {
  icon: React.ReactNode
  label: string
  description: string
  onClick: () => void
  disabled?: boolean
  badge?: string
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-muted/50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-left"
    >
      <div className="shrink-0">{icon}</div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium">{label}</p>
        <p className="text-xs text-muted-foreground">{description}</p>
      </div>
      {badge && (
        <Badge variant="secondary" className="text-xs shrink-0">{badge}</Badge>
      )}
      {!badge && <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0" />}
    </button>
  )
}
