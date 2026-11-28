"use strict";

// jQuery 3.7.1: ready waits for the DOM and shared Store initialization.
$(function () {
  const $table = $("main table");
  const $section = $table.closest("section");
  const $list = $table.find("tbody").attr("id", "product-list");
  const $controls = Store.makeElement("div", "row g-3 align-items-end mb-3");
  $controls.attr("id", "product-filters");
  const $search = Store.makeElement("input", "form-control").attr({
    type: "search",
    id: "product-search",
    placeholder: "Name, specification or category",
    "aria-controls": "product-list",
  });
  const $clearSearch = Store.makeElement(
    "button",
    "btn btn-outline-secondary d-none",
    "Clear search",
  ).attr("type", "button");
  const $searchGroup = Store.makeElement("div", "col-12 col-md-6").append(
    Store.makeElement("label", "form-label", "Search materials").attr("for", "product-search"),
    Store.makeElement("div", "input-group").append($search, $clearSearch),
  );
  const $category = Store.makeElement("select", "form-select")
    .attr({ id: "product-category", "aria-controls": "product-list" })
    .append(Store.makeElement("option", "", "All categories").val("all"));
  const $categoryGroup = Store.makeElement("div", "col-12 col-md-4").append(
    Store.makeElement("label", "form-label", "Category").attr("for", "product-category"),
    $category,
  );
  const $reset = Store.makeElement("button", "btn btn-outline-secondary", "Reset filters");
  $reset.attr("type", "button");
  $controls.append(
    $searchGroup,
    $categoryGroup,
    Store.makeElement("div", "col-12 col-md-2").append($reset),
  );
  const $filterToggle = Store.makeElement(
    "button",
    "btn btn-outline-secondary mb-3",
    "Hide filters",
  ).attr({
    type: "button",
    "aria-controls": "product-filters",
    "aria-expanded": "true",
  });
  const $count = Store.makeMessage("product-count");
  const $result = Store.makeMessage("catalogue-message");
  const $empty = Store.makeMessage("products-empty");
  Store.showMessage($empty, "info", "No materials match. Try another term or use Reset filters.");
  $section.find("h2").after($filterToggle, $controls, $count, $result, $empty);
  $table.find("thead tr").append(Store.makeElement("th", "", "Action").attr("scope", "col"));
  $table.find("caption").text("Materials and estimated prices");
  // Use .html() only for trusted constant markup; insert user data with .text().
  $section
    .find("small")
    .first()
    .html(
      "Prices are per listed unit. <strong>Confirm current prices and availability with the store.</strong>",
    );
  $("h1").text("Products and estimated prices");

  const $cartSection = Store.makeElement("section", "border rounded p-3 my-4").append(
    Store.makeElement("h2", "", "Your cart"),
    Store.makeElement(
      "p",
      "small text-muted",
      "Quantities are whole units from 1 to 999. At one unit, use Remove to delete an item. Only product IDs and quantities are kept for this browser tab.",
    ),
  );
  $section.after($cartSection);
  const $checkout = Store.makeElement("button", "btn btn-danger", "Continue to order");
  $checkout.attr("type", "button");
  Store.setupCart($cartSection, $checkout, true);

  function renderProduct(product) {
    const $row = Store.makeElement("tr", "").attr("data-product-id", product.id);
    const $button = Store.makeElement("button", "btn btn-danger btn-sm", "Add to cart").attr({
      type: "button",
      "data-product-id": product.id,
      "aria-label": "Add " + product.name + " to cart",
    });
    $row.append(
      Store.makeElement("th", "", product.name).attr("scope", "row"),
      Store.makeElement("td", "", product.specification),
      Store.makeElement("td", "", product.unit),
      Store.makeElement("td", "text-nowrap", Store.formatMoney(product.price)),
      Store.makeElement("td", "").append($button),
    );
    return $row;
  }

  // Rewrite 2: .val(), .empty().append() and .toggleClass() replace value,
  // replaceChildren and classList.toggle; updating the list is shorter and clearer.
  function updateProducts() {
    const matches = Store.filterProducts(Store.products, $search.val(), $category.val());
    $list.empty().append(matches.map(renderProduct)); // Build rows from the product array.
    Store.showMessage(
      $count,
      "info",
      matches.length + " of " + Store.products.length + " materials shown.",
    );
    $empty.toggleClass("d-none", matches.length !== 0);
    $clearSearch.toggleClass("d-none", $search.val() === "");
    Store.hideMessage($result);
    updateSelectedRows();
  }

  function updateSelectedRows() {
    const cart = Store.getCart();
    $list.find("tr").each(function () {
      const $row = $(this);
      $row.toggleClass(
        "selected-row",
        cart.some(function (item) {
          return item.id === $row.attr("data-product-id");
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
    Store.makeElement("option", "", name).val(name).appendTo($category);
  });
  $search
    .on("input", function (event) {
      if (!event.originalEvent?.isComposing) updateProducts();
    })
    .on("compositionend", updateProducts);
  $category.on("change", updateProducts);
  $clearSearch.on("click", function () {
    $search.val("");
    updateProducts();
    $search.trigger("focus");
  });
  $reset.on("click", function () {
    $search.val("");
    $category.val("all");
    updateProducts();
    Store.showMessage($result, "info", "Filters reset. All six materials are shown.");
    $search.trigger("focus");
  });
  $filterToggle.on("click", function () {
    const $button = $(this);
    const expanded = $button.attr("aria-expanded") !== "true";
    $button
      .attr("aria-expanded", String(expanded))
      .text(expanded ? "Hide filters" : "Show filters");
    $controls.toggleClass("d-none", !expanded);
  });
  // The existing tbody catches clicks on new buttons after .empty().append().
  // Direct handlers on the original buttons would not transfer to new elements.
  $list.on("click", "button[data-product-id]", function () {
    const $button = $(this);
    const response = Store.addToCart($button.attr("data-product-id"), 1);
    Store.showMessage($result, response.success ? "success" : "danger", response.message);
  });
  $checkout.on("click", function () {
    window.location.href = "order.html#order-form";
  });
  $(document).on("cartchange", updateSelectedRows);
  updateProducts();
});
