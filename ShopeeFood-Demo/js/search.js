/* =========================================================
   SEARCH.JS — Realtime search + category filter
   Used on: menu.html (full) and index.html (header search box)
   ========================================================= */

document.addEventListener("DOMContentLoaded", ()=>{

  initHeaderSearch();
  initMenuSearch();
  initCategoryFilter();
  applySearchFromURL();
});

/* ---------------------------------------------------------
   HEADER SEARCH BOX (present on every page)
   Enter / click search icon -> go to menu.html?q=keyword
--------------------------------------------------------- */
function initHeaderSearch(){
  const form = document.querySelector(".search-wrap");
  if(!form) return;

  const input = form.querySelector("input");
  const button = form.querySelector("button");

  function goSearch(){
    const keyword = input.value.trim();
    const onMenuPage = window.location.pathname.endsWith("menu.html");

    if(onMenuPage){
      filterCards(keyword);
    }else{
      window.location.href = "menu.html?q=" + encodeURIComponent(keyword);
    }
  }

  if(button) button.addEventListener("click", goSearch);
  input.addEventListener("keyup", (e)=>{
    if(e.key === "Enter") goSearch();
  });
}

/* ---------------------------------------------------------
   Pre-fill menu search box using ?q= param from header search
--------------------------------------------------------- */
function applySearchFromURL(){
  const params = new URLSearchParams(window.location.search);
  const q = params.get("q");
  const realtimeInput = document.getElementById("menu-search");

  if(q && realtimeInput){
    realtimeInput.value = q;
    filterCards(q);
  }
}

/* ---------------------------------------------------------
   MENU PAGE — Realtime search box (#menu-search)
--------------------------------------------------------- */
function initMenuSearch(){
  const input = document.getElementById("menu-search");
  if(!input) return;

  input.addEventListener("keyup", ()=>{
    filterCards(input.value);
  });
}

function filterCards(keyword){
  const kw = (keyword || "").toLowerCase().trim();
  const cards = document.querySelectorAll(".food-grid .card");
  const grid = document.querySelector(".food-grid");
  let visibleCount = 0;

  cards.forEach(card=>{
    const name = card.querySelector("h3").textContent.toLowerCase();
    const matches = name.indexOf(kw) > -1;
    card.style.display = matches ? "flex" : "none";
    if(matches) visibleCount++;
  });

  toggleEmptyState(grid, visibleCount);
}

function toggleEmptyState(grid, visibleCount){
  if(!grid) return;

  let empty = grid.querySelector(".empty-state");

  if(visibleCount === 0){
    if(!empty){
      empty = document.createElement("div");
      empty.className = "empty-state";
      empty.innerHTML = `<div class="icon">🔍</div><p>Không tìm thấy món ăn phù hợp.</p>`;
      grid.appendChild(empty);
    }
  }else if(empty){
    empty.remove();
  }
}

/* ---------------------------------------------------------
   MENU PAGE — Category filter chips (.filter-chip)
--------------------------------------------------------- */
function initCategoryFilter(){
  const chips = document.querySelectorAll(".filter-chip");
  if(!chips.length) return;

  chips.forEach(chip=>{
    chip.addEventListener("click", ()=>{
      chips.forEach(c => c.classList.remove("active"));
      chip.classList.add("active");

      const category = chip.dataset.category;
      const cards = document.querySelectorAll(".food-grid .card");
      const grid = document.querySelector(".food-grid");
      let visibleCount = 0;

      cards.forEach(card=>{
        const matches = category === "all" || card.dataset.category === category;
        card.style.display = matches ? "flex" : "none";
        if(matches) visibleCount++;
      });

      // reset the realtime search box when switching category
      const input = document.getElementById("menu-search");
      if(input) input.value = "";

      toggleEmptyState(grid, visibleCount);
    });
  });
}
