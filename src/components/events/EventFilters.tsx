import { useState } from 'react'
import { MapPin, Filter, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useEventsStore } from '@/store/eventsStore'
import type { FilterOption, EventFilters } from '@/types'

const locations: FilterOption[] = [
  { value: 'all', label: 'All Locations' },
  { value: 'mexico', label: 'Mexico' },
  { value: 'usa', label: 'United States' },
  { value: 'canada', label: 'Canada' },
]

const rounds: FilterOption[] = [
  { value: 'all', label: 'All Rounds' },
  { value: 'group', label: 'Group Stage' },
  { value: 'round of 16', label: 'Round of 16' },
  { value: 'quarter', label: 'Quarter Finals' },
  { value: 'semi', label: 'Semi Finals' },
  { value: 'final', label: 'Final' },
]

const teams: FilterOption[] = [
  { value: 'all', label: 'All Teams' },
  { value: 'mexico', label: 'Mexico' },
  { value: 'usa', label: 'USA' },
  { value: 'canada', label: 'Canada' },
  { value: 'argentina', label: 'Argentina' },
  { value: 'brazil', label: 'Brazil' },
  { value: 'france', label: 'France' },
  { value: 'england', label: 'England' },
  { value: 'spain', label: 'Spain' },
  { value: 'germany', label: 'Germany' },
  { value: 'portugal', label: 'Portugal' },
  { value: 'italy', label: 'Italy' },
  { value: 'netherlands', label: 'Netherlands' },
  { value: 'belgium', label: 'Belgium' },
  { value: 'croatia', label: 'Croatia' },
  { value: 'morocco', label: 'Morocco' },
  { value: 'senegal', label: 'Senegal' },
  { value: 'nigeria', label: 'Nigeria' },
  { value: 'egypt', label: 'Egypt' },
  { value: 'cameroon', label: 'Cameroon' },
  { value: 'ghana', label: 'Ghana' },
  { value: 'japan', label: 'Japan' },
  { value: 'south korea', label: 'South Korea' },
  { value: 'saudi arabia', label: 'Saudi Arabia' },
  { value: 'australia', label: 'Australia' },
  { value: 'uruguay', label: 'Uruguay' },
  { value: 'colombia', label: 'Colombia' },
  { value: 'chile', label: 'Chile' },
  { value: 'ecuador', label: 'Ecuador' },
  { value: 'costa rica', label: 'Costa Rica' },
  { value: 'panama', label: 'Panama' },
  { value: 'jamaica', label: 'Jamaica' },
  { value: 'switzerland', label: 'Switzerland' },
  { value: 'denmark', label: 'Denmark' },
  { value: 'poland', label: 'Poland' },
  { value: 'turkey', label: 'Turkey' },
  { value: 'serbia', label: 'Serbia' },
  { value: 'austria', label: 'Austria' },
  { value: 'scotland', label: 'Scotland' },
  { value: 'wales', label: 'Wales' },
  { value: 'iran', label: 'Iran' },
  { value: 'iraq', label: 'Iraq' },
  { value: 'qatar', label: 'Qatar' },
  { value: 'new zealand', label: 'New Zealand' },
  { value: 'peru', label: 'Peru' },
  { value: 'algeria', label: 'Algeria' },
  { value: 'south africa', label: 'South Africa' },
  { value: 'tunisia', label: 'Tunisia' },
]

const dates: FilterOption[] = [
  { value: 'all', label: 'All Dates' },
  { value: 'today', label: 'Today' },
  { value: 'week', label: 'This Week' },
  { value: 'month', label: 'This Month' },
  { value: 'june', label: 'June 2026' },
  { value: 'july', label: 'July 2026' },
]

// --- Moved OUTSIDE EventFilters ---
interface FilterContentProps {
  filters: EventFilters
  setFilters: (filters: Partial<EventFilters>) => void
  clearFilters: () => void
  activeFiltersCount: number
}

