import { useEffect } from 'react'
import { Save } from 'lucide-react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator as SeparatorUI } from '@/components/ui/separator'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { createEventSchema, type CreateEventPayload } from '@/lib/validations'
import type { Event } from '@/types'

interface EventDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  editingEvent: Event | null
  onSubmit: (data: CreateEventPayload) => Promise<void>
  isSubmitting?: boolean
}

export default function EventDialog({
  open,
  onOpenChange,
  editingEvent,
  onSubmit,
  isSubmitting = false
}: EventDialogProps) {
  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm({
    resolver: zodResolver(createEventSchema) as any,
    defaultValues: {
      title: '',
      tournament: 'World Cup 2026',
      stage: '',
      date: '',
      time: '',
      venue: '',
      city: '',
      state: '',
      country: '',
      ticketsLeftPercent: 100,
      priceMin: 0,
      priceMax: 0,
      image: '',
      team1Name: '',
      team1Flag: '',
      team1Code: '',
      team2Name: '',
      team2Flag: '',
      team2Code: '',
      status: 'upcoming',
      settings: {
        ticketLimitPerUser: 4,
        allowResale: true,
        requireId: false
      }
    }
  })

  // Sync form with editingEvent or reset on open
  useEffect(() => {
    if (open) {
      if (editingEvent) {
        reset({
          title: editingEvent.title,
          tournament: editingEvent.tournament,
          stage: editingEvent.stage,
          date: editingEvent.date,
          time: editingEvent.time,
          venue: editingEvent.venue,
          city: editingEvent.city,
          state: editingEvent.state || '',
          country: editingEvent.country,
          ticketsLeftPercent: editingEvent.ticketsLeftPercent,
          priceMin: editingEvent.priceRange.min,
          priceMax: editingEvent.priceRange.max,
          image: editingEvent.image || '',
          team1Name: editingEvent.teams[0]?.name || '',
          team1Flag: editingEvent.teams[0]?.flag || '',
          team1Code: editingEvent.teams[0]?.code || '',
          team2Name: editingEvent.teams[1]?.name || '',
          team2Flag: editingEvent.teams[1]?.flag || '',
          team2Code: editingEvent.teams[1]?.code || '',
          status: (editingEvent as any).status || 'upcoming',
          settings: (editingEvent as any).settings || {
            ticketLimitPerUser: 4,
            allowResale: true,
            requireId: false
          }
        })
      } else {
        reset({
          title: '',
          tournament: 'World Cup 2026',
          stage: '',
          date: '',
          time: '',
          venue: '',
          city: '',
          state: '',
          country: '',
          ticketsLeftPercent: 100,
          priceMin: 0,
          priceMax: 0,
          image: '',
          team1Name: '',
          team1Flag: '',
          team1Code: '',
          team2Name: '',
          team2Flag: '',
          team2Code: '',
          status: 'upcoming',
          settings: {
            ticketLimitPerUser: 4,
            allowResale: true,
            requireId: false
          }
        })
      }
    }
  }, [editingEvent, open, reset])

  const onFormSubmit = async (data: CreateEventPayload) => {
    await onSubmit(data)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{editingEvent ? 'Edit Event' : 'Add New Event'}</DialogTitle>
          <DialogDescription>
            {editingEvent ? 'Update the event details below.' : 'Fill in the details for the new event.'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2 col-span-2">
              <Label htmlFor="title">Event Title</Label>
              <Input
                id="title"
                {...register('title')}
                placeholder="Mexico vs South Africa"
              />
              {errors.title && <p className="text-xs text-destructive font-medium">{errors.title.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="tournament">Tournament</Label>
              <Input
                id="tournament"
                {...register('tournament')}
                placeholder="World Cup 2026"
              />
              {errors.tournament && <p className="text-xs text-destructive font-medium">{errors.tournament.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="stage">Stage</Label>
              <Input
                id="stage"
                {...register('stage')}
                placeholder="Group A - Match 1"
              />
              {errors.stage && <p className="text-xs text-destructive font-medium">{errors.stage.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="date">Date</Label>
              <Input
                id="date"
                type="date"
                {...register('date')}
              />
              {errors.date && <p className="text-xs text-destructive font-medium">{errors.date.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="time">Time</Label>
              <Input
                id="time"
                type="time"
                {...register('time')}
              />
              {errors.time && <p className="text-xs text-destructive font-medium">{errors.time.message}</p>}
            </div>

            <div className="space-y-2 col-span-2">
              <Label htmlFor="venue">Venue</Label>
              <Input
                id="venue"
                {...register('venue')}
                placeholder="Estadio Azteca"
              />
              {errors.venue && <p className="text-xs text-destructive font-medium">{errors.venue.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="city">City</Label>
              <Input
                id="city"
                {...register('city')}
                placeholder="Ciudad de México"
              />
              {errors.city && <p className="text-xs text-destructive font-medium">{errors.city.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="state">State</Label>
              <Input
                id="state"
                {...register('state')}
                placeholder="Estado de Mexico"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="country">Country</Label>
              <Input
                id="country"
                {...register('country')}
                placeholder="Mexico"
              />
              {errors.country && <p className="text-xs text-destructive font-medium">{errors.country.message}</p>}
            </div>

            <div className="space-y-2">
              <Label>Status</Label>
              <Controller
                name="status"
                control={control}
                render={({ field }) => (
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="upcoming">Upcoming</SelectItem>
                      <SelectItem value="ongoing">Ongoing</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.status && <p className="text-xs text-destructive font-medium">{errors.status.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="ticketsLeftPercent">Tickets Left (%)</Label>
              <Input
                id="ticketsLeftPercent"
                type="number"
                {...register('ticketsLeftPercent')}
              />
              {errors.ticketsLeftPercent && <p className="text-xs text-destructive font-medium">{errors.ticketsLeftPercent.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="priceMin">Min Price ($)</Label>
              <Input
                id="priceMin"
                type="number"
                {...register('priceMin')}
              />
              {errors.priceMin && <p className="text-xs text-destructive font-medium">{errors.priceMin.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="priceMax">Max Price ($)</Label>
              <Input
                id="priceMax"
                type="number"
                {...register('priceMax')}
              />
              {errors.priceMax && <p className="text-xs text-destructive font-medium">{errors.priceMax.message}</p>}
            </div>

            <div className="space-y-2 col-span-2">
              <Label htmlFor="image">Event Image URL</Label>
              <Input
                id="image"
                {...register('image')}
                placeholder="https://example.com/event-banner.jpg"
              />
              {errors.image && <p className="text-xs text-destructive font-medium">{errors.image.message}</p>}
            </div>

            <SeparatorUI className="col-span-2" />
            <p className="col-span-2 font-semibold text-sm">Team 1 (Home)</p>

            <div className="space-y-2">
              <Label htmlFor="team1Name">Team Name</Label>
              <Input
                id="team1Name"
                {...register('team1Name')}
                placeholder="Mexico"
              />
              {errors.team1Name && <p className="text-xs text-destructive font-medium">{errors.team1Name.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="team1Flag">Flag (emoji)</Label>
              <Input
                id="team1Flag"
                {...register('team1Flag')}
                placeholder="🇲🇽"
              />
              {errors.team1Flag && <p className="text-xs text-destructive font-medium">{errors.team1Flag.message}</p>}
            </div>

            <div className="space-y-2 col-span-2">
              <Label htmlFor="team1Code">Team Code</Label>
              <Input
                id="team1Code"
                {...register('team1Code')}
                placeholder="MEX"
                maxLength={3}
                className="uppercase"
              />
              {errors.team1Code && <p className="text-xs text-destructive font-medium">{errors.team1Code.message}</p>}
            </div>

            <p className="col-span-2 font-semibold text-sm">Team 2 (Away)</p>

            <div className="space-y-2">
              <Label htmlFor="team2Name">Team Name</Label>
              <Input
                id="team2Name"
                {...register('team2Name')}
                placeholder="South Africa"
              />
              {errors.team2Name && <p className="text-xs text-destructive font-medium">{errors.team2Name.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="team2Flag">Flag (emoji)</Label>
              <Input
                id="team2Flag"
                {...register('team2Flag')}
                placeholder="🇿🇦"
              />
              {errors.team2Flag && <p className="text-xs text-destructive font-medium">{errors.team2Flag.message}</p>}
            </div>

            <div className="space-y-2 col-span-2">
              <Label htmlFor="team2Code">Team Code</Label>
              <Input
                id="team2Code"
                {...register('team2Code')}
                placeholder="RSA"
                maxLength={3}
                className="uppercase"
              />
              {errors.team2Code && <p className="text-xs text-destructive font-medium">{errors.team2Code.message}</p>}
            </div>
          </div>

          <DialogFooter className="mt-6">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              <Save className="h-4 w-4 mr-2" />
              {isSubmitting ? 'Saving...' : editingEvent ? 'Update Event' : 'Create Event'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}