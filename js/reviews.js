(function () {
  'use strict';

  /* ── 1. Constants and data ─────────────────────────────────────────────── */

  var MIN_LEN = 20;
  var MAX_LEN = 500;

  var MONTHS = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  var CATEGORIES = ['Overall', 'Products', 'Delivery', 'Service'];

  var RATING_OPTIONS = [
    ['5', '★★★★★ – Excellent'],
    ['4', '★★★★☆ – Good'],
    ['3', '★★★☆☆ – Average'],
    ['2', '★★☆☆☆ – Poor'],
    ['1', '★☆☆☆☆ – Very poor']
  ];

  /* Seed reviews — distinct from the static "Customer voice" aside in the HTML */
  var INITIAL_REVIEWS = [
    {
      name: 'Anna Petrovskaya',
      category: 'Overall',
      rating: 5,
      text: 'Excellent range of materials. Staff helped me find everything for the repair without any fuss. Prices matched the website. Will be back.',
      date: '2026-09-20T14:30:00'
    },
    {
      name: 'Sergey Kolpakov',
      category: 'Delivery',
      rating: 4,
      text: 'Delivery arrived on time and the driver helped move the OSB-3 sheets to the entrance. The only downside was the delivery time was only confirmed on the morning itself.',
      date: '2026-10-01T09:15:00'
    },
    {
      name: 'Irina Sharapova',
      category: 'Products',
      rating: 5,
      text: 'Great stock of plasterboard and tile adhesive. Bought 20 bags and they were all the same production batch — important for consistent finish colour.',
      date: '2026-10-05T11:00:00'
    }
  ];

  /* ── 2. Date formatting ────────────────────────────────────────────────── */

  function pad(n) {
    return String(n).padStart(2, '0');
  }

  function formatDate(isoString) {
    var d = new Date(isoString);
    return (
      d.getDate() + ' ' + MONTHS[d.getMonth()] + ' ' + d.getFullYear() +
      ', ' + pad(d.getHours()) + ':' + pad(d.getMinutes())
    );
  }

  /* ── 3. Card renderer — called for both seed reviews and new submissions ── */

  function renderReview(review) {
    var col = document.createElement('div');
    col.className = 'col-12 col-md-6 col-lg-4';

    var card = document.createElement('article');
    card.className = 'card h-100 shadow-sm';

    var body = document.createElement('div');
    body.className = 'card-body d-flex flex-column';

    var header = document.createElement('div');
    header.className = 'd-flex justify-content-between align-items-start mb-2';

    var nameEl = document.createElement('h3');
    nameEl.className = 'card-title fs-6 fw-bold mb-0 text-break';
    nameEl.textContent = review.name;

    var badge = document.createElement('span');
    badge.className = 'badge bg-secondary ms-2 flex-shrink-0';
    badge.textContent = review.category;

    header.appendChild(nameEl);
    header.appendChild(badge);

    /* Stars hidden from screen readers; a visually-hidden span speaks them as text */
    var starsWrapper = document.createElement('p');
    starsWrapper.className = 'mb-1';

    var starsVisible = document.createElement('span');
    starsVisible.setAttribute('aria-hidden', 'true');
    starsVisible.textContent = '★'.repeat(review.rating) + '☆'.repeat(5 - review.rating);

    var starsLabel = document.createElement('span');
    starsLabel.className = 'visually-hidden';
    starsLabel.textContent = review.rating + ' out of 5 stars';

    starsWrapper.appendChild(starsVisible);
    starsWrapper.appendChild(starsLabel);

    /* textContent prevents HTML injection from user input */
    var textEl = document.createElement('p');
    textEl.className = 'card-text flex-grow-1 mb-2 text-break';
    textEl.textContent = review.text;

    var footer = document.createElement('footer');
    footer.className = 'small text-muted mt-auto';

    var timeEl = document.createElement('time');
    timeEl.dateTime = review.date;
    timeEl.textContent = formatDate(review.date);
    footer.appendChild(timeEl);

    body.appendChild(header);
    body.appendChild(starsWrapper);
    body.appendChild(textEl);
    body.appendChild(footer);
    card.appendChild(body);
    col.appendChild(card);

    return col;
  }

  /* ── 4. Form element helpers ───────────────────────────────────────────── */

  function makeGroup() {
    var div = document.createElement('div');
    div.className = 'mb-3';
    return div;
  }

  function makeLabel(forId, text) {
    var label = document.createElement('label');
    label.htmlFor = forId;
    label.className = 'form-label';
    label.textContent = text;
    return label;
  }

  /* Must be a following sibling of its control for Bootstrap's .is-invalid ~ .invalid-feedback to show */
  function makeFeedback(id, text) {
    var div = document.createElement('div');
    div.id = id;
    div.className = 'invalid-feedback';
    div.textContent = text;
    return div;
  }

  /* defaultSelected (not .selected) is what form.reset() restores to */
  function makePlaceholderOption(label) {
    var opt = document.createElement('option');
    opt.value = '';
    opt.textContent = label;
    opt.disabled = true;
    opt.defaultSelected = true;
    return opt;
  }

  /* ── 5. Validation ─────────────────────────────────────────────────────── */

  function clearValidation(form) {
    form.querySelectorAll('.is-invalid, .is-valid').forEach(function (el) {
      el.classList.remove('is-invalid', 'is-valid');
    });
  }

  /* Caller prefixes text with ✓ or ✗ so the message isn't colour-only */
  function showMsg(el, type, text) {
    el.className = 'alert alert-' + type;
    el.textContent = text;
  }

  function validateForm(form, fields, liveRegion) {
    clearValidation(form);
    var valid = true;

    if (!fields.name.value.trim()) {
      fields.name.classList.add('is-invalid');
      valid = false;
    } else {
      fields.name.classList.add('is-valid');
    }

    if (!fields.category.value) {
      fields.category.classList.add('is-invalid');
      valid = false;
    } else {
      fields.category.classList.add('is-valid');
    }

    if (!fields.rating.value) {
      fields.rating.classList.add('is-invalid');
      valid = false;
    } else {
      fields.rating.classList.add('is-valid');
    }

    var len = fields.text.value.trim().length;
    var textFeedback = document.getElementById('review-text-feedback');
    if (len < MIN_LEN) {
      fields.text.classList.add('is-invalid');
      textFeedback.textContent =
        'Please enter at least ' + MIN_LEN + ' characters (currently ' + len + ').';
      valid = false;
    } else if (len > MAX_LEN) {
      fields.text.classList.add('is-invalid');
      textFeedback.textContent = 'Please enter no more than ' + MAX_LEN + ' characters.';
      valid = false;
    } else {
      fields.text.classList.add('is-valid');
    }

    if (!valid) {
      showMsg(liveRegion, 'danger', '✗ Please correct the highlighted fields before posting.');
      var firstInvalid = form.querySelector('.is-invalid');
      if (firstInvalid !== null) {
        firstInvalid.focus();
      }
    }

    return valid;
  }

  /* ── 6. Form builder ───────────────────────────────────────────────────── */

  function buildForm() {
    var wrapper = document.createElement('div');
    wrapper.className = 'border rounded p-3 mt-3';

    var formHeading = document.createElement('h3');
    formHeading.id = 'review-form-heading';
    formHeading.textContent = 'Write a review';
    wrapper.appendChild(formHeading);

    /* role="status" + aria-live="polite" — announces messages without interrupting the user */
    var liveRegion = document.createElement('div');
    liveRegion.id = 'review-msg';
    liveRegion.setAttribute('role', 'status');
    liveRegion.setAttribute('aria-live', 'polite');
    liveRegion.className = 'alert d-none mt-2';
    wrapper.appendChild(liveRegion);

    var form = document.createElement('form');
    form.id = 'review-form';
    form.noValidate = true; /* JS handles validation instead of the browser */
    form.setAttribute('aria-labelledby', 'review-form-heading');

    /* ── Name ── */
    var nameGroup = makeGroup();
    nameGroup.appendChild(makeLabel('review-name', 'Your name'));
    var nameInput = document.createElement('input');
    nameInput.type = 'text';
    nameInput.id = 'review-name';
    nameInput.name = 'review-name';
    nameInput.className = 'form-control';
    nameInput.placeholder = 'Full name';
    nameInput.required = true;
    nameInput.setAttribute('aria-describedby', 'review-name-feedback');
    nameGroup.appendChild(nameInput);
    nameGroup.appendChild(makeFeedback('review-name-feedback', 'Please enter your name.'));
    form.appendChild(nameGroup);

    /* ── Category ── */
    var catGroup = makeGroup();
    catGroup.appendChild(makeLabel('review-category', 'Category'));
    var catSelect = document.createElement('select');
    catSelect.id = 'review-category';
    catSelect.name = 'review-category';
    catSelect.className = 'form-select';
    catSelect.required = true;
    catSelect.setAttribute('aria-describedby', 'review-category-feedback');
    catSelect.appendChild(makePlaceholderOption('Choose a category'));
    CATEGORIES.forEach(function (cat) {
      var opt = document.createElement('option');
      opt.value = cat;
      opt.textContent = cat;
      catSelect.appendChild(opt);
    });
    catGroup.appendChild(catSelect);
    catGroup.appendChild(makeFeedback('review-category-feedback', 'Please choose a category.'));
    form.appendChild(catGroup);

    /* ── Rating ── */
    var ratingGroup = makeGroup();
    ratingGroup.appendChild(makeLabel('review-rating', 'Rating'));
    var ratingSelect = document.createElement('select');
    ratingSelect.id = 'review-rating';
    ratingSelect.name = 'review-rating';
    ratingSelect.className = 'form-select';
    ratingSelect.required = true;
    ratingSelect.setAttribute('aria-describedby', 'review-rating-feedback');
    ratingSelect.appendChild(makePlaceholderOption('Choose a rating'));
    RATING_OPTIONS.forEach(function (pair) {
      var opt = document.createElement('option');
      opt.value = pair[0];
      opt.textContent = pair[1];
      ratingSelect.appendChild(opt);
    });
    ratingGroup.appendChild(ratingSelect);
    ratingGroup.appendChild(makeFeedback('review-rating-feedback', 'Please choose a rating.'));
    form.appendChild(ratingGroup);

    /* ── Review text + character counter ── */
    var textGroup = makeGroup();
    textGroup.appendChild(
      makeLabel('review-text', 'Review (' + MIN_LEN + '–' + MAX_LEN + ' characters)')
    );
    var textarea = document.createElement('textarea');
    textarea.id = 'review-text';
    textarea.name = 'review-text';
    textarea.className = 'form-control';
    textarea.rows = 4;
    textarea.placeholder = 'Tell us about your experience with our products or service…';
    textarea.required = true;
    textarea.maxLength = MAX_LEN;
    textarea.setAttribute('aria-describedby', 'review-text-counter review-text-feedback');
    textGroup.appendChild(textarea);

    var counter = document.createElement('small');
    counter.id = 'review-text-counter';
    counter.className = 'form-text';
    counter.setAttribute('aria-live', 'polite');
    counter.setAttribute('aria-atomic', 'true');
    counter.textContent = '0 / ' + MAX_LEN;
    textGroup.appendChild(counter);

    textGroup.appendChild(
      makeFeedback(
        'review-text-feedback',
        'Please enter between ' + MIN_LEN + ' and ' + MAX_LEN + ' characters.'
      )
    );
    form.appendChild(textGroup);

    /* ── Submit button ── */
    var btnRow = document.createElement('div');
    var submitBtn = document.createElement('button');
    submitBtn.type = 'submit';
    submitBtn.id = 'review-submit';
    submitBtn.className = 'btn btn-danger';
    submitBtn.textContent = 'Post review';
    btnRow.appendChild(submitBtn);
    form.appendChild(btnRow);

    wrapper.appendChild(form);

    /* ── Events ── */

    textarea.addEventListener('input', function () {
      counter.textContent = textarea.value.trim().length + ' / ' + MAX_LEN;
    });

    var fields = {
      name: nameInput,
      category: catSelect,
      rating: ratingSelect,
      text: textarea
    };

    form.addEventListener('submit', function (e) {
      e.preventDefault();

      liveRegion.className = 'alert d-none';
      liveRegion.textContent = '';

      if (!validateForm(form, fields, liveRegion)) {
        return;
      }

      var review = {
        name: nameInput.value.trim(),
        category: catSelect.value,
        rating: parseInt(ratingSelect.value, 10),
        text: textarea.value.trim(),
        date: new Date().toISOString()
      };

      document.getElementById('review-list').appendChild(renderReview(review));

      showMsg(liveRegion, 'success', '✓ Your review has been posted. Thank you!');

      form.reset();
      counter.textContent = '0 / ' + MAX_LEN;
      clearValidation(form);
      nameInput.focus();
    });

    return wrapper;
  }

  /* ── 7. Section assembly ───────────────────────────────────────────────── */

  function buildSection() {
    var main = document.querySelector('main');
    if (main === null) { return; }

    var section = document.createElement('section');
    section.id = 'reviews';
    section.className = 'mb-4';
    section.setAttribute('aria-labelledby', 'reviews-heading');

    var heading = document.createElement('h2');
    heading.id = 'reviews-heading';
    heading.textContent = 'Customer reviews';
    section.appendChild(heading);

    var grid = document.createElement('div');
    grid.id = 'review-list';
    grid.className = 'row g-3 mb-4';
    section.appendChild(grid);

    INITIAL_REVIEWS.forEach(function (r) {
      grid.appendChild(renderReview(r));
    });

    section.appendChild(buildForm());
    main.appendChild(section);
  }

  /* ── 8. Init — safety net if script loads without defer ───────────────── */

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', buildSection);
  } else {
    buildSection();
  }

}());
