'use server'

import { prisma } from '@/lib/prisma'
import { userSchema, UserInput } from '@/schemas/user'
import { hash } from 'bcrypt'


export async function getUsers() {
  return await prisma.user.findMany({
    orderBy: { createdAt: 'desc' }
  })
}

export async function updateUser(id: number, data: unknown) {
  const result = userSchema.safeParse(data)
  if (!result.success) {
    throw new Error(JSON.stringify(result.error.format()))
  }

  const { name, email, password } = result.data

  // Prepare the data object for update
  const updateData: any = {
    name,
    email,
  }

  // Only hash and include the password if it's provided
  if (password) {
    const hashedPassword = await hash(password, 10)
    updateData.password = hashedPassword
  }

  return await prisma.user.update({
    where: { id },
    data: updateData,
  })
}


export async function createUser(data: unknown) {
  const result = userSchema.safeParse(data)
  if (!result.success) throw new Error(JSON.stringify(result.error.format()))

  const { name, email, password } = result.data

  // Ensure password is always a string
  const hashedPassword = password ? await hash(password, 10) : ''

  // Create user in the database without including `id`
  return await prisma.user.create({
    data: {
      name,
      email,
      password: hashedPassword, // Ensure password is never undefined
    }
  })
}

export async function deleteUser(id: number) {
  return await prisma.user.delete({ where: { id } })
}
