"use strict";

// Independent plain JavaScript feature: data, DOM rendering, validation and events.
(function () {
  // Reviews contain actual submissions. Starting empty avoids invented testimonials.
  const reviews = [];
  const categories = ["Overall", "Products", "Delivery", "Service"];
  const ratings = [
    { value: 5, label: "Excellent" },
    { value: 4, label: "Good" },
    { value: 3, label: "Average" },
    { value: 2, label: "Poor" },
    { value: 1, label: "Very poor" },
  ];
  const sorts = [
    { value: "newest", label: "Newest first" },
    { value: "highest", label: "Highest rating" },
    { value: "lowest", label: "Lowest rating" },
  ];
  const limits = { name: 80, minimumText: 20, maximumText: 500 };

  function element(tag, classes, text) {
    const node = document.createElement(tag);
    node.className = classes;
    if (text !== undefined) node.textContent = text;
    return node;
  }

  function option(value, label) {
    const node = element("option", "", label);
    node.value = value;
    return node;
  }

  // Pure functions take data as parameters and return new results for the renderer.
  function selectReviews(items, category, sort) {
    const selected = items.filter(function (review) {
      return category === "all" || review.category === category;
    });
    return selected.sort(function (first, second) {
      if (sort === "highest") return second.rating - first.rating || second.id - first.id;
      if (sort === "lowest") return first.rating - second.rating || second.id - first.id;
      return second.id - first.id;
    });
  }

  function averageRating(items) {
    if (items.length === 0) return null;
    const total = items.reduce(function (sum, review) {
      return sum + review.rating;
    }, 0);
    return (total / items.length).toFixed(1);
  }

  function formatDate(isoString) {
    return (
      new Intl.DateTimeFormat("en-GB", {
        timeZone: "Asia/Almaty",
        day: "numeric",
        month: "long",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }).format(new Date(isoString)) + " (Pavlodar time)"
    );
  }

  function renderReview(review) {
    const column = element("div", "col-12 col-md-6 col-lg-4");
    const card = element("article", "card h-100 shadow-sm");
    const body = element("div", "card-body d-flex flex-column");
    const header = element(
      "div",
      "d-flex flex-wrap justify-content-between align-items-start gap-2 mb-2",
    );
    header.append(
      element("h3", "card-title fs-6 fw-bold mb-0 text-break", review.name),
      element("span", "badge bg-secondary", review.category),
    );
    const stars = element("p", "mb-1");
    const visibleStars = element(
      "span",
      "",
      "★".repeat(review.rating) + "☆".repeat(5 - review.rating),
    );
    visibleStars.setAttribute("aria-hidden", "true");
    stars.append(
      visibleStars,
      element("span", "visually-hidden", review.rating + " out of 5 stars"),
    );
    const time = element("time", "", formatDate(review.date));
    time.dateTime = review.date;
    const footer = element("footer", "small text-muted mt-auto");
    footer.append(time);
    body.append(
      header,
      stars,
      element("p", "card-text flex-grow-1 mb-2 text-break", review.text),
      footer,
    );
    card.append(body);
    column.append(card);
    return column;
  }

  function field(id, label, tag) {
    const control = element(tag, tag === "select" ? "form-select" : "form-control");
    control.id = id;
    control.name = id;
    control.required = true;
    const caption = element("label", "form-label", label);
    caption.htmlFor = id;
    const feedback = element("div", "invalid-feedback");
    feedback.id = id + "-feedback";
    control.setAttribute("aria-describedby", feedback.id);
    const group = element("div", "mb-3");
    group.append(caption, control, feedback);
    return { group, control, feedback };
  }

  function setError(input, message) {
    input.control.classList.toggle("is-invalid", Boolean(message));
    input.control.setAttribute("aria-invalid", String(Boolean(message)));
    input.feedback.textContent = message;
  }

  function initReviews() {
    const main = document.querySelector("main");
    if (!main) return;
    document.querySelector("#visit aside")?.classList.add("d-none");
    const section = element("section", "mb-4");
    section.id = "reviews";
    section.setAttribute("aria-labelledby", "reviews-heading");
    const heading = element("h2", "", "Reviews");
    heading.id = "reviews-heading";
    const summary = element("p", "small");
    summary.id = "review-summary";
    summary.setAttribute("role", "status");
    const empty = element("p", "alert alert-info");
    empty.id = "reviews-empty";
    const grid = element("div", "row g-3 mb-4");
    grid.id = "review-list";
    const filter = field("review-filter", "Show reviews", "select");
    filter.control.required = false;
    filter.control.append(option("all", "All categories"));
    for (const category of categories) filter.control.append(option(category, category));
    const sort = field("review-sort", "Sort reviews", "select");
    sort.control.required = false;
    for (const item of sorts) sort.control.append(option(item.value, item.label));
    const controls = element("div", "row");
    for (const input of [filter, sort]) {
      input.group.classList.add("col-12", "col-sm-6");
      input.control.setAttribute("aria-controls", grid.id);
      controls.append(input.group);
    }

    function updateReviews() {
      const selected = selectReviews(reviews, filter.control.value, sort.control.value);
      const cards = document.createDocumentFragment();
      for (const review of selected) cards.append(renderReview(review));
      grid.replaceChildren(cards);
      empty.classList.toggle("d-none", selected.length !== 0);
      empty.textContent =
        reviews.length === 0
          ? "No reviews yet. Be the first to share your experience."
          : "No reviews in this category. Choose All categories to see every review.";
      const average = averageRating(selected);
      summary.textContent =
        selected.length +
        " of " +
        reviews.length +
        " reviews shown." +
        (average === null ? "" : " Average rating: " + average + " out of 5.");
    }

    const wrapper = element("div", "border rounded p-3 mt-3");
    const formHeading = element("h3", "", "Write a review");
    formHeading.id = "review-form-heading";
    const message = element("p", "alert d-none mt-2");
    message.id = "review-msg";
    message.setAttribute("role", "status");
    message.setAttribute("aria-atomic", "true");
    const form = element("form", "");
    form.id = "review-form";
    form.noValidate = true;
    form.setAttribute("aria-labelledby", formHeading.id);
    const name = field("review-name", "Your name", "input");
    name.control.type = "text";
    name.control.autocomplete = "name";
    name.control.maxLength = limits.name;
    const category = field("review-category", "Category", "select");
    category.control.append(option("", "Choose a category"));
    for (const value of categories) category.control.append(option(value, value));
    const rating = field("review-rating", "Rating", "select");
    rating.control.append(option("", "Choose a rating"));
    for (const item of ratings)
      rating.control.append(option(String(item.value), item.value + " — " + item.label));
    const text = field("review-text", "Review (20–500 characters)", "textarea");
    text.control.rows = 4;
    text.control.minLength = limits.minimumText;
    text.control.maxLength = limits.maximumText;
    text.control.placeholder = "Tell us about your experience.";
    const counter = element("small", "form-text");
    counter.id = "review-text-counter";
    text.control.setAttribute("aria-describedby", counter.id + " " + text.feedback.id);
    text.group.append(counter);
    const submit = element("button", "btn btn-danger", "Add review");
    submit.id = "review-submit";
    submit.type = "submit";
    const reset = element("button", "btn btn-outline-secondary", "Clear review");
    reset.type = "reset";
    const actions = element("div", "d-flex flex-wrap gap-2");
    actions.append(submit, reset);
    form.append(name.group, category.group, rating.group, text.group, actions);
    wrapper.append(
      formHeading,
      element(
        "p",
        "small",
        "Reviews stay on this page until you reload. This demo does not publish them.",
      ),
      message,
      form,
    );
    section.append(heading, controls, summary, empty, grid, wrapper);
    main.append(section);
    let submitted = false;

    function showMessage(type, value) {
      message.className = "alert alert-" + type + " mt-2";
      message.textContent = value;
    }
    function updateCounter() {
      counter.textContent = text.control.value.trim().length + " / " + limits.maximumText;
    }
    function validate(focusFirst) {
      const length = text.control.value.trim().length;
      const rules = [
        {
          input: name,
          error:
            name.control.value.trim().length > 0 && name.control.value.trim().length <= limits.name
              ? ""
              : "Enter your name (1–80 characters).",
        },
        {
          input: category,
          error: categories.includes(category.control.value) ? "" : "Choose a category.",
        },
        {
          input: rating,
          error: ratings.some(function (item) {
            return String(item.value) === rating.control.value;
          })
            ? ""
            : "Choose a rating from 1 to 5.",
        },
        {
          input: text,
          error:
            length >= limits.minimumText && length <= limits.maximumText
              ? ""
              : "Enter 20–500 characters, excluding leading or trailing spaces (currently " +
                length +
                ").",
        },
      ];
      for (const rule of rules) setError(rule.input, rule.error);
      const first = rules.find(function (rule) {
        return rule.error !== "";
      });
      if (first && focusFirst) first.input.control.focus();
      return first === undefined;
    }

    filter.control.addEventListener("change", updateReviews);
    sort.control.addEventListener("change", updateReviews);
    // Events bubble from generated controls to the form; no inline attributes.
    function handleCorrection(event) {
      if (event.isComposing) return;
      updateCounter();
      message.classList.add("d-none");
      if (submitted && !validate(false))
        showMessage("danger", "Please correct the highlighted fields.");
    }
    form.addEventListener("input", handleCorrection);
    form.addEventListener("change", handleCorrection);
    form.addEventListener("compositionend", handleCorrection);
    form.addEventListener("reset", function () {
      submitted = false;
      for (const input of [name, category, rating, text]) setError(input, "");
      counter.textContent = "0 / " + limits.maximumText;
      showMessage("info", "Review form cleared.");
    });
    form.addEventListener("submit", function (event) {
      event.preventDefault();
      submitted = true;
      name.control.value = name.control.value.trim();
      text.control.value = text.control.value.trim();
      updateCounter();
      if (!validate(true)) {
        showMessage("danger", "Please correct the highlighted fields.");
        return;
      }
      reviews.push({
        id: reviews.length + 1,
        name: name.control.value,
        category: category.control.value,
        rating: Number(rating.control.value),
        text: text.control.value,
        date: new Date().toISOString(),
      });
      // Show the new review even when the visitor had selected another category.
      filter.control.value = "all";
      sort.control.value = "newest";
      updateReviews();
      form.reset();
      showMessage("success", "Your review has been added to this page.");
      name.control.focus();
    });
    updateCounter();
    updateReviews();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initReviews, { once: true });
  } else {
    initReviews();
  }
})();
