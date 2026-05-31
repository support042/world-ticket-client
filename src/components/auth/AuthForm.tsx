import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useAuthStore } from '@/store/authStore'
import type { AuthFormProps, FormData, FormErrors, CountryCode } from '@/types'
import { toast } from 'sonner'

const countryCodes: CountryCode[] = [
  { code: '+1', country: 'US' },
  { code: '+44', country: 'UK' },
  { code: '+234', country: 'NG' },
  { code: '+49', country: 'DE' },
  { code: '+33', country: 'FR' },
  { code: '+52', country: 'MX' },
  { code: '+55', country: 'BR' },
  { code: '+81', country: 'JP' },
  { code: '+82', country: 'KR' },
  { code: '+86', country: 'CN' },
]

export default function AuthForm({ mode = 'signin', onToggleMode, onSuccess }: AuthFormProps) {
  const [formData, setFormData] = useState<FormData>({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    phone: '',
    countryCode: '+1',
    newsletter: false
  })
  const [errors, setErrors] = useState<FormErrors>({})

  const { login, signup, isLoading, error, clearError } = useAuthStore()

  // Reset form fields and clear store errors when switching between signin and signup modes
  useEffect(() => {
    clearError()
    setFormData({
      email: '',
      password: '',
      firstName: '',
      lastName: '',
      phone: '',
      countryCode: '+1',
      newsletter: false
    })
    setErrors({})
  }, [mode, clearError])

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {}

    if (!formData.email) {
      newErrors.email = 'Email is required'
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Invalid email address'
    }

    if (!formData.password) {
      newErrors.password = 'Password is required'
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters'
    }

    if (mode === 'signup') {
      if (!formData.firstName) newErrors.firstName = 'First name is required'
      if (!formData.lastName) newErrors.lastName = 'Last name is required'
      if (!formData.phone) newErrors.phone = 'Phone number is required'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    clearError()

    if (!validateForm()) return

    let result
    try {
      if (mode === 'signin') {
        result = await login(formData.email, formData.password)
      } else {
        result = await signup(formData)
      }

      if (result.success) {
        toast.success(mode === 'signin' ? 'Welcome back!' : 'Account created successfully!')
        if (onSuccess) {
          onSuccess(result.user)
        }
      } else {
        toast.error(result.error || 'Authentication failed')
      }
    } catch {
      toast.error('An unexpected error occurred')
    }
  }

  const handleChange = (field: keyof FormData, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (field in errors) {
      setErrors(prev => ({ ...prev, [field]: undefined }))
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {mode === 'signup' && (
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="firstName">First Name</Label>
            <Input
              id="firstName"
              value={formData.firstName}
              onChange={(e) => handleChange('firstName', e.target.value)}
              placeholder="John"
            />
            {errors.firstName && <p className="text-xs text-destructive">{errors.firstName}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="lastName">Last Name</Label>
            <Input
              id="lastName"
              value={formData.lastName}
              onChange={(e) => handleChange('lastName', e.target.value)}
              placeholder="Doe"
            />
            {errors.lastName && <p className="text-xs text-destructive">{errors.lastName}</p>}
          </div>
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          value={formData.email}
          onChange={(e) => handleChange('email', e.target.value)}
          placeholder="you@example.com"
        />
        {errors.email && <p className="text-xs text-destructive">{errors.email}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>
        <Input
          id="password"
          type="password"
          value={formData.password}
          onChange={(e) => handleChange('password', e.target.value)}
          placeholder="Enter your password"
        />
        {errors.password && <p className="text-xs text-destructive">{errors.password}</p>}
      </div>

      {mode === 'signup' && (
        <>
          <div className="space-y-2">
            <Label htmlFor="phone">Phone Number</Label>
            <div className="flex gap-2">
              <Select
                value={formData.countryCode}
                onValueChange={(value) => handleChange('countryCode', value)}
              >
                <SelectTrigger className="w-24">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {countryCodes.map((c) => (
                    <SelectItem key={c.code} value={c.code}>
                      {c.country} {c.code}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Input
                id="phone"
                type="tel"
                value={formData.phone}
                onChange={(e) => handleChange('phone', e.target.value)}
                placeholder="Phone Number"
                className="flex-1"
              />
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="newsletter"
              checked={formData.newsletter}
              onCheckedChange={(checked) => handleChange('newsletter', checked as boolean)}
            />
            <Label htmlFor="newsletter" className="text-sm font-normal">
              Please keep me updated by email about the latest news, great deals and special offers
            </Label>
          </div>
        </>
      )}

      {error && (
        <p className="text-sm text-destructive text-center">{error}</p>
      )}

      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? 'Please wait...' : mode === 'signin' ? 'Sign In' : 'Create Account'}
      </Button>

      <div className="text-center text-sm">
        {mode === 'signin' ? (
          <p>
            {"Don't have an account? "}
            <button
              type="button"
              onClick={onToggleMode}
              className="text-primary hover:underline font-medium"
            >
              Sign up
            </button>
          </p>
        ) : (
          <p>
            Already have an account?{' '}
            <button
              type="button"
              onClick={onToggleMode}
              className="text-primary hover:underline font-medium"
            >
              Sign in
            </button>
          </p>
        )}
      </div>
    </form>
  )
}