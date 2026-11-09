# Kamzina 199 Building Materials Store

Coursework website for the building materials store at 199 Kamzina Street, Pavlodar.
HTML, Bootstrap 5.3.3, a frozen branding stylesheet, plain JavaScript and jQuery 3.7.1.

Open `index.html` in a browser. There is no build step or backend. Bootstrap and
jQuery load from CDNs and require internet access. Reviews work independently of
jQuery; the catalogue, estimate and example-account forms require it.

## Pages and outcomes

| Page | Completed visitor outcome |
|---|---|
| `index.html` | Find store/telephone information; add, filter and sort reviews for the current page session |
| `products.html` | Search six materials, filter categories, manage quantities/totals and transfer the cart to order |
| `order.html` | Prepare a collection/delivery estimate with a reference and checked summary; contact the store to arrange it |
| `signin.html` | Sign in to a demo account created in the same browser tab; sign out from any page |
| `signup.html` | Create a browser-only demo account with optional phone validation and password confirmation |

Account pages use standard sign-up and sign-in wording. Registration creates a browser-only account
and signs in; sign-in checks its email/password; the shared indicator shows who is
signed in and offers sign-out. Account records and the session survive navigation
and reloads within the same tab, using `sessionStorage`. A separate fresh tab has
its own demo state. Sign-out ends the session while keeping that tab's demo account.

Use sample details and a made-up password. These are not store accounts and confer
no access permissions. Client state can be inspected or changed using developer
tools; this is not production authentication. There is no backend or account recovery.
No raw passwords are saved: records contain a random salt and a PBKDF2-SHA-256
verifier (600,000 iterations), alongside the demo name/email. Optional telephone
input is validated but not saved. Do not use real credentials. The forms require
browser storage and Web Crypto; HTTPS or localhost is recommended. Failures explain
what is unavailable and do not report successful account creation or login.

