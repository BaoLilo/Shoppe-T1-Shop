/* =========================================================
   SUPPORT-WIDGET.JS — Floating CSKH (customer support) button
   Shown on every page. Depends only on showToast() from script.js.
   ========================================================= */

const SUPPORT_PHONE = "1900 1234";
const SUPPORT_EMAIL  = "support@shopeefood.vn";

document.addEventListener("DOMContentLoaded", ()=>{
  injectSupportWidget();
});

function injectSupportWidget(){
  if(document.getElementById("support-widget")) return;

  const wrap = document.createElement("div");
  wrap.id = "support-widget";
  wrap.innerHTML = `
    <div class="support-panel" id="support-panel">
      <div class="support-panel-head">
        <span>🎧 Hỗ trợ khách hàng</span>
        <button type="button" class="support-close" aria-label="Đóng">✕</button>
      </div>
      <p class="support-panel-sub">Chúng tôi luôn sẵn sàng hỗ trợ bạn 24/7.</p>

      <a class="support-row" href="tel:19001234">
        <span class="support-row-icon">📞</span>
        <span>
          <strong>Gọi hotline</strong>
          <small>${SUPPORT_PHONE}</small>
        </span>
      </a>

      <a class="support-row" href="mailto:${SUPPORT_EMAIL}">
        <span class="support-row-icon">✉️</span>
        <span>
          <strong>Gửi email</strong>
          <small>${SUPPORT_EMAIL}</small>
        </span>
      </a>

      <a class="support-row" href="cskh.html">
        <span class="support-row-icon">❓</span>
        <span>
          <strong>Câu hỏi thường gặp</strong>
          <small>Xem trung tâm CSKH</small>
        </span>
      </a>

      <a class="support-row" href="cskh.html#contact-form">
        <span class="support-row-icon">📝</span>
        <span>
          <strong>Gửi yêu cầu hỗ trợ</strong>
          <small>Chúng tôi phản hồi trong 24h</small>
        </span>
      </a>
    </div>

    <button type="button" class="support-fab" id="support-fab" aria-label="Hỗ trợ khách hàng">
      <span class="support-fab-icon">🎧</span>
    </button>
  `;

  document.body.appendChild(wrap);

  const fab = document.getElementById("support-fab");
  const panel = document.getElementById("support-panel");
  const closeBtn = wrap.querySelector(".support-close");

  fab.addEventListener("click", ()=> panel.classList.toggle("open"));
  closeBtn.addEventListener("click", ()=> panel.classList.remove("open"));

  document.addEventListener("click", (e)=>{
    if(!wrap.contains(e.target)){
      panel.classList.remove("open");
    }
  });
}
