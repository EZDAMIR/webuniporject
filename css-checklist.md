# CSS Assignment 2 — Checklist and Evidence

Author: Damir Shuitinov  
Project: Kamzina 199 Building Materials Store

---

## Colour palette

| Requirement | File | Evidence |
|---|---|---|
| Exactly 5 declared colours | `css/base.css` line 7–13 | `#2c3e50`, `#e74c3c`, `rgb(245,245,240)`, `#f39c12`, `steelblue` declared in palette comment |
| rgba() derived from palette | `css/base.css` throughout | Every `rgba()` value uses the channel values of one of the 5 declared colours |
| At least 3 notation types | `css/base.css` line 7–13 | Hex, `rgb()`, and named colour present |

---

## Selector types (all required)

| Selector type | File | Line | Rule |
|---|---|---|---|
| Type | `css/base.css` | 33, 41, 45, 49 | `body`, `header`, `main`, `footer` |
| Class | `css/base.css` | 71, 82, 96 | `.site-header`, `.store-brand`, `.nav-list` |
| ID | `css/base.css` | 179, 187 | `#services`, `#visit` |
| Descendant | `css/base.css` | 61 | `footer a` |
| Child `>` | `css/base.css` | 55 | `.main-nav > ul` |
| Adjacent sibling `+` | `css/base.css` | 66 | `h2 + p` |
| Grouping | `css/base.css` | 23–24 | `h1, h2` |
| Attribute | `css/base.css` | 380–381 | `input[type="email"]`, `input[type="tel"]` |
| Attribute (negation) | `css/base.css` | 386–387 | `input:not([type="radio"]):not([type="checkbox"])` |
| Universal `*` | `css/base.css` | 16 | `*` |
| `:hover` | `css/base.css` | 116 | `.nav-link:hover` |
| `:focus` | `css/base.css` | 400–401 | `input:focus, select:focus, textarea:focus` |
| `:nth-child` | `css/base.css` | 338 | `tbody tr:nth-child(even)` |
| `::before` | `css/base.css` | 122 | `h2::before` |
| `::after` | `css/base.css` | 193 | `#services::after` |

---

## Typography

| Requirement | File | Line | Evidence |
|---|---|---|---|
| Serif font for headings | `css/base.css` | 25 | `Georgia, "Times New Roman", serif` on `h1, h2` |
| Sans-serif for body | `css/base.css` | 34 | `Arial, Helvetica, sans-serif` on `body` |
| Relative units (rem/em) | `css/base.css` | 35, 146, 151 | `font-size: 1rem`, `1.75rem`, `1.25rem` |
| line-height | `css/base.css` | 36 | `line-height: 1.6` |
| letter-spacing | `css/base.css` | 28 | `letter-spacing: -0.01em` |

---

## Box model

| Requirement | File | Line | Evidence |
|---|---|---|---|
| `box-sizing: border-box` | `css/base.css` | 17 | Applied to `*` |
| Padding | `css/base.css` | 73, 137, 361 | `.site-header`, `.site-footer`, `fieldset` |
| Margin | `css/base.css` | 206, 246 | `.page-main margin: 2rem auto`, `.info-section margin: 1.5rem 0` |
| Border | `css/base.css` | 253, 359 | `.store-photo border`, `fieldset border` |
| Margin collapse explanation | `css/base.css` | 352–357 | Comment in `fieldset` rule explaining how adjacent `<p>` margins collapse |

---

## Flexbox

| Instance | File | Line | Properties |
|---|---|---|---|
| Flexbox #1 — site header | `css/base.css` | 71–80 | `display:flex`, `flex-direction:row`, `flex-wrap:wrap`, `justify-content:space-between`, `align-items:center` |
| Flex items — brand/nav | `css/base.css` | 82–93 | `.store-brand { flex: 1 1 auto }`, `.main-nav { flex: 0 0 auto }` |
| Flexbox #2 — nav list | `css/base.css` | 96–104 | `display:flex`, `flex-direction:row`, `flex-wrap:wrap`, `justify-content:flex-end`, `align-items:center`, `gap: 0.25rem` |
| Action buttons row | `css/base.css` | 428–437 | `display:flex`, `flex-wrap:wrap`, `gap: 0.75rem`; button `flex: 1 1 auto` |

---

## Grid

| Instance | File | Line | Properties |
|---|---|---|---|
| Grid — footer | `css/base.css` | 133–142 | `display:grid`, `justify-items:center`, `gap: 0.4rem` |
| Grid — page-main | `css/base.css` | 201–216 | `display:grid`, `grid-template-columns: repeat(2, minmax(280px, 1fr))`, `gap: 1.5rem`, spanning `grid-column: 1/-1` |
| Grid — products-main | `css/base.css` | 219–239 | `display:grid`, `grid-template-columns: repeat(2, minmax(280px, 1fr))`, `gap: 2rem`, spanning `grid-column: 1/-1` |
| Pages using grid | All 4 HTML files | `<main>` element | `index.html`, `order.html`, `colophon.html` → `page-main`; `products.html` → `products-main` |

---

## Positioning

