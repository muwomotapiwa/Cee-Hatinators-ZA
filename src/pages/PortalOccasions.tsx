import type { FormEvent } from 'react';
import { useEffect, useMemo, useState } from 'react';
import { Edit3, Save, X } from 'lucide-react';
import { PortalAdminLayout } from '../components/PortalAdminLayout';
import { supabase } from '../lib/supabase';

type Status = 'draft' | 'active' | 'archived';

interface OccasionRow {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  sort_order: number;
  status: Status;
}

interface ProductOptionRow {
  id: string;
  slug: string;
  name: string;
  status: Status;
}

interface ProductOccasionRow {
  product_id: string;
  occasion_id: string;
}

interface OccasionForm {
  slug: string;
  name: string;
  description: string;
  sort_order: number;
  status: Status;
}

const emptyForm: OccasionForm = {
  slug: '',
  name: '',
  description: '',
  sort_order: 0,
  status: 'active',
};

const statusOptions: Status[] = ['draft', 'active', 'archived'];

function slugify(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/&/g, 'and')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

export function PortalOccasionsPage() {
  const [occasions, setOccasions] = useState<OccasionRow[]>([]);
  const [products, setProducts] = useState<ProductOptionRow[]>([]);
  const [links, setLinks] = useState<ProductOccasionRow[]>([]);
  const [selectedOccasionId, setSelectedOccasionId] = useState<string | null>(null);
  const [selectedProductId, setSelectedProductId] = useState('');
  const [checkedOccasionIds, setCheckedOccasionIds] = useState<string[]>([]);
  const [form, setForm] = useState<OccasionForm>(emptyForm);
  const [loading, setLoading] = useState(true);
  const [savingOccasion, setSavingOccasion] = useState(false);
  const [savingAssignment, setSavingAssignment] = useState(false);
  const [message, setMessage] = useState('');
  const [assignmentMessage, setAssignmentMessage] = useState('');

  const activeOccasions = useMemo(
    () => occasions.filter((occasion) => occasion.status === 'active'),
    [occasions]
  );

  const selectedProduct = products.find((product) => product.id === selectedProductId);

  const loadData = async () => {
    setLoading(true);
    setMessage('');
    setAssignmentMessage('');

    const [occasionResult, productResult, linkResult] = await Promise.all([
      supabase.from('occasions').select('*').order('sort_order', { ascending: true }),
      supabase.from('products').select('id, slug, name, status, sort_order').order('sort_order', { ascending: true }),
      supabase.from('product_occasions').select('product_id, occasion_id'),
    ]);

    if (occasionResult.error || productResult.error || linkResult.error) {
      setMessage(occasionResult.error?.message || productResult.error?.message || linkResult.error?.message || 'Could not load occasions.');
      setOccasions([]);
      setProducts([]);
      setLinks([]);
      setLoading(false);
      return;
    }

    const productRows = (productResult.data || []) as ProductOptionRow[];
    setOccasions((occasionResult.data || []) as OccasionRow[]);
    setProducts(productRows);
    setLinks((linkResult.data || []) as ProductOccasionRow[]);
    setSelectedProductId((current) => {
      if (current && productRows.some((product) => product.id === current)) return current;
      return productRows[0]?.id || '';
    });
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    setCheckedOccasionIds(
      links
        .filter((link) => link.product_id === selectedProductId)
        .map((link) => link.occasion_id)
    );
  }, [links, selectedProductId]);

  const handleNew = () => {
    setSelectedOccasionId(null);
    setForm(emptyForm);
    setMessage('');
  };

  const handleEdit = (occasion: OccasionRow) => {
    setSelectedOccasionId(occasion.id);
    setForm({
      slug: occasion.slug,
      name: occasion.name,
      description: occasion.description || '',
      sort_order: occasion.sort_order,
      status: occasion.status,
    });
    setMessage('');
  };

  const updateForm = (key: keyof OccasionForm, value: string | number) => {
    setForm((current) => ({
      ...current,
      [key]: value,
    }));
  };

  const handleOccasionSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSavingOccasion(true);
    setMessage('');

    const payload = {
      slug: form.slug.trim() || slugify(form.name),
      name: form.name.trim(),
      description: form.description.trim() || null,
      sort_order: Number(form.sort_order || 0),
      status: form.status,
    };

    const request = selectedOccasionId
      ? supabase.from('occasions').update(payload).eq('id', selectedOccasionId)
      : supabase.from('occasions').insert(payload);

    const { error } = await request;

    if (error) {
      setMessage(error.message);
      setSavingOccasion(false);
      return;
    }

    await loadData();
    setForm({ ...emptyForm, sort_order: payload.sort_order + 1 });
    setSelectedOccasionId(null);
    setMessage('Occasion saved.');
    setSavingOccasion(false);
  };

  const toggleAssignedOccasion = (occasionId: string) => {
    setCheckedOccasionIds((current) =>
      current.includes(occasionId)
        ? current.filter((id) => id !== occasionId)
        : [...current, occasionId]
    );
  };

  const handleAssignmentSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!selectedProductId) return;

    setSavingAssignment(true);
    setAssignmentMessage('');

    const { error: deleteError } = await supabase
      .from('product_occasions')
      .delete()
      .eq('product_id', selectedProductId);

    if (deleteError) {
      setAssignmentMessage(deleteError.message);
      setSavingAssignment(false);
      return;
    }

    if (checkedOccasionIds.length > 0) {
      const payload = checkedOccasionIds.map((occasionId) => ({
        product_id: selectedProductId,
        occasion_id: occasionId,
      }));

      const { error: insertError } = await supabase.from('product_occasions').insert(payload);
      if (insertError) {
        setAssignmentMessage(insertError.message);
        setSavingAssignment(false);
        return;
      }
    }

    const { data } = await supabase.from('product_occasions').select('product_id, occasion_id');
    setLinks((data || []) as ProductOccasionRow[]);
    setAssignmentMessage('Hat occasions saved.');
    setSavingAssignment(false);
  };

  return (
    <PortalAdminLayout eyebrow="Occasions" title="Occasions">
      <div className="grid lg:grid-cols-[1fr_420px] gap-8">
        <section className="bg-white border border-silver p-6 sm:p-8">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-6">
            <p className="text-[12px] leading-7 text-charcoal max-w-2xl">
              Add and edit the occasion filters shown on the shop page. Active occasions can be assigned to each hat.
            </p>
            <button
              type="button"
              onClick={handleNew}
              className="border border-silver px-4 py-2 text-[10px] tracking-[2px] uppercase text-dark hover:border-crimson hover:text-crimson transition-colors"
            >
              New
            </button>
          </div>

          {loading ? (
            <div className="py-16 text-center text-[11px] tracking-[2px] uppercase text-mid-gray">Loading...</div>
          ) : occasions.length === 0 ? (
            <div className="py-16 text-center text-[12px] text-charcoal">
              No occasions yet. Add Wedding, Church, Race Day, or any occasion you need.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[640px] border-collapse text-left">
                <thead>
                  <tr className="border-b border-silver">
                    {['name', 'slug', 'sort order', 'status'].map((heading) => (
                      <th key={heading} className="py-3 pr-4 text-[10px] tracking-[2px] uppercase text-charcoal font-medium">
                        {heading}
                      </th>
                    ))}
                    <th className="py-3 text-right text-[10px] tracking-[2px] uppercase text-charcoal font-medium">Edit</th>
                  </tr>
                </thead>
                <tbody>
                  {occasions.map((occasion) => (
                    <tr key={occasion.id} className={`border-b border-silver ${selectedOccasionId === occasion.id ? 'bg-offwhite' : ''}`}>
                      <td className="py-4 pr-4 text-[12px] text-charcoal">{occasion.name}</td>
                      <td className="py-4 pr-4 text-[12px] text-charcoal">{occasion.slug}</td>
                      <td className="py-4 pr-4 text-[12px] text-charcoal">{occasion.sort_order}</td>
                      <td className="py-4 pr-4 text-[12px] text-charcoal">{occasion.status}</td>
                      <td className="py-4 text-right">
                        <button
                          type="button"
                          onClick={() => handleEdit(occasion)}
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

        <div className="space-y-8">
          <form onSubmit={handleOccasionSubmit} className="bg-white border border-silver p-6 sm:p-8 h-fit space-y-4">
            <div className="flex items-start justify-between gap-4">
              <div>
                <span className="text-[10px] tracking-[2px] uppercase text-crimson block mb-2">
                  {selectedOccasionId ? 'Edit Occasion' : 'New Occasion'}
                </span>
                <h2 className="serif text-3xl text-dark font-light">{form.name || 'Occasion'}</h2>
              </div>
              {selectedOccasionId && (
                <button type="button" onClick={handleNew} className="text-mid-gray hover:text-crimson" aria-label="Clear form">
                  <X size={18} />
                </button>
              )}
            </div>

            <div>
              <label className="text-[10px] tracking-[2px] uppercase text-charcoal block mb-2">Name</label>
              <input
                value={form.name}
                onChange={(event) => updateForm('name', event.target.value)}
                required
                className="w-full border border-silver bg-white p-3 text-[13px] outline-none focus:border-crimson"
              />
            </div>

            <div>
              <label className="text-[10px] tracking-[2px] uppercase text-charcoal block mb-2">Slug</label>
              <input
                value={form.slug}
                onChange={(event) => updateForm('slug', event.target.value)}
                placeholder="auto-created from name if blank"
                className="w-full border border-silver bg-white p-3 text-[13px] outline-none focus:border-crimson"
              />
            </div>

            <div>
              <label className="text-[10px] tracking-[2px] uppercase text-charcoal block mb-2">Description</label>
              <textarea
                value={form.description}
                onChange={(event) => updateForm('description', event.target.value)}
                rows={3}
                className="w-full border border-silver bg-white p-3 text-[13px] leading-6 outline-none focus:border-crimson"
              />
            </div>

            <div>
              <label className="text-[10px] tracking-[2px] uppercase text-charcoal block mb-2">Sort Order</label>
              <input
                type="number"
                value={form.sort_order}
                onChange={(event) => updateForm('sort_order', Number(event.target.value))}
                className="w-full border border-silver bg-white p-3 text-[13px] outline-none focus:border-crimson"
              />
            </div>

            <div>
              <label className="text-[10px] tracking-[2px] uppercase text-charcoal block mb-2">Status</label>
              <select
                value={form.status}
                onChange={(event) => updateForm('status', event.target.value as Status)}
                className="w-full border border-silver bg-white p-3 text-[13px] outline-none focus:border-crimson"
              >
                {statusOptions.map((status) => (
                  <option key={status} value={status}>{status}</option>
                ))}
              </select>
            </div>

            {message && (
              <div className={`border p-4 text-[12px] leading-6 ${message.includes('saved') ? 'bg-green-50 border-green-200 text-green-700' : 'bg-red-50 border-red-200 text-red-700'}`}>
                {message}
              </div>
            )}

            <button
              type="submit"
              disabled={savingOccasion}
              className="w-full bg-crimson text-white py-4 text-[11px] tracking-[2px] uppercase hover:bg-crimson-dark transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
            >
              <Save size={15} /> {savingOccasion ? 'Saving...' : 'Save Occasion'}
            </button>
          </form>

          <form onSubmit={handleAssignmentSubmit} className="bg-white border border-silver p-6 sm:p-8 h-fit space-y-4">
            <div>
              <span className="text-[10px] tracking-[2px] uppercase text-crimson block mb-2">Assign To Hat</span>
              <h2 className="serif text-3xl text-dark font-light">{selectedProduct?.name || 'Product'}</h2>
            </div>

            <div>
              <label className="text-[10px] tracking-[2px] uppercase text-charcoal block mb-2">Hat</label>
              <select
                value={selectedProductId}
                onChange={(event) => setSelectedProductId(event.target.value)}
                className="w-full border border-silver bg-white p-3 text-[13px] outline-none focus:border-crimson"
              >
                {products.map((product) => (
                  <option key={product.id} value={product.id}>
                    {product.name} ({product.status})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <p className="text-[10px] tracking-[2px] uppercase text-charcoal block mb-3">Occasions</p>
              {activeOccasions.length === 0 ? (
                <p className="text-[12px] leading-6 text-charcoal">Create at least one active occasion first.</p>
              ) : (
                <div className="space-y-3">
                  {activeOccasions.map((occasion) => (
                    <label key={occasion.id} className="flex items-center gap-3 border border-silver p-3 text-[12px] text-charcoal">
                      <input
                        type="checkbox"
                        checked={checkedOccasionIds.includes(occasion.id)}
                        onChange={() => toggleAssignedOccasion(occasion.id)}
                        className="accent-crimson"
                      />
                      {occasion.name}
                    </label>
                  ))}
                </div>
              )}
            </div>

            {assignmentMessage && (
              <div className={`border p-4 text-[12px] leading-6 ${assignmentMessage.includes('saved') ? 'bg-green-50 border-green-200 text-green-700' : 'bg-red-50 border-red-200 text-red-700'}`}>
                {assignmentMessage}
              </div>
            )}

            <button
              type="submit"
              disabled={savingAssignment || !selectedProductId}
              className="w-full bg-crimson text-white py-4 text-[11px] tracking-[2px] uppercase hover:bg-crimson-dark transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
            >
              <Save size={15} /> {savingAssignment ? 'Saving...' : 'Save Hat Occasions'}
            </button>
          </form>
        </div>
      </div>
    </PortalAdminLayout>
  );
}
