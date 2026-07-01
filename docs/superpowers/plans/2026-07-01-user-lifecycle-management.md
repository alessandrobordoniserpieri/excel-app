# User Lifecycle Management Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add user lifecycle management: status field (pending/active/disabled), disable/reactivate users, resend invites, action menu, and update operator dropdowns to use registered users.

**Architecture:** Add `status` column to `profiles` table in Supabase. Update the `Users.tsx` page with status badges, three-dot action menu, confirmation modals, and resend invite functionality. Update `PracticeForm.tsx` and `Practices.tsx` to fetch operators from the `profiles` table (only active users) instead of the hardcoded `OPERATORS` list. Show "(disattivato)" next to disabled operator names in practice views.

**Tech Stack:** React 19, TypeScript, Supabase (PostgreSQL + Edge Functions), Tailwind CSS v4

---

### Task 1: Add `status` column to profiles table

**Files:**
- No local files modified (Supabase migration via MCP)

- [ ] **Step 1: Add status column to profiles table**

Run SQL migration on Supabase to add the `status` column:

```sql
ALTER TABLE profiles
ADD COLUMN status text NOT NULL DEFAULT 'active'
CHECK (status IN ('pending', 'active', 'disabled'));
```

- [ ] **Step 2: Update existing admin profile to 'active'**

```sql
UPDATE profiles SET status = 'active' WHERE role = 'admin';
```

- [ ] **Step 3: Update the invite-user Edge Function**

Update the Edge Function so that when it creates a profile, it sets `status = 'pending'`. The profile trigger currently creates profiles on signup — we need to ensure invited users get `status = 'pending'` and it flips to `'active'` on first login.

Update the `handle_new_user` trigger function:

```sql
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role, status)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'role', 'operatore'),
    CASE
      WHEN NEW.email_confirmed_at IS NOT NULL THEN 'active'
      ELSE 'pending'
    END
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    status = CASE
      WHEN profiles.status = 'pending' AND NEW.email_confirmed_at IS NOT NULL THEN 'active'
      ELSE profiles.status
    END;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

- [ ] **Step 4: Create trigger to flip pending→active on login**

```sql
CREATE OR REPLACE FUNCTION activate_user_on_login()
RETURNS trigger AS $$
BEGIN
  IF NEW.email_confirmed_at IS NOT NULL AND OLD.email_confirmed_at IS NULL THEN
    UPDATE public.profiles
    SET status = 'active'
    WHERE id = NEW.id AND status = 'pending';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_user_email_confirmed
  AFTER UPDATE OF email_confirmed_at ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION activate_user_on_login();
```

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "Aggiunta colonna status alla tabella profiles"
```

---

### Task 2: Update Profile type and useAuth hook

**Files:**
- Modify: `src/hooks/useAuth.tsx`
- Modify: `src/pages/Users.tsx` (Profile interface)

- [ ] **Step 1: Update Profile interface in useAuth.tsx**

In `src/hooks/useAuth.tsx`, change the Profile interface (lines 6-10):

```typescript
interface Profile {
  id: string
  email: string
  full_name: string
  role: 'admin' | 'operatore'
  status: 'pending' | 'active' | 'disabled'
}
```

- [ ] **Step 2: Update Profile interface in Users.tsx**

In `src/pages/Users.tsx`, change the Profile interface (lines 5-11):

```typescript
interface Profile {
  id: string
  email: string
  full_name: string
  role: 'admin' | 'operatore'
  status: 'pending' | 'active' | 'disabled'
  created_at: string
}
```

- [ ] **Step 3: Build and verify**

Run: `npm run build`
Expected: No TypeScript errors

- [ ] **Step 4: Commit**

```bash
git add src/hooks/useAuth.tsx src/pages/Users.tsx
git commit -m "Aggiunto campo status alle interfacce Profile"
```

---

### Task 3: Update Users.tsx — status badges and action menu

