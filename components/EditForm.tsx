'use client'

import { useState, useEffect } from 'react'
import { createUser, updateUser } from '@/actions/user'
import { userSchema, UserInput } from '@/schemas/user'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'

type EditFormProps = {
  id?: number
  initialData: UserInput
  onSuccess: () => void
  submitText?: string
}

export function EditForm({ id, initialData, onSuccess, submitText = 'Save' }: EditFormProps) {
  const [formData, setFormData] = useState(initialData)
  const [errors, setErrors] = useState<{ name?: string; email?: string; password?: string; }>({})
  const [loading, setLoading] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const result = userSchema.safeParse(formData)
    if (!result.success) {
      const fieldErrors: Record<string, string> = {}
      result.error.errors.forEach(err => {
        fieldErrors[err.path[0]] = err.message
      })
      setErrors(fieldErrors)
      return
    }

    try {
      setLoading(true)
      if (id) {
        // If the password is not provided, omit it from the update
        const updateData = { ...result.data }
        if (!updateData.password) {
          delete updateData.password
        }
        await updateUser(id, updateData)
        toast.success('User updated!')
      } else {
        await createUser(result.data)
        toast.success('User created!')
      }
      onSuccess()
    } catch (error) {
      console.error('Error:', error)
      toast.error('Email already registered')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    // Reset form data if the initialData changes
    setFormData(initialData)
  }, [initialData])

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="name">Name</Label>
        <Input name="name" value={formData.name} onChange={handleChange} />
        {errors.name && <p className="text-red-500 text-sm">{errors.name}</p>}
      </div>

      <div>
        <Label htmlFor="email">Email</Label>
        <Input name="email" value={formData.email} onChange={handleChange} />
        {errors.email && <p className="text-red-500 text-sm">{errors.email}</p>}
      </div>

      <div>
        <Label htmlFor="password">Password</Label>
        <Input
          name="password"
          type="password"
          value={formData.password || ''}  // Ensure password is bound to the input value
          onChange={handleChange}
        />
        {errors.password && <p className="text-red-500 text-sm">{errors.password}</p>}
      </div>

      <Button type="submit" className="w-full" disabled={loading || !formData.name || !formData.email || (id ? false : !formData.password || formData.password.length < 6)}>
        {loading ? 'Saving...' : submitText}
      </Button>
    </form>
  )
}
