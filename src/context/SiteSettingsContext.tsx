import { createContext, ReactNode, useContext, useEffect, useMemo, useState } from 'react';
import { supabase } from '../lib/supabase';

export type SocialLinks = {
  instagram?: string;
  facebook?: string;
  youtube?: string;
  pinterest?: string;
};

export type ShippingSummary = {
  rates?: string[];
  methods?: DeliveryMethodSetting[];
};

export type DeliveryMethodSetting = {
  id: string;
  label: string;
  description: string;
  price: number;
};

export const DEFAULT_DELIVERY_METHODS: DeliveryMethodSetting[] = [
  { id: 'standard', label: 'Standard Delivery', description: '3-5 business days in South Africa', price: 99 },
  { id: 'express', label: 'Express Delivery', description: '1-2 business days in major centres', price: 149 },
  { id: 'collection', label: 'Local Collection', description: 'Arranged after order confirmation', price: 0 },
];

export interface SiteSettings {
  id?: string;
  site_name: string;
  announcement_text: string;
  logo_url: string | null;
  contact_email: string;
  contact_phone: string;
  contact_address: string;
  social_links: SocialLinks;
  shipping_summary: ShippingSummary;
  footer_statement: string;
  status: 'active' | 'archived';
}

export const DEFAULT_SITE_SETTINGS: SiteSettings = {
  site_name: 'Cee Hatinators',
  announcement_text: 'Cee Hatinators / Elegant headwear for every occasion / New royal purple and orchid edit',
  logo_url: null,
  contact_email: 'ceehatinators@gmail.com',
  contact_phone: '+27 000 000 000',
  contact_address: 'South Africa',
  social_links: {},
  shipping_summary: {
    rates: ['South Africa only', 'Standard delivery: ZAR 99.00', 'Free delivery over ZAR 1,500.00'],
    methods: DEFAULT_DELIVERY_METHODS,
  },
  footer_statement: 'Hats define, and set you apart, makes you feel good and put that special touch to complete your outfit.',
  status: 'active',
};

interface SiteSettingsContextValue {
  settings: SiteSettings;
  loading: boolean;
  refreshSettings: () => Promise<void>;
}

const SiteSettingsContext = createContext<SiteSettingsContextValue | undefined>(undefined);

function normalizeSettings(data: Partial<SiteSettings> | null): SiteSettings {
  if (!data) return DEFAULT_SITE_SETTINGS;
  const shippingSummary = data.shipping_summary || DEFAULT_SITE_SETTINGS.shipping_summary;

  return {
    ...DEFAULT_SITE_SETTINGS,
    ...data,
    social_links: data.social_links || DEFAULT_SITE_SETTINGS.social_links,
    shipping_summary: {
      rates: shippingSummary.rates || DEFAULT_SITE_SETTINGS.shipping_summary.rates,
      methods: shippingSummary.methods?.length ? shippingSummary.methods : DEFAULT_DELIVERY_METHODS,
    },
    footer_statement: data.footer_statement || DEFAULT_SITE_SETTINGS.footer_statement,
    status: data.status || DEFAULT_SITE_SETTINGS.status,
  };
}

export function SiteSettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<SiteSettings>(DEFAULT_SITE_SETTINGS);
  const [loading, setLoading] = useState(true);

  const refreshSettings = async () => {
    const { data, error } = await supabase
      .from('site_settings')
      .select('*')
      .eq('status', 'active')
      .order('updated_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (!error) {
      setSettings(normalizeSettings(data as Partial<SiteSettings> | null));
    }

    setLoading(false);
  };

  useEffect(() => {
    refreshSettings();
  }, []);

  const value = useMemo(
    () => ({ settings, loading, refreshSettings }),
    [settings, loading]
  );

  return (
    <SiteSettingsContext.Provider value={value}>
      {children}
    </SiteSettingsContext.Provider>
  );
}

export function useSiteSettings() {
  const context = useContext(SiteSettingsContext);
  if (!context) throw new Error('useSiteSettings must be used within SiteSettingsProvider');
  return context;
}
