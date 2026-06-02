import { useEffect } from 'react'
import { Save } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { createSectionSchema, type CreateSectionPayload } from '@/lib/validations'
import type { Section } from '@/types'

interface SectionDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  editingSection: Section | null
  onSubmit: (data: CreateSectionPayload) => Promise<void>
  isSubmitting?: boolean
}

export default function SectionDialog({
  open,
  onOpenChange,
  editingSection,
  onSubmit,
  isSubmitting = false
}: SectionDialogProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm<CreateSectionPayload>({
    resolver: zodResolver(createSectionSchema) as any
  })

  useEffect(() => {
    if (open) {
      if (editingSection) {
        reset({
          name: editingSection.name,
          row: editingSection.row,
          price: editingSection.price,
          available: editingSection.available,
          features: editingSection.features.join(', '),
          sectionImage: editingSection.sectionImage || ''
        })
      } else {
        reset({
          name: '',
          row: '',
          price: 0,
          available: 0,
          features: '',
          sectionImage: ''
        })
      }
    }
  }, [editingSection, open, reset])

  const onFormSubmit = async (data: CreateSectionPayload) => {
    await onSubmit(data)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{editingSection ? 'Edit Section' : 'Add New Section'}</DialogTitle>
          <DialogDescription>
            {editingSection ? 'Update the section details.' : 'Add a new ticket section to this event.'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onFormSubmit as any)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Section Name</Label>
              <Input
                id="name"
                {...register('name')}
                placeholder="623"
              />
              {errors.name && <p className="text-xs text-destructive font-medium">{errors.name?.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="row">Row</Label>
              <Input
                id="row"
                {...register('row')}
                placeholder="10"
              />
              {errors.row && <p className="text-xs text-destructive font-medium">{errors.row?.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="price">Price ($)</Label>
              <Input
                id="price"
                type="number"
                {...register('price')}
              />
              {errors.price && <p className="text-xs text-destructive font-medium">{errors.price?.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="available">Available Tickets</Label>
              <Input
                id="available"
                type="number"
                {...register('available')}
              />
              {errors.available && <p className="text-xs text-destructive font-medium">{errors.available?.message}</p>}
            </div>

            <div className="space-y-2 col-span-2">
              <Label htmlFor="features">Features (comma separated)</Label>
              <Input
                id="features"
                {...register('features')}
                placeholder="Clear view, Best price, Away fans section"
              />
              {errors.features && <p className="text-xs text-destructive font-medium">{errors.features?.message}</p>}
            </div>

            <div className="space-y-2 col-span-2">
              <Label htmlFor="sectionImage">Section Image URL</Label>
              <Input
                id="sectionImage"
                {...register('sectionImage')}
                placeholder="https://example.com/section-view.jpg"
              />
              {errors.sectionImage && <p className="text-xs text-destructive font-medium">{errors.sectionImage?.message}</p>}
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              <Save className="h-4 w-4 mr-2" />
              {isSubmitting ? 'Saving...' : editingSection ? 'Update Section' : 'Add Section'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
