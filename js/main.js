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

  function findProduct(id) {
    return products.find(function (product) {
      return product.id === id;
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

  function filterProducts(items, query, category) {
    const search = query.trim().toLowerCase();
    return items.filter(function (product) {
      const text = product.name + " " + product.specification + " " + product.category;
      return (
        (category === "all" || product.category === category) && text.toLowerCase().includes(search)
      );
    });
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

  return {
    products,
    findProduct,
    validQuantity,
    formatMoney,
    getSubtotal,
    getCartLines,
    getCartTotal,
    createReference,
    filterProducts,
    addToCart,
    getCart,
    clearCart,
  };
})();
