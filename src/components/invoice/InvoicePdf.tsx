import { Buffer } from 'buffer'
import {
  Document,
  Image,
  Link,
  Page,
  StyleSheet,
  Text,
  View,
  pdf,
} from '@react-pdf/renderer'

if (typeof globalThis.Buffer === 'undefined') {
  globalThis.Buffer = Buffer
}
import dayjs from 'dayjs'
import {
  BILL_TO_ADDRESS_LABEL,
  BILL_TO_COMPANY_EMAIL_LABEL,
  BILL_TO_COMPANY_NAME_LABEL,
  BILL_TO_PHONE_LABEL,
  BILL_TO_SECTION_LABEL,
  COMPANY_ADDRESS_LINE_1,
  COMPANY_ADDRESS_LINE_2,
  COMPANY_EMAIL,
  COMPANY_EMAIL_HREF,
  COMPANY_NAME,
  COMPANY_PHONE,
  COMPANY_PHONE_LABEL,
  FROM_SECTION_LABEL,
  INVOICE_DATE_LABEL,
  INVOICE_NUMBER_LABEL,
  INVOICE_DATE_FORMAT,
  INVOICE_THEME_COLOR,
  THANK_YOU_MESSAGE,
  formatMoney,
  getInvoiceFileName,
  getInvoiceStatus,
  getInvoiceStatusLabel,
  getInvoiceTotalLabel,
  getItemAmount,
  getLogoDataUrl,
  getSubtotal,
  getTotal,
  INVOICE_STATUS_PAID,
} from '../../lib/invoice'
import type { InvoiceFormValues } from '../../lib/invoice'

const INK = '#1F2933'
const MUTED = '#6B7280'
const LINE = '#D1D5DB'
const LINK = '#0F6F76'
const PRINT_FRAME_READY_DELAY_MS = 500
const PRINT_DIALOG_BLOCKING_MS = 250
const PRINT_DIALOG_FOCUS_LISTENER_DELAY_MS = 300

