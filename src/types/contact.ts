import { Contact as PrismaContact, ContactStatus } from '@prisma/client'

// Re-export Prisma Contact type directly
export type Contact = PrismaContact

// Re-export Prisma ContactStatus enum
export { ContactStatus }

export interface ContactFormData {
  name: string
  email: string
  phone?: string
  subject: string
  message: string
}

export interface ContactResponse {
  success: boolean
  message: string
  data?: Contact
}

export interface ContactListResponse {
  success: boolean
  data: Contact[]
  total: number
  page: number
  limit: number
}
