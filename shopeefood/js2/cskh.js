/* =========================================================
   CSKH.JS — Customer support page logic (cskh2.html only)
   FAQ accordion + contact form (demo: no real backend, just
   validates and shows a success toast).
   ========================================================= */

document.addEventListener("DOMContentLoaded", ()=>{

  const faqList = document.getElementById("faq-list");
  if(!faqList) return; // not on CSKH page

  initFaqAccordion();
  initContactForm();
  scrollToContactIfHashPresent();
});

/* ---------------------------------------------------------
   FAQ ACCORDION
--------------------------------------------------------- */
function initFaqAccordion(){
  const items = document.querySelectorAll(".faq-item");

  items.forEach(item=>{
    const question = item.querySelector(".faq-question");

    question.addEventListener("click", ()=>{
      const isOpen = item.classList.contains("open");

      items.forEach(i => i.classList.remove("open"));

      if(!isOpen){
        item.classList.add("open");
      }
    });
  });
}

/* ---------------------------------------------------------
   CONTACT FORM
--------------------------------------------------------- */
function initContactForm(){
  const form = document.getElementById("cskh-form");
  if(!form) return;

  // Pre-fill name/contact if the user is logged in
  const user = getCurrentUser ? getCurrentUser() : null;
  if(user){
    const contactInput = document.getElementById("cskh-contact");
    if(contactInput && user.email) contactInput.value = user.email;
  }

  form.addEventListener("submit", handleContactSubmit);
}

function validateCskhField(input, message){
  const field = input.closest(".field");
  const isValid = input.value.trim() !== "";

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

function handleContactSubmit(e){
  e.preventDefault();

  const name = document.getElementById("cskh-name");
  const contact = document.getElementById("cskh-contact");
  const message = document.getElementById("cskh-message");

  const nameOk = validateCskhField(name, "Vui lòng nhập họ và tên.");
  const contactOk = validateCskhField(contact, "Vui lòng nhập email hoặc số điện thoại.");
  const messageOk = validateCskhField(message, "Vui lòng nhập nội dung yêu cầu.");

  if(!(nameOk && contactOk && messageOk)){
    showToast("Vui lòng kiểm tra lại thông tin.", "error");
    return;
  }

  // Demo only: no backend. Just confirm to the user.
  showToast("Đã gửi yêu cầu hỗ trợ! Chúng tôi sẽ phản hồi trong 24h.", "success");
  e.target.reset();
}

/* ---------------------------------------------------------
   Auto-scroll to the contact form if arriving via #contact-form
--------------------------------------------------------- */
function scrollToContactIfHashPresent(){
  if(window.location.hash === "#contact-form"){
    const el = document.getElementById("contact-form");
    if(el) setTimeout(()=> el.scrollIntoView({ behavior:"smooth" }), 300);
  }
}
