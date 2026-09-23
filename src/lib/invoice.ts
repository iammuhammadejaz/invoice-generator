export const LOGO_PATH = '/logo.svg'
export const DEFAULT_CURRENCY = 'USD'
export const DEFAULT_ITEM_QUANTITY = 1
export const MIN_ITEM_QUANTITY = 1
export const MAX_ITEM_QUANTITY = 9999
export const MIN_ITEM_PRICE = 0.01
export const MAX_ITEM_PRICE = 999999.99
export const MAX_ITEM_QUANTITY_MESSAGE = `Enter a quantity of ${MAX_ITEM_QUANTITY} or less`
export const MAX_ITEM_PRICE_MESSAGE = `Enter an amount of ${MAX_ITEM_PRICE} or less`
export const MAX_NOTE_LENGTH = 500
export const MAX_NOTE_LENGTH_MESSAGE = `Enter a note of ${MAX_NOTE_LENGTH} characters or less`
export const THANK_YOU_MESSAGE = 'Thank you for your business!'
export const INVOICE_DATE_FORMAT = 'DD-MMM-YYYY'
export const INVOICE_FORM_DATE_FORMAT = 'YYYY-MM-DD'
export const INVOICE_THEME_COLOR = '#70d0d9'
export const INVOICE_STATUS_PAID = 'paid'
export const INVOICE_STATUS_DUE = 'due'
export const DEFAULT_INVOICE_STATUS = INVOICE_STATUS_PAID
export const REQUIRED_FIELD_MESSAGE = 'This field is required'
export const VALID_EMAIL_MESSAGE = 'Enter a valid email address'
export const POSITIVE_NUMBER_MESSAGE = 'Enter a value greater than 0'

export const CURRENCIES = [
  { code: 'USD', symbol: '$', label: 'USD' },
  { code: 'EUR', symbol: '€', label: 'EUR' },
  { code: 'GBP', symbol: '£', label: 'GBP' },
  { code: 'PKR', symbol: 'Rs', label: 'PKR' },
  { code: 'INR', symbol: '₹', label: 'INR' },
  { code: 'CAD', symbol: 'C$', label: 'CAD' },
  { code: 'AUD', symbol: 'A$', label: 'AUD' },
] as const

export type CurrencyCode = (typeof CURRENCIES)[number]['code']

export const INVOICE_STATUSES = [
  { value: INVOICE_STATUS_PAID, label: 'Paid' },
  { value: INVOICE_STATUS_DUE, label: 'Due' },
] as const

export type InvoiceStatus = (typeof INVOICE_STATUSES)[number]['value']

export type InvoiceItem = {
  id: string
  name: string
  quantity: number
  price: number | null
}

export type InvoiceFormValues = {
  companyName: string
  name: string
  email: string
  invoiceNumber: string
  date: string
  currency: CurrencyCode
  customerName: string
  customerEmail: string
  items: InvoiceItem[]
  note: string
  shipping: number | null
  status: InvoiceStatus
}

export function createEmptyItem(id = crypto.randomUUID()): InvoiceItem {
  return {
    id,
    name: '',
    quantity: DEFAULT_ITEM_QUANTITY,
    price: null,
  }
}

export function createDefaultInvoiceValues(): InvoiceFormValues {
  const today = new Date()
  const month = String(today.getMonth() + 1).padStart(2, '0')
  const day = String(today.getDate()).padStart(2, '0')

  return {
    companyName: '',
    name: '',
    email: '',
    invoiceNumber: '',
    date: `${today.getFullYear()}-${month}-${day}`,
    currency: DEFAULT_CURRENCY,
    customerName: '',
    customerEmail: '',
    items: [createEmptyItem('item-1')],
    note: '',
    shipping: null,
    status: DEFAULT_INVOICE_STATUS,
  }
}

export function getInvoiceStatus(status?: InvoiceStatus) {
  return status === INVOICE_STATUS_DUE ? INVOICE_STATUS_DUE : INVOICE_STATUS_PAID
}

export function getInvoiceStatusLabel(status?: InvoiceStatus) {
  const resolvedStatus = getInvoiceStatus(status)
  return (
    INVOICE_STATUSES.find((item) => item.value === resolvedStatus)?.label ??
    'Paid'
  )
}

export function getCurrency(code: CurrencyCode) {
  return CURRENCIES.find((currency) => currency.code === code) ?? CURRENCIES[0]
}

export function getItemAmount(item: InvoiceItem) {
  const quantity = Number(item.quantity) || 0
  const price = Number(item.price) || 0
  return quantity * price
}

export function getSubtotal(items: InvoiceItem[]) {
  return items.reduce((sum, item) => sum + getItemAmount(item), 0)
}

export function getTotal(items: InvoiceItem[], shipping: number | null) {
  return getSubtotal(items) + (Number(shipping) || 0)
}

export function formatMoney(amount: number, currency: CurrencyCode) {
  const { symbol } = getCurrency(currency)
  return `${symbol}${amount.toFixed(2)}`
}

export function getInvoiceFileName(invoiceNumber: string) {
  const safeNumber = invoiceNumber.trim().replace(/[^\w.-]+/g, '-')
  return safeNumber ? `invoice-${safeNumber}.pdf` : 'invoice.pdf'
}

const PNG_DATA_URL_PATTERN = /xlink:href="(data:image\/png;base64,[^"]+)"/

export async function getLogoDataUrl() {
  const response = await fetch(LOGO_PATH)
  const svg = await response.text()
  const match = svg.match(PNG_DATA_URL_PATTERN)
  return match?.[1] ?? LOGO_PATH
}
