import Stripe from 'stripe';
import { Telegraf } from 'telegraf';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const bot = new Telegraf(process.env.TELEGRAM_BOT_TOKEN);

export const config = {
  api: {
    bodyParser: false, // Necesario para Stripe webhooks
  },
};

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end('Method Not Allowed');

  let buf = '';
  for await (const chunk of req) {
    buf += chunk;
  }

  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(buf, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.log('⚠️ Webhook inválido', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === 'checkout.session.completed' || event.type === 'invoice.payment_succeeded') {
    const session = event.data.object;
    console.log('✅ Pago exitoso de:', session.customer_email);

    bot.telegram.sendMessage(
      session.customer_email || 'chat_id_desconocido',
      `¡Gracias por tu suscripción! Únete a tu canal: ${process.env.CHANNEL_INVITE_LINK}`
    ).catch(console.error);
  }

  if (event.type === 'customer.subscription.deleted') {
    const subscription = event.data.object;
    console.log('⚠️ Suscripción cancelada:', subscription.id);
  }

  res.status(200).json({ received: true });
}
