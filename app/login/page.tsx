'use client'

import { signIn } from 'next-auth/react'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'

export default function LoginPage() {
  const router = useRouter()
  const [form, setForm] = useState({ email: '', password: '' })
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    const res = await signIn('credentials', {
      ...form,
      redirect: false,
    })

    if (res?.error) {
      toast.error('Invalid credentials')
    } else {
      toast.success('Logged in!')
      router.push('/zod')
    }
    setLoading(false)
  }
  
  const isDisabled = loading || !form.email || (!form.password || form.password.length < 6);

  return (
    <form onSubmit={handleSubmit} className="max-w-sm mx-auto mt-20 space-y-4">
      <Input
        name="email"
        placeholder="Email"
        value={form.email}
        onChange={(e) => setForm({ ...form, email: e.target.value })}
      />
      <Input
        name="password"
        type="password"
        placeholder="Password"
        value={form.password}
        onChange={(e) => setForm({ ...form, password: e.target.value })}
      />
      <Button type="submit" disabled={isDisabled} className="w-full">
        {loading ? 'Logging in...' : 'Login'}
      </Button>
    </form>
  )
}
