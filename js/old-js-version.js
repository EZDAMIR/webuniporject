"use strict";

// Archive of the three original functions before the jQuery migration.
// For comparison only; this file is NOT loaded by any page.

// Original version: js/main.js
// prettier-ignore
function setFieldError(field, message) {
  let feedback = document.getElementById(field.id + "-feedback");
  if (!feedback) {
    feedback = field.parentElement.querySelector(".invalid-feedback");
    if (!feedback) {
      feedback = makeElement("div", "invalid-feedback");
      field.parentElement.append(feedback);
    }
    feedback.id = field.id + "-feedback";
  }
  field.classList.toggle("is-invalid", message !== "");
  field.setAttribute("aria-invalid", String(message !== ""));
  if (feedback) {
    feedback.textContent = message;
    // Set avoids duplicate IDs while preserving existing help-text links.
    const ids = new Set(
      (field.getAttribute("aria-describedby") || "").split(" ").filter(Boolean),
    );
    ids.add(feedback.id);
    field.setAttribute("aria-describedby", Array.from(ids).join(" "));
  }
  return message === "";
}

// Original version: js/products.js
// prettier-ignore
function updateProducts() {
  const matches = Store.filterProducts(Store.products, search.value, category.value);
  // map() creates a row per match; replace the previous results.
  list.replaceChildren(...matches.map(renderProduct));
  Store.showMessage(
    count,
    "info",
    matches.length + " of " + Store.products.length + " materials shown.",
  );
  empty.classList.toggle("d-none", matches.length !== 0);
  clearSearch.classList.toggle("d-none", search.value === "");
  Store.hideMessage(result);
  updateSelectedRows();
}

// Original version: js/order.js
// prettier-ignore
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
