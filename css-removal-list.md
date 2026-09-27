# CSS Removal List — Assignment 3 Bootstrap Migration

This document records every CSS rule removed from `base.css` and `damir.css` during the Bootstrap 5.3.3 conversion, along with the Bootstrap class or utility that replaced it.

## base.css — removed rules

| Removed rule / selector | Bootstrap replacement |
|---|---|
| `* { box-sizing: border-box; margin: 0; padding: 0; }` | Bootstrap Reboot sets `box-sizing` globally; margin/padding reset included |
| `h1, h2 { font-weight: 700; line-height: 1.25; letter-spacing: -0.01em; }` | Bootstrap Reboot normalises heading weight and line-height |
| `body { font-size: 1rem; line-height: 1.6; }` | Bootstrap Reboot sets `font-size: 1rem; line-height: 1.5` |
| `header { background-color: #2c3e50; }` | `navbar-dark bg-dark` on `<nav>` |
| `main { padding: 0 1.5rem; }` | `.container.py-4` on `<main>` |
| `footer { font-size: 0.875rem; color: … }` | `bg-dark py-3` + `text-white` / `text-white-50 small` utility classes |
| `.main-nav > ul { list-style: none; padding: 0; }` | Bootstrap navbar resets list styles automatically |
| `footer a { color: steelblue; }` | Kept as `.site-footer a` in branding layer |
| `h2 + p { margin-top: 0.25rem; }` | Bootstrap Reboot paragraph spacing is sufficient |
| `.site-header { display: flex; flex-direction: row; … }` | `navbar navbar-expand-md` component |
| `.store-brand { display: block; color: …; text-decoration: none; flex: 1 1 auto; }` | `navbar-brand` class (colour, decoration, flex handled) |
| `.main-nav { flex: 0 0 auto; }` | Bootstrap navbar layout handles nav flex automatically |
| `.nav-list { list-style: none; display: flex; flex-wrap: wrap; … }` | `navbar-nav` component |
| `.nav-link { color: …; text-decoration: none; padding: …; border-radius: …; }` | `nav-link` Bootstrap class |
| `.nav-link:hover { background-color: …; }` | Bootstrap `nav-link:hover` default styles |
| `h1 { font-size: 1.75rem; margin-bottom: 0.75rem; }` | `.display-6` on `<h1>` and Bootstrap Reboot margins |
| `h2 { font-size: 1.25rem; margin-top: 1.5rem; margin-bottom: 0.5rem; }` | Bootstrap Reboot heading sizes and spacing |
| `p { margin-bottom: 0.75rem; }` | Bootstrap Reboot: `p { margin-top: 0; margin-bottom: 1rem; }` |
| `a { color: steelblue; }` | Bootstrap Reboot sets link colour; branding overrides remain in `.site-footer a` |
| `hr { border: none; border-top: 1px solid …; margin: 1.5rem 0; }` | Bootstrap Reboot `<hr>` styles |
| `small { display: block; font-size: 0.8rem; color: …; margin-top: 0.4rem; }` | `small` Bootstrap Reboot + `.text-muted` utility where needed |
| `#services { margin: …; padding: …; background-color: …; border-radius: … }` | `bg-light rounded shadow-sm p-3 mb-4` utility classes on the section element |
| `#visit { margin: …; padding: … }` | `mb-4` utility class |
| `#services::after { content: ""; display: block; clear: both; }` | Float layout removed entirely; Bootstrap grid used instead |
| `.page-main { display: grid; grid-template-columns: repeat(2, …); … }` | `.container.py-4` + `.row` / `.col-*` Bootstrap grid |
| `.page-main > h1, > p, > section, > form { grid-column: 1 / -1; }` | All children are direct `.col-12` inside `.row` |
| `.products-main { display: grid; … }` | `.container.py-4` + `.row.g-4` Bootstrap grid |
| `.products-main > h1, > p, > section, > article, > hr { grid-column: 1 / -1; }` | `.col-12` wrapping each child |
| `.products-main > .store-photo { min-width: 0; }` | Bootstrap grid columns handle overflow correctly |
| `.info-section { position: static; margin: 1.5rem 0; }` | `mb-4` utility class; `position: static` is default and unnecessary |
| `.store-photo { margin: 1rem 0; }` | Margin handled by parent `.row.g-3` gutter |
| `.product-grid { margin: 1.5rem 0; }` | `.col-12` inside `.row.g-4` provides gutter spacing |
| `.product-card { background-color: …; border: …; border-radius: …; padding: … }` | Bootstrap `.card.shadow-sm` + `.card-body` component |
| `table { width: 100%; border-collapse: collapse; font-size: …; margin-bottom: … }` | `table table-bordered table-striped table-hover` Bootstrap classes |
| `th, td { border: …; padding: …; text-align: left; }` | Bootstrap table styles |
| `thead th { background-color: …; color: …; font-weight: … }` | `thead class="table-dark"` Bootstrap class |
| `tbody tr:nth-child(even) { background-color: … }` | `table-striped` Bootstrap class |
| `.order-form { margin-top: 1rem; }` | Fieldset margins handled by Bootstrap utilities |
| `.order-form p { margin-bottom: 0.9rem; }` | Bootstrap form structure (div.mb-3) replaces `<p>` wrappers |
| `fieldset { margin-top: …; border: …; border-radius: …; padding: … }` | `fieldset.border.rounded.p-3.mb-3` utility classes |
| `legend { font-weight: 700; font-size: 0.9rem; padding: …; color: … }` | `legend.float-none.w-auto.px-2.fw-bold.small` Bootstrap utilities |
| `label { display: block; font-size: …; font-weight: …; margin-bottom: …; color: … }` | `.form-label` Bootstrap class |
| `input[type="email"], input[type="tel"] { font-family: inherit; }` | Bootstrap Reboot sets `font-family: inherit` on all form elements |
| `input:not([type="radio"]):not([type="checkbox"]), select, textarea { width: 100%; padding: …; border: …; … }` | `.form-control` and `.form-select` Bootstrap classes |
| `input:focus, select:focus, textarea:focus { outline: 2px solid steelblue; … }` | Bootstrap provides focus ring styles |
| `button { padding: …; border: none; … background-color: #e74c3c; … }` | `.btn.btn-danger` Bootstrap class |
| `button[type="reset"] { background-color: …; color: … }` | `.btn.btn-outline-secondary` Bootstrap class |
| `button:hover { opacity: 0.88; }` | Bootstrap button hover styles built in |
| `.action-buttons { margin-top: 1rem; display: flex; flex-wrap: wrap; gap: … }` | `.d-flex.flex-wrap.gap-2.mt-3` utility classes |
| `.action-buttons button { flex: 1 1 auto; }` | Bootstrap button sizing handles this |
| `aside { background-color: …; border-left: …; padding: …; margin: …; font-size: … }` | `border-start border-warning border-3 ps-3 py-2` Bootstrap utilities |
| `blockquote { padding: …; font-style: italic; }` | Bootstrap Reboot normalises blockquote; branding border-left kept in base.css |
| `blockquote footer { font-style: normal; …; background-color: transparent; … }` | Bootstrap Reboot handles `blockquote footer` defaults |
| `pre { background-color: …; border-radius: …; padding: …; overflow-x: auto; … }` | Bootstrap Reboot pre styles |
| `mark { background-color: rgb(245, 245, 240); }` | Replaced by `mark { background-color: var(--brand-amber); }` in branding layer |

