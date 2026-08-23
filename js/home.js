/* ============================================================
   HOME — scroll reveal
   ============================================================ */

document.addEventListener("DOMContentLoaded", () => {
  const revealEls = document.querySelectorAll(".reveal");
  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("in-view");
          io.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.15 }
  );
  revealEls.forEach((el) => io.observe(el));

  // stagger children index for reveal-stagger containers
  document.querySelectorAll(".reveal-stagger").forEach((group) => {
    [...group.children].forEach((child, i) => child.style.setProperty("--i", i));
  });

  // Redirect logged-in users straight to dashboard from nav CTA if desired
  const nav = document.querySelector(".nav");
  if (nav) {
    window.addEventListener("scroll", () => {
      if (window.scrollY > 8) nav.style.boxShadow = "0 4px 20px rgba(0,0,0,0.25)";
      else nav.style.boxShadow = "none";
    });
  }
});
