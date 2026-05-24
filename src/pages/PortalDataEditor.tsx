import type { FormEvent } from 'react';
import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Edit3, Save, X } from 'lucide-react';
import { PortalAdminLayout } from '../components/PortalAdminLayout';
import { supabase } from '../lib/supabase';
import { formatMoney } from '../lib/money';

type FieldType = 'text' | 'textarea' | 'number' | 'money' | 'select' | 'product_select' | 'checkbox' | 'color_list' | 'url_list' | 'line_list';
type RecordValue = string | number | boolean | string[] | null;
type EditableRecord = Record<string, RecordValue>;

type ProductOption = {
  id: string;
  slug: string;
  name: string;
};

interface EditorField {
  key: string;
  label: string;
  type: FieldType;
  options?: string[];
  required?: boolean;
}

interface EditorConfig {
  section: string;
  title: string;
  description: string;
  table: string;
  orderBy: string;
  canCreate: boolean;
  fields: EditorField[];
  listColumns: string[];
  defaults: EditableRecord;
}

const statusOptions = ['draft', 'active', 'archived'];

const editorConfigs: Record<string, EditorConfig> = {
  content: {
    section: 'Content',
    title: 'Content Blocks',
    description: 'Hero, newsletter, footer, story, and contact copy.',
    table: 'site_content_blocks',
    orderBy: 'sort_order',
    canCreate: true,
    fields: [
      { key: 'page_key', label: 'Page Key', type: 'text', required: true },
      { key: 'block_key', label: 'Block Key', type: 'text', required: true },
      { key: 'title', label: 'Title', type: 'text' },
      { key: 'subtitle', label: 'Subtitle', type: 'text' },
      { key: 'body', label: 'Body', type: 'textarea' },
      { key: 'media_url', label: 'Media URL', type: 'text' },
      { key: 'button_label', label: 'Button Label', type: 'text' },
      { key: 'button_url', label: 'Button URL', type: 'text' },
      { key: 'sort_order', label: 'Sort Order', type: 'number' },
      { key: 'status', label: 'Status', type: 'select', options: statusOptions },
    ],
    listColumns: ['page_key', 'block_key', 'title', 'status'],
    defaults: {
      page_key: 'home',
      block_key: '',
      title: '',
      subtitle: '',
      body: '',
      media_url: '',
      button_label: '',
      button_url: '',
      sort_order: 0,
      status: 'active',
    },
  },
  products: {
    section: 'Products',
    title: 'Products',
    description: 'Product names, display prices, images, badges, and status.',
    table: 'products',
    orderBy: 'sort_order',
    canCreate: true,
    fields: [
      { key: 'slug', label: 'Slug', type: 'text', required: true },
      { key: 'name', label: 'Name', type: 'text', required: true },
      { key: 'short_description', label: 'Short Description', type: 'textarea' },
      { key: 'description', label: 'Description', type: 'textarea' },
      { key: 'base_price_minor', label: 'Price (ZAR)', type: 'money', required: true },
      { key: 'primary_image_url', label: 'Primary Image URL', type: 'text' },
      { key: 'gallery_image_urls', label: 'Thumbnail Image URLs - max 4, one per line', type: 'url_list' },
      { key: 'badge', label: 'Badge', type: 'text' },
      { key: 'colors', label: 'Available Colours - one hex value per line', type: 'color_list' },
      { key: 'styling_note', label: 'Styling Note', type: 'textarea' },
      { key: 'show_on_collections_page', label: 'Show on Collections Page', type: 'checkbox' },
      { key: 'collection_page_title', label: 'Collections Page Title', type: 'text' },
      { key: 'collection_page_description', label: 'Collections Page Description', type: 'textarea' },
      { key: 'collection_page_image_url', label: 'Collections Page Image URL', type: 'text' },
      { key: 'collection_page_image_position', label: 'Collections Page Image Position', type: 'select', options: ['left', 'right'] },
      { key: 'featured', label: 'Featured - show first in New Headwear', type: 'checkbox' },
      { key: 'sort_order', label: 'Sort Order', type: 'number' },
      { key: 'status', label: 'Status', type: 'select', options: statusOptions },
    ],
    listColumns: ['name', 'slug', 'base_price_minor', 'status'],
    defaults: {
      slug: '',
      name: '',
      short_description: '',
      description: '',
      base_price_minor: 0,
      primary_image_url: '',
      gallery_image_urls: [],
      badge: '',
      colors: [],
      styling_note: '',
      show_on_collections_page: false,
      collection_page_title: '',
      collection_page_description: '',
      collection_page_image_url: '',
      collection_page_image_position: 'left',
      featured: false,
      sort_order: 0,
      status: 'draft',
    },
  },
  categories: {
    section: 'Categories',
    title: 'Categories',
    description: 'Category titles, shop filters, images, and ordering.',
    table: 'categories',
    orderBy: 'sort_order',
    canCreate: true,
    fields: [
      { key: 'slug', label: 'Slug', type: 'text', required: true },
      { key: 'name', label: 'Name', type: 'text', required: true },
      { key: 'description', label: 'Description', type: 'textarea' },
      { key: 'image_url', label: 'Image URL', type: 'text' },
      { key: 'sort_order', label: 'Sort Order', type: 'number' },
      { key: 'status', label: 'Status', type: 'select', options: statusOptions },
    ],
    listColumns: ['name', 'slug', 'sort_order', 'status'],
    defaults: {
      slug: '',
      name: '',
      description: '',
      image_url: '',
      sort_order: 0,
      status: 'active',
    },
  },
  collections: {
    section: 'Collections',
    title: 'Collections',
    description: 'Curated edits shown on the Collections page. Choose the product visitors open and the image side for each row.',
    table: 'collections',
    orderBy: 'sort_order',
    canCreate: true,
    fields: [
      { key: 'slug', label: 'Slug', type: 'text', required: true },
      { key: 'name', label: 'Name', type: 'text', required: true },
      { key: 'description', label: 'Description', type: 'textarea' },
      { key: 'hero_image_url', label: 'Hero Image URL', type: 'text' },
      { key: 'featured_product_slug', label: 'Product for Explore Button', type: 'product_select' },
      { key: 'image_position', label: 'Image Position', type: 'select', options: ['left', 'right'] },
      { key: 'sort_order', label: 'Sort Order', type: 'number' },
      { key: 'status', label: 'Status', type: 'select', options: statusOptions },
    ],
    listColumns: ['name', 'featured_product_slug', 'image_position', 'status'],
    defaults: {
      slug: '',
      name: '',
      description: '',
      hero_image_url: '',
      featured_product_slug: '',
      image_position: 'left',
      sort_order: 0,
      status: 'active',
    },
  },
  'spotlight-collection': {
    section: 'Spotlight Collection',
    title: 'Spotlight Collection',
    description: 'Home page Spotlight Collection section. If there is no active record here, the section is hidden on the storefront.',
    table: 'spotlight_collections',
    orderBy: 'sort_order',
    canCreate: true,
    fields: [
      { key: 'eyebrow', label: 'Small Heading', type: 'text' },
      { key: 'title', label: 'Title', type: 'text', required: true },
      { key: 'description', label: 'Description', type: 'textarea' },
      { key: 'hero_image_url', label: 'Large Image URL', type: 'text' },
      { key: 'image_urls', label: 'Small Image URLs - max 2, one per line', type: 'url_list' },
      { key: 'details', label: 'Bullet Lines - one per line', type: 'line_list' },
      { key: 'button_label', label: 'Button Label', type: 'text' },
      { key: 'collection_slug', label: 'Shop Collection Slug', type: 'text' },
      { key: 'sort_order', label: 'Sort Order', type: 'number' },
      { key: 'status', label: 'Status', type: 'select', options: statusOptions },
    ],
    listColumns: ['title', 'collection_slug', 'sort_order', 'status'],
    defaults: {
      eyebrow: 'Spotlight Collection',
      title: '',
      description: '',
      hero_image_url: '',
      image_urls: [],
      details: [],
      button_label: 'Shop the Collection',
      collection_slug: '',
      sort_order: 0,
      status: 'active',
    },
  },
  testimonials: {
    section: 'Testimonials',
    title: 'Testimonials',
    description: 'Customer stories shown in the What People Say section. If there are no active records, the section is hidden on the storefront.',
    table: 'testimonials',
    orderBy: 'sort_order',
    canCreate: true,
    fields: [
      { key: 'customer_name', label: 'Customer Name', type: 'text', required: true },
      { key: 'location', label: 'Location', type: 'text' },
      { key: 'image_url', label: 'Person Image URL', type: 'text' },
      { key: 'rating', label: 'Rating 1-5', type: 'number' },
      { key: 'quote', label: 'Quote', type: 'textarea', required: true },
      { key: 'sort_order', label: 'Sort Order', type: 'number' },
      { key: 'status', label: 'Status', type: 'select', options: statusOptions },
    ],
    listColumns: ['customer_name', 'location', 'rating', 'status'],
    defaults: {
      customer_name: '',
      location: '',
      image_url: '',
      rating: 5,
      quote: '',
      sort_order: 0,
      status: 'active',
    },
  },
  messages: {
    section: 'Messages',
    title: 'Messages',
    description: 'Contact form submissions and handling status.',
    table: 'contact_messages',
    orderBy: 'created_at',
    canCreate: false,
    fields: [
      { key: 'name', label: 'Name', type: 'text' },
      { key: 'email', label: 'Email', type: 'text' },
      { key: 'subject', label: 'Subject', type: 'text' },
      { key: 'message', label: 'Message', type: 'textarea' },
      { key: 'status', label: 'Status', type: 'select', options: ['new', 'read', 'handled', 'archived'] },
    ],
    listColumns: ['name', 'email', 'subject', 'status'],
    defaults: {
      name: '',
      email: '',
      subject: '',
      message: '',
      status: 'new',
    },
  },
  newsletter: {
    section: 'Newsletter',
    title: 'Newsletter Subscribers',
    description: 'Subscriber list and handling status.',
    table: 'newsletter_subscribers',
    orderBy: 'created_at',
    canCreate: false,
    fields: [
      { key: 'email', label: 'Email', type: 'text' },
      { key: 'source', label: 'Source', type: 'text' },
      { key: 'status', label: 'Status', type: 'select', options: ['active', 'unsubscribed', 'archived'] },
    ],
    listColumns: ['email', 'source', 'status'],
    defaults: {
      email: '',
      source: '',
      status: 'active',
    },
  },
};

