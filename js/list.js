document.addEventListener("DOMContentLoaded", async () => {
  try {
    const res = await fetch("./data/levels.json");
    const levels = await res.json();
    const container = document.getElementById("list-container");

    container.innerHTML = levels.map(level => `
      <div class="card mb-3 p-3 bg-light">
        <div class="row g-0 align-items-center">
          <div class="col-md-3">
            <iframe width="100%" height="150" src="${level.youtube}" frameborder="0" allowfullscreen></iframe>
          </div>
          <div class="col-md-9 ps-3">
            <h3>#${level.position} - ${level.name}</h3>
            <h5>By ${level.author} | Verified by ${level.verifier}</h5>
            <p class="mb-1"><strong>ID:</strong> ${level.id}</p>
            <details>
              <summary class="btn btn-sm btn-outline-primary">View Records (${level.records.length})</summary>
              <ul class="mt-2 list-group">
                ${level.records.map(r => `
                  <li class="list-group-item d-flex justify-content-between align-items-center">
                    <a href="${r.link}" target="_blank">${r.user}</a>
                    <span>${r.percent}% (${r.hz})</span>
                  </li>
                `).join("")}
              </ul>
            </details>
          </div>
        </div>
      </div>
    `).join("");
  } catch (err) {
    console.error("Failed to load level list:", err);
  }
});