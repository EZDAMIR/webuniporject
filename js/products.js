"use strict";

(function () {
  const table = document.querySelector("main table");
  const section = table.closest("section");
  const list = table.tBodies[0];
  list.id = "product-list";
  const controls = Store.makeElement("div", "row g-3 align-items-end mb-3");
  const searchGroup = Store.makeElement("div", "col-12 col-md-6");
  const searchLabel = Store.makeElement("label", "form-label", "Search materials");
  searchLabel.htmlFor = "product-search";
  const search = Store.makeElement("input", "form-control");
  search.type = "search";
  search.id = "product-search";
  search.placeholder = "Name, specification or category";
  const clearSearch = Store.makeElement(
    "button",
    "btn btn-outline-secondary d-none",
    "Clear search",
  );
  clearSearch.type = "button";
  const searchControls = Store.makeElement("div", "input-group");
  searchControls.append(search, clearSearch);
  searchGroup.append(searchLabel, searchControls);
  const categoryGroup = Store.makeElement("div", "col-12 col-md-4");
  const categoryLabel = Store.makeElement("label", "form-label", "Category");
  categoryLabel.htmlFor = "product-category";
  const category = Store.makeElement("select", "form-select");
  category.id = "product-category";
  const all = Store.makeElement("option", "", "All categories");
  all.value = "all";
  category.append(all);
  categoryGroup.append(categoryLabel, category);
  search.setAttribute("aria-controls", list.id);
  category.setAttribute("aria-controls", list.id);
  const resetGroup = Store.makeElement("div", "col-12 col-md-2");
  const reset = Store.makeElement("button", "btn btn-outline-secondary", "Reset filters");
  reset.type = "button";
  resetGroup.append(reset);
  controls.append(searchGroup, categoryGroup, resetGroup);
  const count = Store.makeMessage("product-count");
  const result = Store.makeMessage("catalogue-message");
  const empty = Store.makeMessage("products-empty");
  Store.showMessage(empty, "info", "No materials match. Try another term or use Reset filters.");
  section.querySelector("h2").after(controls, count, result, empty);
  const actionHeading = Store.makeElement("th", "", "Action");
  actionHeading.scope = "col";
  table.tHead.rows[0].append(actionHeading);
  table.caption.textContent = "Materials and estimated prices";
  section.querySelector("small").textContent =
    "Prices are per listed unit. Confirm current prices and availability with the store.";
  document.querySelector("h1").textContent = "Products and estimated prices";

  const cartSection = Store.makeElement("section", "border rounded p-3 my-4");
  cartSection.append(Store.makeElement("h2", "", "Your cart"));
  cartSection.append(
    Store.makeElement(
      "p",
      "small text-muted",
      "Quantities are whole units from 1 to 999. At one unit, use Remove to delete an item. Only product IDs and quantities are kept for this browser tab.",
    ),
  );
  section.after(cartSection);
  const checkout = Store.makeElement("button", "btn btn-danger", "Continue to order");
  checkout.type = "button";
  Store.setupCart(cartSection, checkout, true);

  function renderProduct(product) {
    const row = Store.makeElement("tr", "");
    row.dataset.productId = product.id;
    const name = Store.makeElement("th", "", product.name);
    name.scope = "row";
    const actions = Store.makeElement("td", "");
    const button = Store.makeElement("button", "btn btn-danger btn-sm", "Add to cart");
    button.type = "button";
    button.dataset.productId = product.id;
    button.setAttribute("aria-label", "Add " + product.name + " to cart");
    actions.append(button);
    row.append(
      name,
      Store.makeElement("td", "", product.specification),
      Store.makeElement("td", "", product.unit),
      Store.makeElement("td", "text-nowrap", Store.formatMoney(product.price)),
      actions,
    );
    return row;
  }

  function updateProducts() {
    const matches = Store.filterProducts(Store.products, search.value, category.value);
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

  function updateSelectedRows() {
    const cart = Store.getCart();
    list.querySelectorAll("tr").forEach(function (row) {
      row.classList.toggle(
        "selected-row",
        cart.some(function (item) {
          return item.id === row.dataset.productId;
        }),
      );
    });
  }

  const categories = [
    ...new Set(
      Store.products.map(function (product) {
        return product.category;
      }),
    ),
  ];
  categories.forEach(function (name) {
    const option = Store.makeElement("option", "", name);
    option.value = name;
    category.append(option);
  });

  search.addEventListener("input", function (event) {
    if (!event.isComposing) {
      updateProducts();
    }
  });
  search.addEventListener("compositionend", updateProducts);
  category.addEventListener("change", updateProducts);
  clearSearch.addEventListener("click", function () {
    search.value = "";
    updateProducts();
    search.focus();
  });
  reset.addEventListener("click", function () {
    search.value = "";
    category.value = "all";
    updateProducts();
    Store.showMessage(result, "info", "Filters reset. All six materials are shown.");
    search.focus();
  });
  list.addEventListener("click", function (event) {
    const button = event.target.closest("button[data-product-id]");
    if (!button) {
      return;
    }
    const response = Store.addToCart(button.dataset.productId, 1);
    Store.showMessage(result, response.success ? "success" : "danger", response.message);
  });
  checkout.addEventListener("click", function () {
    window.location.href = "order.html#order-form";
  });
  document.addEventListener("cartchange", updateSelectedRows);
  updateProducts();
})();
