// components/admin/AdminSectionCard.tsx
import { Eye, Edit, Trash2, Users, Star, ThumbsUp, DollarSign, CheckCircle } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { formatCurrency } from '@/lib/utils'
import type { Section } from '@/types'

interface AdminSectionCardProps {
  section: Section
  onViewDetails: (section: Section) => void
  onEdit: (section: Section) => void
  onDelete: (sectionId: string) => void
}

export default function AdminSectionCard({
  section,
  onViewDetails,
  onEdit,
  onDelete
}: AdminSectionCardProps) {
  return (
    <Card className="group hover:shadow-md transition-shadow">
      <CardContent className="p-3 md:p-4">
        <div className="flex flex-row gap-2 md:gap-3 lg:gap-4">
          
          {/* Section Image Placeholder */}
          <div 
            className="flex-shrink-0 w-16 h-16 md:w-20 md:h-20 lg:w-24 lg:h-24 rounded-lg bg-gradient-to-br from-slate-700 to-slate-900 flex items-center justify-center text-white overflow-hidden cursor-pointer"
            onClick={() => onViewDetails(section)}
          >
            {section.sectionImage ? (
              <img 
                src={section.sectionImage} 
                alt={`Section ${section.name} view`}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="text-center">
                <Users className="h-5 w-5 md:h-6 md:w-6 mx-auto mb-0.5 md:mb-1 opacity-50" />
                <span className="text-[8px] md:text-[10px] lg:text-xs opacity-70">Section View</span>
              </div>
            )}
          </div>

          {/* Section Details */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-1 md:gap-2">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="font-semibold text-sm md:text-base lg:text-lg">
                    Section {section.name}
                  </h3>
                  <Badge variant="outline" className="text-xs">
                    Row {section.row}
                  </Badge>
                </div>
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1">
                  <p className="text-xs md:text-sm text-muted-foreground">
                    {section.available} tickets available
                  </p>
                  <span className="text-xs font-bold text-primary">
                    {formatCurrency(section.price)} each
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0"
                  onClick={() => onViewDetails(section)}
                >
                  <Eye className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0"
                  onClick={() => onEdit(section)}
                >
                  <Edit className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                  onClick={() => onDelete(section.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Features */}
            {section.features && section.features.length > 0 && (
              <div className="flex flex-wrap gap-1 md:gap-1.5 mt-2">
                {section.features.slice(0, 3).map((feature, idx) => (
                  <span key={idx} className="inline-flex items-center gap-0.5 md:gap-1 text-[10px] md:text-xs text-muted-foreground bg-muted px-1.5 md:px-2 py-0.5 rounded">
                    <CheckCircle className="h-2.5 w-2.5 md:h-3 md:w-3 text-green-500" />
                    {feature}
                  </span>
                ))}
                {section.features.length > 3 && (
                  <span className="text-[10px] md:text-xs text-muted-foreground">
                    +{section.features.length - 3} more
                  </span>
                )}
              </div>
            )}

            {/* Badges */}
            <div className="flex flex-wrap gap-1 md:gap-1.5 mt-2">
              {section.isPopular && (
                <Badge variant="secondary" className="text-[10px] md:text-xs gap-0.5">
                  <ThumbsUp className="h-2.5 w-2.5" />
                  Popular
                </Badge>
              )}
              {section.isLowestPrice && (
                <Badge className="bg-green-500 text-white text-[10px] md:text-xs gap-0.5">
                  <DollarSign className="h-2.5 w-2.5" />
                  Best Price
                </Badge>
              )}
              {section.isFanFavorite && (
                <Badge variant="outline" className="text-orange-500 border-orange-200 text-[10px] md:text-xs gap-0.5">
                  <Star className="h-2.5 w-2.5 fill-orange-500" />
                  Fan Favorite
                </Badge>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}