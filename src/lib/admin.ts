import { collection, doc, getDocs } from 'firebase/firestore';
import { db, addCollectionDoc, deleteCollectionDoc, setCollectionDoc } from './firebase';
import { esc } from './text';

// ---- Field schema -----------------------------------------------------------

export type FieldDef =
  | { type: 'text'; key: string; label: string; placeholder?: string }
  | { type: 'url'; key: string; label: string; placeholder?: string }
  | { type: 'email'; key: string; label: string; placeholder?: string }
  | { type: 'date'; key: string; label: string }
  | { type: 'textarea'; key: string; label: string }
  | { type: 'number'; key: string; label: string }
  | { type: 'boolean'; key: string; label: string }
  | { type: 'list'; key: string; label: string }
  | {
      type: 'pairList';
      key: string;
      label: string;
      keys: [string, string];
      labels: [string, string];
    }
  | { type: 'object'; key: string; label: string; fields: FieldDef[] };

export interface CollectionDef {
  name: string;
  label: string;
  itemLabel?: string;
  single?: boolean;
  fields: FieldDef[];
}

export const COLLECTIONS: CollectionDef[] = [
  {
    name: 'profile',
    label: 'Profile',
    single: true,
    fields: [
      { type: 'text', key: 'name', label: 'Name' },
      { type: 'text', key: 'role', label: 'Role' },
      { type: 'textarea', key: 'tagline', label: 'Tagline' },
      { type: 'textarea', key: 'bio', label: 'Bio' },
      { type: 'url', key: 'photoUrl', label: 'Photo URL' },
      { type: 'text', key: 'location', label: 'Location' },
      { type: 'email', key: 'email', label: 'Email' },
      { type: 'url', key: 'resumeUrl', label: 'Résumé URL' },
      {
        type: 'object',
        key: 'social',
        label: 'Social links',
        fields: [
          { type: 'url', key: 'github', label: 'GitHub' },
          { type: 'url', key: 'linkedin', label: 'LinkedIn' },
          { type: 'url', key: 'twitter', label: 'Twitter' },
        ],
      },
    ],
  },
  {
    name: 'skills',
    label: 'Skills',
    itemLabel: 'category',
    fields: [
      { type: 'text', key: 'category', label: 'Category name' },
      { type: 'number', key: 'order', label: 'Order' },
      {
        type: 'pairList',
        key: 'items',
        label: 'Items',
        keys: ['name', 'icon'],
        labels: ['Name', 'icon'],
      },
    ],
  },
  {
    name: 'experience',
    label: 'Experience',
    itemLabel: 'role',
    fields: [
      { type: 'text', key: 'company', label: 'Company' },
      { type: 'url', key: 'logoUrl', label: 'Company logo URL (optional)' },
      { type: 'text', key: 'role', label: 'Role' },
      { type: 'text', key: 'location', label: 'Location' },
      { type: 'date', key: 'periodStart', label: 'Start date' },
      { type: 'date', key: 'periodEnd', label: 'End date (leave empty if current)' },
      { type: 'boolean', key: 'current', label: 'Current role' },
      { type: 'textarea', key: 'description', label: 'Description' },
      { type: 'list', key: 'highlights', label: 'Highlights' },
      { type: 'list', key: 'tech', label: 'Tech' },
      { type: 'number', key: 'order', label: 'Order' },
    ],
  },
  {
    name: 'projects',
    label: 'Projects',
    itemLabel: 'title',
    fields: [
      { type: 'text', key: 'title', label: 'Title' },
      { type: 'textarea', key: 'description', label: 'Description' },
      { type: 'url', key: 'demoUrl', label: 'Demo URL' },
      { type: 'url', key: 'repoUrl', label: 'Repo URL' },
      { type: 'list', key: 'tech', label: 'Tech' },
      { type: 'list', key: 'tags', label: 'Tags' },
      { type: 'boolean', key: 'featured', label: 'Featured' },
      { type: 'number', key: 'order', label: 'Order' },
    ],
  },
  {
    name: 'education',
    label: 'Education',
    itemLabel: 'degree',
    fields: [
      { type: 'text', key: 'institution', label: 'Institution' },
      { type: 'text', key: 'degree', label: 'Degree' },
      { type: 'date', key: 'periodStart', label: 'Start date' },
      { type: 'date', key: 'periodEnd', label: 'End date' },
      { type: 'textarea', key: 'description', label: 'Description' },
      { type: 'number', key: 'order', label: 'Order' },
    ],
  },
  {
    name: 'certifications',
    label: 'Certifications',
    itemLabel: 'name',
    fields: [
      { type: 'text', key: 'name', label: 'Name' },
      { type: 'text', key: 'issuer', label: 'Issuer' },
      { type: 'text', key: 'year', label: 'Year' },
      { type: 'url', key: 'url', label: 'URL' },
      { type: 'url', key: 'imageUrl', label: 'Badge image URL (optional)' },
      { type: 'number', key: 'order', label: 'Order' },
    ],
  },
];

