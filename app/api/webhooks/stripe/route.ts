// Compatibility endpoint for the Stripe Dashboard destination.
// The configured Stripe webhook URL is /api/webhooks/stripe while the
// canonical handler lives at /api/stripe-webhook.
export { POST } from '@/app/api/stripe-webhook/route';
