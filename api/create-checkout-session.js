import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  // Parsear body manualmente
  let body;
  try {
    body = JSON.parse(req.body);
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
}
