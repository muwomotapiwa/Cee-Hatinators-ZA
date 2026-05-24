import type { FormEvent } from 'react';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Save, ShieldCheck } from 'lucide-react';
import { DEFAULT_DELIVERY_METHODS, DEFAULT_SITE_SETTINGS, DeliveryMethodSetting, SiteSettings, useSiteSettings } from '../context/SiteSettingsContext';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';

type AccessState = 'loading' | 'denied' | 'granted';

function settingsToRatesText(settings: SiteSettings) {
  return (settings.shipping_summary.rates || []).join('\n');
}

function settingsToDeliveryMethods(settings: SiteSettings): DeliveryMethodSetting[] {
  const methods = settings.shipping_summary.methods?.length
    ? settings.shipping_summary.methods
    : DEFAULT_DELIVERY_METHODS;

  return methods.map((method) => ({
    id: method.id,
    label: method.label,
    description: method.description,
    price: Number(method.price || 0),
  }));
}

function formFromSettings(settings: SiteSettings): SiteSettings {
  return {
    ...DEFAULT_SITE_SETTINGS,
    ...settings,
    social_links: {
      ...DEFAULT_SITE_SETTINGS.social_links,
      ...settings.social_links,
    },
    shipping_summary: {
      rates: settings.shipping_summary.rates || DEFAULT_SITE_SETTINGS.shipping_summary.rates,
      methods: settingsToDeliveryMethods(settings),
    },
  };
}

