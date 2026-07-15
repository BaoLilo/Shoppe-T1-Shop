/* =========================================================
   CART.JS — Cart page logic (cart2.html only)
   Depends on helpers from script.js (getCart, saveCart, formatVND...)
   ========================================================= */

const VOUCHERS = {
  "SALE10":   { type:"percent", value:10,    label:"Giảm 10% tổng đơn" },
  "SALE20K":  { type:"amount",  value:20000, label:"Giảm 20.000đ"      },
  "FREESHIP": { type:"ship",    value:0,     label:"Miễn phí vận chuyển" },
  "MEMBER15": { type:"percent", value:15,    label:"Giảm 15% dành cho thành viên", memberOnly:true }
};

const SHIP_FEE = 15000;
const FREE_SHIP_THRESHOLD = 150000;

let appliedVoucher = null;

document.addEventListener("DOMContentLoaded", ()=>{

  const cartTableWrap = document.getElementById("cart-table-wrap");
  if(!cartTableWrap) return; // not on cart page

  renderCart();
  applyPendingVoucherFromStorage();

  const applyBtn = document.getElementById("apply-voucher-btn");
  if(applyBtn) applyBtn.addEventListener("click", applyVoucher);

  const selectAll = document.getElementById("select-all");
  if(selectAll) selectAll.addEventListener("change", onSelectAllChange);

  const clearBtn = document.getElementById("clear-cart-btn");
  if(clearBtn) clearBtn.addEventListener("click", ()=>{
    if(confirm("Bạn có chắc muốn xóa toàn bộ giỏ hàng?")){
      saveCart([]);
      renderCart();
      showToast("Đã xóa toàn bộ giỏ hàng.");
    }
  });

  const checkoutBtn = document.getElementById("go-checkout-btn");
  if(checkoutBtn) checkoutBtn.addEventListener("click", goToCheckout);
});

/* ---------------------------------------------------------
   RENDER CART TABLE + SUMMARY
--------------------------------------------------------- */
function renderCart(){
  const cart = getCart();
  const tbody = document.getElementById("cart-body");
  const emptyBox = document.getElementById("cart-empty");
  const tableWrap = document.getElementById("cart-table-wrap");
  const summaryBox = document.getElementById("summary-box");

  if(cart.length === 0){
    tableWrap.style.display = "none";
    summaryBox.style.display = "none";
    emptyBox.style.display = "block";
    return;
  }

  tableWrap.style.display = "block";
  summaryBox.style.display = "block";
  emptyBox.style.display = "none";

  tbody.innerHTML = "";

  cart.forEach((item, index)=>{
    const checked = item.selected !== false ? "checked" : "";
    const lineTotal = item.price * item.quantity;
    const imgSrc = item.image || "img2/f6.webp";

    const row = document.createElement("div");
    row.className = "cart-item";
    row.innerHTML = `
      <input type="checkbox" class="item-check" data-index="${index}" ${checked}>

      <div class="product">
        <img src="${imgSrc}" alt="${item.name}">
        <h4>${item.name}</h4>
      </div>

      <div>${formatVND(item.price)}</div>

      <div class="qty-control">
        <button type="button" class="minus-btn" data-index="${index}">−</button>
        <span>${item.quantity}</span>
        <button type="button" class="plus-btn" data-index="${index}">+</button>
      </div>

      <div class="cart-item-money">${formatVND(lineTotal)}</div>

      <button type="button" class="remove-btn" data-index="${index}" title="Xóa món">✕</button>
    `;

    tbody.appendChild(row);
  });

  attachRowEvents();
  updateSummary();
}

/* ---------------------------------------------------------
   ATTACH EVENTS TO EACH ROW (qty +/-, remove, checkbox)
--------------------------------------------------------- */
function attachRowEvents(){
  document.querySelectorAll(".plus-btn").forEach(btn=>{
    btn.addEventListener("click", ()=> changeQty(Number(btn.dataset.index), 1));
  });

  document.querySelectorAll(".minus-btn").forEach(btn=>{
    btn.addEventListener("click", ()=> changeQty(Number(btn.dataset.index), -1));
  });

  document.querySelectorAll(".remove-btn").forEach(btn=>{
    btn.addEventListener("click", ()=> removeItem(Number(btn.dataset.index)));
  });

  document.querySelectorAll(".item-check").forEach(box=>{
    box.addEventListener("change", ()=>{
      const cart = getCart();
      cart[Number(box.dataset.index)].selected = box.checked;
      saveCart(cart);
      updateSummary();
      syncSelectAllCheckbox();
    });
  });

  syncSelectAllCheckbox();
}

