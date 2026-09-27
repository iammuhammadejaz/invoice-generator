export const LOGO_PATH = '/logo.svg'
export const DEFAULT_CURRENCY = 'USD'
export const DEFAULT_ITEM_QUANTITY = 1
export const MIN_ITEM_QUANTITY = 1
export const MAX_ITEM_QUANTITY = 9999
export const MIN_ITEM_PRICE = 0.01
export const MAX_ITEM_PRICE = 999999.99
export const MAX_ITEM_QUANTITY_MESSAGE = `Enter a quantity of ${MAX_ITEM_QUANTITY} or less`
export const MAX_ITEM_PRICE_MESSAGE = `Enter an amount of ${MAX_ITEM_PRICE} or less`
export const MAX_INVOICE_NUMBER_LENGTH = 30
export const MAX_INVOICE_NUMBER_LENGTH_MESSAGE = `Enter an invoice number of ${MAX_INVOICE_NUMBER_LENGTH} characters or less`
export const MAX_NOTE_LENGTH = 500
export const MAX_NOTE_LENGTH_MESSAGE = `Enter a note of ${MAX_NOTE_LENGTH} characters or less`
export const THANK_YOU_MESSAGE = 'Thank you for your business!'
export const INVOICE_DATE_FORMAT = 'DD-MMM-YYYY'
export const INVOICE_FORM_DATE_FORMAT = 'YYYY-MM-DD'
export const INVOICE_THEME_COLOR = '#70d0d9'
export const INVOICE_STATUS_PAID = 'paid'
export const INVOICE_STATUS_DUE = 'due'
export const DEFAULT_INVOICE_STATUS = INVOICE_STATUS_PAID
export const INVOICE_TOTAL_LABEL = 'Total'
export const INVOICE_BALANCE_DUE_LABEL = 'Balance Due'
export const BILL_TO_COMPANY_NAME_LABEL = 'Company name'
export const BILL_TO_COMPANY_EMAIL_LABEL = 'Company email'
export const BILL_TO_ADDRESS_LABEL = 'Address'
export const BILL_TO_PHONE_LABEL = 'Phone number'
export const REQUIRED_FIELD_MESSAGE = 'This field is required'
export const VALID_EMAIL_MESSAGE = 'Enter a valid email address'
export const POSITIVE_NUMBER_MESSAGE = 'Enter a value greater than 0'
export const COMPANY_NAME = 'Patch Makers'
export const COMPANY_ADDRESS_LINE_1 = '727 Big Horn Ave Sheridan,'
export const COMPANY_ADDRESS_LINE_2 = 'Wyoming (WY), 82801'
export const COMPANY_PHONE_LABEL = 'Phone'
export const COMPANY_PHONE = '+1 (812) 645 5579'
export const COMPANY_EMAIL = 'sales@patchmakers.us'
export const COMPANY_EMAIL_HREF = `mailto:${COMPANY_EMAIL}`
export const FROM_SECTION_LABEL = 'From'
export const BILL_TO_SECTION_LABEL = 'Bill To'
export const INVOICE_DATE_LABEL = 'Date'
export const INVOICE_NUMBER_LABEL = 'Invoice #'
export const MAX_CUSTOMER_PHONE_LENGTH = 30
export const MAX_CUSTOMER_PHONE_LENGTH_MESSAGE = `Enter a phone number of ${MAX_CUSTOMER_PHONE_LENGTH} characters or less`
export const MAX_CUSTOMER_ADDRESS_LENGTH = 200
export const MAX_CUSTOMER_ADDRESS_LENGTH_MESSAGE = `Enter an address of ${MAX_CUSTOMER_ADDRESS_LENGTH} characters or less`

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
  invoiceNumber: string
  date: string
  currency: CurrencyCode
  customerName: string
  customerEmail: string
  customerPhone: string
  customerAddress: string
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
    invoiceNumber: '',
    date: `${today.getFullYear()}-${month}-${day}`,
    currency: DEFAULT_CURRENCY,
    customerName: '',
    customerEmail: '',
    customerPhone: '',
    customerAddress: '',
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

export function getInvoiceTotalLabel(status?: InvoiceStatus) {
  return getInvoiceStatus(status) === INVOICE_STATUS_PAID
    ? INVOICE_TOTAL_LABEL
    : INVOICE_BALANCE_DUE_LABEL
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