The derivation uses the browser's [Web Crypto API](https://developer.mozilla.org/en-US/docs/Web/API/SubtleCrypto/deriveBits)
and the PBKDF2 work factor in [OWASP's password-storage guidance](https://cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html).
This choice avoids storing a raw password; it does not turn client-only state into
a trusted authentication service. Ordering does not require signing in.

Order references are local estimate references, not submitted orders. Delivery fees
are excluded. Review submission adds a card to the current page and does not publish
it. Reloading clears reviews. Cart IDs/quantities use tab-scoped `sessionStorage`;
order contact details are not stored. Demo account names/emails are stored only in that tab.

## Plain JavaScript / jQuery split and ownership

**Responsible student: Damir Shuitinov**, as recorded in the HTML author metadata.
No additional team ownership is inferred.

| Technology | Feature and source | Responsibility |
|---|---|---|
| Plain JavaScript only | `js/reviews.js`: review data, generated form/cards/options, validation, errors, counter, category filter, three sort modes, count/average, empty states and all handlers | Damir Shuitinov |
| jQuery | `js/main.js`: navigation, product objects, cart persistence/calculations/rendering, delegated cart controls, shared validation/messages, demo credentials/session and account presentation | Damir Shuitinov |
| jQuery | `js/products.js`: generated catalogue, search/category filters, selected rows, delegated add buttons, cart-to-order navigation | Damir Shuitinov |
| jQuery | `js/order.js`: generated material options, quantity previews, cart, collection/delivery fields, live estimate and request confirmation | Damir Shuitinov |
| jQuery | `js/signin.js`, `js/signup.js`: registration/sign-in validation, optional phone, password match, asynchronous account/session outcomes and duplicate-submit protection | Damir Shuitinov |
| Historical reference | `js/old-js-version.js`: three previous functions; never loaded by a page | Damir Shuitinov |

The plain JavaScript review feature is self-contained: no `$`, `jQuery`, `Store`,
shared jQuery helpers or network data. Its top-level `reviews` array stores actual
submitted objects; the category/rating/sort arrays and limit object are also near
the top. `for` loops generate options/cards, conditions select empty/error/success
states, `selectReviews(items, category, sort)` returns a filtered/sorted copy and
`averageRating(items)` returns the calculated mean. `renderReview(review)` returns
a DOM node. Input uses `textContent` and native `addEventListener` handlers.

The complete review workflow was tested with both jQuery and `main.js` omitted,
confirming that its DOM updates and handlers work independently.

jQuery features retain ready wrappers, traversal, chaining, delegated `.on()`
handlers and `fadeIn`, `slideToggle`, `slideDown` and `slideUp` effects. Durations
follow the visitor's reduced-motion preference. No inline event attributes are used.

## New endterm work

This table distinguishes additions in this change from functionality already in
start-of-task commit `35f954a`. Existing search, cart, validation and review creation
are **not** claimed as new endterm work. The actual defended baseline still needs
confirmation before final credit claims.

| Previously available | Addition in this change | Observable result |
|---|---|---|
| Add a review using jQuery helpers | Complete independent plain JavaScript review workflow | Form, validation, cards and events work with no jQuery/Store |
| Review list starts blank | Initial “No reviews yet” state | A visitor knows how to start |
| Submitted review cards only | Category filtering, newest/highest/lowest sorting, visible counts and calculated average | Multiple reviews can be compared; empty categories explain how to recover |
| Review form clears after success | Explicit Clear review control and page-only lifetime text | Drafts can be cleared without removing submitted cards; persistence is clear |
| Static product rows/options replaced at runtime | Approved removal of duplicated data markup from HTML | Product rows/options originate from the six shared product objects |
| Account forms only check details | Browser-only account creation, credential verification, session indicator, sign-out and show/hide-password controls | Registration and sign-in have complete, explicitly limited demo outcomes |
| Reset request retains cart but leaves required product controls empty | Cart owns request contents; the unused product picker is optional | Another collection/delivery estimate can be prepared using the retained cart |
| 320 px navigation brand overflows | Add existing Bootstrap text-wrap/max-width classes through JavaScript | Brand stays inside the viewport without CSS changes |
| Fixed call link can overlap a form action | Suppress the floating link while its rectangle overlaps an interactive control | Form/cart actions stay reachable; telephone links remain elsewhere |

Any partly entered product selection is still validated. A request cannot complete
with an empty cart. Confirmation requires correct enabled fields, consent and an
address only for delivery. Success clears the form while retaining the checked
summary/cart; changing details reopens preparation.

## HTML/CSS freeze

The default constraint preserves HTML interface elements and all CSS. In this task
the user explicitly approved **only removing duplicate product rows/options**:

- `products.html`: the existing catalogue `tbody` remains, with its four static rows removed.
- `order.html`: one product picker, one quantity input and one Add button remain; the picker has a placeholder and six generated product options.
- Product data and controls are generated by JavaScript. No CSS is changed.
- All page heads link to the included local SVG and ICO favicons.

The original defended midterm baseline and deadline checks are deferred at the
user's request. Existing local tags are preserved, including `endterm`. The latest remote check
found no pushed `midterm` or `endterm` tags.

## Verification

All seven JavaScript files (six active and one historical) pass syntax checks;
all five HTML pages pass formatting and Nu HTML validation. Browser checks covered
account registration/sign-out/sign-in and its wording, cached Back/Forward session
presentation, and floating Call-button visibility across mobile and desktop widths.
The main visitor journeys were also checked in WebKit and Chrome phone emulation.
Physical-phone and human-only manual testing remain unverified. The current W3C
result and validated source hashes are in [validation-results.txt](validation-results.txt).

Install the existing formatting tool with `npm ci`. Source checks can be rerun
without dedicated QA scripts:

```sh
for script in js/*.js; do node --check "$script"; done
npm run format:check
npx vnu-jar --errors-only --format text index.html products.html order.html signin.html signup.html
```

## Visitor journeys

1. **Catalogue to collection estimate:** open Products, search/filter materials, add
   them, adjust the cart, continue to order, enter contact details/date, confirm and
   review. Use the displayed estimate to contact the store.
2. **Delivery estimate:** add materials on Order and delivery or reuse a retained
   cart, enter details/date, select delivery, correct the required address and
   review. The goods total excludes delivery charges.
3. **Reviews:** open Home, submit a category/rating/review, add another, filter or
   sort and compare the average. Clear only the draft using Clear review; reload
   to return to the initial empty state.
4. **Demo account:** register using sample details and a made-up password. Confirm
   the signed-in indicator, navigate to another page and reload. Sign out, then open
   the sign-in page and use the same email/password. Try a wrong password and correct
   it. A fresh tab starts without this account/session.

## Repository structure

- `css/base.css`, `css/damir.css`: existing frozen styles.
- `js/`: the seven JavaScript source files described above.
- `images/`, `screenshots/`, `report/`, `sketches/`: existing project assets/evidence.
- `tag-checklist.md`, `css-checklist.md`, `css-removal-list.md`: earlier assignment evidence.
- `ai-log.md`: existing assistance log.
