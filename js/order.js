"use strict";

(function () {
  const form = document.getElementById("order-form");
  const result = document.getElementById("order-confirmation");
  const errors = document.getElementById("order-errors");
  const name = document.getElementById("customer-name");
  const email = document.getElementById("customer-email");
  const phone = document.getElementById("customer-phone");
  const date = document.getElementById("preferred-date");
  const address = document.getElementById("delivery-address");
  const entrance = document.getElementById("delivery-entrance");
  const contact = document.getElementById("delivery-contact");
  const notes = document.getElementById("order-notes");
  const consent = document.getElementById("order-consent");
  const collection = document.getElementById("method-collection");
  const delivery = document.getElementById("method-delivery");
  const submit = document.getElementById("order-submit");
  const summary = document.getElementById("order-summary");
  const selectionMessage = Store.makeMessage("selection-message");
  // Prevent repeated confirmation until the form or cart changes.
  let completed = false;

  form.before(
    Store.makeElement(
      "p",
      "alert alert-info",
      "Confirm prices and availability with the store before arranging collection or delivery.",
    ),
  );
  Store.hideMessage(result);
  submit.textContent = "Review request";
  collection.checked = true;
  collection.defaultChecked = true;
  date.min = Store.todayInPavlodar();
  name.autocomplete = "name";
  email.autocomplete = "email";
  phone.autocomplete = "tel";
  address.autocomplete = "address-line1";
  consent.required = true;
  document.querySelector('label[for="order-consent"]').textContent =
    "I have checked my contact details, material quantities and collection or delivery preferences.";
  document.querySelector("#delivery-block .small").textContent =
    "Delivery is within Pavlodar. Its fee is excluded from the goods total and must be confirmed with the store.";
  document.getElementById("order-row-1").before(selectionMessage);
  document.querySelector("#order-row-1").parentElement.querySelector("p").textContent =
    "Choose a material and a whole quantity from 1 to 999, then click Add to cart. Either row can add materials; the cart holds your selections.";
  document.getElementById("quantity-unit").textContent = "Unit shown in the selected material.";
  // Configure both product rows with the same function.
  const selections = [1, 2].map(setupSelection);

  summary.querySelector("p").textContent =
    "Your cart and live estimate appear below. The total covers goods only; confirm any delivery fee with the store.";
  Store.setupCart(summary, submit, false);
  const details = Store.makeElement("div", "mt-3");
  details.setAttribute("aria-live", "polite");
  details.setAttribute("aria-atomic", "true");
  [
    "summary-customer",
    "summary-contact",
    "summary-date",
    "summary-method",
    "summary-total",
    "summary-notes",
  ].forEach(function (id) {
    const paragraph = Store.makeElement("p", "text-break");
    paragraph.id = id;
    details.append(paragraph);
  });
  result.before(details);

  function setupSelection(index) {
    const product = document.getElementById("product-" + index);
    const quantity = document.getElementById("qty-" + index);
    const row = document.getElementById("order-row-" + index);
    // Keep the placeholder and rebuild options from the shared products.
    product.replaceChildren(product.options[0]);
    // Validate selection rows when adding an item; unused rows may stay blank.
    product.required = false;
    quantity.required = false;
    quantity.max = "999";
    quantity.step = "1";
    quantity.defaultValue = "1";
    Store.products.forEach(function (item) {
      const option = Store.makeElement(
        "option",
        "",
        item.name +
          " — " +
          item.unit +
          ", " +
          item.specification +
          " — " +
          Store.formatMoney(item.price),
      );
      option.value = item.id;
      product.append(option);
    });
    const actions = Store.makeElement("div", "col-12");
    const preview = Store.makeMessage("selection-subtotal-" + index);
    const add = Store.makeElement("button", "btn btn-danger", "Add to cart");
    add.type = "button";
    add.id = "add-material-" + index;
    add.setAttribute("aria-label", "Add product from row " + index + " to cart");
    actions.append(preview, add);
    row.append(actions);

    function refresh() {
      const selected = Store.findProduct(product.value);
      // Input values are text; convert the quantity before calculating.
      const amount = Number(quantity.value);
      row.classList.toggle("selected-row", selected !== undefined);
      if (selected && Store.validQuantity(amount)) {
        Store.showMessage(
          preview,
          "info",
          amount +
            " × " +
            selected.unit +
            " · Subtotal: " +
            Store.formatMoney(Store.getSubtotal(selected.price, amount)),
        );
      } else {
        Store.showMessage(preview, "info", "Choose a material and a whole quantity from 1 to 999.");
      }
      if (product.classList.contains("is-invalid")) {
        Store.setFieldError(product, selected ? "" : "Choose a material to add.");
      }
      if (quantity.classList.contains("is-invalid")) {
        Store.setFieldError(
          quantity,
          Store.validQuantity(amount) ? "" : "Enter a whole quantity from 1 to 999.",
        );
      }
      Store.hideMessage(selectionMessage);
    }

    add.addEventListener("click", function () {
      const rules = [
        {
          field: product,
          error: Store.findProduct(product.value) ? "" : "Choose a material to add.",
        },
        {
          field: quantity,
          error: Store.validQuantity(Number(quantity.value))
            ? ""
            : "Enter a whole quantity from 1 to 999.",
        },
      ];
      if (!Store.validateFields(rules, true)) {
        Store.showMessage(
          selectionMessage,
          "danger",
          "Choose a material and a valid quantity before adding it.",
        );
        return;
      }
      const response = Store.addToCart(product.value, Number(quantity.value));
      Store.showMessage(
        selectionMessage,
        response.success ? "success" : "danger",
        response.message,
      );
    });
    product.addEventListener("change", refresh);
    quantity.addEventListener("input", refresh);
    refresh();
    return { product: product, refresh: refresh };
  }

  // Read current values; an empty error string means the check passed.
  function getRules() {
    return [
      {
        field: name,
        error: name.value.trim().length >= 2 ? "" : "Enter a name with at least 2 characters.",
      },
      {
        field: email,
        error: Store.validEmail(email.value)
          ? ""
          : "Enter a valid email address, such as name@example.com.",
      },
      {
        field: phone,
        error: Store.validPhone(phone.value.trim())
          ? ""
          : "Enter 10–15 digits, using only +, spaces, brackets or hyphens.",
      },
      {
        field: date,
        error:
          date.value && date.value >= Store.todayInPavlodar()
            ? ""
            : "Choose today or a future date in Pavlodar.",
      },
      {
        field: address,
        error:
          !delivery.checked || address.value.trim().length >= 5
            ? ""
            : "Enter a street and building number (at least 5 characters).",
      },
      {
        field: consent,
        error: consent.checked ? "" : "Confirm your details and preferences before continuing.",
      },
    ];
  }

  // Hide and disable delivery fields when collection is selected.
  function updateMethod() {
    document.getElementById("delivery-block").classList.toggle("d-none", !delivery.checked);
    document.getElementById("collection-block").classList.toggle("d-none", delivery.checked);
    document.querySelectorAll("#delivery-block input").forEach(function (field) {
      field.disabled = !delivery.checked;
    });
    address.required = delivery.checked;
    if (!delivery.checked) {
      Store.setFieldError(address, "");
    }
  }

  // Refresh displayed details and totals from the current form and cart.
  function updateSummary() {
    const cart = Store.getCart();
    document.getElementById("summary-customer").textContent =
      name.value.trim() || "Customer details not entered yet.";
    document.getElementById("summary-contact").textContent =
      [email.value.trim(), phone.value.trim()].filter(Boolean).join(" · ") ||
      "Contact details not entered yet.";
    document.getElementById("summary-date").textContent = date.value || "Choose a preferred date.";
    if (delivery.checked) {
      document.getElementById("summary-method").textContent =
        "Delivery: " +
        ([address.value.trim(), entrance.value.trim(), contact.value.trim()]
          .filter(Boolean)
          .join(", ") || "Enter a street and building number.") +
        " Delivery fee is excluded.";
    } else {
      document.getElementById("summary-method").textContent =
        "Collection: Kamzina Street 199, Pavlodar. No delivery charge.";
    }
    document.getElementById("summary-total").textContent =
      "Goods total: " + Store.formatMoney(Store.getCartTotal(cart));
    const summaryNotes = document.getElementById("summary-notes");
    summaryNotes.textContent = "Notes: " + notes.value.trim();
    summaryNotes.classList.toggle("d-none", notes.value.trim() === "");
    submit.disabled = cart.length === 0 || completed;
  }

  const validate = Store.bindValidation(form, getRules, errors);
  // Editing makes the previous confirmation outdated.
  form.addEventListener("input", function () {
    completed = false;
    Store.hideMessage(result);
    updateSummary();
  });
  form.addEventListener("change", function () {
    completed = false;
    Store.hideMessage(result);
    updateMethod();
    updateSummary();
  });
  document.addEventListener("cartchange", function () {
    completed = false;
    Store.hideMessage(result);
    updateSummary();
  });
  form.addEventListener("submit", function (event) {
    // Handle submission locally without sending or reloading the form.
    event.preventDefault();
    if (completed) {
      return;
    }
    if (Store.getCart().length === 0) {
      Store.showMessage(
        errors,
        "danger",
        "Your cart is empty. Add at least one material before checking the request.",
      );
      selections[0].product.focus();
      return;
    }
    if (!validate()) {
      return;
    }
    completed = true;
    updateSummary();
    result.setAttribute("aria-live", "polite");
    Store.showMessage(
      result,
      "success",
      "Request summary " +
        Store.createReference("REQ") +
        " prepared. " +
        document.getElementById("summary-total").textContent +
        ". Review the details above and contact the store to arrange collection or delivery.",
    );
  });
  form.addEventListener("reset", function () {
    // Wait for reset to restore defaults before refreshing the summary.
    setTimeout(function () {
      completed = false;
      selections.forEach(function (selection) {
        selection.refresh();
      });
      updateMethod();
      updateSummary();
      Store.hideMessage(errors);
      Store.showMessage(
        result,
        "info",
        "Form cleared. Your cart is unchanged; use Clear cart to remove materials.",
      );
    }, 0);
  });
  updateMethod();
  updateSummary();
})();
