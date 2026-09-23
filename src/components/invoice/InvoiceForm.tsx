import { CloseOutlined, EditOutlined, PlusOutlined } from '@ant-design/icons'
import {
  Button,
  DatePicker,
  Form,
  Input,
  InputNumber,
  Select,
} from 'antd'
import type { FormInstance } from 'antd'
import dayjs from 'dayjs'
import { useState } from 'react'
import {
  CURRENCIES,
  INVOICE_FORM_DATE_FORMAT,
  INVOICE_STATUSES,
  LOGO_PATH,
  MAX_ITEM_PRICE,
  MAX_ITEM_PRICE_MESSAGE,
  MAX_NOTE_LENGTH,
  MAX_NOTE_LENGTH_MESSAGE,
  MAX_ITEM_QUANTITY,
  MAX_ITEM_QUANTITY_MESSAGE,
  MIN_ITEM_PRICE,
  MIN_ITEM_QUANTITY,
  POSITIVE_NUMBER_MESSAGE,
  REQUIRED_FIELD_MESSAGE,
  VALID_EMAIL_MESSAGE,
  createEmptyItem,
  formatMoney,
  getItemAmount,
  getSubtotal,
  getTotal,
} from '../../lib/invoice'
import type { InvoiceFormValues } from '../../lib/invoice'

const { TextArea } = Input
const SHIPPING_INPUT_WIDTH = 140

function parseShippingAmount(raw: string) {
  const trimmed = raw.trim()
  if (!trimmed) {
    return null
  }

  const amount = Number(trimmed)
  if (
    !Number.isFinite(amount) ||
    amount < MIN_ITEM_PRICE ||
    amount > MAX_ITEM_PRICE
  ) {
    return undefined
  }

  return amount
}

type InvoiceFormProps = {
  form: FormInstance<InvoiceFormValues>
  values: InvoiceFormValues
  onValuesChange: (values: InvoiceFormValues) => void
}

