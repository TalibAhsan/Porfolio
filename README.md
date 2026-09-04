# Portfolio

## Resend + Vercel deployment

The contact form sends messages through the Vercel Edge Function at `/api/contact` and the Resend Email API.

Add these environment variables in Vercel Project Settings → Environment Variables:

```text
RESEND_API_KEY=re_xxxxxxxxx
CONTACT_TO_EMAIL=aryantalib60@gmail.com
RESEND_FROM_EMAIL=Portfolio Contact <onboarding@resend.dev>
```

For production, verify your own sending domain in Resend and set `RESEND_FROM_EMAIL` to an address on that domain. Keep `RESEND_API_KEY` server-only and never place it in frontend JavaScript.
