/* =========================================================
   SLIDER.JS — Hero banner slider (index.html only)
   ========================================================= */

document.addEventListener("DOMContentLoaded", ()=>{

  const slides = document.querySelectorAll(".slide");
  const dotsWrap = document.querySelector(".slider-dots");
  const prevBtn = document.querySelector(".slider-arrow.prev");
  const nextBtn = document.querySelector(".slider-arrow.next");

  if(!slides.length) return;

  let current = 0;
  let timer = null;
  const AUTO_MS = 5000;

  // Build dots dynamically based on number of slides
  slides.forEach((_, i)=>{
    const dot = document.createElement("button");
    if(i === 0) dot.classList.add("active");
    dot.setAttribute("aria-label", "Chuyển đến slide " + (i+1));
    dot.addEventListener("click", ()=> goTo(i));
    dotsWrap.appendChild(dot);
  });

  const dots = dotsWrap.querySelectorAll("button");

  function goTo(index){
    slides[current].classList.remove("active");
    dots[current].classList.remove("active");

    current = (index + slides.length) % slides.length;

    slides[current].classList.add("active");
    dots[current].classList.add("active");
  }

  function next(){ goTo(current + 1); }
  function prev(){ goTo(current - 1); }

  function startAuto(){
    timer = setInterval(next, AUTO_MS);
  }

  function stopAuto(){
    clearInterval(timer);
  }

  if(nextBtn) nextBtn.addEventListener("click", ()=>{ next(); stopAuto(); startAuto(); });
  if(prevBtn) prevBtn.addEventListener("click", ()=>{ prev(); stopAuto(); startAuto(); });

  const heroEl = document.querySelector(".hero-slider");
  if(heroEl){
    heroEl.addEventListener("mouseenter", stopAuto);
    heroEl.addEventListener("mouseleave", startAuto);
  }

  startAuto();
});
