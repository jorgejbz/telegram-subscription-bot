import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end('Method Not Allowed');

  const { email } = req.body; // opcional: si quieres prellenar email del cliente

  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'subscription',
      line_items: [
        {
          price: 'price_1SAixxAEM9QxNWEAxxx', // <--- aquí va el ID de tu plan de Stripe
          quantity: 1,
        },
      ],
      customer_email: email,
      success_url: 'https://t.me/OFernBot', // donde va el usuario después de pagar
      cancel_url: 'https://t.me/OFernBot',  // si cancela
    });

    res.status(200).json({ url: session.url }); // este es el link que debes dar al usuario
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Algo salió mal' });
  }
}
