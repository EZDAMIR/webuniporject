# Kamzina 199 Building Materials Store

Assignment 3 website for a real building materials store at 199 Kamzina Street, Pavlodar. The site migrates the Assignment 2 custom-CSS layout to Bootstrap 5.3.3, keeping the same content and five-page structure.

**Bootstrap version:** 5.3.3 (CDN: jsDelivr)

## Open the site

Open `index.html` directly in a browser. Use the navigation menu to move between all five pages.

## What changed in Assignment 3

- Bootstrap 5.3.3 CDN links added to all five pages
- Custom flexbox/grid navbar replaced with Bootstrap `navbar-expand-md` (collapses at < 768 px)
- `.page-main` and `.products-main` CSS Grid layouts replaced with Bootstrap `.container`, `.row`, and `.col-*`
- Products table converted to Bootstrap `table-bordered table-striped table-hover` with `table-dark` thead and `table-responsive` wrapper
- Choosing-materials article wrapped in a Bootstrap `.card.shadow-sm` component
- Product photos placed in a nested `.row.g-3` with `.col-md-6` columns
- Form inputs converted to `form-control`, selects to `form-select`, radios/checkboxes to `form-check`
- Buttons converted to `btn btn-danger` and `btn btn-outline-secondary`
- `base.css` trimmed from 482 lines to 89 (branding only); `damir.css` reduced to a 1-line comment
- No inline styles or internal `<style>` blocks remain in any page
- `colophon.html` removed; `signin.html` and `signup.html` added

**Note:** `signup.html` was created as a new page for Assignment 3 and was not part of Assignments 1 or 2.

## Repository contents

- `index.html` — home and visit information
- `products.html` — product catalogue, prices, Bootstrap table and card
- `order.html` — order and delivery form with Bootstrap form classes
- `signin.html` — sign-in form with Bootstrap form classes
- `signup.html` — registration form with Bootstrap form classes
- `css/base.css` — branding stylesheet (CSS custom properties, typography, positioning, colours)
- `css/damir.css` — placeholder (consolidated into base.css for Assignment 3)
- `css-removal-list.md` — table mapping every removed CSS rule to its Bootstrap replacement
- `images/` — real shop photographs taken by the student and retrieved from the business's 2GIS gallery
- `sketches/` — design sketches made before writing CSS
- `screenshots/` — responsive screenshots at 375 px, 768 px and desktop width for four pages
- `report/assignment-1-report.pdf` — Task A and Task B report
- `tag-checklist.md` — HTML tag evidence (Assignment 1, updated for Assignment 3 page set)
- `css-checklist.md` — CSS technique evidence (Assignment 2, updated for Assignment 3 Bootstrap migration)
- `ai-log.md` — questions asked to AI during development (items 26–35 cover Bootstrap)
