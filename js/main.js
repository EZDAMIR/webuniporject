"use strict";

let Store;

// jQuery 3.7.1, full build with effects. ready waits for the DOM
// so selectors and .on() handlers run after the page elements exist.
$(function () {
  const $toggle = $(".navbar-toggler"); // class selector
  const $checkbox = $("#nav-toggle"); // ID selector
  const $menu = $("#main-nav");
  const $navigation = $("nav"); // tag selector
  $toggle.attr({ tabindex: 0, role: "button", "aria-controls": $menu.attr("id") });

  function setExpanded(expanded) {
    $checkbox.prop("checked", expanded);
    $toggle.attr("aria-expanded", String(expanded));
  }
  setExpanded(false);
  $checkbox.on("change", function () {
    setExpanded($(this).is(":checked"));
  });
  $toggle.on("keydown", function (event) {
    if (!event.originalEvent?.isComposing && (event.key === "Enter" || event.key === " ")) {
      // preventDefault stops Space from scrolling and avoids duplicate keyboard activation.
      event.preventDefault();
      $checkbox.trigger("click");
    }
  });
  $navigation.on("keydown", function (event) {
    if (event.key === "Escape" && $toggle.attr("aria-expanded") === "true") {
      setExpanded(false);
      $toggle.trigger("focus");
    }
  });
  $(window.matchMedia("(min-width: 768px)")).on("change", function () {
    setExpanded(false);
  });



  // Product objects are the shared source for names, units and prices.
  const products = [
    {
      id: "cement-m400",
      name: "Cement M400",
      category: "Dry mixtures",
      specification: "50 kg",
      unit: "bag",
      price: 2260,
    },
    {
      id: "plasterboard",
      name: "Moisture-resistant plasterboard",
      category: "Sheet materials",
      specification: "9.5 × 1200 × 2500 mm",
      unit: "sheet",
      price: 2720,
    },
    {
      id: "osb3",
      name: "OSB-3 board",
      category: "Sheet materials",
      specification: "9 × 1250 × 2500 mm",
      unit: "sheet",
      price: 5530,
    },
    {
      id: "tile-adhesive",
      name: "Tile adhesive",
      category: "Dry mixtures",
      specification: "25 kg",
      unit: "bag",
      price: 2720,
    },
    {
      id: "mineral-wool",
      name: "Mineral wool insulation",
      category: "Insulation",
      specification: "50 mm, 6 m²",
      unit: "pack",
      price: 6500,
    },
    {
      id: "acrylic-paint",
      name: "Interior acrylic paint",
      category: "Paints",
      specification: "White, 5 kg",
      unit: "bucket",
      price: 4200,
    },
  ];
  // sessionStorage carries cart selections between pages in this tab.
  const cartKey = "kamzina-demo-cart";
  const maxQuantity = 999;
  let storageAvailable = true;
  let cart = loadCart();
  let cartView = null;

  // find() returns the first match, or undefined if none exists.
  function findProduct(id) {
    return products.find(function (product) {
      return product.id === id;
    });
  }

  // Combine category filtering with case-insensitive text search.
  function filterProducts(items, query, category) {
    const search = query.trim().toLowerCase();
    return items.filter(function (product) {
      const text = product.name + " " + product.specification + " " + product.category;
      return (
        (category === "all" || product.category === category) && text.toLowerCase().includes(search)
      );
    });
  }

  function validQuantity(quantity) {
    return Number.isInteger(quantity) && quantity >= 1 && quantity <= maxQuantity;
  }

  function formatMoney(amount) {
    return new Intl.NumberFormat("en-GB", { maximumFractionDigits: 0 }).format(amount) + " ₸";
  }

  function getSubtotal(price, quantity) {
    return price * quantity;
  }

  // map() turns selections into product details and subtotals.
  function getCartLines(items) {
    return items.map(function (item) {
      const product = findProduct(item.id);
      return {
        product: product,
        quantity: item.quantity,
        subtotal: getSubtotal(product.price, item.quantity),
      };
    });
  }

  // reduce() adds the subtotals, starting from zero.
  function getCartTotal(items) {
    return getCartLines(items).reduce(function (total, line) {
      return total + line.subtotal;
    }, 0);
  }

  // Generate a display reference; uniqueness is not guaranteed.
  function createReference(prefix) {
    return prefix + "-" + Math.floor(100000 + Math.random() * 900000);
  }

  // Return a jQuery object so callers use the same DOM API.
  function makeElement(tag, classes, text) {
    const $element = $("<" + tag + ">").addClass(classes);
    if (text !== undefined) {
      $element.text(text); // Insert user data as plain text.
    }
    return $element;
  }

  function makeMessage(id) {
    return makeElement("p", "alert d-none").attr({
      id,
      role: "status",
      "aria-live": "polite",
      "aria-atomic": "true",
    });
  }

  function showMessage($element, type, message) {
    $element.removeClass("d-none alert-danger alert-success alert-info")
      .addClass("alert alert-" + type).text(message);
  }

  function hideMessage($element) {
    $element.addClass("d-none").text("");
  }

  // Rewrite 1: .siblings()/.parent().find(), .toggleClass(), .attr() and .text() replace
  // manual DOM lookup, classList and textContent; clearer, but ARIA handling keeps the length similar.
  function setFieldError($field, message) {
    const feedbackId = $field.attr("id") + "-feedback";
    let $feedback = $("#" + feedbackId);
    if (!$feedback.length) {
      $feedback = $field.siblings(".invalid-feedback").first();
      if (!$feedback.length) {
        $feedback = $field.parent().find(".invalid-feedback").first();
      }
      if (!$feedback.length) {
        $feedback = makeElement("div", "invalid-feedback").appendTo($field.parent());
      }
      $feedback.attr("id", feedbackId);
    }
    const ids = new Set(($field.attr("aria-describedby") || "").split(/\s+/).filter(Boolean));
    ids.add(feedbackId);
    $field.toggleClass("is-invalid", message !== "").attr({
      "aria-invalid": String(message !== ""),
      "aria-describedby": [...ids].join(" "),
    });
    $feedback.text(message);
    return message === "";
  }

  function validateFields(rules, focusFirst) {
    rules.forEach(function (rule) {
      setFieldError(rule.field, rule.error);
    });
    const first = rules.find(function (rule) {
      return rule.error !== "";
    });
    if (first && focusFirst) {
      first.field.trigger("focus");
    }
    return first === undefined;
  }





  function bindValidation($form, getRules, $result) {
    let submitted = false;
    $form.prop("noValidate", true);
    $result.attr({ "aria-live": "polite", "aria-atomic": "true" });
    getRules().forEach(function (rule) {
      setFieldError(rule.field, "");
    });
    $form.on("input change", function (event) {
      if (event.originalEvent?.isComposing) return;
      hideMessage($result);
      if (submitted && !validateFields(getRules(), false)) {
        showMessage($result, "danger", "Please correct the highlighted fields.");
      }
    });
    $form.on("reset", function () {
      submitted = false;
      $form.find(".is-invalid").each(function () {
        setFieldError($(this), "");
      });
      showMessage($result, "info", "Form cleared.");
    });
    return function () {
      submitted = true;
      const valid = validateFields(getRules(), true);
      if (!valid) showMessage($result, "danger", "Please correct the highlighted fields.");
      return valid;
    };
  }

  function validEmail(value) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
  }

  function validPhone(value) {
    const digits = value.replace(/\D/g, "");
    return /^\+?[\d\s()-]+$/.test(value) && digits.length >= 10 && digits.length <= 15;
  }

  function todayInPavlodar() {
    const parts = new Intl.DateTimeFormat("en-CA", {
      timeZone: "Asia/Almaty",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).formatToParts(new Date());
    return ["year", "month", "day"]
      .map(function (type) {
        return parts.find(function (part) {
          return part.type === type;
        }).value;
      })
      .join("-");
  }

  // Parse saved JSON; recover with an empty cart if reading or parsing fails.
  function loadCart() {
    try {
      const saved = JSON.parse(sessionStorage.getItem(cartKey) || "[]");
      if (!Array.isArray(saved)) {
        return [];
      }
      // Discard unknown products, invalid quantities and duplicate IDs.
      const ids = new Set();
      return saved
        .filter(function (item) {
          if (!item || !findProduct(item.id) || !validQuantity(item.quantity) || ids.has(item.id)) {
            return false;
          }
          ids.add(item.id);
          return true;
        })
        .map(function (item) {
          return { id: item.id, quantity: item.quantity };
        });
    } catch (error) {
      storageAvailable = false;
      return [];
    }
  }

  function saveCart(message) {
    try {
      sessionStorage.setItem(cartKey, JSON.stringify(cart));
      storageAvailable = true;
    } catch (error) {
      storageAvailable = false;
    }
    renderCart();
    $(document).trigger("cartchange");
    showMessage($("#cart-message"), "success", message);
    return { success: true, message };
  }

  function addToCart(id, quantity) {
    const product = findProduct(id);
    const existing = cart.find(function (item) {
      return item.id === id;
    });
    // Check the combined quantity when the product is already in the cart.
    const totalQuantity = quantity + (existing ? existing.quantity : 0);
    if (!product || !validQuantity(quantity) || !validQuantity(totalQuantity)) {
      return {
        success: false,
        message:
          "Choose a product and a whole quantity from 1 to 999. Each cart item is limited to 999 units.",
      };
    }
    if (existing) {
      existing.quantity = totalQuantity;
    } else {
      cart.push({ id: id, quantity: quantity });
    }
    return saveCart("Added " + quantity + " × " + product.name + " to your cart.");
  }

  function changeQuantity(id, change) {
    const item = cart.find(function (line) {
      return line.id === id;
    });
    if (!item || !validQuantity(item.quantity + change)) {
      return false;
    }
    item.quantity += change;
    saveCart(findProduct(id).name + ": quantity changed to " + item.quantity + ".");
    return true;
  }

  function removeFromCart(id) {
    const product = findProduct(id);
    if (!product) {
      return false;
    }
    cart = cart.filter(function (item) {
      return item.id !== id;
    });
    saveCart(product.name + " removed from your cart.");
    return true;
  }

  function clearCart() {
    cart = [];
    return saveCart("Cart cleared. Choose materials to start again.");
  }

  // Return copies so callers cannot accidentally modify the internal cart.
  function getCart() {
    return cart.map(function (item) {
      return { id: item.id, quantity: item.quantity };
    });
  }

  function cartButton(label, action, id, disabled) {
    return makeElement("button", "btn btn-outline-secondary btn-sm", label)
      .attr({
        type: "button",
        "data-cart-action": action,
        "data-product-id": id,
        "aria-label": label + " " + findProduct(id).name,
      })
      .prop("disabled", disabled);
  }

  function renderCartItem(line) {
    const id = line.product.id;
    const $row = makeElement("tr", "").attr("data-product-id", id);
    const $controls = makeElement("div", "d-flex align-items-center gap-2");
    $controls.append(
      cartButton("Decrease", "decrease", id, line.quantity === 1),
      makeElement("span", "text-nowrap", line.quantity + " × " + line.product.unit),
      cartButton("Increase", "increase", id, line.quantity === maxQuantity),
    );
    $row.append(
      makeElement("th", "", line.product.name).attr("scope", "row"),
      makeElement("td", "").append($controls),
      makeElement("td", "text-nowrap", formatMoney(line.product.price)),
      makeElement("td", "text-nowrap", formatMoney(line.subtotal)),
      makeElement("td", "").append(cartButton("Remove", "remove", id, false)),
    );
    return $row;
  }

  function renderCart() {
    if (!cartView) return;
    cartView.list.empty().append(getCartLines(cart).map(renderCartItem));
    const empty = cart.length === 0;
    cartView.empty.toggleClass("d-none", !empty);
    cartView.wrapper.toggleClass("d-none", empty);
    cartView.total.text(formatMoney(getCartTotal(cart)));
    cartView.clear.prop("disabled", empty);
    cartView.checkout.prop("disabled", empty || (cartView.requiresStorage && !storageAvailable));
    cartView.storage.toggleClass("d-none", storageAvailable);
  }

  function setupCart($section, $checkout, requiresStorage) {
    const $heading = $section.find("h2").first();
    $heading.attr({ id: $heading.attr("id") || "cart-heading", tabindex: -1 });
    let $table = $section.find("table");
    if (!$table.length) {
      $table = makeElement("table", "table table-bordered");
      const $header = makeElement("tr", "");
      ["Product", "Quantity", "Unit price", "Subtotal"].forEach(function (label) {
        $header.append(makeElement("th", "", label).attr("scope", "col"));
      });
      const $footer = makeElement("tr", "").append(
        makeElement("th", "", "Total (goods only)").attr({ scope: "row", colspan: 3 }),
        makeElement("td", "").attr("id", "cart-total"),
      );
      $table.append(
        makeElement("caption", "", "Selected materials and estimated subtotals"),
        makeElement("thead", "table-dark").append($header),
        makeElement("tbody", "").attr("id", "cart-items"),
        makeElement("tfoot", "").append($footer),
      );
      $section.append(makeElement("div", "table-responsive").append($table));
    }
    $table.find("thead tr").append(makeElement("th", "", "Action").attr("scope", "col"));
    $table.find("tfoot tr").append(makeElement("td", ""));
    const $wrapper = $table
      .parent()
      .attr({ tabindex: 0, role: "region", "aria-label": "Cart materials" });
    const $message = makeMessage("cart-message");
    const $empty = makeMessage("cart-empty");
    showMessage($empty, "info", "Your cart is empty. Add materials to prepare an estimate.");
    const $storage = makeMessage("cart-storage-note");
    showMessage(
      $storage,
      "info",
      "Browser storage is unavailable. Select materials on the Order and delivery page and keep that page open to prepare your request.",
    );
    $wrapper.before($message, $empty, $storage);
    const $clear = makeElement("button", "btn btn-outline-secondary", "Clear cart").attr({
      type: "button",
      id: "cart-clear",
    });
    const $actions = makeElement("div", "d-flex flex-wrap gap-2 my-3").append($clear);
    if (requiresStorage) $actions.append($checkout);
    $section.append($actions);
    cartView = {
      list: $table.find("tbody"),
      total: $table.find("tfoot tr").children().eq(1),
      wrapper: $wrapper,
      empty: $empty,
      storage: $storage,
      clear: $clear,
      checkout: $checkout,
      requiresStorage,
    };
    // Delegate to a stable parent because renderCart() replaces the rows.
    // Direct handlers on old buttons would not handle buttons created later.
    $section.on("click", "button[data-cart-action]", function () {
      const $button = $(this);
      if ($button.prop("disabled")) return;
      const id = $button.closest("tr").attr("data-product-id");
      const action = $button.attr("data-cart-action");
      if (action === "increase") changeQuantity(id, 1);
      else if (action === "decrease") changeQuantity(id, -1);
      else removeFromCart(id);
      const $replacement = cartView.list
        .find("button:not(:disabled)")
        .filter(function () {
          return (
            $(this).attr("data-product-id") === id && $(this).attr("data-cart-action") === action
          );
        })
        .first();
      const $fallback = cartView.list.find("button:not(:disabled)").first();
      const $focus = $replacement.length ? $replacement : $fallback;
      ($focus.length ? $focus : $heading).trigger("focus");
    });
    $clear.on("click", function () {
      clearCart();
      $heading.trigger("focus");
    });
    renderCart();
  }

  Store = {
    products,
    findProduct,
    filterProducts,
    validQuantity,
    formatMoney,
    getSubtotal,
    getCartLines,
    getCartTotal,
    createReference,
    makeElement,
    makeMessage,
    setupCart,
    showMessage,
    hideMessage,
    setFieldError,
    validateFields,
    bindValidation,
    validEmail,
    validPhone,
    todayInPavlodar,
    addToCart,
    getCart,
    clearCart,
  };
});
