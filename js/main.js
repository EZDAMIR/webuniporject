"use strict";

let Store;

// jQuery 3.7.1 (full build). Wait for the DOM before binding handlers.
$(function () {
  const $toggle = $(".navbar-toggler");
  const $checkbox = $("#nav-toggle");
  const $menu = $("#main-nav");
  const $navigation = $("nav");
  $(".navbar-brand").addClass("text-wrap mw-100");
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
      // Stop Space from scrolling the page when it toggles the menu.
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

  // Keep the fixed telephone link from covering controls anywhere on the page.
  const $callLink = $(".fixed-call");
  let callFrame = 0;
  function keepActionsVisible() {
    if (callFrame || !$callLink.length) return;
    callFrame = requestAnimationFrame(function () {
      callFrame = 0;
      const call = $callLink[0].getBoundingClientRect();
      const covered = $("input, select, textarea, button, a[href], [role='button']")
        .not($callLink)
        .toArray()
        .some(function (node) {
          if (window.getComputedStyle(node).visibility !== "visible") return false;
          const rect = node.getBoundingClientRect();
          return (
            rect.width > 0 &&
            rect.height > 0 &&
            rect.left < call.right &&
            rect.right > call.left &&
            rect.top < call.bottom &&
            rect.bottom > call.top
          );
        });
      $callLink.toggleClass("invisible", covered);
    });
  }
  $(window).on("scroll resize", keepActionsVisible);
  $(document).on("focusin input change", keepActionsVisible);
  new ResizeObserver(keepActionsVisible).observe(document.body);
  keepActionsVisible();

  // Recheck this each time so a changed motion preference takes effect without reloading.
  function effectDuration(milliseconds) {
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches ? 0 : milliseconds;
  }

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
  // Keep the cart between pages in this tab.
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

  // This local reference is not an order number issued by the store.
  function createReference(prefix) {
    return prefix + "-" + Math.floor(100000 + Math.random() * 900000);
  }

  function makeElement(tag, classes, text) {
    const $element = $("<" + tag + ">").addClass(classes);
    if (text !== undefined) {
      $element.text(text); // Names and reviews must be inserted as text, not HTML.
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
    const wasHidden = $element.hasClass("d-none");
    $element
      .stop(true, true)
      .removeClass("d-none alert-danger alert-success alert-info")
      .addClass("alert alert-" + type)
      .text(message);
    if (wasHidden && type === "success") {
      $element.hide().fadeIn(effectDuration(180), function () {
        // Remove the fade styles after completion so classes control visibility again.
        $(this).removeAttr("style");
      });
    }
  }

  function hideMessage($element) {
    $element.stop(true, true).addClass("d-none").text("").removeAttr("style");
  }

  // .siblings()/.parent().find(), .toggleClass(), .attr() and .text() replace native DOM calls.
  // About the same length, but easier to follow with one API for field errors.
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

  function trimValues($form) {
    const $fields = $form
      .find("input, textarea")
      .not(":checkbox, :radio, :button, :submit, :reset");
    $fields.each(function () {
      const $field = $(this);
      $field.val(String($field.val()).trim());
    });
  }

  // Use the HTML constraints too, including required, min, max and step.
  function getHTMLError($field) {
    const validity = $field.prop("validity");
    const value = String($field.val() || "").trim();
    const type = $field.attr("type");
    if (validity.badInput) return "Enter a valid number or date.";
    if (validity.valueMissing) return "Complete this field.";
    if (!value) return "";
    if (type === "email" && !validEmail(value)) {
      return "Enter a valid email address, such as name@example.com.";
    }
    if (type === "tel" && !validPhone(value)) {
      return "Enter 10–15 digits with an optional leading +, spaces, brackets or hyphens.";
    }
    if (validity.rangeUnderflow || validity.rangeOverflow || validity.stepMismatch) {
      return type === "date"
        ? "Choose today or a future date in Pavlodar."
        : "Enter a whole quantity from 1 to 999.";
    }
    const minLength = $field.attr("minlength");
    const maxLength = $field.attr("maxlength");
    if (minLength && value.length < Number(minLength)) {
      return "Use at least " + minLength + " characters.";
    }
    if (maxLength && value.length > Number(maxLength)) {
      return "Use no more than " + maxLength + " characters.";
    }
    if (validity.patternMismatch) return "Use the format shown for this field.";
    return "";
  }

  function bindValidation($form, getRules, $result) {
    let submitted = false;
    $form.prop("noValidate", true);
    $result.attr({ "aria-live": "polite", "aria-atomic": "true" });

    function currentRules() {
      const customRules = getRules();
      const rules = [];
      const $fields = $form
        .find("input, select, textarea")
        .not(":disabled, :button, :submit, :reset");
      $fields.each(function () {
        const $field = $(this);
        const custom = customRules.find(function (rule) {
          return rule.field.is($field);
        });
        rules.push({ field: $field, error: custom?.error || getHTMLError($field) });
      });
      return rules;
    }
    currentRules().forEach(function (rule) {
      setFieldError(rule.field, "");
    });
    $form.on("input change", function (event) {
      if (event.originalEvent?.isComposing) return;
      hideMessage($result);
      if (submitted && !validateFields(currentRules(), false)) {
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
      trimValues($form);
      const valid = validateFields(currentRules(), true);
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

  // Blocked storage or invalid saved JSON should not stop the catalogue from loading.
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
    // Apply the limit to the existing quantity plus the amount being added.
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

  // Callers may read the cart, but should not change its internal objects.
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
    // renderCart() replaces the buttons; direct handlers would be lost.
    // Handle clicks on the section so the replacement buttons still work.
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

  // Browser-only coursework demo. This state never authorizes access to real data.
  const demoAccountKey = "kamzina-demo-accounts-v1";
  const demoIterations = 600000;
  const $demoStatus = makeElement("div", "alert alert-info d-none")
    .attr({ id: "demo-session", role: "status", "aria-live": "polite" })
    .prependTo("main");

  function readDemoState() {
    const raw = sessionStorage.getItem(demoAccountKey);
    if (!raw) return { accounts: [], sessionEmail: null };
    let saved;
    try {
      saved = JSON.parse(raw);
    } catch {
      return { accounts: [], sessionEmail: null };
    }
    if (!saved || !Array.isArray(saved.accounts)) return { accounts: [], sessionEmail: null };
    const accounts = saved.accounts
      .filter(function (account) {
        return (
          account &&
          typeof account.name === "string" &&
          account.name.length >= 2 &&
          account.name.length <= 80 &&
          typeof account.email === "string" &&
          validEmail(account.email) &&
          /^[a-f0-9]{32}$/.test(account.salt) &&
          /^[a-f0-9]{64}$/.test(account.verifier)
        );
      })
      .map(function (account) {
        return {
          name: account.name,
          email: account.email,
          salt: account.salt,
          verifier: account.verifier,
        };
      });
    return {
      accounts,
      sessionEmail: accounts.some(function (account) {
        return account.email === saved.sessionEmail;
      })
        ? saved.sessionEmail
        : null,
    };
  }

  function saveDemoState(state) {
    try {
      sessionStorage.setItem(demoAccountKey, JSON.stringify(state));
    } catch {
      throw new Error("Browser storage is unavailable. Enable storage to use accounts.");
    }
    refreshDemoSession();
  }

  function refreshDemoSession() {
    let state;
    try {
      state = readDemoState();
    } catch {
      $demoStatus.addClass("d-none");
      return;
    }
    const account = state.accounts.find(function (item) {
      return item.email === state.sessionEmail;
    });
    $demoStatus.empty().toggleClass("d-none", !account);
    if (!account) return;
    const $signout = makeElement(
      "button",
      "btn btn-outline-secondary btn-sm ms-2",
      "Sign out",
    )
      .attr("type", "button")
      .on("click", function () {
        try {
          const current = readDemoState();
          current.sessionEmail = null;
          saveDemoState(current);
          $demoStatus
            .removeClass("d-none")
            .text("You have signed out. Your account remains available in this tab.");
          $("main h1").attr("tabindex", -1).trigger("focus");
        } catch (error) {
          showMessage($demoStatus, "danger", error.message);
        }
      });
    $demoStatus.append(
      makeElement(
        "span",
        "text-break",
        "Signed in as " + account.name + " (" + account.email + "). This tab only.",
      ),
      $signout,
    );
  }

  function hex(bytes) {
    return Array.from(bytes, function (byte) {
      return byte.toString(16).padStart(2, "0");
    }).join("");
  }

  async function demoVerifier(password, salt) {
    if (!window.crypto?.subtle)
      throw new Error("Accounts need HTTPS or localhost in a supported browser.");
    const key = await crypto.subtle.importKey(
      "raw",
      new TextEncoder().encode(password),
      "PBKDF2",
      false,
      ["deriveBits"],
    );
    const bytes = new Uint8Array(
      salt.match(/../g).map(function (pair) {
        return parseInt(pair, 16);
      }),
    );
    const bits = await crypto.subtle.deriveBits(
      { name: "PBKDF2", hash: "SHA-256", salt: bytes, iterations: demoIterations },
      key,
      256,
    );
    return hex(new Uint8Array(bits));
  }

  async function registerDemoAccount(name, email, password) {
    email = email.trim().toLowerCase();
    let state;
    try {
      state = readDemoState();
    } catch {
      throw new Error("Browser storage is unavailable. Enable storage to use accounts.");
    }
    if (
      state.accounts.some(function (account) {
        return account.email === email;
      })
    ) {
      return {
        success: false,
        field: "email",
        message: "An account for this email already exists in this tab. Sign in instead.",
      };
    }
    if (!window.crypto?.subtle)
      throw new Error("Accounts need HTTPS or localhost in a supported browser.");
    const salt = hex(crypto.getRandomValues(new Uint8Array(16)));
    const verifier = await demoVerifier(password, salt);
    state.accounts.push({ name: name.trim(), email, salt, verifier });
    state.sessionEmail = email;
    saveDemoState(state);
    return {
      success: true,
      message: "Account created. You are signed in for this browser tab.",
    };
  }

  async function signInDemoAccount(email, password) {
    let state;
    try {
      state = readDemoState();
    } catch {
      throw new Error("Browser storage is unavailable. Enable storage to use accounts.");
    }
    const account = state.accounts.find(function (item) {
      return item.email === email.trim().toLowerCase();
    });
    if (!account || (await demoVerifier(password, account.salt)) !== account.verifier) {
      return {
        success: false,
        message:
          "The email or password does not match. Create an account in this tab first if needed.",
      };
    }
    state.sessionEmail = account.email;
    saveDemoState(state);
    return {
      success: true,
      message: "Signed in for this browser tab.",
    };
  }

  refreshDemoSession();
  $(window).on("pageshow", function (event) {
    // History-cache restoration keeps the old DOM without rerunning this script.
    if (event.originalEvent?.persisted) {
      refreshDemoSession();
      keepActionsVisible();
    }
  });

  // Shared presentation for browser-only demo accounts.
  function setupAccountDemo(kind) {
    const signup = kind === "signup";
    const $form = $("#" + kind + "-form");
    const title = signup ? "Create an account" : "Sign in";
    const description = signup
      ? "Create an account for this browser tab. Your account stays available until you close the tab. Ordering does not require an account."
      : "Use an account created in this browser tab. Ordering does not require an account.";
    document.title = title + " | Kamzina 199";
    $('meta[name="description"]').attr("content", description);
    $("main h1").text(title).next("p").text(description);
    $form
      .closest("section")
      .find("h2")
      .text(signup ? "Registration" : "Credentials");
    $form.find("legend").text(signup ? "New account details" : "Account credentials");
    $("#" + kind + "-submit").text(signup ? "Create account" : "Sign in");
    const $related = $form
      .next("small")
      .text(signup ? "Already have an account? " : "No account yet? ");
    $related.append(
      makeElement("a", "", signup ? "Sign in" : "Create an account").attr(
        "href",
        signup ? "signin.html" : "signup.html",
      ),
    );
    $form.find('input[type="password"]').each(function () {
      const $field = $(this);
      const $button = makeElement(
        "button",
        "btn btn-outline-secondary btn-sm mt-2",
        "Show password",
      ).attr({ type: "button", "aria-controls": $field.attr("id"), "aria-pressed": "false" });
      $field.after($button);
      function maskPassword() {
        $field.attr("type", "password");
        $button.attr("aria-pressed", "false").text("Show password");
      }
      $button.on("click", function () {
        const show = $field.attr("type") === "password";
        $field.attr("type", show ? "text" : "password");
        $button.attr("aria-pressed", String(show)).text(show ? "Hide password" : "Show password");
      });
      $form.on("reset", maskPassword);
    });
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
    trimValues,
    validEmail,
    validPhone,
    todayInPavlodar,
    addToCart,
    getCart,
    clearCart,
    effectDuration,
    setupAccountDemo,
    registerDemoAccount,
    signInDemoAccount,
  };
});
