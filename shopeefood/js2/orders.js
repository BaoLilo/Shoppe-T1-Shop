/* =========================================================
   ORDERS.JS — Order history page logic (orders2.html only)
   Depends on helpers from script.js (getCart, saveCart,
   formatVND, getCurrentUser, isLoggedIn, logoutUser...)
   ========================================================= */

const STATUS_CLASS = {
  "Đang xử lý":  "status-processing",
  "Đang giao":   "status-shipping",
  "Đã giao":     "status-done",
  "Đã hủy":      "status-cancelled"
};

document.addEventListener("DOMContentLoaded", ()=>{

  const list = document.getElementById("orders-list");
  if(!list) return; // not on orders page

  if(!isLoggedIn()){
    document.getElementById("login-required-box").style.display = "block";
    return;
  }

  document.getElementById("logout-btn").style.display = "inline-flex";
  document.getElementById("logout-btn").addEventListener("click", ()=> logoutUser("index2.html"));

  renderOrders();
});

function getOrders(){
  try{
    return JSON.parse(localStorage.getItem(ORDERS_KEY)) || [];
  }catch(e){
    return [];
  }
}

function renderOrders(){
  const list = document.getElementById("orders-list");
  const emptyBox = document.getElementById("orders-empty");
  const orders = getOrders();

  list.innerHTML = "";

  if(orders.length === 0){
    emptyBox.style.display = "block";
    return;
  }

  emptyBox.style.display = "none";

  orders.forEach(order=>{
    list.appendChild(buildOrderCard(order));
  });
}

function buildOrderCard(order){
  const card = document.createElement("div");
  card.className = "order-card";

  const dateStr = formatOrderDate(order.date);
  const statusClass = STATUS_CLASS[order.status] || "status-processing";

  const itemsHtml = order.items.map(i=>
    `<div class="order-item-row"><span>${i.name} x${i.quantity}</span><span>${formatVND(i.price * i.quantity)}</span></div>`
  ).join("");

  card.innerHTML = `
    <div class="order-card-head">
      <div>
        <h4>Mã đơn: ${order.id}</h4>
        <span class="order-date">${dateStr}</span>
      </div>
      <span class="order-status ${statusClass}">${order.status}</span>
    </div>

    <div class="order-items">${itemsHtml}</div>

    <div class="order-card-foot">
      <div class="order-meta">
        <span>Thanh toán: ${paymentLabel(order.payment)}</span>
        <span>Giao đến: ${order.address}</span>
      </div>
      <div class="order-total-wrap">
        <span>Tổng cộng</span>
        <strong>${formatVND(order.total)}</strong>
      </div>
    </div>

    <div class="order-card-actions">
      <button type="button" class="btn btn-outline btn-sm reorder-btn">Đặt lại</button>
    </div>
  `;

  card.querySelector(".reorder-btn").addEventListener("click", ()=> reorder(order));

  return card;
}

function paymentLabel(code){
  const map = {
    COD: "Thanh toán khi nhận hàng",
    ShopeePay: "Ví ShopeePay",
    Momo: "Ví MoMo",
    VNPay: "VNPay / Chuyển khoản"
  };
  return map[code] || code;
}

function formatOrderDate(iso){
  const d = new Date(iso);
  if(isNaN(d.getTime())) return "";
  return d.toLocaleString("vi-VN");
}

function reorder(order){
  const cart = getCart();

  order.items.forEach(orderItem=>{
    const found = cart.find(item => item.name === orderItem.name);
    if(found){
      found.quantity += orderItem.quantity;
    }else{
      cart.push({ name: orderItem.name, price: orderItem.price, image: orderItem.image || "", quantity: orderItem.quantity });
    }
  });

  saveCart(cart);
  showToast("Đã thêm các món từ đơn " + order.id + " vào giỏ hàng.", "success");
  setTimeout(()=> window.location.href = "cart2.html", 900);
}
