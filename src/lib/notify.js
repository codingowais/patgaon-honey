import emailjs from '@emailjs/browser'

const SERVICE = import.meta.env.VITE_EMAILJS_SERVICE_ID
const TEMPLATE = import.meta.env.VITE_EMAILJS_TEMPLATE_ID
const PUBLIC_KEY = import.meta.env.VITE_EMAILJS_PUBLIC_KEY
const OWNER = import.meta.env.VITE_OWNER_EMAIL

// Sends the same order details to the customer and to the shop owner.
// Errors are logged but never block the order itself.
export async function sendOrderEmails({ order, customerName, customerEmail, phone, address }) {
  if (!SERVICE || !TEMPLATE || !PUBLIC_KEY) {
    console.warn('EmailJS is not configured. Skipping order emails.')
    return
  }

  const items = order.items.map((i) => `${i.name} x ${i.qty} (₹${i.price * i.qty})`).join(', ')
  const params = {
    customer_name: customerName,
    order_id: order.id.slice(0, 8).toUpperCase(),
    items,
    total: `₹${order.total}`,
    phone,
    address,
  }

  const send = (to) =>
    emailjs.send(SERVICE, TEMPLATE, { ...params, to_email: to }, { publicKey: PUBLIC_KEY })

  try {
    await Promise.all([
      customerEmail && send(customerEmail),
      OWNER && send(OWNER),
    ].filter(Boolean))
  } catch (err) {
    console.error('Order email failed:', err)
  }
}