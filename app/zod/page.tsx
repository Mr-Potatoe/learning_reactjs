'use client'

import { useEffect, useState } from 'react'
import { getUsers, deleteUser } from '@/actions/user'
import { EditForm } from '@/components/EditForm'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table'
import { Checkbox } from '@/components/ui/checkbox'
import { toast } from 'sonner'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog'
import { useAuth } from '@/hooks/useAuth'
import { Avatar } from '@/components/Avatar'

type User = {
  id: number
  name: string | null
  email: string
  password: string
}

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([])
  const [editingUser, setEditingUser] = useState<User | null>(null)
  const [open, setOpen] = useState(false)
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set())
  const [search, setSearch] = useState('')
  const [sortBy, setSortBy] = useState<'name' | 'email'>('name')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc')
  const [page, setPage] = useState(1)
  const itemsPerPage = 2
  const { session } = useAuth()


  const fetchUsers = async () => {
    const res = await getUsers()
    setUsers(res.map(user => ({ ...user, password: '' }))) // Reset password for display
    setSelectedIds(new Set())
  }

  const filteredUsers = users.filter(user =>
    (user.name?.toLowerCase().includes(search.toLowerCase()) ||
      user.email.toLowerCase().includes(search.toLowerCase()))
    )

    const sortedUsers = [...filteredUsers].sort((a, b) => {
      const valA = a[sortBy]?.toLowerCase?.() ?? ''
      const valB = b[sortBy]?.toLowerCase?.() ?? ''
      if (sortOrder === 'asc') return valA.localeCompare(valB)
      else return valB.localeCompare(valA)
    })

    const paginatedUsers = sortedUsers.slice(
      (page - 1) * itemsPerPage,
      page * itemsPerPage
    )

    const totalPages = Math.ceil(sortedUsers.length / itemsPerPage)


  useEffect(() => {
    if (session) fetchUsers()
  }, [session])

  const handleEdit = (user: User) => {
    setEditingUser(user)
    setOpen(true)
  }

  const handleCreate = () => {
    setEditingUser(null)
    setOpen(true)
  }

  const handleDelete = async (id: number) => {
    await deleteUser(id)
    toast.success('User deleted')
    fetchUsers()
  }

  const handleBulkDelete = async () => {
    const promises = Array.from(selectedIds).map(id => deleteUser(id))
    await Promise.all(promises)
    toast.success('Users deleted')
    fetchUsers()
  }

  const toggleSelect = (id: number) => {
    const newSet = new Set(selectedIds)
    if (newSet.has(id)) newSet.delete(id)
    else newSet.add(id)
    setSelectedIds(newSet)
  }

  const handleSuccess = async () => {
    setOpen(false)
    setEditingUser(null)
    await fetchUsers()
  }

  return (
    <div className="max-w-4xl mx-auto py-10 px-4">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">User List</h1>
        <Avatar />
        <div className="flex items-center gap-2">
          <Button onClick={handleCreate}>+ Add User</Button>
          {selectedIds.size > 0 && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive">Delete Selected</Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>
                    Are you sure you want to delete {selectedIds.size} user{selectedIds.size > 1 ? 's' : ''}?
                  </AlertDialogTitle>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleBulkDelete}>
                    Yes, Delete
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
        </div>
      </div>
      <div className="flex items-center justify-between mb-4">
        <input
          type="text"
          placeholder="Search name/email..."
          className="border p-2 rounded w-64"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value)
            setPage(1) // reset to first page
          }}
        />

        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => {
              setSortBy('name')
              setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
            }}
          >
            Sort by Name ({sortOrder})
          </Button>
          <Button
            variant="outline"
            onClick={() => {
              setSortBy('email')
              setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
            }}
          >
            Sort by Email ({sortOrder})
          </Button>
        </div>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-10"></TableHead>
            <TableHead>Name</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Action</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {paginatedUsers.map((user) => (
            <TableRow key={user.id}>
              <TableCell>
                <Checkbox
                  checked={selectedIds.has(user.id)}
                  onCheckedChange={() => toggleSelect(user.id)}
                />
              </TableCell>
              <TableCell>{user.name}</TableCell>
              <TableCell>{user.email}</TableCell>
              <TableCell className="space-x-2">
                <Button size="sm" onClick={() => handleEdit(user)}>
                  Edit
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => handleDelete(user.id)}
                >
                  Delete
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <div className="mt-6 flex justify-between items-center">
        <div className="text-sm text-gray-600">
          Page {page} of {totalPages}
        </div>
        <div className="space-x-2">
          <Button
            variant="outline"
            disabled={page === 1}
            onClick={() => setPage(page - 1)}
          >
            Previous
          </Button>
          <Button
            variant="outline"
            disabled={page === totalPages}
            onClick={() => setPage(page + 1)}
          >
            Next
          </Button>
        </div>
      </div>


      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingUser ? 'Edit User' : 'Create User'}</DialogTitle>
          </DialogHeader>
          <EditForm
            id={editingUser?.id}
            initialData={{
              name: editingUser?.name || '',
              email: editingUser?.email || '',
              password: editingUser?.password || '',
            }}
            onSuccess={handleSuccess}
            submitText={editingUser ? 'Update' : 'Create'}
          />
        </DialogContent>
      </Dialog>
    </div>
  )
}