function getInitialForm(config: EditorConfig) {
  return { ...config.defaults };
}

function normalizeFormValue(value: unknown): RecordValue {
  if (Array.isArray(value)) {
    return value.filter((item): item is string => typeof item === 'string');
  }

  if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') return value;
  return null;
}

function minorUnitsToMajorValue(value: unknown) {
  const minorUnits = typeof value === 'number' ? value : Number(value || 0);
  return (minorUnits / 100).toFixed(2);
}

function toFormRecord(config: EditorConfig, row: Record<string, unknown>): EditableRecord {
  return config.fields.reduce<EditableRecord>((result, field) => {
    if (field.type === 'money') {
      result[field.key] = minorUnitsToMajorValue(row[field.key]);
      return result;
    }

    result[field.key] = normalizeFormValue(row[field.key]);
    return result;
  }, {});
}

function displayValue(value: unknown) {
  if (value === null || value === undefined || value === '') return '-';
  if (Array.isArray(value)) return value.join(', ');
  if (typeof value === 'boolean') return value ? 'Yes' : 'No';
  return String(value);
}

function displayColumnValue(config: EditorConfig, column: string, row: Record<string, unknown>) {
  if (config.table === 'products' && column === 'base_price_minor') {
    return formatMoney(Number(row[column] || 0) / 100);
  }

  return displayValue(row[column]);
}

