/* =========================================================
   LOGIN.JS — Login page logic (login2.html only)
   ========================================================= */

const DEMO_ACCOUNT = { email: "admin@gmail.com", password: "123456" };

document.addEventListener("DOMContentLoaded", ()=>{

  const form = document.getElementById("login-form");
  if(!form) return; // not on login page

  form.addEventListener("submit", handleLogin);

  const toggle = document.querySelector(".toggle-pass");
  if(toggle){
    toggle.addEventListener("click", togglePasswordVisibility);
  }

  // Social login buttons (demo only — no real OAuth without internet)
  document.querySelectorAll(".btn-social").forEach(btn=>{
    btn.addEventListener("click", ()=>{
      showToast("Tính năng đăng nhập qua " + btn.dataset.provider + " chỉ mang tính minh họa.", "default");
    });
  });
});

function togglePasswordVisibility(){
  const input = document.getElementById("password");
  const icon = document.querySelector(".toggle-pass");
  const isPassword = input.type === "password";

  input.type = isPassword ? "text" : "password";
  icon.textContent = isPassword ? "🙈" : "👁";
}

function validateLoginField(input, message){
  const field = input.closest(".field");
  const isValid = input.value.trim() !== "" && input.checkValidity();

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

function handleLogin(e){
  e.preventDefault();

  const emailInput = document.getElementById("email");
  const passInput = document.getElementById("password");

  const emailOk = validateLoginField(emailInput, "Vui lòng nhập email hợp lệ.");
  const passOk = validateLoginField(passInput, "Mật khẩu phải có ít nhất 6 ký tự.") &&
                 passInput.value.trim().length >= 6;

  if(!(emailOk && passOk)){
    showToast("Vui lòng kiểm tra lại thông tin đăng nhập.", "error");
    return;
  }

  const email = emailInput.value.trim();
  const password = passInput.value.trim();

  if(email === DEMO_ACCOUNT.email && password === DEMO_ACCOUNT.password){
    localStorage.setItem(USER_KEY, JSON.stringify({ email, name:"Khách hàng ShopeeFood" }));
    showToast("Đăng nhập thành công! Đang chuyển hướng...", "success");

    const params = new URLSearchParams(window.location.search);
    const redirectTo = params.get("redirect") || "index2.html";

    setTimeout(()=> window.location.href = redirectTo, 1200);
  }else{
    showToast("Sai email hoặc mật khẩu!", "error");
    passInput.closest(".field").classList.add("has-error","shake");
    setTimeout(()=> passInput.closest(".field").classList.remove("shake"), 500);
  }
}
