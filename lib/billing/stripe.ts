import crypto from 'node:crypto';

type StripeFetchMethod = 'GET' | 'POST';

const STRIPE_API_BASE = 'https://api.stripe.com/v1';
const WEBHOOK_TOLERANCE_SECONDS = 300;

function getStripeSecretKey() {
  const key = process.env.STRIPE_SECRET_KEY?.trim();
  if (!key) {
    throw new Error('Missing STRIPE_SECRET_KEY');
  }
  return key;
}

export function getStripeWebhookSecret() {
  const secret = process.env.STRIPE_WEBHOOK_SECRET?.trim();
  if (!secret) {
    throw new Error('Missing STRIPE_WEBHOOK_SECRET');
  }
  return secret;
}

function getStripeAuthHeader() {
  const encoded = Buffer.from(`${getStripeSecretKey()}:`).toString('base64');
  return `Basic ${encoded}`;
}

function appendFormValue(
  params: URLSearchParams,
  key: string,
  value: unknown
) {
  if (value === undefined || value === null) {
    return;
  }

  if (Array.isArray(value)) {
    value.forEach((item, index) => {
      appendFormValue(params, `${key}[${index}]`, item);
    });
    return;
  }

  if (typeof value === 'object') {
    Object.entries(value as Record<string, unknown>).forEach(([childKey, childValue]) => {
      appendFormValue(params, `${key}[${childKey}]`, childValue);
    });
    return;
  }

  params.append(key, String(value));
}

function createStripeFormBody(body: Record<string, unknown>) {
  const params = new URLSearchParams();
  Object.entries(body).forEach(([key, value]) => {
    appendFormValue(params, key, value);
  });
  return params.toString();
}

async function stripeRequest<T>(
  path: string,
  options?: {
    method?: StripeFetchMethod;
    body?: Record<string, unknown>;
  }
): Promise<T> {
  const response = await fetch(`${STRIPE_API_BASE}${path}`, {
    method: options?.method ?? 'POST',
    headers: {
      Authorization: getStripeAuthHeader(),
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: options?.body ? createStripeFormBody(options.body) : undefined,
  });

  const data = (await response.json().catch(() => ({}))) as T & {
    error?: { message?: string };
  };

  if (!response.ok) {
    throw new Error(data?.error?.message ?? `Stripe request failed for ${path}`);
  }

  return data;
}

export type StripeCustomer = {
  id: string;
  email: string | null;
  name: string | null;
  metadata?: Record<string, string>;
};

export type StripeCheckoutSession = {
  id: string;
  url: string | null;
  customer: string | null;
  subscription: string | null;
  metadata?: Record<string, string>;
};

export type StripeBillingPortalSession = {
  id: string;
  url: string;
};

export async function createStripeCustomer(input: {
  email: string;
  name: string;
  metadata: Record<string, string>;
}) {
  return stripeRequest<StripeCustomer>('/customers', {
    body: {
      email: input.email,
      name: input.name,
      metadata: input.metadata,
    },
  });
}

export async function updateStripeCustomer(
  customerId: string,
  input: {
    email?: string;
    name?: string;
    metadata?: Record<string, string>;
  }
) {
  return stripeRequest<StripeCustomer>(`/customers/${customerId}`, {
    body: {
      email: input.email,
      name: input.name,
      metadata: input.metadata,
    },
  });
}

export async function createStripeCheckoutSession(input: {
  customerId: string;
  priceId: string;
  successUrl: string;
  cancelUrl: string;
  clientReferenceId: string;
  metadata: Record<string, string>;
}) {
  return stripeRequest<StripeCheckoutSession>('/checkout/sessions', {
    body: {
      mode: 'subscription',
      customer: input.customerId,
      success_url: input.successUrl,
      cancel_url: input.cancelUrl,
      allow_promotion_codes: 'true',
      client_reference_id: input.clientReferenceId,
      line_items: [{ price: input.priceId, quantity: 1 }],
      metadata: input.metadata,
      subscription_data: {
        metadata: input.metadata,
      },
    },
  });
}

export async function createStripeBillingPortalSession(input: {
  customerId: string;
  returnUrl: string;
}) {
  return stripeRequest<StripeBillingPortalSession>('/billing_portal/sessions', {
    body: {
      customer: input.customerId,
      return_url: input.returnUrl,
    },
  });
}

export function resolveAppUrl(headers?: Record<string, string | string[] | undefined>) {
  const configured =
    process.env.BREWASSIST_APP_URL?.trim() ||
    process.env.NEXT_PUBLIC_BREWASSIST_HOST?.trim();

  if (configured) {
    return configured.replace(/\/+$/, '');
  }

  const hostHeader = headers?.host;
  const host = Array.isArray(hostHeader) ? hostHeader[0] : hostHeader;
  const protoHeader =
    headers?.['x-forwarded-proto'] ??
    headers?.['x-forwarded-protocol'];
  const proto = Array.isArray(protoHeader) ? protoHeader[0] : protoHeader;

  if (host) {
    return `${proto ?? 'http'}://${host}`;
  }

  return 'http://localhost:3000';
}

export function verifyStripeWebhookSignature(input: {
  payload: string;
  signatureHeader: string | undefined;
  secret: string;
  nowSeconds?: number;
}) {
  if (!input.signatureHeader) {
    throw new Error('Missing Stripe-Signature header');
  }

  const elements = input.signatureHeader.split(',');
  const timestamp = elements
    .find((item) => item.startsWith('t='))
    ?.slice(2);
  const signatures = elements
    .filter((item) => item.startsWith('v1='))
    .map((item) => item.slice(3));

  if (!timestamp || signatures.length === 0) {
    throw new Error('Invalid Stripe-Signature header');
  }

  const nowSeconds = input.nowSeconds ?? Math.floor(Date.now() / 1000);
  if (Math.abs(nowSeconds - Number(timestamp)) > WEBHOOK_TOLERANCE_SECONDS) {
    throw new Error('Stripe webhook timestamp is outside the tolerance window');
  }

  const signedPayload = `${timestamp}.${input.payload}`;
  const expected = crypto
    .createHmac('sha256', input.secret)
    .update(signedPayload, 'utf8')
    .digest('hex');

  const matches = signatures.some((signature) => {
    const expectedBuffer = Buffer.from(expected, 'hex');
    const receivedBuffer = Buffer.from(signature, 'hex');
    if (expectedBuffer.length !== receivedBuffer.length) {
      return false;
    }
    return crypto.timingSafeEqual(expectedBuffer, receivedBuffer);
  });

  if (!matches) {
    throw new Error('Invalid Stripe webhook signature');
  }
}
