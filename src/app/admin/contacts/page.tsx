'use client'

import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Contact, ContactStatus } from '@/types/contact'
import { Search, Mail, Phone, Calendar, MessageSquare, Reply, Trash2, Eye, Filter, RefreshCw } from 'lucide-react'
import { format } from 'date-fns'
import { id } from 'date-fns/locale'
import { AdminBreadcrumb } from '@/components/admin/admin-breadcrumb'

export default function AdminContactPage() {
  const [contacts, setContacts] = useState<Contact[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('ALL')
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null)
  const [replyText, setReplyText] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0
  })

  const fetchContacts = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
      })
      
      if (statusFilter !== 'ALL') {
        params.append('status', statusFilter)
      }
      
      if (searchTerm) {
        params.append('search', searchTerm)
      }

      const response = await fetch(`/api/contact?${params}`)
      const data = await response.json()

      if (data.success) {
        setContacts(data.data)
        setPagination(prev => ({
          ...prev,
          total: data.total
        }))
      }
    } catch (error) {
      console.error('Error fetching contacts:', error)
    } finally {
      setLoading(false)
    }
  }

  const updateContactStatus = async (contactId: string, status: ContactStatus, adminReply?: string) => {
    try {
      setSubmitting(true)
      const response = await fetch(`/api/contact/${contactId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status, adminReply }),
      })

      const data = await response.json()

      if (data.success) {
        fetchContacts()
        if (selectedContact?.id === contactId) {
          setSelectedContact(data.data)
        }
        setReplyText('')
      }
    } catch (error) {
      console.error('Error updating contact:', error)
    } finally {
      setSubmitting(false)
    }
  }

  const deleteContact = async (contactId: string) => {
    if (!confirm('Apakah Anda yakin ingin menghapus kontak ini?')) {
      return
    }

    try {
      const response = await fetch(`/api/contact/${contactId}`, {
        method: 'DELETE',
      })

      const data = await response.json()

      if (data.success) {
        fetchContacts()
        setSelectedContact(null)
      }
    } catch (error) {
      console.error('Error deleting contact:', error)
    }
  }

  const getStatusBadge = (status: ContactStatus) => {
    const variants = {
      UNREAD: 'destructive',
      READ: 'secondary',
      REPLIED: 'default',
      CLOSED: 'outline'
    } as const

    const labels = {
      UNREAD: 'Belum Dibaca',
      READ: 'Sudah Dibaca',
      REPLIED: 'Sudah Dibalas',
      CLOSED: 'Ditutup'
    }

    return (
      <Badge variant={variants[status]}>
        {labels[status]}
      </Badge>
    )
  }

  useEffect(() => {
    fetchContacts()
  }, [pagination.page, statusFilter, searchTerm])

  const handleSearch = (value: string) => {
    setSearchTerm(value)
    setPagination(prev => ({ ...prev, page: 1 }))
  }

  const handleStatusFilter = (value: string) => {
    setStatusFilter(value)
    setPagination(prev => ({ ...prev, page: 1 }))
  }

  return (
    <div className="p-3 space-y-3">
      <AdminBreadcrumb 
        items={[
          { label: 'Manajemen Kontak' }
        ]} 
      />
      
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-xl font-bold text-foreground">Manajemen Kontak</h1>
          <p className="text-xs text-muted-foreground">Kelola pesan dari pelanggan</p>
        </div>
        <Button onClick={fetchContacts} variant="outline">
          <RefreshCw className="w-4 h-4 mr-2" />
          Refresh
        </Button>
      </div>
      {/* Filters */}
      <Card className="bg-card border-border">
        <CardContent className="p-3">
          <div className="flex flex-col md:flex-row gap-3">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder="Cari berdasarkan nama, email, subjek, atau pesan..."
                  value={searchTerm}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="w-full md:w-48">
              <Select value={statusFilter} onValueChange={handleStatusFilter}>
                <SelectTrigger>
                  <Filter className="w-4 h-4 mr-2" />
                  <SelectValue placeholder="Filter Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">Semua Status</SelectItem>
                  <SelectItem value="UNREAD">Belum Dibaca</SelectItem>
                  <SelectItem value="READ">Sudah Dibaca</SelectItem>
                  <SelectItem value="REPLIED">Sudah Dibalas</SelectItem>
                  <SelectItem value="CLOSED">Ditutup</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>
      {/* Contact List */}
      <div className="grid gap-3">
        {loading ? (
          <Card className="bg-card border-border">
            <CardContent className="text-center py-6">
              <div className="inline-block w-6 h-6 border-4 border-orange-200 border-t-orange-600 rounded-full animate-spin"></div>
              <p className="mt-2 text-sm text-muted-foreground">Memuat kontak...</p>
            </CardContent>
          </Card>
        ) : contacts.length === 0 ? (
          <Card className="bg-card border-border">
            <CardContent className="text-center py-6">
              <Mail className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
              <p className="text-sm text-muted-foreground">Tidak ada kontak ditemukan</p>
            </CardContent>
          </Card>
        ) : (
          contacts.map((contact) => (
            <Card key={contact.id} className="hover:shadow-md transition-shadow bg-card border-border">
              <CardContent className="p-3">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-semibold text-base text-foreground">{contact.name}</h3>
                      {getStatusBadge(contact.status)}
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-1 text-xs text-muted-foreground mb-2">
                      <div className="flex items-center gap-2">
                        <Mail className="w-3 h-3" />
                        {contact.email}
                      </div>
                      {contact.phone && (
                        <div className="flex items-center gap-2">
                          <Phone className="w-3 h-3" />
                          {contact.phone}
                        </div>
                      )}
                      <div className="flex items-center gap-2">
                        <Calendar className="w-3 h-3" />
                        {format(new Date(contact.createdAt), 'dd MMM yyyy HH:mm', { locale: id })}
                      </div>
                      <div className="flex items-center gap-2">
                        <MessageSquare className="w-3 h-3" />
                        {contact.subject}
                      </div>
                    </div>
                    <Card className="bg-muted border-0 shadow-none mb-2">
                      <CardContent className="p-2 text-sm text-foreground line-clamp-2">
                        {contact.message}
                      </CardContent>
                    </Card>
                  </div>
                  <div className="flex gap-2">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-7 w-7 p-0"
                          onClick={() => {
                            setSelectedContact(contact)
                            if (contact.status === ContactStatus.UNREAD) {
                              updateContactStatus(contact.id, ContactStatus.READ)
                            }
                          }}
                        >
                          <Eye className="w-3 h-3" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto bg-card border-border">
                        <DialogHeader>
                          <DialogTitle className="text-foreground">Detail Kontak</DialogTitle>
                          <DialogDescription className="text-muted-foreground">
                            Lihat detail dan balas pesan dari {contact.name}
                          </DialogDescription>
                        </DialogHeader>
                        {selectedContact && (
                          <div className="space-y-6">
                            {/* Contact Info */}
                            <Card className="bg-muted border-0 shadow-none">
                              <CardContent className="grid grid-cols-2 gap-4 p-4">
                                <div>
                                  <Label className="text-sm font-medium text-foreground">Nama</Label>
                                  <p className="text-sm text-muted-foreground">{selectedContact.name}</p>
                                </div>
                                <div>
                                  <Label className="text-sm font-medium text-foreground">Email</Label>
                                  <p className="text-sm text-muted-foreground">{selectedContact.email}</p>
                                </div>
                                {selectedContact.phone && (
                                  <div>
                                    <Label className="text-sm font-medium text-foreground">Telepon</Label>
                                    <p className="text-sm text-muted-foreground">{selectedContact.phone}</p>
                                  </div>
                                )}
                                <div>
                                  <Label className="text-sm font-medium text-foreground">Status</Label>
                                  <div className="mt-1">{getStatusBadge(selectedContact.status)}</div>
                                </div>
                              </CardContent>
                            </Card>
                            {/* Subject */}
                            <Card className="bg-muted border-0 shadow-none">
                              <CardContent>
                                <Label className="text-sm font-medium text-foreground">Subjek</Label>
                                <p className="text-sm mt-1 p-3 rounded text-muted-foreground">{selectedContact.subject}</p>
                              </CardContent>
                            </Card>
                            {/* Message */}
                            <Card className="bg-muted border-0 shadow-none">
                              <CardContent>
                                <Label className="text-sm font-medium text-foreground">Pesan</Label>
                                <p className="text-sm mt-1 p-3 rounded whitespace-pre-wrap text-muted-foreground">{selectedContact.message}</p>
                              </CardContent>
                            </Card>
                            {/* Existing Reply */}
                            {selectedContact.adminReply && (
                              <Card className="bg-blue-50 border border-blue-200 shadow-none">
                                <CardContent>
                                  <Label className="text-sm font-medium text-blue-900">Balasan Admin</Label>
                                  <p className="text-sm mt-1 p-3 rounded text-blue-900">{selectedContact.adminReply}</p>
                                </CardContent>
                              </Card>
                            )}
                            {/* Reply Form */}
                            <Card className="border-0 shadow-none bg-card">
                              <CardContent>
                                <Label htmlFor="reply" className="text-sm font-medium text-foreground">Balasan</Label>
                                <Textarea
                                  id="reply"
                                  value={replyText}
                                  onChange={(e) => setReplyText(e.target.value)}
                                  placeholder="Tulis balasan Anda..."
                                  rows={4}
                                  className="mt-1 bg-card text-foreground border-border"
                                />
                              </CardContent>
                            </Card>
                            {/* Action Buttons */}
                            <div className="flex gap-2">
                              <Button
                                onClick={() => updateContactStatus(selectedContact.id, ContactStatus.REPLIED, replyText)}
                                disabled={!replyText.trim() || submitting}
                                className="flex-1"
                              >
                                <Reply className="w-4 h-4 mr-2" />
                                {submitting ? 'Mengirim...' : 'Kirim Balasan'}
                              </Button>
                              <Select
                                value={selectedContact.status}
                                onValueChange={(value) => updateContactStatus(selectedContact.id, value as ContactStatus)}
                              >
                                <SelectTrigger className="w-40 bg-card text-foreground border-border">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent className="bg-card text-foreground border-border">
                                  <SelectItem value={ContactStatus.UNREAD}>Belum Dibaca</SelectItem>
                                  <SelectItem value={ContactStatus.READ}>Sudah Dibaca</SelectItem>
                                  <SelectItem value={ContactStatus.REPLIED}>Sudah Dibalas</SelectItem>
                                  <SelectItem value={ContactStatus.CLOSED}>Ditutup</SelectItem>
                                </SelectContent>
                              </Select>
                              <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => deleteContact(selectedContact.id)}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        )}
                      </DialogContent>
                    </Dialog>
                    <Button
                      variant="destructive"
                      size="sm"
                      className="h-7 w-7 p-0"
                      onClick={() => deleteContact(contact.id)}
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
      {/* Pagination */}
      {pagination.total > pagination.limit && (
        <Card className="mt-8 bg-card border-border">
          <CardContent className="flex justify-center">
            <div className="flex gap-2">
              <Button
                variant="outline"
                disabled={pagination.page === 1}
                onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                className="bg-card text-foreground border-border"
              >
                Sebelumnya
              </Button>
              <span className="flex items-center px-4 py-2 text-sm text-foreground">
                Halaman {pagination.page} dari {Math.ceil(pagination.total / pagination.limit)}
              </span>
              <Button
                variant="outline"
                disabled={pagination.page >= Math.ceil(pagination.total / pagination.limit)}
                onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                className="bg-card text-foreground border-border"
              >
                Selanjutnya
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
