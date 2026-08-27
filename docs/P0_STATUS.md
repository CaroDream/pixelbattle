# P0 Security & Payments Status

## Done
- Client direct writes to `Pixels` revoked.
- Server-side price calculation and order creation.
- Pixel reservation before Checkout.
- Stripe hosted Checkout.
- Signed webhook verification.
- Atomic Supabase fulfillment via `fulfill_pixel_order`.
- Idempotent paid-order handling.
- Success page does not fulfill payment.
- P0 CI workflow runs lint and build.

## Remaining before production
- Configure `STRIPE_WEBHOOK_SECRET` in the deployment environment.
- Register the sandbox webhook endpoint in Stripe Dashboard.
- Run a real Stripe Sandbox end-to-end payment and verify `pixel_orders` and `Pixels`.
- Review deployment environment variables.
- Only then merge to `main` and deploy.
