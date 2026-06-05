import { Globe, Calendar, Trophy, Ticket, MapPin, Flag } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

interface WorldCupDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export default function WorldCupDialog({ open, onOpenChange }: WorldCupDialogProps) {
  const stats = [
    { icon: <Flag className="h-5 w-5 text-primary" />, value: '48', label: 'Nations' },
    { icon: <Trophy className="h-5 w-5 text-primary" />, value: '104', label: 'Matches' },
    { icon: <Calendar className="h-5 w-5 text-primary" />, value: '39', label: 'Days' },
    { icon: <Globe className="h-5 w-5 text-primary" />, value: '3', label: 'Host Countries' },
  ]

  const keyDates = [
    {
      badge: 'Kickoff',
      badgeClass: 'bg-primary/15 text-primary border-none',
      date: 'June 11, 2026',
      venue: 'Estadio Azteca',
      city: 'Mexico City, Mexico',
    },
    {
      badge: 'Group Stage',
      badgeClass: 'bg-blue-500/15 text-blue-600 border-none',
      date: 'June 11 – July 1, 2026',
      venue: '16 Stadiums',
      city: 'USA, Canada & Mexico',
    },
    {
      badge: 'Semi-Finals',
      badgeClass: 'bg-orange-500/15 text-orange-600 border-none',
      date: 'July 14 & 15, 2026',
      venue: 'AT&T Stadium & MetLife Stadium',
      city: 'Dallas & New Jersey',
    },
    {
      badge: 'Grand Final',
      badgeClass: 'bg-amber-500/15 text-amber-600 border-none',
      date: 'July 19, 2026',
      venue: 'MetLife Stadium',
      city: 'East Rutherford, New Jersey',
    },
  ]

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-5xl max-h-[90vh] overflow-y-auto p-0 overflow-hidden rounded-2xl">
        {/* Full-bleed gradient hero */}
        <div className="relative h-56 sm:h-64 bg-gradient-to-br from-green-800 via-green-600 to-green-400 flex items-center justify-center overflow-hidden shrink-0">
          {/* Decorative orbs */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full translate-x-24 -translate-y-24" />
          <div className="absolute bottom-0 left-0 w-40 h-40 bg-white/10 rounded-full -translate-x-16 translate-y-16" />
          <div className="absolute top-1/2 left-1/4 w-24 h-24 bg-white/5 rounded-full -translate-y-1/2" />

          {/* World Cup title */}
          <div className="relative z-10 text-center text-white select-none">
            <div className="text-[4.5rem] sm:text-[6rem] font-black tracking-tight leading-none drop-shadow-lg">
              WORLD
            </div>
            <div className="text-[4.5rem] sm:text-[6rem] font-black tracking-tight leading-none drop-shadow-lg">
              CUP
            </div>
            <div className="text-2xl sm:text-3xl font-bold mt-2 tracking-[0.3em] opacity-90">
              2026
            </div>
          </div>

          {/* Host countries pills */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
            {['🇺🇸 USA', '🇨🇦 Canada', '🇲🇽 Mexico'].map((c) => (
              <span
                key={c}
                className="text-[11px] font-bold bg-white/20 backdrop-blur-sm text-white px-3 py-1 rounded-full border border-white/25"
              >
                {c}
              </span>
            ))}
          </div>
        </div>

        {/* Body */}
        <div className="p-6 sm:p-8 space-y-7 overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl sm:text-3xl font-black tracking-tight">
              The World's Greatest Sporting Event
            </DialogTitle>
          </DialogHeader>

          {/* Description */}
          <div className="space-y-4 text-sm text-muted-foreground leading-relaxed">
            <p>
              Get ready for the ultimate soccer spectacle of 2026, spanning the United States,
              Canada, and Mexico, where <strong className="text-foreground">48 nations</strong>{' '}
              will compete across{' '}
              <strong className="text-foreground">104 matches</strong> in 39 unforgettable
              days. The tournament kicks off on{' '}
              <strong className="text-foreground">June 11, 2026</strong>, at the legendary
              Estadio Azteca in Mexico City, and all roads lead to the grand finale on{' '}
              <strong className="text-foreground">July 19, 2026</strong>, at MetLife Stadium
              in New Jersey.
            </p>
            <p>
              From breathtaking goals to nail-biting finishes, every moment will pulse with
              energy as the world's biggest stars take center stage in front of roaring crowds.
              This is your chance to secure a seat at the world's greatest sporting event.
              Imagine the roar of the crowd and the pure adrenaline of watching iconic moments
              happen right in front of you.
            </p>
            <p>
              Tickets will be in massive demand, and the best seats will disappear fast — so
              don't wait. Secure yours now and be part of the global celebration that only
              comes once every four years.
            </p>
          </div>

          {/* Stats row */}
          <div className="grid grid-cols-4 gap-3 pt-2 border-t">
            {stats.map((s) => (
              <div
                key={s.label}
                className="flex flex-col items-center gap-2 text-center"
              >
                <div className="h-11 w-11 rounded-2xl bg-primary/10 flex items-center justify-center">
                  {s.icon}
                </div>
                <span className="text-2xl font-black text-foreground">{s.value}</span>
                <span className="text-xs text-muted-foreground font-semibold">{s.label}</span>
              </div>
            ))}
          </div>

          {/* Key dates */}
          <div className="space-y-3 bg-muted/40 rounded-2xl p-5">
            <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-4">
              Tournament Timeline
            </h4>
            <div className="space-y-3">
              {keyDates.map((item) => (
                <div
                  key={item.badge}
                  className="flex items-start gap-3"
                >
                  <Badge className={`${item.badgeClass} text-[10px] font-bold shrink-0 mt-0.5`}>
                    {item.badge}
                  </Badge>
                  <div>
                    <span className="text-sm font-bold text-foreground">{item.date}</span>
                    <div className="flex items-center gap-1 mt-0.5 text-xs text-muted-foreground">
                      <MapPin className="h-3 w-3" />
                      {item.venue} · {item.city}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* CTA */}
          <Button
            size="lg"
            className="w-full font-bold rounded-xl text-base gap-2 cursor-pointer"
            onClick={() => onOpenChange(false)}
          >
            <Ticket className="h-5 w-5" />
            Secure Your Tickets Now
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