**Files:**
- Modify: `src/pages/Users.tsx`

- [ ] **Step 1: Add status badge column to table header**

In `src/pages/Users.tsx`, add a "Stato" column header after "Ruolo" and an "Azioni" column at the end. Replace the `<thead>` section (lines 97-103):

```tsx
<thead>
  <tr className="bg-slate-50 border-b border-slate-200">
    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Nome</th>
    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Email</th>
    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Ruolo</th>
    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Stato</th>
    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Registrato il</th>
    <th className="px-6 py-3 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">Azioni</th>
  </tr>
</thead>
```

- [ ] **Step 2: Add status badge and action menu to table rows**

Replace the table body `{profiles.map(...)}` section (lines 106-132). Each row now shows a status badge and a three-dot menu button:

```tsx
{profiles.map((p) => (
  <tr key={p.id} className="hover:bg-slate-50">
    <td className="px-6 py-4">
      <div className="flex items-center gap-3">
        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
          p.status === 'disabled' ? 'bg-slate-100' : 'bg-blue-100'
        }`}>
          <span className={`text-sm font-semibold ${
            p.status === 'disabled' ? 'text-slate-400' : 'text-blue-700'
          }`}>
            {p.full_name.charAt(0).toUpperCase()}
          </span>
        </div>
        <span className={`text-sm font-medium ${
          p.status === 'disabled' ? 'text-slate-400' : 'text-slate-900'
        }`}>
          {p.full_name}
        </span>
      </div>
    </td>
    <td className={`px-6 py-4 text-sm ${p.status === 'disabled' ? 'text-slate-400' : 'text-slate-600'}`}>
      {p.email}
    </td>
    <td className="px-6 py-4">
      <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
        p.role === 'admin'
          ? 'bg-purple-100 text-purple-700'
          : 'bg-blue-100 text-blue-700'
      }`}>
        {p.role === 'admin' ? 'Admin' : 'Operatore'}
      </span>
    </td>
    <td className="px-6 py-4">
      <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
        p.status === 'active'
          ? 'bg-green-100 text-green-700'
          : p.status === 'pending'
            ? 'bg-yellow-100 text-yellow-700'
            : 'bg-slate-100 text-slate-500'
      }`}>
        {p.status === 'active' ? 'Attivo' : p.status === 'pending' ? 'In attesa' : 'Disattivato'}
      </span>
    </td>
    <td className="px-6 py-4 text-sm text-slate-500">
      {new Date(p.created_at).toLocaleDateString('it-IT')}
    </td>
    <td className="px-6 py-4 text-right">
      <ActionMenu profile={p} />
    </td>
  </tr>
))}
```

- [ ] **Step 3: Create ActionMenu component inside Users.tsx**

Add this component inside `Users.tsx`, before the `Users` function. It renders a three-dot button that opens a dropdown with context-dependent actions:

```tsx
function ActionMenu({ profile: p }: { profile: Profile }) {
  const [open, setOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    if (open) document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [open])

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setOpen(!open)}
        className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
      >
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
          <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
        </svg>
      </button>
      {open && (
        <div className="absolute right-0 mt-1 w-48 bg-white rounded-lg shadow-lg border border-slate-200 py-1 z-10">
          {p.status === 'pending' && (
            <button
              onClick={() => { setOpen(false); /* will wire up */ }}
              className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
            >
              Rinvia invito
            </button>
          )}
          {p.status === 'active' && (
            <button
              onClick={() => { setOpen(false); /* will wire up */ }}
              className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
            >
              Disattiva
            </button>
          )}
          {p.status === 'disabled' && (
            <button
              onClick={() => { setOpen(false); /* will wire up */ }}
              className="w-full text-left px-4 py-2 text-sm text-green-600 hover:bg-green-50"
            >
              Riattiva
            </button>
          )}
        </div>
      )}
    </div>
  )
}
```

Add `useRef` to the React imports at line 1.

- [ ] **Step 4: Build and verify**

Run: `npm run build`
Expected: No TypeScript errors

- [ ] **Step 5: Commit**

```bash
git add src/pages/Users.tsx
git commit -m "Aggiunto badge stato e menu azioni nella tabella utenti"
```

---

### Task 4: Wire up disable, reactivate, and resend invite actions

**Files:**
- Modify: `src/pages/Users.tsx`

- [ ] **Step 1: Add state variables for confirmation modal**

In the `Users` function, add these state variables after the existing ones (after line 21):

```typescript
const [confirmAction, setConfirmAction] = useState<{
  type: 'disable' | 'reactivate'
  profile: Profile
  practiceCount?: number
} | null>(null)
```

- [ ] **Step 2: Add the disable user handler**

Add this function inside `Users`, after `handleInvite`:

```typescript
const handleDisable = async (p: Profile) => {
  const { count } = await supabase
    .from('practices')
    .select('*', { count: 'exact', head: true })
    .eq('operator', p.full_name)
  setConfirmAction({ type: 'disable', profile: p, practiceCount: count ?? 0 })
}

