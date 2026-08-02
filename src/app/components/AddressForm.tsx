import { useState } from "react";
import { inter, poppins } from "../lib/fonts";
import { api, type Address } from "../lib/api";

const emptyForm = { label: "", line1: "", line2: "", city: "", state: "", pincode: "", phone: "" };

export default function AddressForm({
  initial, onCancel, onSaved,
}: {
  initial: Address | null;
  onCancel: () => void;
  onSaved: () => void;
}) {
  const [form, setForm] = useState(
    initial
      ? { label: initial.label, line1: initial.line1, line2: initial.line2 ?? "", city: initial.city, state: initial.state, pincode: initial.pincode, phone: initial.phone }
      : emptyForm,
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      if (initial) await api.updateAddress(initial._id, form);
      else await api.addAddress({ ...form, isDefault: false });
      onSaved();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save address");
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={submit} className="bg-[#F8FAFC] dark:bg-white/5 border border-[#E5E7EB] dark:border-white/10 rounded-2xl p-4 mb-4 space-y-3">
      {error && <p className="text-xs text-red-500" style={inter}>{error}</p>}
      <div className="grid grid-cols-2 gap-3">
        <input required placeholder="Label (Home, Work...)" value={form.label} onChange={set("label")} className="col-span-2 sm:col-span-1 px-3 py-2.5 bg-white dark:bg-[#131B2E] border border-[#E5E7EB] dark:border-white/10 rounded-xl text-sm text-[#111827] dark:text-white outline-none focus:border-[#F97316]" style={inter} />
        <input required placeholder="Phone" value={form.phone} onChange={set("phone")} className="col-span-2 sm:col-span-1 px-3 py-2.5 bg-white dark:bg-[#131B2E] border border-[#E5E7EB] dark:border-white/10 rounded-xl text-sm text-[#111827] dark:text-white outline-none focus:border-[#F97316]" style={inter} />
        <input required placeholder="Address line 1" value={form.line1} onChange={set("line1")} className="col-span-2 px-3 py-2.5 bg-white dark:bg-[#131B2E] border border-[#E5E7EB] dark:border-white/10 rounded-xl text-sm text-[#111827] dark:text-white outline-none focus:border-[#F97316]" style={inter} />
        <input placeholder="Address line 2 (optional)" value={form.line2} onChange={set("line2")} className="col-span-2 px-3 py-2.5 bg-white dark:bg-[#131B2E] border border-[#E5E7EB] dark:border-white/10 rounded-xl text-sm text-[#111827] dark:text-white outline-none focus:border-[#F97316]" style={inter} />
        <input required placeholder="City" value={form.city} onChange={set("city")} className="px-3 py-2.5 bg-white dark:bg-[#131B2E] border border-[#E5E7EB] dark:border-white/10 rounded-xl text-sm text-[#111827] dark:text-white outline-none focus:border-[#F97316]" style={inter} />
        <input required placeholder="State" value={form.state} onChange={set("state")} className="px-3 py-2.5 bg-white dark:bg-[#131B2E] border border-[#E5E7EB] dark:border-white/10 rounded-xl text-sm text-[#111827] dark:text-white outline-none focus:border-[#F97316]" style={inter} />
        <input required placeholder="Pincode" value={form.pincode} onChange={set("pincode")} className="col-span-2 sm:col-span-1 px-3 py-2.5 bg-white dark:bg-[#131B2E] border border-[#E5E7EB] dark:border-white/10 rounded-xl text-sm text-[#111827] dark:text-white outline-none focus:border-[#F97316]" style={inter} />
      </div>
      <div className="flex gap-2 justify-end">
        <button type="button" onClick={onCancel} className="px-4 py-2 text-sm font-medium text-[#6B7280] dark:text-gray-400 hover:text-[#374151] dark:hover:text-gray-200" style={inter}>Cancel</button>
        <button type="submit" disabled={saving} className="px-5 py-2 bg-[#F97316] hover:bg-orange-600 text-white rounded-xl text-sm font-semibold disabled:opacity-60" style={poppins}>
          {saving ? "Saving…" : "Save Address"}
        </button>
      </div>
    </form>
  );
}
