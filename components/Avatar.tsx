// components/Avatar.tsx
'use client'

import { useSession, signOut } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from '@/components/ui/dialog'
import { useState } from 'react'

export function Avatar() {
  const { data: session, status } = useSession()
  const [open, setOpen] = useState(false)

  if (status === 'loading') {
    return <p>Loading user info...</p>
  }

  const handleSignOut = () => {
    signOut()
    setOpen(false)
  }

  return (
    <div className="flex items-center gap-2">
      {session?.user ? (
        <div className="flex items-center gap-4">
          <p className="text-sm text-gray-600">Signed in as {session.user.email}</p>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">Sign Out</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Confirm Sign Out</DialogTitle>
              </DialogHeader>
              <DialogFooter>
                <Button variant="secondary" onClick={() => setOpen(false)}>
                  Cancel
                </Button>
                <Button variant="destructive" onClick={handleSignOut}>
                  Yes, Sign Out
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      ) : (
        <p>No user signed in</p>
      )}
    </div>
  )
}
