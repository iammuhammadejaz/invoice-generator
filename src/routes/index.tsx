import { FilePdfOutlined, PrinterOutlined } from '@ant-design/icons'
import { createFileRoute } from '@tanstack/react-router'
import { App, Button, Form } from 'antd'
import { useEffect, useState } from 'react'
import InvoiceForm from '../components/invoice/InvoiceForm'
import { createDefaultInvoiceValues } from '../lib/invoice'
import type { InvoiceFormValues } from '../lib/invoice'

export const Route = createFileRoute('/')({ component: InvoicePage })

function InvoicePage() {
  const { message } = App.useApp()
  const [form] = Form.useForm<InvoiceFormValues>()
  const [isReady, setIsReady] = useState(false)
  const [values, setValues] = useState<InvoiceFormValues>(
    createDefaultInvoiceValues,
  )
  const [isPrinting, setIsPrinting] = useState(false)
  const [isDownloading, setIsDownloading] = useState(false)

  useEffect(() => {
    setIsReady(true)
  }, [])

  async function validateInvoice() {
    await form.validateFields()
    return form.getFieldsValue(true) as InvoiceFormValues
  }

  async function handlePrint() {
    let invoiceValues: InvoiceFormValues
    try {
      invoiceValues = await validateInvoice()
    } catch {
      return
    }

    setIsPrinting(true)
    try {
      const { printInvoicePdf } = await import('../components/invoice/InvoicePdf')
      await printInvoicePdf(invoiceValues)
    } catch {
      message.error('Could not print the invoice.')
    } finally {
      setIsPrinting(false)
    }
  }

  async function handleDownload() {
    let invoiceValues: InvoiceFormValues
    try {
      invoiceValues = await validateInvoice()
    } catch {
      return
    }

    setIsDownloading(true)
    try {
      const { downloadInvoicePdf } = await import(
        '../components/invoice/InvoicePdf'
      )
      await downloadInvoicePdf(invoiceValues)
    } catch {
      message.error('Could not download the invoice PDF.')
    } finally {
      setIsDownloading(false)
    }
  }

  if (!isReady) {
    return <main className="invoice-page" />
  }

  return (
    <main className="invoice-page">
      <section className="invoice-card">
        <InvoiceForm form={form} values={values} onValuesChange={setValues} />

        <div className="invoice-actions">
          <Button
            className="invoice-btn-print"
            size="large"
            icon={<PrinterOutlined />}
            loading={isPrinting}
            onClick={handlePrint}
          >
            Print
          </Button>
          <Button
            type="primary"
            size="large"
            icon={<FilePdfOutlined />}
            loading={isDownloading}
            onClick={handleDownload}
          >
            Download PDF
          </Button>
        </div>
      </section>
    </main>
  )
}
