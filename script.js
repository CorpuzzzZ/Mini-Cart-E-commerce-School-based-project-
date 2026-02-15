// script.js - Final version

let cart = [];

// Product data (matches your HTML order)
const products = [
  {
    id: 1,
    name: "Sage Green Maxi Dress",
    price: 500,
    img: "image/Product 1.png",
  },
  {
    id: 2,
    name: "Sage green breasted blazer",
    price: 500,
    img: "image/Product 2.png",
  },
  {
    id: 3,
    name: "Charcoal Grey Leg Trousers",
    price: 500,
    img: "image/Product 3.png",
  },
  { id: 4, name: "The Blue Chronograph", price: 500, img: "image/Watch 1.png" },
  {
    id: 5,
    name: "The Rose Gold Classicx",
    price: 500,
    img: "image/Watch 2.png",
  },
  { id: 6, name: "The Alabaster Satchel", price: 500, img: "image/Bag 1.png" },
  { id: 7, name: "The Sienna Workbag", price: 500, img: "image/Bag 2.png" },
  { id: 8, name: "The Voyager Boot", price: 500, img: "image/Shoes 1.png" },
];

// Format currency
function peso(amount) {
  return (
    "₱" +
    Number(amount).toLocaleString("en-PH", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })
  );
}

function getProduct(id) {
  return products.find((p) => p.id === id);
}

// Show toast with "View Cart" button
function showAddedToast(name) {
  let container = document.getElementById("toastContainer");
  if (!container) {
    container = document.createElement("div");
    container.id = "toastContainer";
    container.className = "toast-container position-fixed bottom-0 end-0 p-3";
    document.body.appendChild(container);
  }

  const toastId = "toast-" + Date.now();
  const toastHtml = `
    <div id="${toastId}" class="toast align-items-center text-bg-success border-0 shadow" role="alert" aria-live="assertive" aria-atomic="true">
      <div class="d-flex">
        <div class="toast-body">
          <strong>${name}</strong> added to cart!
        </div>
        <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button>
      </div>
      <div class="toast-body pt-0 pb-3">
        <button class="btn btn-sm btn-light mt-1 px-3" 
                onclick="new bootstrap.Offcanvas(document.getElementById('cartOffcanvas')).show(); 
                         document.getElementById('${toastId}').querySelector('.btn-close').click();">
          View Cart
        </button>
      </div>
    </div>
  `;

  container.insertAdjacentHTML("beforeend", toastHtml);
  const toastEl = document.getElementById(toastId);
  const toast = new bootstrap.Toast(toastEl, { delay: 5000 });
  toast.show();

  toastEl.addEventListener("hidden.bs.toast", () => toastEl.remove());
}

// Render cart items
function renderCart() {
  const container = document.getElementById("cartItemsContainer");
  if (!container) return;

  if (cart.length === 0) {
    container.innerHTML = `
      <div class="text-center py-5 text-secondary">
        <i class="bi bi-cart fs-1"></i><br>
        Your cart is empty
      </div>`;
    document.getElementById("proceedCheckoutBtn").disabled = true;
  } else {
    let html = "";
    cart.forEach((item) => {
      html += `
        <div class="d-flex align-items-center mb-4 pb-3 border-bottom">
          <img src="${item.img}" alt="${item.name}" style="width:70px;height:70px;object-fit:cover;" class="rounded-3 me-3 shadow-sm">
          <div class="flex-grow-1">
            <div class="fw-bold text-dark">${item.name}</div>
            <div class="text-success small">${peso(item.price)}</div>
          </div>
          <div class="d-flex align-items-center gap-2 me-3">
            <button class="btn btn-sm btn-outline-secondary rounded-circle" onclick="changeQty(${item.id}, -1)">−</button>
            <span class="px-3 fw-bold">${item.qty}</span>
            <button class="btn btn-sm btn-outline-secondary rounded-circle" onclick="changeQty(${item.id}, 1)">+</button>
          </div>
          <div class="text-end fw-bold text-success" style="min-width:80px;">
            ${peso(item.price * item.qty)}
          </div>
        </div>`;
    });
    container.innerHTML = html;
    document.getElementById("proceedCheckoutBtn").disabled = false;
  }

  updateTotals();
}

// Change quantity – remove item if <= 0
function changeQty(id, delta) {
  const idx = cart.findIndex((i) => i.id === id);
  if (idx === -1) return;

  const newQty = cart[idx].qty + delta;

  if (newQty <= 0) {
    cart.splice(idx, 1);
  } else {
    cart[idx].qty = newQty;
  }

  renderCart();
}

// Add item to cart (only from cart icon)
function addToCart(id) {
  const prod = getProduct(id);
  if (!prod) return;

  let item = cart.find((i) => i.id === id);
  if (item) {
    item.qty += 1;
  } else {
    cart.push({ ...prod, qty: 1 });
  }

  showAddedToast(prod.name);
  renderCart();
}

