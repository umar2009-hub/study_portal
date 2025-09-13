document.addEventListener("DOMContentLoaded", () => {
  const materials = JSON.parse(document.getElementById("materials-data").textContent || "{}");
  const subjectCards = Array.from(document.querySelectorAll(".subject-card"));
  const waterfall = document.getElementById("waterfall");
  const fileList = document.getElementById("file-list");
  const title = document.getElementById("waterfall-title");
  const closeBtn = document.getElementById("close-waterfall");

  // Add tiny hover tilt (mousemove) for each card
  subjectCards.forEach((card, i) => {
    card.addEventListener("mousemove", e => {
      const rect = card.getBoundingClientRect();
      const cx = rect.left + rect.width/2;
      const cy = rect.top + rect.height/2;
      const dx = (e.clientX - cx)/rect.width;
      const dy = (e.clientY - cy)/rect.height;
      card.style.transform = `translateY(-6px) rotateX(${dy*4}deg) rotateY(${dx*6}deg)`;
    });
    card.addEventListener("mouseleave", () => card.style.transform = "");
  });

  // Click -> open waterfall for that subject
  subjectCards.forEach(card => {
    card.addEventListener("click", () => {
      const subject = card.dataset.subject;
      openWaterfall(subject);
    });
  });

  // Open waterfall: populate file list with staggered animations
  function openWaterfall(subject) {
    const files = materials[subject] || [];
    title.textContent = subject + " — Materials";
    fileList.innerHTML = "";

    // If no files
    if (!files.length) {
      const li = document.createElement("li");
      li.className = "file-item show";
      li.innerHTML = `<div class="file-name">No materials yet</div>`;
      fileList.appendChild(li);
    } else {
      files.forEach((relPath, idx) => {
        const li = document.createElement("li");
        li.className = "file-item";
        const filename = relPath.split("/").pop();
        li.innerHTML = `
          <div style="display:flex;align-items:center;gap:12px">
            <div class="icon-file">📄</div>
            <div>
              <div class="file-name">${filename}</div>
              <div class="file-meta">${relPath}</div>
            </div>
          </div>
          <div>
            <a class="file-link" href="/uploads/${encodeURI(relPath)}" target="_blank" rel="noopener">Open</a>
          </div>
        `;
        fileList.appendChild(li);

        // Staggered micro-animation
        setTimeout(()=> li.classList.add("show"), 90*idx);
      });
    }

    // show waterfall with gentle scale/fade
    waterfall.classList.add("show");
    waterfall.setAttribute("aria-hidden","false");
    // scroll into view (desktop)
    setTimeout(()=> waterfall.scrollIntoView({behavior:"smooth", block:"center"}), 50);
  }

  // close
  closeBtn.addEventListener("click", closeWaterfall);
  waterfall.addEventListener("click", (e) => {
    if (e.target === waterfall) closeWaterfall();
  });
  function closeWaterfall(){
    waterfall.classList.remove("show");
    waterfall.setAttribute("aria-hidden","true");
    // remove file-list content (optional)
    setTimeout(()=> fileList.innerHTML = "", 350);
  }

  // Page transition - small dissolve when loading
  window.addEventListener("load", ()=>{
    document.body.style.transition = "background .6s";
  });
});