const styles = StyleSheet.create({
  page: {
    paddingTop: 36,
    paddingHorizontal: 36,
    paddingBottom: 72,
    fontSize: 10,
    color: INK,
    fontFamily: 'Helvetica',
  },
  header: {
    backgroundColor: INVOICE_THEME_COLOR,
    color: INK,
    paddingHorizontal: 18,
    paddingVertical: 14,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginHorizontal: -36,
    marginTop: -36,
    marginBottom: 24,
  },
  logo: {
    width: 92,
    height: 54,
    objectFit: 'contain',
  },
  headerRight: {
    alignItems: 'flex-end',
    gap: 8,
  },
  invoiceTitle: {
    fontSize: 28,
    letterSpacing: 1.2,
    fontFamily: 'Helvetica-Bold',
  },
  statusBadge: {
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  statusPaid: {
    backgroundColor: '#DCFCE7',
  },
  statusDue: {
    backgroundColor: '#FEF3C7',
  },
  statusPaidText: {
    color: '#15803D',
    fontFamily: 'Helvetica-Bold',
    fontSize: 11,
  },
  statusDueText: {
    color: '#B45309',
    fontFamily: 'Helvetica-Bold',
    fontSize: 11,
  },
  section: {
    marginBottom: 18,
  },
  sectionTitle: {
    fontSize: 9,
    fontFamily: 'Helvetica-Bold',
    letterSpacing: 0.8,
    color: MUTED,
    marginBottom: 6,
  },
  companyName: {
    fontSize: 12,
    fontFamily: 'Helvetica-Bold',
    marginBottom: 3,
  },
  detailLine: {
    marginBottom: 2,
    color: MUTED,
  },
  fieldLabel: {
    fontFamily: 'Helvetica-Bold',
    color: INK,
  },
  emailLink: {
    color: LINK,
    textDecoration: 'underline',
    marginTop: 2,
  },
  billToLine: {
    marginBottom: 3,
    color: MUTED,
  },
  invoiceDetails: {
    flexDirection: 'row',
    gap: 32,
    marginBottom: 18,
  },
  detailLabel: {
    color: MUTED,
    marginBottom: 2,
  },
  tableHeader: {
    backgroundColor: INVOICE_THEME_COLOR,
    color: INK,
    flexDirection: 'row',
    paddingVertical: 7,
    paddingHorizontal: 8,
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: 8,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: LINE,
  },
  colQty: { width: '14%' },
  colDesc: { width: '46%' },
  colPrice: { width: '20%', textAlign: 'right' },
  colAmount: { width: '20%', textAlign: 'right' },
  headerCell: {
    color: INK,
    fontFamily: 'Helvetica-Bold',
  },
  totals: {
    marginTop: 16,
    width: 220,
    alignSelf: 'flex-end',
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  balanceRow: {
    backgroundColor: INVOICE_THEME_COLOR,
    color: INK,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    paddingHorizontal: 8,
    marginTop: 4,
  },
  note: {
    marginTop: 22,
    color: MUTED,
  },
  footer: {
    position: 'absolute',
    bottom: 24,
    left: 36,
    right: 36,
    textAlign: 'center',
    color: INK,
    fontFamily: 'Helvetica-Oblique',
  },
})

function BillToField({ label, value }: { label: string; value: string }) {
  return (
    <Text style={styles.billToLine}>
      <Text style={styles.fieldLabel}>{label}: </Text>
      {value}
    </Text>
  )
}

type InvoicePdfDocumentProps = {
  values: InvoiceFormValues
  logoSrc: string
}

export function InvoicePdfDocument({
  values,
  logoSrc,
}: InvoicePdfDocumentProps) {
  const subtotal = getSubtotal(values.items)
  const shipping = Number(values.shipping) || 0
  const total = getTotal(values.items, values.shipping)
  const formattedDate = values.date
    ? dayjs(values.date).format(INVOICE_DATE_FORMAT)
    : ''
  const status = getInvoiceStatus(values.status)
  const isPaid = status === INVOICE_STATUS_PAID

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          {logoSrc ? <Image src={logoSrc} style={styles.logo} /> : <View />}
          <View style={styles.headerRight}>
            <Text style={styles.invoiceTitle}>INVOICE</Text>
            <View style={[styles.statusBadge, isPaid ? styles.statusPaid : styles.statusDue]}>
              <Text style={isPaid ? styles.statusPaidText : styles.statusDueText}>
                {getInvoiceStatusLabel(status)}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{FROM_SECTION_LABEL}</Text>
          <Text style={styles.companyName}>{COMPANY_NAME}</Text>
          <Text style={styles.detailLine}>{COMPANY_ADDRESS_LINE_1}</Text>
          <Text style={styles.detailLine}>{COMPANY_ADDRESS_LINE_2}</Text>
          <Text style={styles.detailLine}>
            <Text style={styles.fieldLabel}>{COMPANY_PHONE_LABEL}: </Text>
            {COMPANY_PHONE}
          </Text>
          <Link src={COMPANY_EMAIL_HREF} style={styles.emailLink}>
            {COMPANY_EMAIL}
          </Link>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{BILL_TO_SECTION_LABEL}</Text>
          <BillToField
            label={BILL_TO_COMPANY_NAME_LABEL}
            value={values.customerName}
          />
          <BillToField
            label={BILL_TO_COMPANY_EMAIL_LABEL}
            value={values.customerEmail}
          />
          <BillToField
            label={BILL_TO_ADDRESS_LABEL}
            value={values.customerAddress}
          />
          <BillToField
            label={BILL_TO_PHONE_LABEL}
            value={values.customerPhone}
          />
        </View>

        <View style={styles.invoiceDetails}>
          <View>
            <Text style={styles.detailLabel}>{INVOICE_DATE_LABEL}</Text>
            <Text>{formattedDate}</Text>
          </View>
          <View>
            <Text style={styles.detailLabel}>{INVOICE_NUMBER_LABEL}</Text>
            <Text>{values.invoiceNumber}</Text>
          </View>
        </View>

        <View style={styles.tableHeader}>
          <Text style={[styles.colQty, styles.headerCell]}>Quantity</Text>
          <Text style={[styles.colDesc, styles.headerCell]}>Description</Text>
          <Text style={[styles.colPrice, styles.headerCell]}>Unit price</Text>
          <Text style={[styles.colAmount, styles.headerCell]}>Amount</Text>
        </View>

        {values.items.map((item) => (
          <View key={item.id} style={styles.tableRow}>
            <Text style={styles.colQty}>{item.quantity || 0}</Text>
            <Text style={styles.colDesc}>{item.name}</Text>
            <Text style={styles.colPrice}>
              {formatMoney(Number(item.price) || 0, values.currency)}
            </Text>
            <Text style={styles.colAmount}>
              {formatMoney(getItemAmount(item), values.currency)}
            </Text>
          </View>
        ))}

        <View style={styles.totals}>
          <View style={styles.totalRow}>
            <Text>Subtotal</Text>
            <Text>{formatMoney(subtotal, values.currency)}</Text>
          </View>
          <View style={styles.totalRow}>
            <Text>Shipping</Text>
            <Text>{formatMoney(shipping, values.currency)}</Text>
          </View>
          <View style={styles.balanceRow}>
            <Text>{getInvoiceTotalLabel(status)}</Text>
            <Text>{formatMoney(total, values.currency)}</Text>
          </View>
        </View>

        {values.note ? (
          <View style={styles.note}>
            <Text>{values.note}</Text>
          </View>
        ) : null}

        <Text style={styles.footer}>{THANK_YOU_MESSAGE}</Text>
      </Page>
    </Document>
  )
}

async function buildInvoicePdfBlob(values: InvoiceFormValues) {
  const logoSrc = await getLogoDataUrl()
  return pdf(<InvoicePdfDocument values={values} logoSrc={logoSrc} />).toBlob()
}

export async function downloadInvoicePdf(values: InvoiceFormValues) {
  const blob = await buildInvoicePdfBlob(values)
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = getInvoiceFileName(values.invoiceNumber)
  link.click()
  URL.revokeObjectURL(url)
}

function printFrameAndWaitForDialog(printWindow: Window) {
  return new Promise<void>((resolve) => {
    let settled = false
    let focusListenerId = 0

    const finish = () => {
      if (settled) {
        return
      }

      settled = true
      window.clearTimeout(focusListenerId)
      printWindow.removeEventListener('afterprint', finish)
      window.removeEventListener('afterprint', finish)
      printWindow.removeEventListener('focus', finish)
      window.removeEventListener('focus', finish)
      resolve()
    }

    printWindow.addEventListener('afterprint', finish)
    window.addEventListener('afterprint', finish)

    const startedAt = performance.now()
    printWindow.focus()
    printWindow.print()

    // Windows keeps the page script paused until the dialog closes, and a PDF
    // frame often never emits afterprint. A slow return means that dialog is done.
    if (performance.now() - startedAt >= PRINT_DIALOG_BLOCKING_MS) {
      finish()
      return
    }

    focusListenerId = window.setTimeout(() => {
      if (settled) {
        return
      }

      printWindow.addEventListener('focus', finish)
      window.addEventListener('focus', finish)
    }, PRINT_DIALOG_FOCUS_LISTENER_DELAY_MS)
  })
}

export async function printInvoicePdf(values: InvoiceFormValues) {
  const blob = await buildInvoicePdfBlob(values)
  const url = URL.createObjectURL(blob)
  const iframe = document.createElement('iframe')
  iframe.setAttribute('aria-hidden', 'true')
  iframe.style.position = 'fixed'
  iframe.style.right = '0'
  iframe.style.bottom = '0'
  iframe.style.width = '0'
  iframe.style.height = '0'
  iframe.style.border = '0'
  iframe.src = url
  document.body.appendChild(iframe)

  const cleanup = () => {
    iframe.remove()
    URL.revokeObjectURL(url)
  }

  try {
    await new Promise<void>((resolve, reject) => {
      iframe.addEventListener('load', () => {
        window.setTimeout(() => {
          const printWindow = iframe.contentWindow
          if (!printWindow) {
            reject(new Error('Print frame was not available'))
            return
          }

          void printFrameAndWaitForDialog(printWindow).then(resolve)
        }, PRINT_FRAME_READY_DELAY_MS)
      })
    })
  } finally {
    cleanup()
  }
}
