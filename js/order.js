"use strict";

// jQuery 3.7.1: ready waits for the DOM; main.js initializes shared helpers first.
$(function () {
  const $form = $("#order-form");
  const $result = $("#order-confirmation");
  const $errors = $("#order-errors");
  const $name = $("#customer-name").attr("autocomplete", "name");
  const $email = $("#customer-email").attr("autocomplete", "email");
  const $phone = $("#customer-phone").attr("autocomplete", "tel");
  const $date = $("#preferred-date").attr("min", Store.todayInPavlodar());
  const $address = $("#delivery-address").attr({ autocomplete: "address-line1", maxlength: 200 });
  const $entrance = $("#delivery-entrance").attr("maxlength", 80);
  const $contact = $("#delivery-contact").attr("maxlength", 80);
  const $notes = $("#order-notes").attr("maxlength", 1000);
  const $consent = $("#order-consent").prop("required", true);
  const $collection = $("#method-collection").prop({ checked: true, defaultChecked: true });
  const $delivery = $("#method-delivery");
  const $submit = $("#order-submit").text("Review request");
  const $summary = $("#order-summary");
  const $selectionMessage = Store.makeMessage("selection-message");
  let completed = false;

  $form.before(
    Store.makeElement(
      "p",
      "alert alert-info",
      "Confirm prices and availability with the store before arranging collection or delivery.",
    ),
  );
  Store.hideMessage($result);
  $('label[for="order-consent"]').text(
    "I have checked my contact details, material quantities and collection or delivery preferences.",
  );
  $("#delivery-block .small").text(
    "Delivery is within Pavlodar. Its fee is excluded from the goods total and must be confirmed with the store.",
  );
  $("#order-row-1")
    .before($selectionMessage)
    .parent()
    .find("p")
    .first()
    .text(
      "Choose a material and a whole quantity from 1 to 999, then click Add to cart. Either row can add materials; the cart holds your selections.",
    );
  $("#quantity-unit").text("Unit shown in the selected material.");
  const selections = [1, 2].map(setupSelection);
  const savedCart = Store.getCart();
  if (savedCart.length) {
    selections[0].product.val(savedCart[0].id);
    selections[0].quantity.val(savedCart[0].quantity);
    selections[0].refresh();
  }

  $summary
    .find("p")
    .first()
    .text(
      "Your cart and live estimate appear below. The total covers goods only; confirm any delivery fee with the store.",
    );
  Store.setupCart($summary, $submit, false);
  const $details = Store.makeElement("div", "mt-3").attr({
    "aria-live": "polite",
    "aria-atomic": "true",
  });
  [
    "summary-customer",
    "summary-contact",
    "summary-date",
    "summary-method",
    "summary-total",
    "summary-notes",
  ].forEach(function (id) {
    Store.makeElement("p", "text-break").attr("id", id).appendTo($details);
  });
  $result.before($details);

  function setupSelection(index) {
    const $product = $("#product-" + index);
    const $quantity = $("#qty-" + index).attr({ max: 999, step: 1 });
    const $row = $("#order-row-" + index);
    // Preserve required/min from HTML; the second row remains optional.
    const $placeholder = $product.find("option").first().detach();
    $product.empty().append($placeholder);
    Store.products.forEach(function (item) {
      const label = `${item.name} — ${item.unit}, ${item.specification} — ${Store.formatMoney(item.price)}`;
      Store.makeElement("option", "", label).val(item.id).appendTo($product);
    });
    const $preview = Store.makeMessage("selection-subtotal-" + index);
    const $add = Store.makeElement("button", "btn btn-danger", "Add to cart").attr({
      type: "button",
      id: "add-material-" + index,
      "aria-label": "Add product from row " + index + " to cart",
    });
    $row.append(Store.makeElement("div", "col-12").append($preview, $add));

    function rules(forceRequired) {
      const active =
        forceRequired ||
        $product.prop("required") ||
        $product.val() !== "" ||
        $quantity.val() !== "";
      return [
        {
          field: $product,
          error: !active || Store.findProduct($product.val()) ? "" : "Choose a material to add.",
        },
        {
          field: $quantity,
          error:
            !active || Store.validQuantity(Number($quantity.val()))
              ? ""
              : "Enter a whole quantity from 1 to 999.",
        },
      ];
    }
    function refresh() {
      const selected = Store.findProduct($product.val());
      const amount = Number($quantity.val());
      $row.toggleClass("selected-row", selected !== undefined);
      let preview = "Choose a material and a whole quantity from 1 to 999.";
      if (selected && Store.validQuantity(amount)) {
        const subtotal = Store.formatMoney(Store.getSubtotal(selected.price, amount));
        preview = `${amount} × ${selected.unit} · Subtotal: ${subtotal}`;
      }
      Store.showMessage($preview, "info", preview);
      rules(false).forEach(function (rule) {
        if (rule.field.hasClass("is-invalid")) Store.setFieldError(rule.field, rule.error);
      });
      Store.hideMessage($selectionMessage);
    }
    $add.on("click", function () {
      if (!Store.validateFields(rules(true), true)) {
        Store.showMessage(
          $selectionMessage,
          "danger",
          "Choose a material and a valid quantity before adding it.",
        );
        return;
      }
      const response = Store.addToCart($product.val(), Number($quantity.val()));
      Store.showMessage(
        $selectionMessage,
        response.success ? "success" : "danger",
        response.message,
      );
    });
    $product.on("change", refresh);
    $quantity.on("input", refresh);
    refresh();
    return { product: $product, quantity: $quantity, refresh, rules };
  }

  function getRules() {
    const deliverySelected = $delivery.is(":checked");
    return [
      {
        field: $name,
        error: $name.val().trim().length >= 2 ? "" : "Enter a name with at least 2 characters.",
      },
      {
        field: $email,
        error: Store.validEmail($email.val())
          ? ""
          : "Enter a valid email address, such as name@example.com.",
      },
      {
        field: $phone,
        error: Store.validPhone($phone.val().trim())
          ? ""
          : "Enter 10–15 digits with an optional leading +, spaces, brackets or hyphens.",
      },
      {
        field: $date,
        error:
          $date.val() && $date.val() >= Store.todayInPavlodar()
            ? ""
            : "Choose today or a future date in Pavlodar.",
      },
      ...selections.flatMap(function (selection) {
        return selection.rules(false);
      }),
      {
        field: $collection,
        error: $form.find('input[name="order-method"]:checked').length
          ? ""
          : "Choose collection or delivery.",
      },
      {
        field: $address,
        error:
          !deliverySelected ||
          ($address.val().trim().length >= 5 && $address.val().trim().length <= 200)
            ? ""
            : "Enter a street and building number (5–200 characters).",
      },
      {
        field: $consent,
        error: $consent.is(":checked")
          ? ""
          : "Confirm your details and preferences before continuing.",
      },
    ];
  }

  // Rewrite 3: .find().prop() and .toggleClass() replace querySelectorAll and classList.
  // The DOM updates are shorter and clearer than the original loops.
  function updateMethod() {
    const deliverySelected = $delivery.is(":checked");
    const $block = $("#delivery-block");
    $block.toggleClass("d-none", !deliverySelected).find("input").prop("disabled", !deliverySelected);
    $address.prop("required", deliverySelected);
    $("#collection-block").toggleClass("d-none", deliverySelected);
    if (!deliverySelected) {
      $block.find("input").each(function () {
        Store.setFieldError($(this), "");
      });
    }
  }

  function updateSummary() {
    const cart = Store.getCart();
    $("#summary-customer").text($name.val().trim() || "Customer details not entered yet.");
    $("#summary-contact").text(
      [$email.val().trim(), $phone.val().trim()].filter(Boolean).join(" · ") ||
        "Contact details not entered yet.",
    );
    $("#summary-date").text($date.val() || "Choose a preferred date.");
    if ($delivery.is(":checked")) {
      const address =
        [$address.val().trim(), $entrance.val().trim(), $contact.val().trim()]
          .filter(Boolean)
          .join(", ") || "Enter a street and building number.";
      $("#summary-method").text(`Delivery: ${address} Delivery fee is excluded.`);
    } else {
      $("#summary-method").text("Collection: Kamzina Street 199, Pavlodar. No delivery charge.");
    }
    $("#summary-total").text("Goods total: " + Store.formatMoney(Store.getCartTotal(cart)));
    // Three-method chain: .text() updates the content; .toggleClass() hides empty notes
    // with the existing d-none class; .attr() exposes that state to screen readers.
    $("#summary-notes")
      .text("Notes: " + $notes.val().trim())
      .toggleClass("d-none", $notes.val().trim() === "")
      .attr("aria-hidden", String($notes.val().trim() === ""));
    $submit.prop("disabled", cart.length === 0 || completed);
  }

  // Update the delivery method before live validation so hidden fields are disabled.
  $form.on("change", 'input[name="order-method"]', function () {
    updateMethod();
  });
  updateMethod();
  const validate = Store.bindValidation($form, getRules, $errors);
  $form.on("input change", function () {
    completed = false;
    Store.hideMessage($result);
    updateSummary();
  });
  $(document).on("cartchange", function () {
    completed = false;
    Store.hideMessage($result);
    updateSummary();
  });
  $form.on("submit", function (event) {
    // Without preventDefault, GET would expose contact details in the URL and reload the page.
    event.preventDefault();
    if (completed) return;
    if (!validate()) return;
    if (!Store.getCart().length) {
      Store.showMessage(
        $errors,
        "danger",
        "Your cart is empty. Add at least one material before checking the request.",
      );
      selections[0].product.trigger("focus");
      return;
    }
    // The server must recheck all fields, prices and stock because client JS can be bypassed.
    // This page only validates locally; it does not send a request to the store.
    completed = true;
    updateSummary();
    const reference = Store.createReference("REQ");
    const message =
      `Request summary ${reference} prepared. ${$("#summary-total").text()}. ` +
      "Review the details above and contact the store to arrange collection or delivery.";
    Store.showMessage($result, "success", message);
  });
  $form.on("reset", function () {
    // Native reset restores values after the event; wait before refreshing the summary.
    setTimeout(function () {
      completed = false;
      selections.forEach(function (selection) {
        selection.refresh();
      });
      updateMethod();
      updateSummary();
      Store.hideMessage($errors);
      Store.showMessage($result, "info", "Form cleared. Your cart is unchanged; use Clear cart to remove materials.");
    }, 0);
  });
  updateSummary();
});
