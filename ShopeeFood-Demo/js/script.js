/* =========================================================
   SCRIPT.JS — Shared utilities used on every page
   Loaded on: index / menu / cart / checkout / login
   ========================================================= */

/* ---------- Storage keys ---------- */
const CART_KEY   = "sf_cart";
const FAV_KEY    = "sf_favorites";
const USER_KEY   = "sf_user";
const ORDERS_KEY = "sf_orders";

/* =========================================================
   AUTH HELPERS (shared across all pages)
   ========================================================= */
function getCurrentUser(){
  try{
    return JSON.parse(localStorage.getItem(USER_KEY)) || null;
  }catch(e){
    return null;
  }
}

function isLoggedIn(){
  return !!getCurrentUser();
}

function logoutUser(redirectTo){
  localStorage.removeItem(USER_KEY);
  showToast("Đã đăng xuất. Hẹn gặp lại!", "default");
  setTimeout(()=> window.location.href = redirectTo || "index.html", 900);
}

/* Redirect to login if not authenticated, preserving where to come back to.
   Call at the top of a gated page; returns true if the page should stop rendering. */
function requireLogin(currentPage){
  if(isLoggedIn()) return false;
  window.location.href = "login.html?redirect=" + encodeURIComponent(currentPage);
  return true;
}

/* Update the header's account link: shows the user's name + points to
   the orders page when logged in, otherwise points to login.html */
function updateAuthUI(){
  const authLink  = document.getElementById("auth-link");
  const authLabel = document.getElementById("auth-label");
  if(!authLink) return;

  const user = getCurrentUser();

  if(user){
    authLabel.textContent = user.name || "Tài khoản";
    authLink.href = "orders.html";
    authLink.title = "Xem đơn hàng của bạn";
  }else{
    authLabel.textContent = "Đăng nhập";
    authLink.href = "login.html";
    authLink.removeAttribute("title");
  }
}

/* ---------- Cart helpers (shared across all pages) ---------- */
function getCart(){
  try{
    return JSON.parse(localStorage.getItem(CART_KEY)) || [];
  }catch(e){
    return [];
  }
}

function saveCart(cart){
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
  updateCartBadge();
}

function cartCount(cart){
  return (cart || getCart()).reduce((sum,item)=>sum+item.quantity,0);
}

function cartTotal(cart){
  return (cart || getCart()).reduce((sum,item)=>sum+item.price*item.quantity,0);
}

function formatVND(number){
  return number.toLocaleString("vi-VN") + "đ";
}

/* ---------- Update cart badge in header (all pages) ---------- */
function updateCartBadge(){
  const badges = document.querySelectorAll(".cart-badge");
  const count = cartCount();
  badges.forEach(b=>{
    b.textContent = count;
    b.style.display = count > 0 ? "flex" : "none";
    b.classList.remove("bounce");
    // force reflow so animation can replay
    void b.offsetWidth;
    b.classList.add("bounce");
  });
}

/* ---------- Add to cart (used by menu.js / index cards) ---------- */
function addToCart(name, price, image){
  const cart = getCart();
  const found = cart.find(item => item.name === name);

  if(found){
    found.quantity++;
  }else{
    cart.push({ name, price, image: image || "", quantity: 1 });
  }

  saveCart(cart);
  showToast(name + " đã được thêm vào giỏ hàng!", "success");
}

/* =========================================================
   TOAST NOTIFICATION
   ========================================================= */
function showToast(message, type = "default"){
  let container = document.getElementById("toast-container");

  if(!container){
    container = document.createElement("div");
    container.id = "toast-container";
    document.body.appendChild(container);
  }

  const toast = document.createElement("div");
  toast.className = "toast " + type;

  const icon = type === "success" ? "✅" : type === "error" ? "⚠️" : "🔔";
  toast.innerHTML = `<span>${icon}</span><span>${message}</span>`;

  container.appendChild(toast);

  setTimeout(()=>{
    toast.classList.add("hide");
    setTimeout(()=> toast.remove(), 350);
  }, 2600);
}

/* =========================================================
   LOADING SCREEN
   ========================================================= */
window.addEventListener("load", ()=>{
  const loader = document.getElementById("loading-screen");
  if(loader){
    setTimeout(()=> loader.classList.add("hide"), 450);
  }
});

/* =========================================================
   MOBILE NAV TOGGLE
   ========================================================= */
document.addEventListener("DOMContentLoaded", ()=>{

  const toggle = document.querySelector(".burger-toggle");
  const nav = document.querySelector(".header-nav");

  if(toggle && nav){
    toggle.addEventListener("click", ()=>{
      nav.classList.toggle("open");
    });
  }

  updateCartBadge();
  updateAuthUI();
  initRipple();
  initScrollReveal();
  initFavorites();
  highlightActiveNav();
});

/* =========================================================
   ACTIVE NAV HIGHLIGHT
   ========================================================= */
function highlightActiveNav(){
  const current = window.location.pathname.split("/").pop() || "index.html";
  document.querySelectorAll(".header-nav a").forEach(link=>{
    const href = link.getAttribute("href");
    if(href === current){
      link.classList.add("active");
    }
  });
}

/* =========================================================
   BUTTON RIPPLE EFFECT
   ========================================================= */
function initRipple(){
  document.querySelectorAll(".btn").forEach(btn=>{
    btn.addEventListener("click", function(e){
      const rect = this.getBoundingClientRect();
      const circle = document.createElement("span");
      const size = Math.max(rect.width, rect.height);

      circle.className = "ripple";
      circle.style.width = circle.style.height = size + "px";
      circle.style.left = (e.clientX - rect.left - size/2) + "px";
      circle.style.top = (e.clientY - rect.top - size/2) + "px";

      this.appendChild(circle);
      setTimeout(()=> circle.remove(), 650);
    });
  });
}

/* =========================================================
   SCROLL REVEAL (IntersectionObserver)
   ========================================================= */
function initScrollReveal(){
  const targets = document.querySelectorAll(".reveal");
  if(!targets.length) return;

  const observer = new IntersectionObserver((entries)=>{
    entries.forEach(entry=>{
      if(entry.isIntersecting){
        entry.target.classList.add("in-view");
        observer.unobserve(entry.target);
      }
    });
  },{ threshold: 0.15 });

  targets.forEach(t => observer.observe(t));
}

/* =========================================================
   FAVORITES (heart button on food cards)
   ========================================================= */
function getFavorites(){
  try{
    return JSON.parse(localStorage.getItem(FAV_KEY)) || [];
  }catch(e){
    return [];
  }
}

function initFavorites(){
  const favs = getFavorites();

  document.querySelectorAll(".fav-btn").forEach(btn=>{
    const name = btn.dataset.name;
    if(favs.includes(name)){
      btn.classList.add("active");
      btn.textContent = "♥";
    }

    btn.addEventListener("click", (e)=>{
      e.stopPropagation();
      let list = getFavorites();

      if(list.includes(name)){
        list = list.filter(n => n !== name);
        btn.classList.remove("active");
        btn.textContent = "♡";
        showToast("Đã bỏ yêu thích " + name);
      }else{
        list.push(name);
        btn.classList.add("active");
        btn.textContent = "♥";
        showToast("Đã thêm " + name + " vào yêu thích", "success");
      }

      localStorage.setItem(FAV_KEY, JSON.stringify(list));
    });
  });
}

/* =========================================================
   SMOOTH SCROLL TO A SECTION BY ID
   ========================================================= */
function scrollToSection(id){
  const el = document.getElementById(id);
  if(el){
    el.scrollIntoView({ behavior:"smooth" });
  }
}