const handleConfirmDisable = async () => {
  if (!confirmAction) return
  setLoading(true)
  setError('')
  setMessage('')

  const p = confirmAction.profile
  const activeAdmins = profiles.filter(
    (u) => u.role === 'admin' && u.status === 'active' && u.id !== p.id
  )
  if (p.role === 'admin' && activeAdmins.length === 0) {
    setError('Non puoi disattivare l\'ultimo amministratore.')
    setLoading(false)
    setConfirmAction(null)
    return
  }

  const { error: err } = await supabase
    .from('profiles')
    .update({ status: 'disabled' })
    .eq('id', p.id)

  if (err) {
    setError('Errore nella disattivazione. Riprova.')
  } else {
    setMessage(`${p.full_name} è stato disattivato.`)
    loadProfiles()
  }
  setLoading(false)
  setConfirmAction(null)
}
```

- [ ] **Step 3: Add the reactivate user handler**

```typescript
const handleReactivate = async (p: Profile) => {
  setConfirmAction({ type: 'reactivate', profile: p })
}

const handleConfirmReactivate = async () => {
  if (!confirmAction) return
  setLoading(true)
  setError('')
  setMessage('')

  const { error: err } = await supabase
    .from('profiles')
    .update({ status: 'active' })
    .eq('id', confirmAction.profile.id)

  if (err) {
    setError('Errore nella riattivazione. Riprova.')
  } else {
    setMessage(`${confirmAction.profile.full_name} è stato riattivato.`)
    loadProfiles()
  }
  setLoading(false)
  setConfirmAction(null)
}
```

- [ ] **Step 4: Add the resend invite handler**

```typescript
const handleResendInvite = async (p: Profile) => {
  setLoading(true)
  setError('')
  setMessage('')

  const { error: err } = await supabase.functions.invoke('invite-user', {
    body: { email: p.email, fullName: p.full_name },
  })

  if (err) {
    setError('Errore nel rinvio dell\'invito. Riprova.')
  } else {
    setMessage(`Invito rinviato a ${p.email}`)
  }
  setLoading(false)
}
```

- [ ] **Step 5: Wire actions into ActionMenu**

The `ActionMenu` component needs access to these handlers. Convert it to receive callbacks as props, or move it inside `Users`. The simplest approach: move `ActionMenu` inside the `Users` function so it can access the handlers via closure. Update the action buttons:

- "Rinvia invito" → `onClick={() => { setOpen(false); handleResendInvite(p) }}`
- "Disattiva" → `onClick={() => { setOpen(false); handleDisable(p) }}`
- "Riattiva" → `onClick={() => { setOpen(false); handleReactivate(p) }}`

- [ ] **Step 6: Add confirmation modal**

Add this modal JSX before the closing `</div>` of the component (before the invite modal):

```tsx
{confirmAction && (
  <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
    <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
      {confirmAction.type === 'disable' ? (
        <>
          <h2 className="text-lg font-bold text-slate-900 mb-2">Disattiva utente</h2>
          <p className="text-sm text-slate-600 mb-1">
            Sei sicuro di voler disattivare <strong>{confirmAction.profile.full_name}</strong>?
          </p>
          <p className="text-sm text-slate-600 mb-1">
            Non potrà più accedere al sistema.
          </p>
          {(confirmAction.practiceCount ?? 0) > 0 && (
            <p className="text-sm text-amber-600 mt-3 p-3 bg-amber-50 rounded-lg">
              Questo utente ha <strong>{confirmAction.practiceCount}</strong> pratiche assegnate.
              Dopo la disattivazione le pratiche resteranno assegnate ma potrai riassegnarle.
            </p>
          )}
          <div className="flex justify-end gap-3 mt-6">
            <button
              onClick={() => setConfirmAction(null)}
              className="px-4 py-2 text-sm text-slate-600 hover:text-slate-800"
            >
              Annulla
            </button>
            <button
              onClick={handleConfirmDisable}
              disabled={loading}
              className="px-6 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 disabled:opacity-50 transition-colors"
            >
              {loading ? 'Disattivazione...' : 'Disattiva'}
            </button>
          </div>
        </>
      ) : (
        <>
          <h2 className="text-lg font-bold text-slate-900 mb-2">Riattiva utente</h2>
          <p className="text-sm text-slate-600 mb-4">
            Vuoi riattivare <strong>{confirmAction.profile.full_name}</strong>?
            Potrà accedere di nuovo al sistema.
          </p>
          <div className="flex justify-end gap-3 mt-6">
            <button
              onClick={() => setConfirmAction(null)}
              className="px-4 py-2 text-sm text-slate-600 hover:text-slate-800"
            >
              Annulla
            </button>
            <button
              onClick={handleConfirmReactivate}
              disabled={loading}
              className="px-6 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors"
            >
              {loading ? 'Riattivazione...' : 'Riattiva'}
            </button>
          </div>
        </>
      )}
    </div>
  </div>
)}
```

- [ ] **Step 7: Build and verify**

Run: `npm run build`
Expected: No TypeScript errors

- [ ] **Step 8: Commit**

```bash
git add src/pages/Users.tsx
git commit -m "Aggiunta disattivazione, riattivazione e rinvio invito utenti"
```

---

### Task 5: Replace hardcoded OPERATORS with database users

**Files:**
- Modify: `src/components/PracticeForm.tsx`
- Modify: `src/pages/Practices.tsx`
- Modify: `src/pages/PracticeDetail.tsx`
- Modify: `src/pages/ProjectDetail.tsx`
- Modify: `src/pages/Dashboard.tsx`

- [ ] **Step 1: Update PracticeForm.tsx to fetch operators from profiles**

In `src/components/PracticeForm.tsx`, replace the `OPERATORS` import (line 10) and add a `useEffect` to fetch active operators from the database:

Remove `OPERATORS` from the import on line 10.

Add at the top of the `PracticeForm` function:

```typescript
const [operators, setOperators] = useState<string[]>([])

