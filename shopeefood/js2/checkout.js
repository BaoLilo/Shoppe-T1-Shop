/* =========================================================
   CHECKOUT.JS — Checkout page logic (checkout2.html only)
   ========================================================= */

document.addEventListener("DOMContentLoaded", ()=>{

  const form = document.getElementById("checkout-form");
  if(!form) return; // not on checkout page

  renderOrderSummary();
  initPaymentOptions();

  form.addEventListener("submit", handleSubmit);
});

/* ---------------------------------------------------------
   Load the summary saved by cart.js, with a safe fallback
   that recomputes directly from localStorage cart.
--------------------------------------------------------- */
function loadSummary(){
  try{
    const raw = sessionStorage.getItem("sf_checkout_summary");
    if(raw){
      const parsed = JSON.parse(raw);
      if(parsed.items && parsed.items.length > 0) return parsed;
    }
  }catch(e){ /* fall through to recompute */ }

  const items = getCart().filter(i => i.selected !== false);
  const subtotal = items.reduce((s,i)=> s + i.price*i.quantity, 0);
  const ship = items.length === 0 ? 0 : (subtotal >= 150000 ? 0 : 15000);

  return { subtotal, ship, discount:0, total: subtotal + ship, voucher:null, items };
}

/* ---------------------------------------------------------
   RENDER ORDER SUMMARY
--------------------------------------------------------- */
function renderOrderSummary(){
  const summary = loadSummary();
  const list = document.getElementById("order-items");

  if(summary.items.length === 0){
    document.getElementById("checkout-form").innerHTML =
      `<div class="empty-state" style="padding:30px 0;">
         <div class="icon">🛒</div>
         <p>Không có sản phẩm nào để thanh toán.</p>
         <a href="menu2.html" class="btn btn-primary" style="margin-top:16px;">Chọn món ngay</a>
       </div>`;
    document.getElementById("order-summary-box").style.display = "none";
    return;
  }

  list.innerHTML = "";
  summary.items.forEach(item=>{
    const row = document.createElement("div");
    row.className = "order-item-row";
    row.innerHTML = `<span>${item.name} x${item.quantity}</span><span>${formatVND(item.price*item.quantity)}</span>`;
    list.appendChild(row);
  });

  setText("checkout-subtotal", formatVND(summary.subtotal));
  setText("checkout-ship", summary.ship === 0 ? "Miễn phí" : formatVND(summary.ship));
  setText("checkout-discount", "-" + formatVND(summary.discount));
  setText("checkout-total", formatVND(summary.total));
}

function setText(id, value){
  const el = document.getElementById(id);
  if(el) el.textContent = value;
}

/* ---------------------------------------------------------
   PAYMENT METHOD SELECTOR
--------------------------------------------------------- */
function initPaymentOptions(){
  const options = document.querySelectorAll(".payment-option");

  options.forEach(opt=>{
    opt.addEventListener("click", ()=>{
      options.forEach(o => o.classList.remove("selected"));
      opt.classList.add("selected");
      opt.querySelector("input[type=radio]").checked = true;
    });
  });
}

/* ---------------------------------------------------------
   FORM VALIDATION
--------------------------------------------------------- */
function validateField(input, message){
  const field = input.closest(".field");
  const isValid = input.checkValidity() && input.value.trim() !== "";

  if(!isValid){
    field.classList.add("has-error");
    field.classList.add("shake");
    field.querySelector(".error-msg").textContent = message;
    setTimeout(()=> field.classList.remove("shake"), 500);
  }else{
    field.classList.remove("has-error");
  }

  return isValid;
}

function handleSubmit(e){
  e.preventDefault();

  const name = document.getElementById("cus-name");
  const phone = document.getElementById("cus-phone");
  const address = document.getElementById("cus-address");

  const nameOk = validateField(name, "Vui lòng nhập họ và tên.");
  const phoneOk = validateField(phone, "Số điện thoại không hợp lệ (10 số).") &&
                  /^[0-9]{9,11}$/.test(phone.value.trim());
  const addressOk = validateField(address, "Vui lòng nhập địa chỉ giao hàng.");

  if(!phoneOk){
    phone.closest(".field").classList.add("has-error");
  }

  if(!(nameOk && phoneOk && addressOk)){
    showToast("Vui lòng kiểm tra lại thông tin đặt hàng.", "error");
    return;
  }

  placeOrder();
}

/* ---------------------------------------------------------
   PLACE ORDER — success animation + clear cart + redirect
--------------------------------------------------------- */
function placeOrder(){
  const overlay = document.getElementById("success-overlay");
  overlay.classList.add("show");

  saveOrderToHistory();

  localStorage.removeItem(CART_KEY);
  sessionStorage.removeItem("sf_checkout_summary");
  updateCartBadge();

  setTimeout(()=>{
    window.location.href = "index2.html";
  }, 2600);
}

/* ---------------------------------------------------------
   SAVE ORDER TO HISTORY (localStorage, read by orders2.html)
--------------------------------------------------------- */
function saveOrderToHistory(){
  const summary = loadSummary();
  const paymentInput = document.querySelector('input[name="payment"]:checked');
  const user = getCurrentUser();

  const order = {
    id: "SF" + Date.now(),
    date: new Date().toISOString(),
    name: document.getElementById("cus-name").value.trim(),
    phone: document.getElementById("cus-phone").value.trim(),
    address: document.getElementById("cus-address").value.trim(),
    note: document.getElementById("cus-note").value.trim(),
    payment: paymentInput ? paymentInput.value : "COD",
    items: summary.items,
    subtotal: summary.subtotal,
    ship: summary.ship,
    discount: summary.discount,
    total: summary.total,
    voucher: summary.voucher,
    status: "Đang xử lý",
    userEmail: user ? user.email : null
  };

  let orders = [];
  try{
    orders = JSON.parse(localStorage.getItem(ORDERS_KEY)) || [];
  }catch(e){ orders = []; }

  orders.unshift(order);
  localStorage.setItem(ORDERS_KEY, JSON.stringify(orders));
}
