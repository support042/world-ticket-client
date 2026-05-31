import { useNavigate } from 'react-router-dom'
import { Eye, ThumbsUp, DollarSign, Star, Users } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { formatCurrency } from '@/lib/utils'
import type { Section } from '@/types'

interface SectionCardProps {
  section: Section
  eventId: string
  isSelected: boolean
  ticketCount: number
  onSelect: (section: Section) => void
}

export default function SectionCard({ 
  section, 
  eventId, 
  isSelected, 
  ticketCount, 
  onSelect 
}: SectionCardProps) {
  const navigate = useNavigate()

  const handleClick = () => {
    onSelect(section)
    navigate(`/event/${eventId}/section/${section.id}`, {
      state: {
        selectedSection: section,
        ticketCount: ticketCount
      }
    })
  }

  return (
    <Card
      className={`cursor-pointer transition-all hover:shadow-md ${
        isSelected ? 'ring-2 ring-primary' : ''
      }`}
      onClick={handleClick}
    >
      <CardContent className="p-3 md:p-4">
        {/* Always horizontal layout - responsive */}
        <div className="flex flex-row gap-2 md:gap-3 lg:gap-4">
          
          {/* Section Image - Responsive sizing */}
          <div className="flex-shrink-0 w-16 h-16 md:w-20 md:h-20 lg:w-33 lg:h-25 rounded-lg bg-gradient-to-br from-slate-700 to-slate-900 flex items-center justify-center text-white overflow-hidden">
            {section.sectionImage ? (
              <img src={section.sectionImage} alt={`Section ${section.name}`} className="w-full h-full object-cover" />
            ) : (
              <div className="text-center">
                <Users className="h-5 w-5 md:h-6 md:w-6 mx-auto mb-0.5 md:mb-1 opacity-50" />
                <span className="text-[8px] md:text-[10px] lg:text-xs opacity-70">Section View</span>
              </div>
            )}
          </div>

          {/* Section Details */}
          <div className="flex-1 min-w-0">
            {/* Header with title and price */}
            <div className="flex items-start justify-between gap-1 md:gap-2">
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-sm md:text-base lg:text-lg truncate">
                  Section {section.name}
                </h3>
                <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 mt-0.5">
                  <p className="text-xs md:text-sm text-muted-foreground">Row {section.row}</p>
                  <span className="text-[10px] md:text-xs text-muted-foreground hidden sm:inline">•</span>
                  <p className="text-xs md:text-sm text-muted-foreground">
                    {section.available} tickets
                  </p>
                </div>
              </div>
              <div className="text-right shrink-0">
                <p className="text-base md:text-lg lg:text-xl font-bold">
                  {formatCurrency(section.price)}
                </p>
                {section.rating && (
                  <Badge className="mt-0.5 md:mt-1 bg-green-500 text-white text-[9px] md:text-[10px] lg:text-xs px-1.5 py-0">
                    {section.rating} {section.ratingLabel}
                  </Badge>
                )}
              </div>
            </div>

            {/* Features - Responsive chips */}
            <div className="flex flex-wrap items-center gap-1 md:gap-1.5 mt-1.5 md:mt-2">
              {section.features.slice(0, 2).map((feature, idx) => (
                <span key={idx} className="inline-flex items-center gap-0.5 md:gap-1 text-[9px] md:text-[10px] lg:text-xs text-muted-foreground bg-muted px-1.5 md:px-2 py-0.5 rounded">
                  <Eye className="h-2.5 w-2.5 md:h-3 md:w-3" />
                  {feature}
                </span>
              ))}
            </div>

            {/* Badges - Responsive */}
            <div className="flex flex-wrap gap-1 md:gap-1.5 mt-1.5 md:mt-2">
              {section.isPopular && (
                <Badge variant="outline" className="text-[9px] md:text-[10px] lg:text-xs py-0 px-1.5">
                  <ThumbsUp className="h-2.5 w-2.5 md:h-3 md:w-3 mr-0.5" />
                  Popular
                </Badge>
              )}
              {section.isLowestPrice && (
                <Badge className="bg-green-500 text-white text-[9px] md:text-[10px] lg:text-xs py-0 px-1.5">
                  <DollarSign className="h-2.5 w-2.5 md:h-3 md:w-3 mr-0.5" />
                  Best Price
                </Badge>
              )}
              {section.isFanFavorite && (
                <Badge variant="outline" className="text-orange-500 border-orange-200 text-[9px] md:text-[10px] lg:text-xs py-0 px-1.5">
                  <Star className="h-2.5 w-2.5 md:h-3 md:w-3 mr-0.5 fill-orange-500" />
                  Fan Fav
                </Badge>
              )}
            </div>

            {/* Availability message */}
            <p className="text-[10px] md:text-xs text-green-600 mt-1.5 md:mt-2">
              {section.available} tickets remaining
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}