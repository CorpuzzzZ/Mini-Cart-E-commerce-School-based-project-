// script.js - Final version with toast + View Cart button

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

// Format price
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
  const toast = new bootstrap.Toast(toastEl, { delay: 5000 }); // longer so user can click
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
        <div class="d-flex align-items-center mb-4 pb-3 border-bottom position-relative">
          <img src="${item.img}" alt="${item.name}" 
               style="width:70px;height:70px;object-fit:cover;" 
               class="rounded-3 me-3 shadow-sm">
          <div class="flex-grow-1">
            <div class="fw-bold text-dark">${item.name}</div>
            <div class="text-success small">${peso(item.price)}</div>
          </div>
          <div class="d-flex align-items-center gap-2 me-4">
            <button class="btn btn-sm btn-outline-secondary rounded-circle" 
                    onclick="changeQty(${item.id}, -1)">−</button>
            <span class="px-3 fw-bold">${item.qty}</span>
            <button class="btn btn-sm btn-outline-secondary rounded-circle" 
                    onclick="changeQty(${item.id}, 1)">+</button>
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

// Quantity change – remove item if qty <= 0
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

// Add to cart – show toast, do NOT open cart
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
  renderCart(); // update totals & UI but don't open panel
}

// Update totals – shipping shown when cart has items
function updateTotals() {
  let subtotal = cart.reduce((sum, i) => sum + i.price * i.qty, 0);

  let discount = subtotal >= 2000 ? Math.round(subtotal * 0.1) : 0;
  let afterDiscount = subtotal - discount;
  let tax = Math.round(afterDiscount * 0.12);

  // Shipping: always shown if cart has items; free above ₱1500
  let shipping = cart.length > 0 ? (subtotal >= 1500 ? 0 : 150) : 0;

  let grandTotal = afterDiscount + tax + shipping;

  document.getElementById("subtotal").textContent = peso(subtotal);
  document.getElementById("discount").textContent = peso(discount);
  document.getElementById("tax").textContent = peso(tax);
  document.getElementById("shipping").textContent = peso(shipping);
  document.getElementById("grandTotal").textContent = peso(grandTotal);
}

// Delivery toggle
document.querySelectorAll('input[name="delivery"]').forEach((radio) => {
  radio.addEventListener("change", () => {
    const show =
      document.querySelector('input[name="delivery"]:checked')?.value ===
      "Delivery";
    document.getElementById("deliveryAddressGroup").style.display = show
      ? "block"
      : "none";
    document.querySelector('textarea[name="address"]').required = show;
  });
});

// Checkout submission
document.getElementById("checkoutForm")?.addEventListener("submit", (e) => {
  e.preventDefault();
  const form = e.target;
  if (!form.checkValidity()) {
    form.classList.add("was-validated");
    return;
  }

  const data = new FormData(form);
  const orderId = "ORD-" + Date.now().toString().slice(-6);

  let itemsHtml = cart
    .map(
      (i) => `
    <tr>
      <td>${i.name}</td>
      <td class="text-end">${i.qty}</td>
      <td class="text-end">${peso(i.price)}</td>
      <td class="text-end fw-bold">${peso(i.price * i.qty)}</td>
    </tr>
  `,
    )
    .join("");

  document.getElementById("receiptBody").innerHTML = `
    <div class="text-center mb-5">
      <h4 class="text-success fw-bold">Order #${orderId}</h4>
      <p class="text-muted">${new Date().toLocaleString("en-PH")}</p>
    </div>
    <div class="mb-4">
      <strong>Customer:</strong><br>${data.get("fullName")}<br>${data.get("email")}<br>
      <strong>Payment:</strong> ${data.get("payment")}<br>
      <strong>Delivery:</strong> ${data.get("delivery")}${data.get("address") ? ` – ${data.get("address")}` : ""}
    </div>
    <table class="table table-borderless table-sm">
      <thead class="border-bottom">
        <tr><th>Item</th><th class="text-end">Qty</th><th class="text-end">Price</th><th class="text-end">Total</th></tr>
      </thead>
      <tbody>${itemsHtml}</tbody>
    </table>
    <hr>
    <div class="d-flex justify-content-between fw-bold fs-5">
      <span>Grand Total</span><span>${document.getElementById("grandTotal").textContent}</span>
    </div>
    <p class="text-center text-muted mt-5 small">Thank you for shopping with us ♡</p>
  `;

  new bootstrap.Modal(document.getElementById("receiptModal")).show();

  cart = [];
  renderCart();
  form.reset();
  document.getElementById("deliveryAddressGroup").style.display = "none";
  bootstrap.Modal.getInstance(document.getElementById("checkoutModal"))?.hide();
});

// Product add buttons
document.querySelectorAll('.card a[href="#"]').forEach((link) => {
  link.addEventListener("click", (e) => {
    e.preventDefault();
    const card = link.closest(".card");
    const id = parseInt(card.getAttribute("data-id"));
    if (id) addToCart(id);
  });
});

// Navbar cart → open cart
document.getElementById("navbarCartLink")?.addEventListener("click", (e) => {
  e.preventDefault();
  new bootstrap.Offcanvas(document.getElementById("cartOffcanvas")).show();
});

// Initial render
renderCart();