## damir.css — removed rules

| Removed rule / selector | Bootstrap replacement |
|---|---|
| `.nav-link { color: #f39c12; }` | Specificity demo — replaced by Bootstrap `nav-link` colour via `navbar-dark` |
| `.site-header .nav-link { color: rgb(245, 245, 240); }` | `navbar-dark` on the Bootstrap `<nav>` sets link colour |
| `.store-brand { font-size: 1.15rem; … color: … }` | `navbar-brand` Bootstrap class handles colour; branding `.store-brand` keeps `text-transform` and `letter-spacing` |
| `h1 { border-bottom: 3px solid #e74c3c; padding-bottom: 0.25rem; margin-bottom: 1rem; }` | Moved into consolidated `base.css` branding layer (kept) |
| `.nav-link:focus { outline: 2px solid #f39c12; … }` | Bootstrap provides focus-visible styles |
| `footer a { color: steelblue; text-decoration: underline; }` | Moved to `.site-footer a` in consolidated `base.css` |
| `#services { box-shadow: … }` | `shadow-sm` utility class on the section element |
| `tbody tr:hover { background-color: … }` | `table-hover` Bootstrap class |
| `textarea:focus { outline-color: #f39c12; border-color: #f39c12; }` | Bootstrap focus ring styles |
| `code { background-color: …; padding: …; border-radius: …; font-size: …; color: … }` | Moved into consolidated `base.css` branding layer (kept) |
| `blockquote { border-left: …; color: …; padding-left: … }` | Moved into consolidated `base.css` branding layer (kept) |
| `.fixed-call { border: 2px solid rgba(245, 245, 240, 0.4); }` | Merged into consolidated `.fixed-call` rule in `base.css` |
