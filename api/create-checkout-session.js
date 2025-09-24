// Usamos CommonJS para evitar problemas de import
const Stripe = require('stripe');

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  // Parsear el body seguro
  let body;
  try {
    body = req.body;
    if (typeof body === 'string') {
      body = JSON.parse(body);
    }
  } catch (err) {
    console.error('Error parseando body:', err);
    return res.status(400).json({ error: 'Body inválido' });
  }

  const email = body.email || undefined;

  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'subscription',
      line_items: [
        {
          price: 'price_1SAj6fEM9QxNWEANj30BIW3k', // tu Price ID de Stripe
          quantity: 1,
        },
      ],
      customer_email: email,
      success_url: 'https://t.me/OFernBot',
      cancel_url: 'https://t.me/OFernBot',
    });

    res.status(200).json({ url: session.url });
  } catch (err) {
    console.error('Error creando sesión de Stripe:', err);
    res.status(500).json({ error: 'Algo salió mal con Stripe' });
  }
};
