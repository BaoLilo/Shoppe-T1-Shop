/* =========================================================
   VOUCHER.JS — Voucher page logic (voucher2.html only)
   Voucher data is intentionally duplicated from cart.js's
   VOUCHERS map (kept minimal here) so this page has no hard
   dependency on cart.js. Codes must stay in sync with cart.js.
   ========================================================= */

const PAGE_VOUCHERS = [
  { code:"SALE10",   type:"percent", value:10,    title:"Giảm 10% tổng đơn",           desc:"Áp dụng cho mọi đơn hàng, không giới hạn giá trị tối thiểu.", icon:"🔥", memberOnly:false },
  { code:"FREESHIP", type:"ship",    value:0,     title:"Miễn phí vận chuyển",          desc:"Áp dụng cho đơn hàng trong bán kính giao hàng tiêu chuẩn.",   icon:"🚚", memberOnly:false },
  { code:"SALE20K",  type:"amount",  value:20000, title:"Giảm ngay 20.000đ",            desc:"Áp dụng cho đơn hàng từ 50.000đ trở lên.",                    icon:"🎁", memberOnly:false },
  { code:"MEMBER15", type:"percent", value:15,    title:"Giảm 15% dành cho thành viên", desc:"Ưu đãi đặc biệt chỉ dành cho khách hàng đã đăng nhập.",       icon:"👑", memberOnly:true  }
];

document.addEventListener("DOMContentLoaded", ()=>{

  const publicGrid = document.getElementById("public-voucher-grid");
  if(!publicGrid) return; // not on voucher page

  renderVouchers();
});

function renderVouchers(){
  const publicGrid = document.getElementById("public-voucher-grid");
  const memberArea = document.getElementById("member-voucher-area");
  const loggedIn = isLoggedIn();

  publicGrid.innerHTML = "";

  PAGE_VOUCHERS.filter(v => !v.memberOnly).forEach(v=>{
    publicGrid.appendChild(buildVoucherCard(v, true));
  });

  memberArea.innerHTML = "";

  if(loggedIn){
    const grid = document.createElement("div");
    grid.className = "voucher-grid";
    PAGE_VOUCHERS.filter(v => v.memberOnly).forEach(v=>{
      grid.appendChild(buildVoucherCard(v, true));
    });
    memberArea.appendChild(grid);
  }else{
    const locked = document.createElement("div");
    locked.className = "member-locked-box";
    locked.innerHTML = `
      <div class="icon">🔒</div>
      <p>Đăng nhập để mở khóa thêm voucher giảm giá dành riêng cho thành viên.</p>
      <a href="login2.html?redirect=voucher2.html" class="btn btn-primary">Đăng nhập ngay</a>
    `;
    memberArea.appendChild(locked);
  }
}

function buildVoucherCard(v, usable){
  const card = document.createElement("div");
  card.className = "voucher-card";

  card.innerHTML = `
    <div class="voucher-icon">${v.icon}</div>
    <div class="voucher-body">
      <h4>${v.title}</h4>
      <p>${v.desc}</p>
      <p style="margin-top:4px;"><strong>${v.code}</strong></p>
      <div class="voucher-actions">
        <button type="button" class="btn-copy" data-code="${v.code}">Sao chép mã</button>
        <button type="button" class="btn btn-primary btn-sm btn-apply" data-code="${v.code}">Áp dụng vào giỏ hàng</button>
      </div>
    </div>
  `;

  card.querySelector(".btn-copy").addEventListener("click", ()=> copyVoucherCode(v.code));
  card.querySelector(".btn-apply").addEventListener("click", ()=> applyVoucherToCart(v.code));

  return card;
}

function copyVoucherCode(code){
  if(navigator.clipboard && navigator.clipboard.writeText){
    navigator.clipboard.writeText(code)
      .then(()=> showToast("Đã sao chép mã \"" + code + "\".", "success"))
      .catch(()=> fallbackCopy(code));
  }else{
    fallbackCopy(code);
  }
}

function fallbackCopy(code){
  const temp = document.createElement("input");
  temp.value = code;
  document.body.appendChild(temp);
  temp.select();
  document.execCommand("copy");
  document.body.removeChild(temp);
  showToast("Đã sao chép mã \"" + code + "\".", "success");
}

function applyVoucherToCart(code){
  localStorage.setItem("sf_pending_voucher", code);
  showToast("Đang chuyển đến giỏ hàng để áp dụng mã \"" + code + "\"...", "success");
  setTimeout(()=> window.location.href = "cart2.html", 700);
}
