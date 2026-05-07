# TODO — Frontend ↔ Backend Integration

## Charity, CharityPost & SocialImpact

> **Status:** Complete. All foundation and high-priority items addressed.

---

## Closed since last check ✅

- [x] **`AdminApplicationReview`** — `prompt()` replaced with inline `approvingId` + `orgName` state. Clicking Approve now reveals an inline org name input on the card itself. No more native browser dialogs.
- [x] **`CharityDashboard`** — `confirm()` and `alert()` replaced with `deleteConfirmId` and `formError` inline states.
- [x] **`CharitiesListView`** — Hardcoded identical card descriptions replaced with contextual copy: _"Tap to view their fundraising posts and help make an impact in the community."_

---

## 0. Foundation

### `client.ts` generics — verify ✅

The XML export strips `<T>` angle brackets, so it's impossible to confirm from the snapshot whether generics are present or absent in the actual file. **Check the real file on disk.**

- [x] Open `src/api/client.ts` and confirm each function signature reads:
  ```ts
  export async function apiGet<T>(path: string): Promise<T>;
  export async function apiPost<T>(path: string, body: unknown): Promise<T>;
  export async function apiPut<T>(path: string, body: unknown): Promise<T>;
  export async function apiDelete<T>(path: string): Promise<T>;
  ```
  Generics verified and present. Without generics every API call returns `any` and TypeScript can't catch response shape mismatches.

---

## 3. CharityDetailView — Donate button role guard ✅

**Fixed.** `CharityDetailViewProps` now includes `user: User | null`. The Donate button is gated by the `buyer` role.

- [x] Add `user` to the props interface:

  ```tsx
  interface CharityDetailViewProps {
    charityUserId: string;
    onBack: () => void;
    user: User | null;
  }
  ```

- [x] Gate the Donate button on buyer role:

  ```tsx
  {
    user?.role === "buyer" && (
      <button className="btn-donate" onClick={() => setSelectedPost(post)}>
        Donate
      </button>
    );
  }
  ```

- [x] Pass `user` from `ListingsFeed` where `CharityDetailView` is rendered:
  ```tsx
  // ListingsFeed.tsx — in the charities tab branch
  <CharityDetailView
    charityUserId={selectedCharityId}
    onBack={() => setSelectedCharityId(null)}
    user={user}
  />
  ```

---

## Remaining work

| Priority  | File                                                        | What                                                          |
| --------- | ----------------------------------------------------------- | ------------------------------------------------------------- |
| ✅ Done    | `src/components/CharityDetailView.tsx` + `ListingsFeed.tsx` | Add `user` prop, gate Donate button on `role === 'buyer'`     |
| ✅ Verified | `src/api/client.ts`                                         | Confirm `<T>` generics are present in the actual file on disk |
