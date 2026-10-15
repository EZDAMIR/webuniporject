"use strict";

(function () {
  const unverifiedQuote = document.querySelector("#visit aside");
  if (unverifiedQuote) {
    unverifiedQuote.classList.add("d-none");
  }
  const minLength = 20;
  const maxLength = 500;
  const categories = ["Overall", "Products", "Delivery", "Service"];

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
    const column = Store.makeElement("div", "col-12 col-md-6 col-lg-4");
    const card = Store.makeElement("article", "card h-100 shadow-sm");
    const body = Store.makeElement("div", "card-body d-flex flex-column");
    const header = Store.makeElement(
      "div",
      "d-flex flex-wrap justify-content-between align-items-start gap-2 mb-2",
    );
    header.append(Store.makeElement("h3", "card-title fs-6 fw-bold mb-0 text-break", review.name));
    header.append(Store.makeElement("span", "badge bg-secondary", review.category));
    body.append(header);

    if (review.rating !== null) {
      const stars = Store.makeElement("p", "mb-1");
      const visible = Store.makeElement(
        "span",
        "",
        "★".repeat(review.rating) + "☆".repeat(5 - review.rating),
      );
      visible.setAttribute("aria-hidden", "true");
      stars.append(
        visible,
        Store.makeElement("span", "visually-hidden", review.rating + " out of 5 stars"),
      );
      body.append(stars);
    }
    // textContent keeps submitted text as text, never HTML.
    body.append(Store.makeElement("p", "card-text flex-grow-1 mb-2 text-break", review.text));
    if (review.date) {
      const footer = Store.makeElement("footer", "small text-muted mt-auto");
      const time = Store.makeElement("time", "", formatDate(review.date));
      time.dateTime = review.date;
      footer.append(time);
      body.append(footer);
    }
    card.append(body);
    column.append(card);
    return column;
  }

  function makeField(id, label, tag) {
    const group = Store.makeElement("div", "mb-3");
    const labelElement = Store.makeElement("label", "form-label", label);
    labelElement.htmlFor = id;
    const control = Store.makeElement(tag, tag === "select" ? "form-select" : "form-control");
    control.id = id;
    control.name = id;
    control.required = true;
    control.setAttribute("aria-describedby", id + "-feedback");
    const feedback = Store.makeElement("div", "invalid-feedback");
    feedback.id = id + "-feedback";
    group.append(labelElement, control, feedback);
    return { group: group, control: control };
  }

  function addOption(select, value, label) {
    const option = Store.makeElement("option", "", label);
    option.value = value;
    select.append(option);
    return option;
  }

  function buildForm() {
    const wrapper = Store.makeElement("div", "border rounded p-3 mt-3");
    const heading = Store.makeElement("h3", "", "Write a review");
    heading.id = "review-form-heading";
    const message = Store.makeElement("p", "alert d-none mt-2");
    message.id = "review-msg";
    message.setAttribute("role", "status");
    message.setAttribute("aria-live", "polite");
    message.setAttribute("aria-atomic", "true");
    const form = Store.makeElement("form", "");
    form.id = "review-form";
    form.noValidate = true;
    form.setAttribute("aria-labelledby", heading.id);
    const name = makeField("review-name", "Your name", "input");
    name.control.type = "text";
    name.control.autocomplete = "name";
    name.control.maxLength = 80;
    const category = makeField("review-category", "Category", "select");
    addOption(category.control, "", "Choose a category").defaultSelected = true;
    categories.forEach(function (value) {
      addOption(category.control, value, value);
    });
    const rating = makeField("review-rating", "Rating", "select");
    addOption(rating.control, "", "Choose a rating").defaultSelected = true;
    const ratings = ["Very poor", "Poor", "Average", "Good", "Excellent"];
    for (let stars = 5; stars >= 1; stars -= 1) {
      addOption(
        rating.control,
        String(stars),
        "★".repeat(stars) + "☆".repeat(5 - stars) + " — " + ratings[stars - 1],
      );
    }
    const text = makeField("review-text", "Review (20–500 characters)", "textarea");
    text.control.rows = 4;
    text.control.minLength = minLength;
    text.control.maxLength = maxLength;
    text.control.placeholder = "Tell us about your experience.";
    text.control.setAttribute("aria-describedby", "review-text-counter review-text-feedback");
    const counter = Store.makeElement("small", "form-text", "0 / " + maxLength);
    counter.id = "review-text-counter";
    counter.setAttribute("aria-live", "polite");
    counter.setAttribute("aria-atomic", "true");
    text.group.append(counter);
    const submit = Store.makeElement("button", "btn btn-danger", "Add review");
    submit.id = "review-submit";
    submit.type = "submit";
    form.append(name.group, category.group, rating.group, text.group, submit);
    wrapper.append(
      heading,
      Store.makeElement(
        "p",
        "small",
        "Choose a category and rating, then tell us about your experience.",
      ),
      message,
      form,
    );

    function getRules() {
      const length = text.control.value.trim().length;
      return [
        { field: name.control, error: name.control.value.trim() ? "" : "Enter your name." },
        {
          field: category.control,
          error: categories.includes(category.control.value) ? "" : "Choose a category.",
        },
        {
          field: rating.control,
          error: /^[1-5]$/.test(rating.control.value) ? "" : "Choose a rating from 1 to 5.",
        },
        {
          field: text.control,
          error:
            length >= minLength && length <= maxLength
              ? ""
              : "Enter 20–500 characters, excluding leading or trailing spaces (currently " +
                length +
                ").",
        },
      ];
    }

    const validate = Store.bindValidation(form, getRules, message);
    text.control.addEventListener("input", function () {
      counter.textContent = text.control.value.trim().length + " / " + maxLength;
    });
    form.addEventListener("submit", function (event) {
      event.preventDefault();
      if (!validate()) {
        return;
      }
      const review = {
        name: name.control.value.trim(),
        category: category.control.value,
        rating: Number(rating.control.value),
        text: text.control.value.trim(),
        date: new Date().toISOString(),
      };
      document.getElementById("review-list").append(renderReview(review));
      form.reset();
      counter.textContent = "0 / " + maxLength;
      Store.showMessage(message, "success", "Your review has been added.");
      name.control.focus();
    });
    return wrapper;
  }

  const section = Store.makeElement("section", "mb-4");
  section.id = "reviews";
  section.setAttribute("aria-labelledby", "reviews-heading");
  const heading = Store.makeElement("h2", "", "Reviews");
  heading.id = "reviews-heading";
  const grid = Store.makeElement("div", "row g-3 mb-4");
  grid.id = "review-list";
  section.append(
    heading,
    Store.makeElement("p", "", "Share your experience with our products, delivery or service."),
    grid,
    buildForm(),
  );
  document.querySelector("main").append(section);
})();