export default function InvoiceForm({
  form,
  values,
  onValuesChange,
}: InvoiceFormProps) {
  const currency = values.currency
  const subtotal = getSubtotal(values.items)
  const total = getTotal(values.items, values.shipping)
  const [isShippingOpen, setIsShippingOpen] = useState(false)

  function setShipping(shipping: number | null) {
    form.setFieldValue('shipping', shipping)
    onValuesChange({
      ...values,
      shipping,
    })
  }

  function openShipping() {
    setShipping(null)
    setIsShippingOpen(true)
  }

  function closeShipping() {
    setShipping(null)
    setIsShippingOpen(false)
  }

  function editShipping() {
    setIsShippingOpen(true)
  }

  function commitShipping(raw: string) {
    const amount = parseShippingAmount(raw)
    if (amount === undefined) {
      const typed = Number(raw.trim())
      if (Number.isFinite(typed)) {
        form.setFieldValue('shipping', typed)
      }
      void form.validateFields(['shipping'])
      return
    }
    if (amount === null) {
      return
    }

    setShipping(amount)
    setIsShippingOpen(false)
  }

  return (
    <Form
      form={form}
      layout="vertical"
      initialValues={values}
      requiredMark
      onValuesChange={(_, allValues) => {
        onValuesChange({
          ...values,
          ...allValues,
          items: allValues.items ?? values.items,
          status: allValues.status ?? values.status,
        })
      }}
    >
      <header className="invoice-header">
        <img src={LOGO_PATH} alt="Company logo" className="invoice-logo" />

        <div className="invoice-title-row">
          <h1 className="invoice-heading">Invoice</h1>
          <Form.Item name="status" className="mb-0">
            <div className="invoice-status-picker">
              {INVOICE_STATUSES.map((status) => {
                const isActive = values.status === status.value

                return (
                  <button
                    key={status.value}
                    type="button"
                    className={`invoice-status-badge is-${status.value}${isActive ? ' is-active' : ''}`}
                    onClick={() => {
                      form.setFieldValue('status', status.value)
                      onValuesChange({
                        ...values,
                        status: status.value,
                      })
                    }}
                  >
                    {status.label}
                  </button>
                )
              })}
            </div>
          </Form.Item>
        </div>
      </header>

      <section className="invoice-section">
        <h2 className="invoice-section-title">From</h2>
        <div className="invoice-field-grid">
          <Form.Item
            name="companyName"
            label="Company name"
            rules={[{ required: true, message: REQUIRED_FIELD_MESSAGE }]}
          >
            <Input size="large" placeholder="Company name" />
          </Form.Item>

          <Form.Item
            name="name"
            label="Name"
            rules={[{ required: true, message: REQUIRED_FIELD_MESSAGE }]}
          >
            <Input size="large" placeholder="Name" />
          </Form.Item>

          <Form.Item
            className="invoice-span-2"
            name="email"
            label="Email address"
            rules={[
              { required: true, message: REQUIRED_FIELD_MESSAGE },
              { type: 'email', message: VALID_EMAIL_MESSAGE },
            ]}
          >
            <Input size="large" type="email" placeholder="Email address" />
          </Form.Item>

          <Form.Item
            className="invoice-span-2"
            name="invoiceNumber"
            label="Invoice number"
            rules={[{ required: true, message: REQUIRED_FIELD_MESSAGE }]}
          >
            <Input size="large" placeholder="Invoice number" />
          </Form.Item>

          <Form.Item
            name="date"
            label="Date"
            rules={[{ required: true, message: REQUIRED_FIELD_MESSAGE }]}
            getValueProps={(value) => ({
              value: value ? dayjs(value) : null,
            })}
            getValueFromEvent={(value) =>
              value ? value.format(INVOICE_FORM_DATE_FORMAT) : ''
            }
          >
            <DatePicker
              size="large"
              style={{ width: '100%' }}
              format="MM/DD/YYYY"
            />
          </Form.Item>

          <Form.Item
            name="currency"
            label="Currency"
            rules={[{ required: true, message: REQUIRED_FIELD_MESSAGE }]}
          >
            <Select
              size="large"
              options={CURRENCIES.map((item) => ({
                value: item.code,
                label: `${item.label} (${item.symbol})`,
              }))}
            />
          </Form.Item>
        </div>
      </section>

      <section className="invoice-section">
        <h2 className="invoice-section-title">Bill To</h2>
        <div className="invoice-field-grid">
          <Form.Item
            name="customerName"
            label="Customer name"
            rules={[{ required: true, message: REQUIRED_FIELD_MESSAGE }]}
          >
            <Input size="large" placeholder="Customer name" />
          </Form.Item>

          <Form.Item
            name="customerEmail"
            label="Customer email address"
            rules={[
              { required: true, message: REQUIRED_FIELD_MESSAGE },
              { type: 'email', message: VALID_EMAIL_MESSAGE },
            ]}
          >
            <Input
              size="large"
              type="email"
              placeholder="Customer email address"
            />
          </Form.Item>
        </div>
      </section>

      <section className="invoice-section">
        <h2 className="invoice-section-title">Items</h2>

      <Form.List name="items">
        {(fields, { add, remove }) => (
          <div className="invoice-items">
            <div className="invoice-item-head" aria-hidden="true">
              <span>Item</span>
              <span>Qty</span>
              <span>Price</span>
              <span>Amount</span>
              <span />
            </div>
            {fields.map((field, index) => {
              const item = values.items[index]
              const amount = item ? getItemAmount(item) : 0
              const hasPrice = typeof item?.price === 'number' && item.price > 0

              return (
                <div key={field.key} className="invoice-item-row">
                  <Form.Item name={[field.name, 'id']} noStyle>
                    <input type="hidden" />
                  </Form.Item>
                  <Form.Item
                    name={[field.name, 'name']}
                    className="mb-0"
                    rules={[{ required: true, message: REQUIRED_FIELD_MESSAGE }]}
                  >
                    <Input size="large" placeholder="Item name" />
                  </Form.Item>
                  <Form.Item
                    name={[field.name, 'quantity']}
                    className="mb-0"
                    rules={[
                      { required: true, message: REQUIRED_FIELD_MESSAGE },
                      {
                        type: 'number',
                        min: MIN_ITEM_QUANTITY,
                        message: POSITIVE_NUMBER_MESSAGE,
                      },
                      {
                        type: 'number',
                        max: MAX_ITEM_QUANTITY,
                        message: MAX_ITEM_QUANTITY_MESSAGE,
                      },
                    ]}
                  >
                    <InputNumber
                      size="large"
                      min={MIN_ITEM_QUANTITY}
                      max={MAX_ITEM_QUANTITY}
                      placeholder="Qty"
                      style={{ width: '100%' }}
                    />
                  </Form.Item>
                  <Form.Item
                    name={[field.name, 'price']}
                    className="mb-0"
                    rules={[
                      { required: true, message: REQUIRED_FIELD_MESSAGE },
                      {
                        type: 'number',
                        min: MIN_ITEM_PRICE,
                        message: POSITIVE_NUMBER_MESSAGE,
                      },
                      {
                        type: 'number',
                        max: MAX_ITEM_PRICE,
                        message: MAX_ITEM_PRICE_MESSAGE,
                      },
                    ]}
                  >
                    <InputNumber
                      size="large"
                      min={MIN_ITEM_PRICE}
                      max={MAX_ITEM_PRICE}
                      step={0.01}
                      placeholder="Price"
                      style={{ width: '100%' }}
                    />
                  </Form.Item>
                  <div className="invoice-item-amount">
                    {hasPrice ? formatMoney(amount, currency) : null}
                  </div>
                  {fields.length > 1 ? (
                    <Button
                      type="text"
                      danger
                      aria-label="Remove item"
                      onClick={() => remove(field.name)}
                    >
                      ×
                    </Button>
                  ) : (
                    <span />
                  )}
                </div>
              )
            })}

            <div>
              <Button
                type="link"
                icon={<PlusOutlined />}
                onClick={() => add(createEmptyItem())}
              >
                Add item
              </Button>
            </div>
          </div>
        )}
      </Form.List>
      </section>

      <Form.Item
        name="note"
        label="Note to recipient"
        className="invoice-note"
        rules={[{ max: MAX_NOTE_LENGTH, message: MAX_NOTE_LENGTH_MESSAGE }]}
      >
        <TextArea
          rows={3}
          maxLength={MAX_NOTE_LENGTH}
          showCount
          placeholder="Note to recipient"
        />
      </Form.Item>

      <div className="invoice-totals">
        <div className="invoice-total-row">
          <span>Subtotal</span>
          <span>{formatMoney(subtotal, currency)}</span>
        </div>
        <div className="invoice-total-row">
          <span>Shipping</span>
          {isShippingOpen ? (
            <div className="invoice-shipping-editor">
              <Form.Item
                name="shipping"
                className="mb-0"
                rules={[
                  {
                    type: 'number',
                    min: MIN_ITEM_PRICE,
                    message: POSITIVE_NUMBER_MESSAGE,
                  },
                  {
                    type: 'number',
                    max: MAX_ITEM_PRICE,
                    message: MAX_ITEM_PRICE_MESSAGE,
                  },
                ]}
              >
                <InputNumber
                  autoFocus
                  min={MIN_ITEM_PRICE}
                  max={MAX_ITEM_PRICE}
                  step={0.01}
                  size="large"
                  style={{ width: SHIPPING_INPUT_WIDTH }}
                  onPressEnter={(event) => {
                    event.preventDefault()
                    commitShipping((event.target as HTMLInputElement).value)
                  }}
                />
              </Form.Item>
              <Button
                type="text"
                danger
                aria-label="Remove shipping"
                icon={<CloseOutlined />}
                onClick={closeShipping}
              />
            </div>
          ) : values.shipping === null ? (
            <Button type="link" className="p-0" onClick={openShipping}>
              Add
            </Button>
          ) : (
            <div className="invoice-shipping-editor">
              <span>{formatMoney(values.shipping, currency)}</span>
              <Button
                type="text"
                size="small"
                aria-label="Edit shipping"
                icon={<EditOutlined />}
                onClick={editShipping}
              />
            </div>
          )}
        </div>
        <div className="invoice-total-row invoice-total-row-grand">
          <strong>Total</strong>
          <strong>{formatMoney(total, currency)}</strong>
        </div>
      </div>
    </Form>
  )
}