function columnHeading(config: EditorConfig, column: string) {
  if (config.table === 'products' && column === 'base_price_minor') return 'Price';
  return column.replace(/_/g, ' ');
}

function colorsToText(value: RecordValue) {
  if (Array.isArray(value)) return value.join('\n');
  if (typeof value === 'string') return value;
  return '';
}

function textToColors(value: string) {
  return value
    .split(/[\n,]/)
    .map((color) => color.trim())
    .filter(Boolean);
}

function urlsToText(value: RecordValue) {
  if (Array.isArray(value)) return value.join('\n');
  if (typeof value === 'string') return value;
  return '';
}

function textToUrls(value: string) {
  return value
    .split(/[\n,]/)
    .map((url) => url.trim())
    .filter(Boolean)
    .slice(0, 4);
}

function linesToText(value: RecordValue) {
  if (Array.isArray(value)) return value.join('\n');
  if (typeof value === 'string') return value;
  return '';
}

function textToLines(value: string) {
  return value
    .split(/\n/)
    .map((line) => line.trim())
    .filter(Boolean);
}

export function PortalDataEditorPage() {
  const { section = '' } = useParams();
  const config = editorConfigs[section];
  const [rows, setRows] = useState<Record<string, unknown>[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [form, setForm] = useState<EditableRecord>(() => (config ? getInitialForm(config) : {}));
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [productOptions, setProductOptions] = useState<ProductOption[]>([]);

  const selectedRow = useMemo(
    () => rows.find((row) => row.id === selectedId),
    [rows, selectedId]
  );

  const loadRows = async () => {
    if (!config) return;

    setLoading(true);
    setMessage('');

    const { data, error } = await supabase
      .from(config.table)
      .select('*')
      .order(config.orderBy, { ascending: config.orderBy !== 'created_at' });

    if (error) {
      setMessage(error.message);
      setRows([]);
    } else {
      setRows((data || []) as Record<string, unknown>[]);
    }

    setLoading(false);
  };

  const loadProductOptions = async () => {
    const { data, error } = await supabase
      .from('products')
      .select('id, slug, name')
      .order('name', { ascending: true });

    if (!error) {
      setProductOptions((data || []) as ProductOption[]);
    }
  };

  useEffect(() => {
    if (!config) return;

    setSelectedId(null);
    setForm(getInitialForm(config));
    loadRows();
    if (config.table === 'collections') {
      loadProductOptions();
    }
  }, [section]);

  if (!config) {
    return (
      <PortalAdminLayout eyebrow="Portal" title="Area Not Found">
        <div className="bg-white border border-silver p-8 text-[13px] text-charcoal">
          That portal area does not exist yet.
        </div>
      </PortalAdminLayout>
    );
  }

  const handleNew = () => {
    setSelectedId(null);
    setForm(getInitialForm(config));
    setMessage('');
  };

  const handleEdit = (row: Record<string, unknown>) => {
    setSelectedId(String(row.id));
    setForm(toFormRecord(config, row));
    setMessage('');
  };

  const updateField = (field: EditorField, value: string | boolean) => {
    setForm((current) => ({
      ...current,
      [field.key]: field.type === 'number' ? Number(value) : value,
    }));
  };

  const getPayload = () => {
    const payload = config.fields.reduce<EditableRecord>((payload, field) => {
      const value = form[field.key];

      if (field.type === 'number') {
        payload[field.key] = Number(value || 0);
        return payload;
      }

      if (field.type === 'money') {
        const amount = Number(String(value || '0').replace(/,/g, ''));
        payload[field.key] = Math.round((Number.isFinite(amount) ? amount : 0) * 100);
        return payload;
      }

      if (field.type === 'checkbox') {
        payload[field.key] = Boolean(value);
        return payload;
      }

      if (field.type === 'product_select') {
        payload[field.key] = value === '' ? null : value;
        return payload;
      }

      if (field.type === 'color_list') {
        const colors = Array.isArray(value) ? value : textToColors(String(value || ''));
        payload[field.key] = colors.length > 0 ? colors : null;
        return payload;
      }

      if (field.type === 'url_list') {
        const urls = Array.isArray(value) ? value.slice(0, 4) : textToUrls(String(value || ''));
        payload[field.key] = urls.length > 0 ? urls : null;
        return payload;
      }

      if (field.type === 'line_list') {
        const lines = Array.isArray(value) ? value : textToLines(String(value || ''));
        payload[field.key] = lines.length > 0 ? lines : null;
        return payload;
      }

      payload[field.key] = value === '' ? null : value;
      return payload;
    }, {});

    if (config.table === 'products') {
      payload.currency = 'ZAR';
    }

    return payload;
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSaving(true);
    setMessage('');

    const payload = getPayload();

    const request = selectedId
      ? supabase.from(config.table).update(payload).eq('id', selectedId).select('*').single()
      : supabase.from(config.table).insert(payload).select('*').single();

    const { data, error } = await request;

    if (error) {
      setMessage(error.message);
      setSaving(false);
      return;
    }

    if (data && typeof data.id === 'string') {
      setSelectedId(data.id);
      setForm(toFormRecord(config, data as Record<string, unknown>));
    }

    await loadRows();
    setMessage('Saved.');
    setSaving(false);
  };

  return (
    <PortalAdminLayout eyebrow={config.section} title={config.title}>
      <div className="grid lg:grid-cols-[1fr_420px] gap-8">
        <section className="bg-white border border-silver p-6 sm:p-8">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-6">
            <p className="text-[12px] leading-7 text-charcoal max-w-2xl">{config.description}</p>
            {config.canCreate && (
              <button
                type="button"
                onClick={handleNew}
                className="border border-silver px-4 py-2 text-[10px] tracking-[2px] uppercase text-dark hover:border-crimson hover:text-crimson transition-colors"
              >
                New
              </button>
            )}
          </div>

          {loading ? (
            <div className="py-16 text-center text-[11px] tracking-[2px] uppercase text-mid-gray">Loading...</div>
          ) : rows.length === 0 ? (
            <div className="py-16 text-center text-[12px] text-charcoal">No records yet.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[680px] border-collapse text-left">
                <thead>
                  <tr className="border-b border-silver">
                    {config.listColumns.map((column) => (
                      <th key={column} className="py-3 pr-4 text-[10px] tracking-[2px] uppercase text-charcoal font-medium">
                        {columnHeading(config, column)}
                      </th>
                    ))}
                    <th className="py-3 text-right text-[10px] tracking-[2px] uppercase text-charcoal font-medium">Edit</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row) => (
                    <tr key={String(row.id)} className={`border-b border-silver ${selectedId === row.id ? 'bg-offwhite' : ''}`}>
                      {config.listColumns.map((column) => (
                        <td key={column} className="py-4 pr-4 text-[12px] text-charcoal max-w-[220px] truncate">
                          {config.table === 'collections' && column === 'featured_product_slug'
                            ? productOptions.find((product) => product.slug === String(row[column] || ''))?.name || displayValue(row[column])
                            : displayColumnValue(config, column, row)}
                        </td>
                      ))}
                      <td className="py-4 text-right">
                        <button
                          type="button"
                          onClick={() => handleEdit(row)}
                          className="inline-flex items-center gap-2 text-[10px] tracking-[1.5px] uppercase text-crimson hover:text-dark transition-colors"
                        >
                          <Edit3 size={13} /> Edit
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        <form onSubmit={handleSubmit} className="bg-white border border-silver p-6 sm:p-8 h-fit space-y-4">
          <div className="flex items-start justify-between gap-4">
            <div>
              <span className="text-[10px] tracking-[2px] uppercase text-crimson block mb-2">
                {selectedId ? 'Edit Record' : 'New Record'}
              </span>
              <h2 className="serif text-3xl text-dark font-light">{selectedRow ? displayValue(selectedRow[config.listColumns[0]]) : config.section}</h2>
            </div>
            {selectedId && config.canCreate && (
              <button type="button" onClick={handleNew} className="text-mid-gray hover:text-crimson" aria-label="Clear form">
                <X size={18} />
              </button>
            )}
          </div>

          {config.fields.map((field) => (
            <div key={field.key}>
              <label className="text-[10px] tracking-[2px] uppercase text-charcoal block mb-2">
                {field.label}
              </label>
              {field.type === 'textarea' ? (
                <textarea
                  value={String(form[field.key] || '')}
                  onChange={(event) => updateField(field, event.target.value)}
                  rows={4}
                  required={field.required}
                  className="w-full border border-silver bg-white p-3 text-[13px] leading-6 outline-none focus:border-crimson"
                />
              ) : field.type === 'color_list' ? (
                <>
                  <textarea
                    value={colorsToText(form[field.key])}
                    onChange={(event) => updateField(field, event.target.value)}
                    rows={4}
                    className="w-full border border-silver bg-white p-3 text-[13px] leading-6 outline-none focus:border-crimson"
                    placeholder={'#4f0254\n#e01386\n#b3899e'}
                  />
                  <div className="mt-2 flex flex-wrap gap-2">
                    {textToColors(colorsToText(form[field.key])).map((color) => (
                      <span key={color} className="inline-flex h-5 w-5 rounded-full border border-silver" style={{ backgroundColor: color }} title={color} />
                    ))}
                  </div>
                </>
              ) : field.type === 'url_list' ? (
                <textarea
                  value={urlsToText(form[field.key])}
                  onChange={(event) => updateField(field, event.target.value)}
                  rows={5}
                  className="w-full border border-silver bg-white p-3 text-[13px] leading-6 outline-none focus:border-crimson"
                  placeholder={'https://example.com/hat-front.jpg\nhttps://example.com/hat-side.jpg'}
                />
              ) : field.type === 'line_list' ? (
                <textarea
                  value={linesToText(form[field.key])}
                  onChange={(event) => updateField(field, event.target.value)}
                  rows={5}
                  className="w-full border border-silver bg-white p-3 text-[13px] leading-6 outline-none focus:border-crimson"
                  placeholder={'Elegant silhouettes for weddings\nStatement colour stories in purple'}
                />
              ) : field.type === 'select' ? (
                <select
                  value={String(form[field.key] || '')}
                  onChange={(event) => updateField(field, event.target.value)}
                  required={field.required}
                  className="w-full border border-silver bg-white p-3 text-[13px] outline-none focus:border-crimson"
                >
                  {field.options?.map((option) => (
                    <option key={option} value={option}>{option}</option>
                  ))}
                </select>
              ) : field.type === 'product_select' ? (
                <select
                  value={String(form[field.key] || '')}
                  onChange={(event) => updateField(field, event.target.value)}
                  required={field.required}
                  className="w-full border border-silver bg-white p-3 text-[13px] outline-none focus:border-crimson"
                >
                  <option value="">Select product...</option>
                  {productOptions.map((product) => (
                    <option key={product.id} value={product.slug}>{product.name}</option>
                  ))}
                </select>
              ) : field.type === 'checkbox' ? (
                <label className="flex items-center gap-3 border border-silver p-3 text-[12px] text-charcoal">
                  <input
                    type="checkbox"
                    checked={Boolean(form[field.key])}
                    onChange={(event) => updateField(field, event.target.checked)}
                    className="accent-crimson"
                  />
                  Yes
                </label>
              ) : (
                <input
                  type={field.type === 'money' ? 'number' : field.type}
                  step={field.type === 'money' ? '0.01' : undefined}
                  min={field.type === 'money' ? '0' : undefined}
                  inputMode={field.type === 'money' ? 'decimal' : undefined}
                  value={field.type === 'number' ? Number(form[field.key] || 0) : String(form[field.key] || '')}
                  onChange={(event) => updateField(field, event.target.value)}
                  required={field.required}
                  className="w-full border border-silver bg-white p-3 text-[13px] outline-none focus:border-crimson"
                />
              )}
            </div>
          ))}

          {message && (
            <div className={`border p-4 text-[12px] leading-6 ${message === 'Saved.' ? 'bg-green-50 border-green-200 text-green-700' : 'bg-red-50 border-red-200 text-red-700'}`}>
              {message}
            </div>
          )}

          <button
            type="submit"
            disabled={saving || (!selectedId && !config.canCreate)}
            className="w-full bg-crimson text-white py-4 text-[11px] tracking-[2px] uppercase hover:bg-crimson-dark transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
          >
            <Save size={15} /> {saving ? 'Saving...' : 'Save'}
          </button>
        </form>
      </div>
    </PortalAdminLayout>
  );
}
