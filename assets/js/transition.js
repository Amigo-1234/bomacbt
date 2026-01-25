document.addEventListener("DOMContentLoaded", () => {
  const links = document.querySelectorAll("a[href]");

  const overlay = document.getElementById("page-transition");

  links.forEach(link => {
    link.addEventListener("click", e => {
      const target = link.getAttribute("href");

      if (target.startsWith("#") || target.startsWith("http")) return;

      e.preventDefault();
      overlay.classList.add("active");

      setTimeout(() => {
        window.location.href = target;
      }, 600);
    });
  });
});
