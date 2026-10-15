"use strict";

// Shared data and helpers; page scripts load after this file.
const Store = (function () {
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
  const cartKey = "kamzina-demo-cart";
  const maxQuantity = 999;
  let storageAvailable = true;
  let cart = loadCart();
  let cartView = null;

  function findProduct(id) {
    return products.find(function (product) {
      return product.id === id;
    });
  }

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

  function getCartTotal(items) {
    return getCartLines(items).reduce(function (total, line) {
      return total + line.subtotal;
    }, 0);
  }

  function createReference(prefix) {
    // A display reference for the request summary, not a secure or unique order ID.
    return prefix + "-" + Math.floor(100000 + Math.random() * 900000);
  }

  function makeElement(tag, classes, text) {
    const element = document.createElement(tag);
    element.classList.add(...classes.split(" ").filter(Boolean));
    if (text !== undefined) {
      element.textContent = text;
    }
    return element;
  }

  function makeMessage(id) {
    const message = makeElement("p", "alert d-none");
    message.id = id;
    message.setAttribute("role", "status");
    message.setAttribute("aria-live", "polite");
    message.setAttribute("aria-atomic", "true");
    return message;
  }

  function showMessage(element, type, message) {
    element.classList.remove("d-none", "alert-danger", "alert-success", "alert-info");
    element.classList.add("alert", "alert-" + type);
    element.textContent = message;
  }

  function hideMessage(element) {
    element.classList.add("d-none");
    element.textContent = "";
  }

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
      const ids = new Set(
        (field.getAttribute("aria-describedby") || "").split(" ").filter(Boolean),
      );
      ids.add(feedback.id);
      field.setAttribute("aria-describedby", Array.from(ids).join(" "));
    }
    return message === "";
  }

  function validateFields(rules, focusFirst) {
    rules.forEach(function (rule) {
      setFieldError(rule.field, rule.error);
    });
    const firstError = rules.find(function (rule) {
      return rule.error !== "";
    });
    if (firstError && focusFirst) {
      firstError.field.focus();
    }
    return firstError === undefined;
  }

  function bindValidation(form, getRules, result) {
    let submitted = false;
    form.noValidate = true;
    result.setAttribute("aria-live", "polite");
    result.setAttribute("aria-atomic", "true");
    getRules().forEach(function (rule) {
      setFieldError(rule.field, "");
    });

    function update() {
      hideMessage(result);
      if (submitted && !validateFields(getRules(), false)) {
        showMessage(result, "danger", "Please correct the highlighted fields.");
      }
    }

    form.addEventListener("input", update);
    form.addEventListener("change", update);
    form.addEventListener("reset", function () {
      submitted = false;
      form.querySelectorAll(".is-invalid").forEach(function (field) {
        setFieldError(field, "");
      });
      showMessage(result, "info", "Form cleared.");
    });

    return function () {
      submitted = true;
      const valid = validateFields(getRules(), true);
      if (!valid) {
        showMessage(result, "danger", "Please correct the highlighted fields.");
      }
      return valid;
    };
  }

  function validEmail(value) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
  }

  function validPhone(value) {
    const digits = value.replace(/\D/g, "");
    return /^[+\d\s()-]+$/.test(value) && digits.length >= 10 && digits.length <= 15;
  }

  function todayInPavlodar() {
    return new Intl.DateTimeFormat("en-CA", {
      timeZone: "Asia/Almaty",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).format(new Date());
  }

  function loadCart() {
    try {
      const saved = JSON.parse(sessionStorage.getItem(cartKey) || "[]");
      if (!Array.isArray(saved)) {
        return [];
      }
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
    } catch (error) {
      storageAvailable = false;
    }
    renderCart();
    document.dispatchEvent(new CustomEvent("cartchange"));
    const status = document.getElementById("cart-message");
    if (status) {
      showMessage(status, "success", message);
    }
    return { success: true, message: message };
  }

  function addToCart(id, quantity) {
    const product = findProduct(id);
    const existing = cart.find(function (item) {
      return item.id === id;
    });
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

  function getCart() {
    return cart.map(function (item) {
      return { id: item.id, quantity: item.quantity };
    });
  }

  function cartButton(label, action, id, disabled) {
    const button = makeElement("button", "btn btn-outline-secondary btn-sm", label);
    button.type = "button";
    button.dataset.cartAction = action;
    button.dataset.productId = id;
    button.setAttribute("aria-label", label + " " + findProduct(id).name);
    button.disabled = disabled;
    return button;
  }

  // Both pages use this renderer for every cart line.
  function renderCartItem(line) {
    const row = makeElement("tr", "");
    row.dataset.productId = line.product.id;
    const heading = makeElement("th", "", line.product.name);
    heading.scope = "row";
    const quantity = makeElement("td", "");
    const controls = makeElement("div", "d-flex align-items-center gap-2");
    controls.append(cartButton("Decrease", "decrease", line.product.id, line.quantity === 1));
    controls.append(makeElement("span", "text-nowrap", line.quantity + " × " + line.product.unit));
    controls.append(
      cartButton("Increase", "increase", line.product.id, line.quantity === maxQuantity),
    );
    quantity.append(controls);
    const actions = makeElement("td", "");
    actions.append(cartButton("Remove", "remove", line.product.id, false));
    row.append(
      heading,
      quantity,
      makeElement("td", "text-nowrap", formatMoney(line.product.price)),
      makeElement("td", "text-nowrap", formatMoney(line.subtotal)),
      actions,
    );
    return row;
  }

  function renderCart() {
    if (!cartView) {
      return;
    }
    cartView.list.replaceChildren(...getCartLines(cart).map(renderCartItem));
    const empty = cart.length === 0;
    cartView.empty.classList.toggle("d-none", !empty);
    cartView.wrapper.classList.toggle("d-none", empty);
    cartView.total.textContent = formatMoney(getCartTotal(cart));
    cartView.clear.disabled = empty;
    cartView.checkout.disabled = empty || (cartView.requiresStorage && !storageAvailable);
    cartView.storage.classList.toggle("d-none", storageAvailable);
  }

  function setupCart(section, checkout, requiresStorage) {
    const heading = section.querySelector("h2");
    heading.id = heading.id || "cart-heading";
    heading.tabIndex = -1;
    let table = section.querySelector("table");
    if (!table) {
      table = makeElement("table", "table table-bordered");
      table.append(makeElement("caption", "", "Selected materials and estimated subtotals"));
      const header = table.createTHead().insertRow();
      table.tHead.classList.add("table-dark");
      ["Product", "Quantity", "Unit price", "Subtotal"].forEach(function (label) {
        const cell = makeElement("th", "", label);
        cell.scope = "col";
        header.append(cell);
      });
      table.createTBody().id = "cart-items";
      const footer = table.createTFoot().insertRow();
      const label = makeElement("th", "", "Total (goods only)");
      label.scope = "row";
      label.colSpan = 3;
      footer.append(label);
      footer.insertCell().id = "cart-total";
      const wrapper = makeElement("div", "table-responsive");
      wrapper.append(table);
      section.append(wrapper);
    }
    const action = makeElement("th", "", "Action");
    action.scope = "col";
    table.tHead.rows[0].append(action);
    table.tFoot.rows[0].insertCell();
    const wrapper = table.parentElement;
    wrapper.tabIndex = 0;
    wrapper.setAttribute("role", "region");
    wrapper.setAttribute("aria-label", "Cart materials");
    const message = makeMessage("cart-message");
    const empty = makeMessage("cart-empty");
    showMessage(empty, "info", "Your cart is empty. Add materials to prepare an estimate.");
    const storage = makeMessage("cart-storage-note");
    showMessage(
      storage,
      "info",
      "Browser storage is unavailable. Select materials on the Order and delivery page and keep that page open to prepare your request.",
    );
    wrapper.before(message, empty, storage);
    const clear = makeElement("button", "btn btn-outline-secondary", "Clear cart");
    clear.type = "button";
    clear.id = "cart-clear";
    const actions = makeElement("div", "d-flex flex-wrap gap-2 my-3");
    actions.append(clear);
    if (requiresStorage) {
      actions.append(checkout);
    }
    section.append(actions);
    cartView = {
      list: table.tBodies[0],
      total: table.tFoot.rows[0].cells[1],
      wrapper,
      empty,
      storage,
      clear,
      checkout,
      requiresStorage,
    };

    cartView.list.addEventListener("click", function (event) {
      const button = event.target.closest("[data-cart-action]");
      if (!button || button.disabled) {
        return;
      }
      const id = button.dataset.productId;
      const action = button.dataset.cartAction;
      if (action === "increase") {
        changeQuantity(id, 1);
      } else if (action === "decrease") {
        changeQuantity(id, -1);
      } else {
        removeFromCart(id);
      }
      const replacement = Array.from(cartView.list.querySelectorAll("button")).find(
        function (item) {
          return (
            item.dataset.productId === id && item.dataset.cartAction === action && !item.disabled
          );
        },
      );
      const fallback = cartView.list.querySelector("button:not(:disabled)") || heading;
      (replacement || fallback).focus();
    });
    clear.addEventListener("click", function () {
      clearCart();
      heading.focus();
    });
    renderCart();
  }

  return {
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
})();