export function PortalSettingsPage() {
  const { settings, refreshSettings } = useSiteSettings();
  const { loading: authLoading, isSuperUser } = useAuth();
  const [access, setAccess] = useState<AccessState>('loading');
  const [form, setForm] = useState<SiteSettings>(() => formFromSettings(settings));
  const [ratesText, setRatesText] = useState(settingsToRatesText(settings));
  const [deliveryMethods, setDeliveryMethods] = useState<DeliveryMethodSetting[]>(() => settingsToDeliveryMethods(settings));
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (authLoading) {
      setAccess('loading');
      return;
    }

    setAccess(isSuperUser ? 'granted' : 'denied');
  }, [authLoading, isSuperUser]);

  useEffect(() => {
    setForm(formFromSettings(settings));
    setRatesText(settingsToRatesText(settings));
    setDeliveryMethods(settingsToDeliveryMethods(settings));
  }, [settings]);

  const updateField = (field: keyof SiteSettings, value: string) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const updateSocial = (field: keyof SiteSettings['social_links'], value: string) => {
    setForm((current) => ({
      ...current,
      social_links: {
        ...current.social_links,
        [field]: value,
      },
    }));
  };

  const updateDeliveryMethod = (id: string, field: keyof Omit<DeliveryMethodSetting, 'id'>, value: string) => {
    setDeliveryMethods((current) => current.map((method) => {
      if (method.id !== id) return method;

      return {
        ...method,
        [field]: field === 'price' ? Number(value || 0) : value,
      };
    }));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSaving(true);
    setMessage('');

    const payload = {
      site_name: form.site_name,
      announcement_text: form.announcement_text,
      logo_url: form.logo_url || null,
      contact_email: form.contact_email,
      contact_phone: form.contact_phone,
      contact_address: form.contact_address,
      footer_statement: form.footer_statement,
      social_links: form.social_links,
      shipping_summary: {
        rates: ratesText
          .split('\n')
          .map((rate) => rate.trim())
          .filter(Boolean),
        methods: deliveryMethods.map((method) => ({
          id: method.id,
          label: method.label.trim() || method.id,
          description: method.description.trim(),
          price: Number(method.price || 0),
        })),
      },
      status: 'active',
    };

    const request = form.id
      ? supabase.from('site_settings').update(payload).eq('id', form.id).select('*').single()
      : supabase.from('site_settings').insert(payload).select('*').single();

    const { data, error } = await request;

    if (error) {
      setMessage(error.message);
      setSaving(false);
      return;
    }

    setForm(formFromSettings(data as SiteSettings));
    setRatesText(settingsToRatesText(data as SiteSettings));
    await refreshSettings();
    setMessage('Settings saved.');
    setSaving(false);
  };

  if (access === 'loading') {
    return (
      <div className="min-h-screen bg-offwhite flex items-center justify-center text-[11px] tracking-[2px] uppercase text-mid-gray">
        Checking access...
      </div>
    );
  }

  if (access === 'denied') {
    return (
      <div className="min-h-screen bg-offwhite px-6 py-16">
        <div className="max-w-xl mx-auto bg-white border border-silver p-8">
          <h1 className="serif text-4xl text-dark font-light mb-4">Super User Required</h1>
          <p className="text-[13px] leading-7 text-charcoal mb-6">
            Sign in through the portal with a super user account before editing settings.
          </p>
          <Link to="/portal" className="inline-flex items-center gap-2 bg-crimson text-white px-5 py-3 text-[10px] tracking-[2px] uppercase">
            <ShieldCheck size={14} /> Go to Portal
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-offwhite px-6 py-12 sm:px-10">
      <div className="max-w-[1120px] mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-5 mb-10">
          <div>
            <Link to="/portal" className="inline-flex items-center gap-2 text-[10px] tracking-[1.5px] uppercase text-mid-gray hover:text-crimson transition-colors mb-6">
              <ArrowLeft size={13} /> Back to Portal
            </Link>
            <span className="text-[10px] tracking-[3px] uppercase text-crimson block mb-3">Settings</span>
            <h1 className="serif text-[clamp(34px,5vw,56px)] font-light text-dark leading-tight">
              Site Settings
            </h1>
          </div>
          <a href="#/" className="text-[10px] tracking-[2px] uppercase text-crimson hover:text-dark transition-colors">
            View Store
          </a>
        </div>

        <form onSubmit={handleSubmit} className="grid lg:grid-cols-[1.2fr_0.8fr] gap-8">
          <section className="bg-white border border-silver p-6 sm:p-8 space-y-5">
            <div>
              <label className="text-[10px] tracking-[2px] uppercase text-charcoal block mb-2">Site Name</label>
              <input
                value={form.site_name}
                onChange={(event) => updateField('site_name', event.target.value)}
                className="w-full border border-silver bg-white p-3 text-[13px] outline-none focus:border-crimson"
              />
            </div>

            <div>
              <label className="text-[10px] tracking-[2px] uppercase text-charcoal block mb-2">Announcement Text</label>
              <textarea
                value={form.announcement_text}
                onChange={(event) => updateField('announcement_text', event.target.value)}
                rows={3}
                className="w-full border border-silver bg-white p-3 text-[13px] leading-6 outline-none focus:border-crimson"
              />
            </div>

            <div>
              <label className="text-[10px] tracking-[2px] uppercase text-charcoal block mb-2">Footer Statement</label>
              <textarea
                value={form.footer_statement}
                onChange={(event) => updateField('footer_statement', event.target.value)}
                rows={4}
                className="w-full border border-silver bg-white p-3 text-[13px] leading-6 outline-none focus:border-crimson"
              />
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] tracking-[2px] uppercase text-charcoal block mb-2">Contact Email</label>
                <input
                  type="email"
                  value={form.contact_email}
                  onChange={(event) => updateField('contact_email', event.target.value)}
                  className="w-full border border-silver bg-white p-3 text-[13px] outline-none focus:border-crimson"
                />
              </div>
              <div>
                <label className="text-[10px] tracking-[2px] uppercase text-charcoal block mb-2">Contact Phone</label>
                <input
                  value={form.contact_phone}
                  onChange={(event) => updateField('contact_phone', event.target.value)}
                  className="w-full border border-silver bg-white p-3 text-[13px] outline-none focus:border-crimson"
                />
              </div>
            </div>

            <div>
              <label className="text-[10px] tracking-[2px] uppercase text-charcoal block mb-2">Contact Address</label>
              <textarea
                value={form.contact_address}
                onChange={(event) => updateField('contact_address', event.target.value)}
                rows={3}
                className="w-full border border-silver bg-white p-3 text-[13px] leading-6 outline-none focus:border-crimson"
              />
            </div>
          </section>

          <section className="space-y-8">
            <div className="bg-white border border-silver p-6 sm:p-8 space-y-4">
              <h2 className="serif text-3xl text-dark font-light">Social Links</h2>
              {(['instagram', 'facebook', 'youtube', 'pinterest'] as const).map((item) => (
                <div key={item}>
                  <label className="text-[10px] tracking-[2px] uppercase text-charcoal block mb-2">{item}</label>
                  <input
                    value={form.social_links[item] || ''}
                    onChange={(event) => updateSocial(item, event.target.value)}
                    className="w-full border border-silver bg-white p-3 text-[13px] outline-none focus:border-crimson"
                    placeholder="https://..."
                  />
                </div>
              ))}
            </div>

            <div className="bg-white border border-silver p-6 sm:p-8">
              <h2 className="serif text-3xl text-dark font-light mb-4">Shipping Lines</h2>
              <textarea
                value={ratesText}
                onChange={(event) => setRatesText(event.target.value)}
                rows={6}
                className="w-full border border-silver bg-white p-3 text-[13px] leading-6 outline-none focus:border-crimson"
              />
            </div>

            <div className="bg-white border border-silver p-6 sm:p-8 space-y-5">
              <h2 className="serif text-3xl text-dark font-light">Checkout Delivery</h2>
              {deliveryMethods.map((method) => (
                <div key={method.id} className="border border-silver p-4 space-y-3">
                  <div className="grid sm:grid-cols-[1fr_120px] gap-3">
                    <div>
                      <label className="text-[10px] tracking-[2px] uppercase text-charcoal block mb-2">Method Name</label>
                      <input
                        value={method.label}
                        onChange={(event) => updateDeliveryMethod(method.id, 'label', event.target.value)}
                        className="w-full border border-silver bg-white p-3 text-[13px] outline-none focus:border-crimson"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] tracking-[2px] uppercase text-charcoal block mb-2">Price (ZAR)</label>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        value={method.price}
                        onChange={(event) => updateDeliveryMethod(method.id, 'price', event.target.value)}
                        className="w-full border border-silver bg-white p-3 text-[13px] outline-none focus:border-crimson"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-[10px] tracking-[2px] uppercase text-charcoal block mb-2">Description</label>
                    <input
                      value={method.description}
                      onChange={(event) => updateDeliveryMethod(method.id, 'description', event.target.value)}
                      className="w-full border border-silver bg-white p-3 text-[13px] outline-none focus:border-crimson"
                    />
                  </div>
                </div>
              ))}
            </div>

            {message && (
              <div className={`border p-4 text-[12px] leading-6 ${message === 'Settings saved.' ? 'bg-green-50 border-green-200 text-green-700' : 'bg-red-50 border-red-200 text-red-700'}`}>
                {message}
              </div>
            )}

            <button
              type="submit"
              disabled={saving}
              className="w-full bg-crimson text-white py-4 text-[11px] tracking-[2px] uppercase hover:bg-crimson-dark transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
            >
              <Save size={15} /> {saving ? 'Saving...' : 'Save Settings'}
            </button>
          </section>
        </form>
      </div>
    </div>
  );
}
