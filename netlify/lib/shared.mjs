// Shared helpers for the payment functions. Runs on Netlify's servers only, never in the browser.
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

// Stripe expects amounts in cents, except for these currencies (RWF is one of them)
export const ZERO_DECIMAL = new Set(['BIF', 'CLP', 'DJF', 'GNF', 'JPY', 'KMF', 'KRW', 'MGA', 'PYG', 'RWF', 'UGX', 'VND', 'VUV', 'XAF', 'XOF', 'XPF']);

export const json = (status, body) =>
  new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } });

export function env() {
  const supabaseUrl = (process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || '')
    .trim().replace(/\/rest\/v1\/?$/, '').replace(/\/+$/, '');
  return {
    supabaseUrl,
    serviceKey: (process.env.SUPABASE_SERVICE_ROLE_KEY || '').trim(),
    stripeKey: (process.env.STRIPE_SECRET_KEY || '').trim(),
    webhookSecret: (process.env.STRIPE_WEBHOOK_SECRET || '').trim(),
    siteUrl: (process.env.SITE_URL || process.env.URL || '').replace(/\/+$/, ''),
  };
}

export const admin = (e) => createClient(e.supabaseUrl, e.serviceKey, { auth: { persistSession: false } });
export const stripeClient = (e) => new Stripe(e.stripeKey);
