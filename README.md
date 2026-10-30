# Kamzina 199 Building Materials Store

Midterm project website for a real building materials store at 199 Kamzina Street, Pavlodar.
Built with Bootstrap 5.3.3 and a thin custom branding stylesheet.

**Bootstrap version:** 5.3.3 (CDN: jsDelivr)

## Open the site

Open `index.html` directly in a browser. Use the navigation menu to move between pages.
No build step or server is required.

## Pages

- `index.html` — home page: store overview, services, visit information
- `products.html` — product catalogue with prices, Bootstrap table and card
- `order.html` — order and delivery request form with product selection, delivery address, and on-page summary
- `signin.html` — sign-in interface (account features prepared for future implementation)
- `signup.html` — registration interface (account features prepared for future implementation)

## Functionality Plan

Responsible student: **Damir Shuitinov**, as recorded in the HTML author metadata.
The functions below are planned for the JavaScript work in Assignments 4 and 5.
Account validation, order estimates and submitted reviews are intended to run locally.

| Page | Visitor goal | Function | Result | Responsible student |
|---|---|---|---|---|
| `index.html` | Find the store and share an experience | Follow service/visit anchors, use telephone links, validate and add a review with a category and rating | Relevant section or telephone handler opens; a valid review appears with stars and a Pavlodar timestamp; invalid input gets field errors | Damir Shuitinov |
| `products.html` | Find materials and prepare a cart | Search by name/specification/category, filter/reset, add/increase/decrease/remove/clear items, continue to order | Matching materials and no-results feedback appear; quantities and totals update; the tab's cart transfers to the order page | Damir Shuitinov |
| `order.html` | Prepare a collection or delivery estimate | Validate material quantities and contact/date/confirmation fields, toggle delivery fields, update the summary, review or clear the form | A valid request gets a local reference and goods total; missing delivery addresses are rejected; duplicate reviews are blocked until something changes; clearing the form retains the cart | Damir Shuitinov |
| `signin.html` | Check sign-in details | Validate email and a nonblank password; clear the form | Errors identify invalid fields; valid input gets confirmation and the password is cleared; no login/session is created | Damir Shuitinov |
| `signup.html` | Check registration details | Validate name/email, optional phone, an eight-character password and exact confirmation; clear the form | Invalid fields receive correction hints; valid input gets confirmation and resets the form; no account is created | Damir Shuitinov |

## Submission constraints

- Keep the midterm tag unchanged once it has been established.
- Preserve the HTML interface elements; HTML source edits are limited to deferred JavaScript script links.
- Preserve all CSS rules; use existing Bootstrap classes and prepared CSS states for JavaScript interactions.

## Screenshots

### Home page

| Mobile (375 px) | Desktop (1280 px) |
|---|---|
| ![Home — mobile](screenshots/index-375.png) | ![Home — desktop](screenshots/index-desktop.png) |

### Products and prices

| Mobile (375 px) | Desktop (1280 px) |
|---|---|
| ![Products — mobile](screenshots/products-375.png) | ![Products — desktop](screenshots/products-desktop.png) |

### Order and delivery

| Mobile (375 px) | Desktop (1280 px) |
|---|---|
| ![Order — mobile](screenshots/order-375.png) | ![Order — desktop](screenshots/order-desktop.png) |

### Sign in / Sign up

| Sign in — mobile | Sign in — desktop | Sign up — mobile | Sign up — desktop |
|---|---|---|---|
| ![Sign in — mobile](screenshots/signin-375.png) | ![Sign in — desktop](screenshots/signin-desktop.png) | ![Sign up — mobile](screenshots/signup-375.png) | ![Sign up — desktop](screenshots/signup-desktop.png) |

## Three visitor journeys

### 1. Browse products and place an order

**Start:** Open `index.html`.  
**Steps:**  
1. Read the store description and click **Products and prices** in the navigation.  
2. Review the product table (catalogue items with units and prices).  
3. Click **Place an order** in the "Choosing materials" card.  
4. On `order.html`, fill in your name, email, phone and preferred date.  
5. Select a product from the first product row; the unit is shown in the option label.  
6. Enter a quantity. Optionally add a second product.  
7. Choose **Collect from the store** or **Delivery within Pavlodar**.  
8. If delivery: fill in the street address block.  
9. Click **Submit request**.  

**End:** The order request summary section below the form shows the prepared result area.
An on-page confirmation message appears (requires JavaScript to populate).

---

### 2. Request delivery for heavy materials

**Start:** Open `order.html` directly or via navigation.  
**Steps:**  
1. Fill in customer details (name, email, phone, preferred date).  
2. Select **Cement M400 — bag, 50 kg — 2,260 ₸** from the product list and enter quantity.  
3. Select **Delivery within Pavlodar** radio button.  
4. Fill in the delivery address block (street, entrance, on-site contact if needed).  
5. Add any extra instructions in the notes field.  
6. Click **Submit request**.  

**End:** The on-page summary section displays the prepared result layout. The delivery fee
note explains it is confirmed separately after the request is received.

---

### 3. Browse the store, check hours, and call directly

**Start:** Open `index.html`.  
**Steps:**  
1. Read the "What the shop offers" section.  
2. Follow the same-page link to **visit information** (the `#visit` anchor).  
3. Note the opening hours and address: Kamzina Street 199, daily 08:00–18:00.  
4. Click the **Call us** button fixed in the bottom-right corner (or tap the telephone link).  

**End:** The phone app opens with `+7 777 132-04-74` ready to dial.

---

## Repository structure

- `css/base.css` — branding stylesheet: custom properties, typography, positioning, colour, CSS-only nav toggle, and prepared JavaScript state targets
- `css/damir.css` — placeholder (consolidated into base.css)
- `images/` — store photographs
- `screenshots/` — responsive screenshots at 375 px, 768 px and desktop width
- `report/` — assignment reports
- `tag-checklist.md` — HTML tag evidence
- `css-checklist.md` — CSS technique evidence
- `css-removal-list.md` — Bootstrap migration map
- `ai-log.md` — AI assistance log
- `validation-results.txt` — W3C validation record (rerun after final edits)

## Essential midterm corrections

These decisions are recorded before implementing the corrections. HTML source files
keep their original interface elements; deferred script links enable interactions. CSS
supplies shared branding and states. JavaScript reuses the existing catalogue table, two product
rows, form fields, error areas and order summary, adding only the assignment controls
with Bootstrap classes and the prepared `d-none`, `is-invalid` and `selected-row` states.

- The review script hides the static quotation aside and provides a review form.
- Catalogue prices are labelled as estimates, with instructions to confirm current
  prices and availability with the store.
- Scripts prevent the original GET submissions and enable accessible custom validation.
  Order details are presented in a summary with instructions to contact the store.
- Error elements receive IDs and ARIA associations through JavaScript. Missing feedback
  elements are generated using Bootstrap's existing validation classes.
- The original material selectors are populated from the shared six-product array.
  JavaScript adds quantity previews, Add to cart buttons and controls in the existing
  summary table. A product must be added before checking the request.
- Collection is the initial method. Scripts hide and disable delivery fields until
  delivery is selected, require its address only then, and ask customers to confirm their details.
