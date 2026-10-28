"use strict";

// jQuery 3.7.1: ready waits for the DOM; reviews last until the page reloads.
$(function () {
  $("#visit aside").addClass("d-none");
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
    const $column = Store.makeElement("div", "col-12 col-md-6 col-lg-4");
    const $card = Store.makeElement("article", "card h-100 shadow-sm");
    const $body = Store.makeElement("div", "card-body d-flex flex-column");
    const $header = Store.makeElement(
      "div",
      "d-flex flex-wrap justify-content-between align-items-start gap-2 mb-2",
    );
    $header.append(
      Store.makeElement("h3", "card-title fs-6 fw-bold mb-0 text-break", review.name),
      Store.makeElement("span", "badge bg-secondary", review.category),
    );
    $body.append($header);
    const $stars = Store.makeElement("p", "mb-1");
    const $visible = Store.makeElement(
      "span",
      "",
      "★".repeat(review.rating) + "☆".repeat(5 - review.rating),
    );
    $stars.append(
      $visible.attr("aria-hidden", "true"),
      Store.makeElement("span", "visually-hidden", review.rating + " out of 5 stars"),
    );
    $body.append($stars);
    // makeElement uses .text() so review content cannot execute as HTML.
    $body.append(Store.makeElement("p", "card-text flex-grow-1 mb-2 text-break", review.text));
    const $footer = Store.makeElement("footer", "small text-muted mt-auto");
    $footer.append(
      Store.makeElement("time", "", formatDate(review.date)).attr("datetime", review.date),
    );
    $body.append($footer);
    $card.append($body);
    return $column.append($card);
  }

  function makeField(id, label, tag) {
    const $control = Store.makeElement(tag, tag === "select" ? "form-select" : "form-control")
      .attr({ id, name: id, "aria-describedby": id + "-feedback" })
      .prop("required", true);
    const $group = Store.makeElement("div", "mb-3").append(
      Store.makeElement("label", "form-label", label).attr("for", id),
      $control,
      Store.makeElement("div", "invalid-feedback").attr("id", id + "-feedback"),
    );
    return { group: $group, control: $control };
  }

  function addOption($select, value, label) {
    return Store.makeElement("option", "", label).val(value).appendTo($select);
  }

  function buildForm() {
    const $wrapper = Store.makeElement("div", "border rounded p-3 mt-3");
    const $message = Store.makeMessage("review-msg").addClass("mt-2");
    const $form = Store.makeElement("form", "").attr({
      id: "review-form",
      "aria-labelledby": "review-form-heading",
    });
    const name = makeField("review-name", "Your name", "input");
    name.control.attr({ type: "text", autocomplete: "name", maxlength: 80 });
    const category = makeField("review-category", "Category", "select");
    addOption(category.control, "", "Choose a category").prop("defaultSelected", true);
    categories.forEach(function (value) {
      addOption(category.control, value, value);
    });
    const rating = makeField("review-rating", "Rating", "select");
    addOption(rating.control, "", "Choose a rating").prop("defaultSelected", true);
    const ratings = ["Very poor", "Poor", "Average", "Good", "Excellent"];
    for (let stars = 5; stars >= 1; stars -= 1) {
      addOption(
        rating.control,
        String(stars),
        "★".repeat(stars) + "☆".repeat(5 - stars) + " — " + ratings[stars - 1],
      );
    }
    const text = makeField("review-text", "Review (20–500 characters)", "textarea");
    text.control.attr({
      rows: 4,
      minlength: minLength,
      maxlength: maxLength,
      placeholder: "Tell us about your experience.",
      "aria-describedby": "review-text-counter review-text-feedback",
    });
    const $counter = Store.makeElement("small", "form-text", "0 / " + maxLength).attr({
      id: "review-text-counter",
      "aria-live": "polite",
      "aria-atomic": "true",
    });
    text.group.append($counter);
    $form.append(
      name.group,
      category.group,
      rating.group,
      text.group,
      Store.makeElement("button", "btn btn-danger", "Add review").attr({
        id: "review-submit",
        type: "submit",
      }),
    );
    $wrapper.append(
      Store.makeElement("h3", "", "Write a review").attr("id", "review-form-heading"),
      Store.makeElement(
        "p",
        "small",
        "Choose a category and rating, then tell us about your experience.",
      ),
      $message,
      $form,
    );

    function getRules() {
      const length = text.control.val().trim().length;
      return [
        { field: name.control, error: name.control.val().trim() ? "" : "Enter your name." },
        {
          field: category.control,
          error: categories.includes(category.control.val()) ? "" : "Choose a category.",
        },
        {
          field: rating.control,
          error: /^[1-5]$/.test(rating.control.val()) ? "" : "Choose a rating from 1 to 5.",
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
    const validate = Store.bindValidation($form, getRules, $message);
    text.control.on("input", function () {
      $counter.text($(this).val().trim().length + " / " + maxLength);
    });
    $form.on("reset", function () {
      $counter.text("0 / " + maxLength);
    });
    $form.on("submit", function (event) {
      // Without preventDefault, the form would submit and the new review would disappear on reload.
      event.preventDefault();
      if (!validate()) return;
      const review = {
        name: name.control.val().trim(),
        category: category.control.val(),
        rating: Number(rating.control.val()),
        text: text.control.val().trim(),
        date: new Date().toISOString(),
      };
      $grid.append(renderReview(review));
      $form.trigger("reset");
      Store.showMessage($message, "success", "Your review has been added.");
      name.control.trigger("focus");
    });
    return $wrapper;
  }

  const $section = Store.makeElement("section", "mb-4").attr({
    id: "reviews",
    "aria-labelledby": "reviews-heading",
  });
  const $grid = Store.makeElement("div", "row g-3 mb-4").attr("id", "review-list");
  $section.append(
    Store.makeElement("h2", "", "Reviews").attr("id", "reviews-heading"),
    Store.makeElement("p", "", "Share your experience with our products, delivery or service."),
    $grid,
    buildForm(),
  );
  $("main").append($section);
});
