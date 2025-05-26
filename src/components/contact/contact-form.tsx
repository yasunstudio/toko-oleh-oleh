'use client'

import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { ContactFormData } from '@/types/contact'
import { Mail, Phone, User, MessageSquare, Send, CheckCircle, AlertCircle } from 'lucide-react'

interface ContactFormProps {
  onSuccess?: () => void
}

export default function ContactForm({ onSuccess }: ContactFormProps) {
  const [formData, setFormData] = useState<ContactFormData>({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const [errorMessage, setErrorMessage] = useState('')

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const validateForm = (): boolean => {
    if (!formData.name.trim()) {
      setErrorMessage('Nama wajib diisi')
      return false
    }
    if (!formData.email.trim()) {
      setErrorMessage('Email wajib diisi')
      return false
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      setErrorMessage('Format email tidak valid')
      return false
    }
    if (!formData.subject.trim()) {
      setErrorMessage('Subjek wajib diisi')
      return false
    }
    if (!formData.message.trim()) {
      setErrorMessage('Pesan wajib diisi')
      return false
    }
    if (formData.message.trim().length < 10) {
      setErrorMessage('Pesan minimal 10 karakter')
      return false
    }
    return true
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMessage('')
    
    if (!validateForm()) {
      setSubmitStatus('error')
      return
    }

    setIsSubmitting(true)
    setSubmitStatus('idle')

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (response.ok && data.success) {
        setSubmitStatus('success')
        setFormData({
          name: '',
          email: '',
          phone: '',
          subject: '',
          message: ''
        })
        onSuccess?.()
      } else {
        setSubmitStatus('error')
        setErrorMessage(data.message || 'Terjadi kesalahan saat mengirim pesan')
      }
    } catch (error) {
      setSubmitStatus('error')
      setErrorMessage('Gagal mengirim pesan. Silakan coba lagi.')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (submitStatus === 'success') {
    return (
      <Card className="w-full bg-card border-border">
        <CardContent className="p-8 text-center">
          <CheckCircle className="w-16 h-16 text-green-500 dark:text-green-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold mb-2 text-foreground">Pesan Berhasil Dikirim!</h3>
          <p className="text-muted-foreground mb-4">
            Terima kasih telah menghubungi kami. Kami akan membalas pesan Anda dalam 1x24 jam.
          </p>
          <Button
            onClick={() => setSubmitStatus('idle')}
            variant="outline"
            className="border-border hover:bg-accent hover:text-accent-foreground"
          >
            Kirim Pesan Lain
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="w-full bg-card border-border">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-foreground">
          <MessageSquare className="w-5 h-5 text-primary" />
          Kirim Pesan
        </CardTitle>
        <CardDescription className="text-muted-foreground">
          Isi formulir di bawah ini untuk menghubungi kami. Kami akan membalas pesan Anda sesegera mungkin.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Name Field */}
            <div className="space-y-2">
              <Label htmlFor="name" className="flex items-center gap-2 text-foreground">
                <User className="w-4 h-4 text-muted-foreground" />
                Nama Lengkap *
              </Label>
              <Input
                id="name"
                name="name"
                type="text"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="Masukkan nama lengkap"
                required
                disabled={isSubmitting}
                className="bg-background border-border placeholder:text-muted-foreground focus-visible:ring-ring"
              />
            </div>

            {/* Email Field */}
            <div className="space-y-2">
              <Label htmlFor="email" className="flex items-center gap-2 text-foreground">
                <Mail className="w-4 h-4 text-muted-foreground" />
                Email *
              </Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="contoh@email.com"
                required
                disabled={isSubmitting}
                className="bg-background border-border placeholder:text-muted-foreground focus-visible:ring-ring"
              />
            </div>
          </div>

          {/* Phone Field */}
          <div className="space-y-2">
            <Label htmlFor="phone" className="flex items-center gap-2 text-foreground">
              <Phone className="w-4 h-4 text-muted-foreground" />
              Nomor Telepon (Opsional)
            </Label>
            <Input
              id="phone"
              name="phone"
              type="tel"
              value={formData.phone}
              onChange={handleInputChange}
              placeholder="08xxxxxxxxxx"
              disabled={isSubmitting}
              className="bg-background border-border placeholder:text-muted-foreground focus-visible:ring-ring"
            />
          </div>

          {/* Subject Field */}
          <div className="space-y-2">
            <Label htmlFor="subject" className="text-foreground">
              Subjek *
            </Label>
            <Input
              id="subject"
              name="subject"
              type="text"
              value={formData.subject}
              onChange={handleInputChange}
              placeholder="Masukkan subjek pesan"
              required
              disabled={isSubmitting}
              className="bg-background border-border placeholder:text-muted-foreground focus-visible:ring-ring"
            />
          </div>

          {/* Message Field */}
          <div className="space-y-2">
            <Label htmlFor="message" className="text-foreground">
              Pesan *
            </Label>
            <Textarea
              id="message"
              name="message"
              value={formData.message}
              onChange={handleInputChange}
              placeholder="Tulis pesan Anda di sini... (minimal 10 karakter)"
              rows={5}
              required
              disabled={isSubmitting}
              className="resize-none bg-background border-border placeholder:text-muted-foreground focus-visible:ring-ring"
            />
            <p className="text-sm text-muted-foreground">
              {formData.message.length}/500 karakter
            </p>
          </div>

          {/* Error Message */}
          {submitStatus === 'error' && (
            <div className="flex items-center gap-2 p-3 bg-destructive/10 border border-destructive/30 rounded-md">
              <AlertCircle className="w-5 h-5 text-destructive" />
              <p className="text-destructive text-sm">{errorMessage}</p>
            </div>
          )}

          {/* Submit Button */}
          <Button
            type="submit"
            disabled={isSubmitting}
            className="w-full"
            size="lg"
          >
            {isSubmitting ? (
              <>
                <div className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin mr-2" />
                Mengirim...
              </>
            ) : (
              <>
                <Send className="w-4 h-4 mr-2" />
                Kirim Pesan
              </>
            )}
          </Button>

          <p className="text-xs text-muted-foreground text-center">
            Dengan mengirim pesan ini, Anda menyetujui bahwa data yang Anda berikan akan digunakan untuk merespons pertanyaan Anda.
          </p>
        </form>
      </CardContent>
    </Card>
  )
}