export interface AdminDoc {
  id: string;
  data: Record<string, unknown>;
}

// ---- CRUD helpers -----------------------------------------------------------

export async function fetchCollection(col: CollectionDef): Promise<AdminDoc[]> {
  if (!db) return [];
  const snapshot = await getDocs(collection(db, col.name));
  const docs = snapshot.docs.map((d) => ({
    id: d.id,
    data: d.data() as Record<string, unknown>,
  }));
  return docs.sort((a, b) => {
    const ao = (a.data.order as number | undefined) ?? Number.MAX_SAFE_INTEGER;
    const bo = (b.data.order as number | undefined) ?? Number.MAX_SAFE_INTEGER;
    return ao - bo;
  });
}

export async function saveDoc(
  col: CollectionDef,
  id: string | null,
  data: Record<string, unknown>,
): Promise<void> {
  if (!db) throw new Error('Firebase is not configured.');
  const targetId = col.single ? 'main' : (id ?? doc(collection(db, col.name)).id);
  if (col.single || id) {
    await setCollectionDoc(col.name, targetId, data);
  } else {
    await addCollectionDoc(col.name, data);
  }
}

export async function removeDoc(col: CollectionDef, id: string): Promise<void> {
  if (!db) throw new Error('Firebase is not configured.');
  await deleteCollectionDoc(col.name, id);
}

export function describe(col: CollectionDef, data: Record<string, unknown>): string {
  const v = (key: string): string => (data?.[key] as string | undefined) ?? '';
  if (col.name === 'experience') {
    const parts = [v('company'), v('role')].filter(Boolean);
    return parts.length ? parts.join(' — ') : col.label;
  }
  if (col.name === 'skills') {
    return v('category') || col.label;
  }
  return v(col.itemLabel ?? '') || col.label;
}

// ---- Form rendering ----------------------------------------------------------

export const BTN_PRIMARY =
  'inline-flex items-center justify-center rounded-xl bg-accent px-4 py-2 text-sm font-semibold text-white transition hover:bg-accent-hover disabled:cursor-not-allowed disabled:opacity-60';
export const BTN_GHOST =
  'inline-flex items-center justify-center rounded-xl border border-line bg-surface px-4 py-2 text-sm font-medium text-ink transition hover:border-accent/40 hover:text-accent';
export const BTN_DANGER =
  'inline-flex items-center justify-center rounded-xl border border-line bg-surface px-3 py-2 text-sm font-medium text-[#b3261e] transition hover:border-[#b3261e]/40';

const INPUT =
  'mt-1 w-full rounded-xl border border-line bg-base px-3 py-2 text-sm text-ink placeholder:text-muted/60 outline-none transition focus:border-accent focus:ring-2 focus:ring-accent/30';
const LABEL = 'text-sm font-medium text-ink';

function valueFor(data: Record<string, unknown> | undefined, key: string): string {
  const v = data?.[key];
  return v == null ? '' : String(v);
}