function FilterContent({ filters, setFilters, clearFilters, activeFiltersCount }: FilterContentProps) {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <MapPin className="h-4 w-4" />
      </div>

      <Select
        value={filters.location}
        onValueChange={(value) => setFilters({ location: value })}
      >
        <SelectTrigger className="w-[140px] h-9">
          <SelectValue placeholder="Location" />
        </SelectTrigger>
        <SelectContent>
          {locations.map((loc) => (
            <SelectItem key={loc.value} value={loc.value}>
              {loc.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={filters.team}
        onValueChange={(value) => setFilters({ team: value })}
      >
        <SelectTrigger className="w-[130px] h-9">
          <SelectValue placeholder="Team" />
        </SelectTrigger>
        <SelectContent>
          {teams.map((team) => (
            <SelectItem key={team.value} value={team.value}>
              {team.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={filters.round}
        onValueChange={(value) => setFilters({ round: value })}
      >
        <SelectTrigger className="w-[140px] h-9">
          <SelectValue placeholder="All Rounds" />
        </SelectTrigger>
        <SelectContent>
          {rounds.map((round) => (
            <SelectItem key={round.value} value={round.value}>
              {round.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={filters.dateRange}
        onValueChange={(value) => setFilters({ dateRange: value })}
      >
        <SelectTrigger className="w-[130px] h-9">
          <SelectValue placeholder="All dates" />
        </SelectTrigger>
        <SelectContent>
          {dates.map((date) => (
            <SelectItem key={date.value} value={date.value}>
              {date.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select>
        <SelectTrigger className="w-[100px] h-9">
          <SelectValue placeholder="Price" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="any">Any Price</SelectItem>
          <SelectItem value="under500">Under $500</SelectItem>
          <SelectItem value="500-1000">$500 - $1,000</SelectItem>
          <SelectItem value="1000-2000">$1,000 - $2,000</SelectItem>
          <SelectItem value="over2000">Over $2,000</SelectItem>
        </SelectContent>
      </Select>

      {activeFiltersCount > 0 && (
        <Button
          variant="ghost"
          size="sm"
          onClick={clearFilters}
          className="h-9 text-destructive hover:text-destructive"
        >
          <X className="h-3 w-3 mr-1" />
          Clear
        </Button>
      )}
    </div>
  )
}

// --- Main component stays clean ---
export default function EventFilters() {
  const { filters, setFilters, clearFilters } = useEventsStore()
  const [showMobileFilters, setShowMobileFilters] = useState<boolean>(false)

  const activeFiltersCount = Object.values(filters).filter(v =>
    v && v !== '' && (typeof v !== 'object' || v.min > 0 || v.max < 50000)
  ).length

  return (
    <div className="space-y-4">
      {/* Desktop Filters */}
      <div className="hidden md:block">
        <FilterContent
          filters={filters}
          setFilters={setFilters}
          clearFilters={clearFilters}
          activeFiltersCount={activeFiltersCount}
        />
      </div>

      {/* Mobile Filter Toggle */}
      <div className="md:hidden">
        <Button
          variant="outline"
          onClick={() => setShowMobileFilters(!showMobileFilters)}
          className="w-full justify-between"
        >
          <span className="flex items-center gap-2">
            <Filter className="h-4 w-4" />
            Filters
          </span>
          {activeFiltersCount > 0 && (
            <Badge variant="secondary">{activeFiltersCount}</Badge>
          )}
        </Button>

        {showMobileFilters && (
          <div className="mt-4 p-4 border rounded-lg bg-card">
            <div className="grid grid-cols-2 gap-3">
              <Select
                value={filters.location}
                onValueChange={(value) => setFilters({ location: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Location" />
                </SelectTrigger>
                <SelectContent>
                  {locations.map((loc) => (
                    <SelectItem key={loc.value} value={loc.value}>
                      {loc.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select
                value={filters.team}
                onValueChange={(value) => setFilters({ team: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Team" />
                </SelectTrigger>
                <SelectContent>
                  {teams.map((team) => (
                    <SelectItem key={team.value} value={team.value}>
                      {team.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select
                value={filters.round}
                onValueChange={(value) => setFilters({ round: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Round" />
                </SelectTrigger>
                <SelectContent>
                  {rounds.map((round) => (
                    <SelectItem key={round.value} value={round.value}>
                      {round.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select
                value={filters.dateRange}
                onValueChange={(value) => setFilters({ dateRange: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Date" />
                </SelectTrigger>
                <SelectContent>
                  {dates.map((date) => (
                    <SelectItem key={date.value} value={date.value}>
                      {date.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {activeFiltersCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearFilters}
                className="w-full mt-3 text-destructive hover:text-destructive"
              >
                Clear All Filters
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}