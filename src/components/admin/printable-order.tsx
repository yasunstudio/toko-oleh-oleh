'use client'

import { useRef, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Printer, Loader2 } from 'lucide-react'

interface PrintableOrderProps {
  order: {
    id: string
    orderNumber: string
    status: string
    totalAmount: number
    paymentStatus: string
    shippingAddress: string
    notes?: string | null
    createdAt: string
    user: {
      name: string
      email: string
      phone?: string | null
    }
    orderItems: Array<{
      id: string
      product: {
        name: string
      }
      quantity: number
      price: number
    }>
    paymentProof?: string // add this line for payment proof image
  }
}

export function PrintableOrder({ order }: PrintableOrderProps) {
  const printRef = useRef<HTMLDivElement>(null)
  const [isPrinting, setIsPrinting] = useState(false)

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR'
    }).format(price)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const handlePrint = () => {
    if (isPrinting || !printRef.current) return
    setIsPrinting(true)
    
    setTimeout(() => {
      try {
        const printWindow = window.open('', '_blank')
        if (!printWindow) {
          setIsPrinting(false)
          return
        }

        const printContent = printRef.current!.innerHTML
        const styles = `
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { 
              font-family: 'Segoe UI', 'Arial', 'Helvetica', sans-serif; 
              font-size: 9pt; 
              line-height: 1.3; 
              color: #000; 
              background: white; 
              padding: 15px; 
              max-width: 210mm;
              margin: 0 auto;
            }
            .print-header { 
              text-align: center; 
              border-bottom: 2px solid #000; 
              padding-bottom: 12px; 
              margin-bottom: 18px; 
            }
            .print-header h1 { 
              font-family: 'Arial Black', 'Arial', sans-serif;
              font-size: 16pt; 
              font-weight: 900; 
              margin-bottom: 4px; 
              letter-spacing: 1px;
              color: #000;
            }
            .print-header h2 { 
              font-family: 'Arial', sans-serif;
              font-size: 12pt; 
              font-weight: 600;
              margin-bottom: 4px; 
              color: #333;
            }
            .print-header p { 
              font-size: 8pt; 
              color: #666; 
              font-weight: 400;
            }
            .print-section { margin-bottom: 15px; page-break-inside: avoid; }
            .print-section h3 { 
              font-family: 'Arial', sans-serif;
              font-size: 10pt; 
              font-weight: 700; 
              border-bottom: 1px solid #333; 
              padding-bottom: 3px; 
              margin-bottom: 6px; 
              color: #000;
            }
            .info-container { 
              display: flex; 
              gap: 20px; 
              margin-bottom: 15px; 
            }
            .info-section { 
              flex: 1; 
              page-break-inside: avoid; 
            }
            .info-table { width: 100%; font-size: 8pt; border-collapse: collapse; }
            .info-table td { padding: 1px 0; vertical-align: top; }
            .info-table .label { width: 42%; font-weight: 600; color: #333; }
            .print-table { 
              width: 100%; 
              border-collapse: collapse; 
              margin-top: 8px; 
              font-size: 8pt;
              font-family: 'Arial', sans-serif; 
            }
            .print-table th, .print-table td { 
              border: 1px solid #333; 
              padding: 4px 6px; 
              text-align: left; 
            }
            .print-table th { 
              background-color: #f5f5f5; 
              font-weight: 700; 
              text-align: center; 
              font-size: 8pt;
              color: #000;
            }
            .print-table .number { text-align: center; }
            .print-table .price { text-align: right; font-weight: 500; }
            .total-row { font-weight: 700; border-top: 2px solid #000 !important; background-color: #f9f9f9; }
            .total-row td { padding: 6px !important; font-size: 9pt; }
            .print-footer { 
              margin-top: 18px; 
              border-top: 1px solid #333; 
              padding-top: 8px; 
              text-align: center; 
              font-size: 7pt; 
              color: #666;
              font-family: 'Arial', sans-serif;
            }
            @media print { 
              body { 
                margin: 0; 
                padding: 20mm; 
                -webkit-print-color-adjust: exact;
                print-color-adjust: exact;
              } 
              .print-section { 
                page-break-inside: avoid; 
                orphans: 3;
                widows: 3;
              }
              .info-container {
                display: flex;
                gap: 30px;
              }
              .info-section {
                flex: 1;
              }
              .print-table {
                page-break-inside: auto;
              }
              .print-table tr {
                page-break-inside: avoid;
                page-break-after: auto;
              }
            }
          </style>
        `

        printWindow.document.write(`
          <!DOCTYPE html>
          <html lang="id">
            <head>
              <meta charset="UTF-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
              <title>Pesanan ${order.orderNumber} - Toko Oleh-Oleh</title>
              ${styles}
            </head>
            <body>
              ${printContent}
            </body>
          </html>
        `)

        printWindow.document.close()
        printWindow.onload = () => {
          printWindow.print()
          printWindow.close()
          setIsPrinting(false)
        }
        
      } catch (error) {
        console.error('Error during printing:', error)
        setIsPrinting(false)
      }
    }, 100)
  }

  return (
    <>
      <Button 
        variant="outline" 
        size="sm" 
        className="flex items-center gap-2"
        onClick={handlePrint}
        disabled={isPrinting}
      >
        {isPrinting ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Menyiapkan...
          </>
        ) : (
          <>
            <Printer className="h-4 w-4" />
            Cetak
          </>
        )}
      </Button>

      <div ref={printRef} style={{ display: 'none' }}>
        <div className="print-header">
          <h1>TOKO OLEH-OLEH</h1>
          <h2>Detail Pesanan #{order.orderNumber}</h2>
          <p>Dicetak pada: {formatDate(new Date().toISOString())}</p>
        </div>

        <div className="info-container">
          <div className="info-section">
            <h3>Informasi Pesanan</h3>
            <table className="info-table">
              <tbody>
                <tr>
                  <td className="label">Nomor Pesanan:</td>
                  <td>{order.orderNumber}</td>
                </tr>
                <tr>
                  <td className="label">Tanggal Pesanan:</td>
                  <td>{formatDate(order.createdAt)}</td>
                </tr>
                <tr>
                  <td className="label">Status Pesanan:</td>
                  <td>{order.status}</td>
                </tr>
                <tr>
                  <td className="label">Status Pembayaran:</td>
                  <td>{order.paymentStatus}</td>
                </tr>
                <tr>
                  <td className="label">Total Pembayaran:</td>
                  <td style={{ fontWeight: '700', fontSize: '11pt', color: '#000' }}>{formatPrice(order.totalAmount)}</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="info-section">
            <h3>Informasi Pelanggan</h3>
            <table className="info-table">
              <tbody>
                <tr>
                  <td className="label">Nama:</td>
                  <td>{order.user.name}</td>
                </tr>
                <tr>
                  <td className="label">Email:</td>
                  <td>{order.user.email}</td>
                </tr>
                {order.user.phone && (
                  <tr>
                    <td className="label">Telepon:</td>
                    <td>{order.user.phone}</td>
                  </tr>
                )}
                <tr>
                  <td className="label">Alamat Pengiriman:</td>
                  <td>{order.shippingAddress}</td>
                </tr>
                {order.notes && (
                  <tr>
                    <td className="label">Catatan:</td>
                    <td>{order.notes}</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="print-section">
          <h3>Detail Produk</h3>
          <table className="print-table">
            <thead>
              <tr>
                <th style={{ width: '8%' }}>No</th>
                <th style={{ width: '40%' }}>Nama Produk</th>
                <th style={{ width: '20%' }}>Harga Satuan</th>
                <th style={{ width: '12%' }}>Jumlah</th>
                <th style={{ width: '20%' }}>Subtotal</th>
              </tr>
            </thead>
            <tbody>
              {order.orderItems.map((item, index) => (
                <tr key={item.id}>
                  <td className="number">{index + 1}</td>
                  <td>{item.product.name}</td>
                  <td className="price">{formatPrice(item.price)}</td>
                  <td className="number">{item.quantity}</td>
                  <td className="price">{formatPrice(item.price * item.quantity)}</td>
                </tr>
              ))}
              <tr className="total-row">
                <td colSpan={4} style={{ textAlign: 'right' }}>TOTAL:</td>
                <td className="price">{formatPrice(order.totalAmount)}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="print-footer">
          <p><strong>Dokumen ini dicetak secara otomatis dari sistem Toko Oleh-Oleh</strong></p>
          <p>Halaman ini dapat digunakan sebagai bukti pesanan yang sah</p>
          <p style={{ marginTop: '8px', fontSize: '8pt' }}>
            Dicetak pada: {formatDate(new Date().toISOString())} | 
            Pesanan #{order.orderNumber} | 
            © {new Date().getFullYear()} Toko Oleh-Oleh
          </p>
        </div>
      </div>
    </>
  )
}