function syncSelectAllCheckbox(){
  const selectAll = document.getElementById("select-all");
  if(!selectAll) return;
  const boxes = document.querySelectorAll(".item-check");
  selectAll.checked = boxes.length > 0 && Array.from(boxes).every(b => b.checked);
}

function onSelectAllChange(e){
  const checked = e.target.checked;
  const cart = getCart();
  cart.forEach(item => item.selected = checked);
  saveCart(cart);
  renderCart();
}

/* ---------------------------------------------------------
   QUANTITY / REMOVE
--------------------------------------------------------- */
function changeQty(index, delta){
  const cart = getCart();
  const item = cart[index];
  if(!item) return;

  item.quantity = Math.max(1, item.quantity + delta);
  saveCart(cart);
  renderCart();
}

function removeItem(index){
  const cart = getCart();
  const name = cart[index]?.name;
  cart.splice(index, 1);
  saveCart(cart);
  renderCart();
  if(name) showToast(name + " đã được xóa khỏi giỏ hàng.");
}

/* ---------------------------------------------------------
   VOUCHER
--------------------------------------------------------- */
function applyVoucher(){
  const input = document.getElementById("voucher-code");
  const code = input.value.trim().toUpperCase();

  if(!code){
    showToast("Vui lòng nhập mã giảm giá.", "error");
    return;
  }

  const voucher = VOUCHERS[code];

  if(!voucher){
    showToast("Mã giảm giá không hợp lệ.", "error");
    appliedVoucher = null;
    updateSummary();
    return;
  }

  if(voucher.memberOnly && !isLoggedIn()){
    showToast("Mã này chỉ dành cho thành viên. Vui lòng đăng nhập để sử dụng.", "error");
    appliedVoucher = null;
    updateSummary();
    return;
  }

  appliedVoucher = { code, ...voucher };
  showToast("Áp dụng mã \"" + code + "\" thành công: " + voucher.label, "success");
  updateSummary();
}

/* ---------------------------------------------------------
   AUTO-APPLY A VOUCHER HANDED OFF FROM voucher2.html
--------------------------------------------------------- */
function applyPendingVoucherFromStorage(){
  const code = localStorage.getItem("sf_pending_voucher");
  if(!code) return;

  localStorage.removeItem("sf_pending_voucher");

  const input = document.getElementById("voucher-code");
  if(input) input.value = code;

  applyVoucher();
}

/* ---------------------------------------------------------
   SUMMARY CALCULATION (subtotal / ship / discount / total)
--------------------------------------------------------- */
function getSelectedItems(){
  return getCart().filter(item => item.selected !== false);
}

function updateSummary(){
  const selected = getSelectedItems();
  const subtotal = selected.reduce((sum,i)=> sum + i.price*i.quantity, 0);

  let ship = selected.length === 0 ? 0 : (subtotal >= FREE_SHIP_THRESHOLD ? 0 : SHIP_FEE);
  let discount = 0;

  if(appliedVoucher && selected.length > 0){
    if(appliedVoucher.type === "percent"){
      discount = Math.round(subtotal * appliedVoucher.value / 100);
    }else if(appliedVoucher.type === "amount"){
      discount = Math.min(appliedVoucher.value, subtotal);
    }else if(appliedVoucher.type === "ship"){
      ship = 0;
    }
  }

  const total = Math.max(0, subtotal - discount + ship);

  setText("summary-subtotal", formatVND(subtotal));
  setText("summary-ship", ship === 0 ? "Miễn phí" : formatVND(ship));
  setText("summary-discount", "-" + formatVND(discount));
  setText("summary-total", formatVND(total));
  setText("summary-count", selected.length);

  // Persist the computed order for checkout2.html to read
  sessionStorage.setItem("sf_checkout_summary", JSON.stringify({
    subtotal, ship, discount, total,
    voucher: appliedVoucher ? appliedVoucher.code : null,
    items: selected
  }));
}

function setText(id, value){
  const el = document.getElementById(id);
  if(el) el.textContent = value;
}

/* ---------------------------------------------------------
   GO TO CHECKOUT
--------------------------------------------------------- */
function goToCheckout(){
  const selected = getSelectedItems();

  if(selected.length === 0){
    showToast("Vui lòng chọn ít nhất 1 sản phẩm để thanh toán!", "error");
    return;
  }

  updateSummary();
  window.location.href = "checkout2.html";
}