useEffect(() => {
  const fetchOperators = async () => {
    const { data } = await supabase
      .from('profiles')
      .select('full_name')
      .eq('status', 'active')
      .order('full_name')
    if (data) setOperators(data.map((d) => d.full_name))
  }
  fetchOperators()
}, [])
```

Add the supabase import at the top:
```typescript
import { supabase } from '../lib/supabase'
```

Change the operator field's `options` prop from `OPERATORS` to `operators`.

- [ ] **Step 2: Update Practices.tsx operator filter to use database**

In `src/pages/Practices.tsx`, replace the `OPERATORS` import (line 10) and fetch active operators:

Remove `OPERATORS` from the import. Add state and effect:

```typescript
const [operators, setOperators] = useState<string[]>([])

useEffect(() => {
  const fetchOperators = async () => {
    const { data } = await supabase
      .from('profiles')
      .select('full_name')
      .eq('status', 'active')
      .order('full_name')
    if (data) setOperators(data.map((d) => d.full_name))
  }
  fetchOperators()
}, [])
```

Add the supabase import. Change the filter dropdown from `OPERATORS.map(...)` to `operators.map(...)`.

- [ ] **Step 3: Show "(disattivato)" next to disabled operators in practice views**

In `src/pages/PracticeDetail.tsx`, `src/pages/Practices.tsx`, `src/pages/ProjectDetail.tsx`, and `src/pages/Dashboard.tsx`, wherever `practice.operator` is displayed, check if the operator is in the active operators list. If not, append " (disattivato)":

Create a helper hook `src/hooks/useOperators.tsx` to avoid duplicating the fetch logic:

```typescript
import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