function renderField(field: FieldDef, data: Record<string, unknown> | undefined, prefix = ''): string {
  const name = prefix ? `${prefix}.${field.key}` : field.key;
  const label = `<span class="${LABEL}">${esc(field.label)}</span>`;
  const placeholder =
    'placeholder' in field && field.placeholder ? ` placeholder="${esc(field.placeholder)}"` : '';

  switch (field.type) {
    case 'boolean': {
      const checked = data?.[field.key] === true ? ' checked' : '';
      return `
        <label class="flex items-center gap-2 text-sm font-medium text-ink">
          <input type="checkbox" name="${name}"${checked} class="h-4 w-4 rounded border-line accent-[#b8683f]" />
          ${esc(field.label)}
        </label>`;
    }
    case 'textarea':
      return `
        <div>
          ${label}
          <textarea name="${name}" rows="4" class="${INPUT}">${esc(valueFor(data, field.key))}</textarea>
        </div>`;
    case 'list':
      return `
        <div>
          ${label}
          <p class="mt-0.5 text-xs text-muted">One item per line.</p>
          <textarea name="${name}" rows="4" class="${INPUT}">${esc(valueFor(data, field.key))}</textarea>
        </div>`;
    case 'pairList': {
      const items = Array.isArray(data?.[field.key])
        ? (data?.[field.key] as Record<string, string>[])
        : [];
      const raw = items
        .map((it) => [it[field.keys[0]], it[field.keys[1]]].filter(Boolean).join(' | '))
        .join('\n');
      return `
        <div>
          ${label}
          <p class="mt-0.5 text-xs text-muted">One per line: ${esc(field.labels[0])} | ${esc(field.labels[1])}</p>
          <textarea name="${name}" rows="4" class="${INPUT}">${esc(raw)}</textarea>
        </div>`;
    }
    case 'object':
      return `
        <fieldset class="border-t border-line pt-4">
          <legend class="${LABEL}">${esc(field.label)}</legend>
          <div class="mt-2 space-y-3">
            ${field.fields.map((f) => renderField(f, data, name)).join('')}
          </div>
        </fieldset>`;
    default:
      return `
        <div>
          ${label}
          <input type="${field.type}" name="${name}" value="${esc(valueFor(data, field.key))}"${placeholder} class="${INPUT}" />
        </div>`;
  }
}

export function formHtml(col: CollectionDef, data: Record<string, unknown> = {}): string {
  return `
    <form data-crud-form class="space-y-4" novalidate>
      ${col.fields.map((f) => renderField(f, data)).join('')}
      <div class="flex items-center justify-end gap-3 pt-2">
        <button type="button" data-close class="${BTN_GHOST}">Cancel</button>
        <button type="submit" class="${BTN_PRIMARY}">Save</button>
      </div>
    </form>`;
}

// ---- Form parsing ------------------------------------------------------------

function parseField(field: FieldDef, form: HTMLFormElement, prefix = ''): unknown {
  const name = prefix ? `${prefix}.${field.key}` : field.key;
  const el = form.elements.namedItem(name) as HTMLInputElement | HTMLTextAreaElement | null;
  const value = el?.value ?? '';

  switch (field.type) {
    case 'boolean':
      return (el as HTMLInputElement | null)?.checked === true;
    case 'number': {
      const n = Number(value);
      return Number.isFinite(n) ? n : 0;
    }
    case 'list':
      return value
        .split('\n')
        .map((s) => s.trim())
        .filter(Boolean);
    case 'pairList':
      return value
        .split('\n')
        .map((line) => {
          const [a, b] = line.split('|').map((s) => s.trim());
          const item: Record<string, string> = {};
          item[field.keys[0]] = a ?? '';
          item[field.keys[1]] = b ?? '';
          return item;
        })
        .filter((o) => o[field.keys[0]] || o[field.keys[1]]);
    case 'object': {
      const obj: Record<string, unknown> = {};
      for (const f of field.fields) obj[f.key] = parseField(f, form, name);
      return obj;
    }
    default:
      return value;
  }
}

export function parseForm(col: CollectionDef, form: HTMLFormElement): Record<string, unknown> {
  const data: Record<string, unknown> = {};
  for (const f of col.fields) data[f.key] = parseField(f, form);
  return data;
}
