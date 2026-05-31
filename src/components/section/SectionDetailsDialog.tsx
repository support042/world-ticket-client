import { Users, Star, CheckCircle, ThumbsUp, DollarSign} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { formatCurrency } from '@/lib/utils'
import type { Section } from '@/types'

interface SectionDetailsDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  section: Section | null
  eventTitle?: string
}

export default function SectionDetailsDialog({ 
  open, 
  onOpenChange, 
  section,
  eventTitle 
}: SectionDetailsDialogProps) {
  if (!section) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-5xl max-h-[90vh] overflow-y-auto p-6">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <span>Section {section.name} Details</span>
            {eventTitle && (
              <span className="text-sm font-normal text-muted-foreground">
                {eventTitle}
              </span>
            )}
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Section Image */}
          <div className="relative w-full h-60 sm:h-80 md:h-96 lg:h-[17rem] bg-gradient-to-br from-slate-700 to-slate-900 rounded-lg overflow-hidden">
            {section.sectionImage ? (
              <img 
                src={section.sectionImage} 
                alt={`Section ${section.name} view`}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-white">
                <Users className="h-16 w-16 mx-auto mb-4 opacity-50" />
                <p className="text-lg font-semibold">Section View</p>
                <p className="text-sm opacity-70">View from Section {section.name}</p>
              </div>
            )}
            
            {/* Section Badge Overlay */}
            <div className="absolute top-4 left-4">
              <Badge className="bg-black/50 backdrop-blur-sm text-white border-0">
                Section {section.name} • Row {section.row}
              </Badge>
            </div>
          </div>

          {/* Section Details */}
          <div className="space-y-4">
            {/* Title */}
            <div>
              <h3 className="text-xl font-bold">Section {section.name}, Row {section.row}</h3>
              <div className="flex items-center gap-2 mt-2 flex-wrap">
                <Badge variant="outline" className="text-sm">
                  {section.available} tickets available
                </Badge>
                {section.rating && (
                  <Badge className="bg-green-500 hover:bg-green-600 text-white">
                    <Star className="h-3 w-3 mr-1 fill-current" />
                    {section.rating} {section.ratingLabel}
                  </Badge>
                )}
              </div>
            </div>

            {/* Features */}
            {section.features && section.features.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {section.features.map((feature, idx) => (
                  <Badge key={idx} variant="secondary" className="text-sm">
                    <CheckCircle className="h-3 w-3 mr-1 text-green-500" />
                    {feature}
                  </Badge>
                ))}
              </div>
            )}

            {/* Special Badges */}
            <div className="flex flex-wrap gap-2">
              {section.isPopular && (
                <Badge className="bg-orange-500 hover:bg-orange-600 text-white">
                  <ThumbsUp className="h-3 w-3 mr-1" />
                  Popular Pick - {section.ticketsSoldLastHour} sold recently
                </Badge>
              )}
              
              {section.isLowestPrice && (
                <Badge className="bg-green-500 hover:bg-green-600 text-white">
                  <DollarSign className="h-3 w-3 mr-1" />
                  Lowest Price Guaranteed
                </Badge>
              )}
              
              {section.isFanFavorite && (
                <Badge variant="outline" className="text-orange-500 border-orange-200">
                  <Star className="h-3 w-3 mr-1 fill-orange-500" />
                  Fan Favorite Section
                </Badge>
              )}
            </div>

            {/* Description */}
            <div className="pt-2">
              <h4 className="font-semibold mb-2">About this section</h4>
              <p className="text-sm text-muted-foreground">
                Located in Section {section.name}, Row {section.row}. 
                This area offers {section.features?.join(', ') || 'great views'}. 
                {section.isPopular && ' This is one of our most popular sections with fans!'}
                {section.isLowestPrice && ' Get the best value for your money with these seats.'}
              </p>
            </div>

            {/* Price Info */}
            <div className="pt-2 border-t">
              <div className="flex justify-between items-center">
                <span className="font-semibold">Price per ticket</span>
                <span className="text-xl font-bold text-primary">
                  {formatCurrency(section.price)}
                </span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Price includes all applicable fees
              </p>
            </div>
          </div>

          {/* Action Button */}
          <Button 
            className="w-full" 
            onClick={() => onOpenChange(false)}
          >
            Got it
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}