// Update totals – shipping if cart has items
function updateTotals() {
  let subtotal = cart.reduce((sum, i) => sum + i.price * i.qty, 0);

  let discount = subtotal >= 2000 ? Math.round(subtotal * 0.1) : 0;
  let afterDiscount = subtotal - discount;
  let tax = Math.round(afterDiscount * 0.12);

  let shipping = cart.length > 0 ? (subtotal >= 1500 ? 0 : 150) : 0;

  let grandTotal = afterDiscount + tax + shipping;

  document.getElementById("subtotal").textContent = peso(subtotal);
  document.getElementById("discount").textContent = peso(discount);
  document.getElementById("tax").textContent = peso(tax);
  document.getElementById("shipping").textContent = peso(shipping);
  document.getElementById("grandTotal").textContent = peso(grandTotal);
}

// Delivery address toggle
document.querySelectorAll('input[name="delivery"]').forEach((radio) => {
  radio.addEventListener("change", () => {
    const isDelivery =
      document.querySelector('input[name="delivery"]:checked')?.value ===
      "Delivery";
    document.getElementById("deliveryAddressGroup").style.display = isDelivery
      ? "block"
      : "none";
    document.querySelector('textarea[name="address"]').required = isDelivery;
  });
});

// Place Order → generate receipt
document
  .getElementById("checkoutForm")
  ?.addEventListener("submit", function (e) {
    e.preventDefault();

    const form = e.target;
    if (!form.checkValidity()) {
      form.classList.add("was-validated");
      return;
    }

    const data = new FormData(form);
    const orderId = "ORD-" + Date.now().toString().slice(-6);
    const orderDate = new Date().toLocaleString("en-PH");

    let itemsHtml = cart
      .map(
        (item) => `
    <tr>
      <td>${item.name}</td>
      <td class="text-end">${item.qty}</td>
      <td class="text-end">${peso(item.price)}</td>
      <td class="text-end fw-bold">${peso(item.price * item.qty)}</td>
    </tr>
  `,
      )
      .join("");

    document.getElementById("receiptBody").innerHTML = `
    <div class="text-center mb-4">
      <h4 class="text-success fw-bold">Order #${orderId}</h4>
      <p class="text-muted small">${orderDate}</p>
    </div>

    <div class="mb-4">
      <strong>Customer:</strong><br>
      ${data.get("fullName")}<br>
      ${data.get("email")}<br><br>
      <strong>Payment Method:</strong> ${data.get("payment")}<br>
      <strong>Delivery:</strong> ${data.get("delivery")}
      ${data.get("address") ? `<br><strong>Address:</strong> ${data.get("address")}` : ""}
    </div>

    <h6 class="mb-2">Order Items</h6>
    <table class="table table-sm table-borderless">
      <thead class="border-bottom">
        <tr>
          <th>Item</th>
          <th class="text-end">Qty</th>
          <th class="text-end">Unit Price</th>
          <th class="text-end">Total</th>
        </tr>
      </thead>
      <tbody>${itemsHtml}</tbody>
    </table>

    <hr class="my-4">

    <table class="table table-borderless w-100">
      <tr><td>Subtotal:</td><td class="text-end">${document.getElementById("subtotal").textContent}</td></tr>
      <tr><td>Discount:</td><td class="text-end text-danger">${document.getElementById("discount").textContent}</td></tr>
      <tr><td>Tax (12%):</td><td class="text-end">${document.getElementById("tax").textContent}</td></tr>
      <tr><td>Shipping:</td><td class="text-end">${document.getElementById("shipping").textContent}</td></tr>
      <tr class="fw-bold fs-5 border-top">
        <td>Grand Total:</td>
        <td class="text-end">${document.getElementById("grandTotal").textContent}</td>
      </tr>
    </table>

    <div class="text-center mt-5 text-muted small">
      Thank you for shopping with us!
    </div>
  `;

    // Show receipt modal
    const receiptModal = new bootstrap.Modal(
      document.getElementById("receiptModal"),
    );
    receiptModal.show();

    // Reset
    cart = [];
    renderCart();
    form.reset();
    document.getElementById("deliveryAddressGroup").style.display = "none";
    bootstrap.Modal.getInstance(
      document.getElementById("checkoutModal"),
    )?.hide();
  });

// Connect cart icons (only way to add items)
document.querySelectorAll('.card a[href="#"]').forEach((link) => {
  link.addEventListener("click", function (e) {
    e.preventDefault();
    const card = this.closest(".card");
    const id = parseInt(card.getAttribute("data-id"));
    if (id) addToCart(id);
  });
});

// Navbar cart icon → open cart
document
  .getElementById("navbarCartLink")
  ?.addEventListener("click", function (e) {
    e.preventDefault();
    new bootstrap.Offcanvas(document.getElementById("cartOffcanvas")).show();
  });

// Initial render
renderCart();