export function useOperators() {
  const [activeOperators, setActiveOperators] = useState<string[]>([])

  useEffect(() => {
    const fetch = async () => {
      const { data } = await supabase
        .from('profiles')
        .select('full_name, status')
        .in('status', ['active', 'pending'])
        .order('full_name')
      if (data) setActiveOperators(data.map((d) => d.full_name))
    }
    fetch()
  }, [])

  const formatOperator = (name: string) => {
    if (!name) return ''
    return activeOperators.length > 0 && !activeOperators.includes(name)
      ? `${name} (disattivato)`
      : name
  }

  return { activeOperators, formatOperator }
}
```

Then use `useOperators()` in each page component and call `formatOperator(practice.operator)` where the operator name is displayed.

- [ ] **Step 4: Update PracticeForm.tsx and Practices.tsx to use useOperators hook**

Replace the inline fetch logic added in Steps 1-2 with the `useOperators` hook:

```typescript
const { activeOperators } = useOperators()
```

Use `activeOperators` for the dropdown options and filter.

- [ ] **Step 5: Build and verify**

Run: `npm run build`
Expected: No TypeScript errors

- [ ] **Step 6: Commit**

```bash
git add src/hooks/useOperators.tsx src/components/PracticeForm.tsx src/pages/Practices.tsx src/pages/PracticeDetail.tsx src/pages/ProjectDetail.tsx src/pages/Dashboard.tsx
git commit -m "Operatori da database invece che hardcoded, con indicazione disattivato"
```

---

### Task 6: Block disabled users from logging in

**Files:**
- Modify: `src/hooks/useAuth.tsx`

- [ ] **Step 1: Check status on login in useAuth.tsx**

In `src/hooks/useAuth.tsx`, update the `signIn` function to check the user's profile status after successful authentication. If the user is disabled, sign them out and return an error:

```typescript
const signIn = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password })
  if (error) return { error: error.message }

  const { data: profileData } = await supabase
    .from('profiles')
    .select('status')
    .eq('id', data.user.id)
    .single()

  if (profileData?.status === 'disabled') {
    await supabase.auth.signOut()
    return { error: 'Il tuo account è stato disattivato. Contatta l\'amministratore.' }
  }

  return { error: null }
}
```

- [ ] **Step 2: Build and verify**

Run: `npm run build`
Expected: No TypeScript errors

- [ ] **Step 3: Commit**

```bash
git add src/hooks/useAuth.tsx
git commit -m "Blocco login per utenti disattivati"
```

---

### Task 7: Final build verification and push

**Files:**
- No new files

- [ ] **Step 1: Full build**

Run: `npm run build`
Expected: Build succeeds with no errors

- [ ] **Step 2: Lint**

Run: `npm run lint`
Expected: No lint errors

- [ ] **Step 3: Push to remote**

```bash
git push -u origin claude/excel-app-web-setup-kye0q5
```
