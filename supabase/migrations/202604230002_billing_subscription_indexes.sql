begin;

create unique index if not exists billing_subscriptions_provider_external_subscription_id_key
  on public.billing_subscriptions (provider, external_subscription_id)
  where external_subscription_id is not null;

commit;
