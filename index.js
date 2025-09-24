require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const Stripe = require('stripe');
const { Telegraf } = require('telegraf');

const app = express();
const stripe = Stripe(process.env.STRIPE_SECRET_KEY);
const bot = new Telegraf(process.env.TELEGRAM_BOT_TOKEN);

// Endpoint para Stripe Webhooks
app.post('/webhook', bodyParser.raw({ type: 'application/json' }), (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.log('⚠️ Webhook inválido', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Evento de pago exitoso
  if (event.type === 'checkout.session.completed' || event.type === 'invoice.payment_succeeded') {
    const session = event.data.object;
    console.log('✅ Pago exitoso de:', session.customer_email);

    // Envía mensaje al usuario
    bot.telegram.sendMessage(
      session.customer_email || 'chat_id_desconocido', // opcional: reemplaza con chat_id real si quieres
      `¡Gracias por tu suscripción! Únete a tu canal: ${process.env.CHANNEL_INVITE_LINK}`
    ).catch(console.error);
  }

  // Evento de baja o cancelación
  if (event.type === 'customer.subscription.deleted') {
    const subscription = event.data.object;
    console.log('⚠️ Suscripción cancelada:', subscription.id);
    // Aquí puedes notificar al usuario o actualizar tu base de datos
  }

  res.json({ received: true });
});

// Inicia servidor
app.listen(process.env.PORT, () => {
  console.log(`Servidor corriendo en puerto ${process.env.PORT}`);
});