| Mode | File | Line | Element |
|---|---|---|---|
| `position: static` | `css/base.css` | 245 | `.info-section` — default, labelled explicitly |
| `position: relative` | `css/base.css` | 251 | `.store-photo` — positioning context for figcaption |
| `position: absolute` | `css/base.css` | 266 | `.store-photo figcaption` — overlaid at bottom of figure |
| `position: fixed` | `css/base.css` | 278 | `.fixed-call` — viewport call button |
| `position: relative` on header | `css/base.css` | 74 | `.site-header` |

---

## Float and clear

| Requirement | File | Line | Evidence |
|---|---|---|---|
| Float on image inside paragraph | `css/base.css` | 297 | `.float-right { float: right }` |
| Float applied in HTML | `index.html` | `<img class="float-right">` inside `<p>` in `#services` | Text wraps around image |
| Clearfix | `css/base.css` | 193–197 | `#services::after { content:""; display:block; clear:both }` |

---

## Three centering methods

| Method | File | Line | Evidence |
|---|---|---|---|
| `margin: auto` | `css/base.css` | 206 | `.page-main { max-width: 1100px; margin: 2rem auto }` |
| Flexbox `align-items` | `css/base.css` | 79 | `.site-header { display:flex; align-items:center }` |
| Grid `justify-items` | `css/base.css` | 140 | `.site-footer { display:grid; justify-items:center }` |

---

## Cascade demonstrations

| Demonstration | Files | Evidence |
|---|---|---|
| External → internal cascade | `css/base.css` + `colophon.html` line 15–20 | `base.css` sets `.page-main { max-width: 1100px }`; internal `<style>` on colophon overrides to `800px` — same specificity (0,1,0) but later in cascade |
| External → inline cascade | `css/base.css` line 477–481 + `index.html` line 54 | `base.css` sets `mark { background-color: rgb(245,245,240) }`; inline `style="background-color: #f39c12"` overrides it — inline always wins |

---

## Specificity experiment

| Rule | File | Line | Specificity | Outcome |
|---|---|---|---|---|
| Rule A | `css/damir.css` | 15 | `(0,1,0)` | `.nav-link { color: #f39c12 }` — sets amber, LOSES |
| Rule B | `css/damir.css` | 18 | `(0,2,0)` | `.site-header .nav-link { color: rgb(245,245,240) }` — sets off-white, WINS |
| Result | Visible in browser | — | B has higher score | Nav links show off-white regardless of Rule A |

---

## Form styling

| Element | File | Line |
|---|---|---|
| `fieldset` | `css/base.css` | 351–362 |
| `legend` | `css/base.css` | 364–369 |
| `label` | `css/base.css` | 371–377 |
| `input` (text, email, tel, number, date) | `css/base.css` | 386–397 |
| `input[type="radio"]`, `input[type="checkbox"]` excluded from width | `css/base.css` | 386 | `:not()` selectors |
| `select` | `css/base.css` | 387 |
| `textarea` | `css/base.css` | 388 |
| `button` (submit) | `css/base.css` | 407–416 |
| `button[type="reset"]` | `css/base.css` | 418–421 |

---

## Exactly one internal `<style>` block

| File | Line | Content |
|---|---|---|
| `colophon.html` | 15–20 | `.page-main { max-width: 800px }` — cascade demo |

No other HTML file contains a `<style>` block.

---

## Exactly one inline `style=""` attribute

| File | Line | Content |
|---|---|---|
| `index.html` | 54 | `<mark style="background-color: #f39c12;">` — overrides base.css off-white |

No other element uses a `style=""` attribute.

---

## Structural HTML classes

| Class | File | Element |
|---|---|---|
| `.site-header` | All 4 HTML | `<header>` |
| `.store-brand` | All 4 HTML | `<a>` brand link |
| `.main-nav` | All 4 HTML | `<nav>` |
| `.nav-list` | All 4 HTML | `<ul>` |
| `.nav-link` | All 4 HTML | `<a>` nav links |
| `.site-footer` | All 4 HTML | `<footer>` |
| `.page-main` | `index.html`, `order.html`, `colophon.html` | `<main>` |
| `.products-main` | `products.html` | `<main>` |
| `.info-section` | `index.html`, `order.html` | `<section>` |
| `.store-photo` | `index.html`, `products.html` | `<figure>` |
| `.float-right` | `index.html` | `<img>` inside `<p>` |
| `.product-grid` | `products.html` | `<section>` |
| `.product-card` | `products.html` | `<article>` |
| `.order-form` | `order.html` | `<form>` |
| `.action-buttons` | `order.html` | `<div>` |
| `.fixed-call` | `index.html` | `<a>` call button |

---

## IDs with comments

| ID | File | Comment explains |
|---|---|---|
| `#services` | `index.html` | Fragment target for same-page link; float container cleared by `::after` |
| `#visit` | `index.html` | Fragment target for 'visit information' link |

---

## Forbidden items (none present)

| Forbidden | Status |
|---|---|
| CSS reset library (`normalize.css`, `reset.css`) | Not used |
| `@import` rule | Not used |
| More than one `<style>` block per page | Not present |
| More than one inline `style=""` attribute in the whole project | Not present |
| Colours outside the declared palette | Not present — all values are the 5 declared colours or their rgba() derivatives |
