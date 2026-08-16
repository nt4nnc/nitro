function getPointsForPosition(position) {
  const pointScale = {
    1: 100,
    2: 75,
    3: 50,
    4: 35,
    5: 25
  };
  return pointScale[position] || 10;
}

async function loadListData() {
  try {
    const response = await fetch('data/levels.json');
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    const levels = await response.json();

    renderList(levels);
    renderLeaderboard(levels);
  } catch (err) {
    console.error("Error loading list data:", err);
    document.getElementById('list-container').innerHTML = 
      `<div class="alert alert-danger">Failed to load level list data (${err.message}). Check data/levels.json file path.</div>`;
  }
}

function renderList(levels) {
  const container = document.getElementById('list-container');
  container.innerHTML = '';

  // Remove any previously appended modals from document.body to avoid duplicates
  document.querySelectorAll('.custom-modal-wrapper').forEach(el => el.remove());

  levels.forEach((level) => {
    const points = getPointsForPosition(level.position);
    const modalId = `modal-${level.id}`;

    let recordsHTML = '<p class="text-muted mb-0">No records submitted yet.</p>';
    if (level.records && level.records.length > 0) {
      recordsHTML = '<ul class="list-group list-group-flush">';
      level.records.forEach(r => {
        recordsHTML += `
          <li class="list-group-item d-flex justify-content-between align-items-center">
            <div>
              <strong>${r.user}</strong> (${r.percent}% - ${r.hz})
            </div>
            <a href="${r.link}" target="_blank" class="btn btn-sm btn-primary">Proof</a>
          </li>`;
      });
      recordsHTML += '</ul>';
    }

    // 1. Render Card Panel
    const card = document.createElement('div');
    card.className = 'card mb-3 p-3';
    card.innerHTML = `
      <div class="row g-0 align-items-center">
        <div class="col-md-4">
          <div class="ratio ratio-16x9">
            <iframe src="${level.youtube}" title="${level.name}" allowfullscreen></iframe>
          </div>
        </div>
        <div class="col-md-8">
          <div class="card-body">
            <h3 class="card-title">#${level.position} - ${level.name}</h3>
            <p class="card-text mb-1">By <strong>${level.author}</strong> | Verified by <strong>${level.verifier}</strong></p>
            <p class="card-text mb-1"><small>Level ID: ${level.id} | <strong>${points} Points</strong></small></p>
            
            <button class="btn btn-primary btn-sm mt-2" data-bs-toggle="modal" data-bs-target="#${modalId}">
              View Records (${level.records ? level.records.length : 0})
            </button>
          </div>
        </div>
      </div>
    `;
    container.appendChild(card);

    // 2. Render Modal DIRECTLY to document.body (prevents stacking context/backdrop lockup)
    const modalDiv = document.createElement('div');
    modalDiv.className = 'custom-modal-wrapper';
    modalDiv.innerHTML = `
      <div class="modal fade" id="${modalId}" tabindex="-1" aria-hidden="true">
        <div class="modal-dialog modal-dialog-centered">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title">${level.name} - Records</h5>
              <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div class="modal-body">
              ${recordsHTML}
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-secondary btn-sm" data-bs-dismiss="modal">Close</button>
            </div>
          </div>
        </div>
      </div>
    `;
    document.body.appendChild(modalDiv);
  });
}

function renderLeaderboard(levels) {
  const leaderboardContainer = document.getElementById('leaderboard-container');
  const players = {};

  levels.forEach(level => {
    const points = getPointsForPosition(level.position);

    if (level.records) {
      level.records.forEach(record => {
        if (!players[record.user]) {
          players[record.user] = { points: 0, completions: 0 };
        }
        if (record.percent === 100) {
          players[record.user].points += points;
          players[record.user].completions += 1;
        }
      });
    }

    if (level.verifier) {
      const alreadyHasRecord = level.records && level.records.some(r => r.user === level.verifier && r.percent === 100);
      if (!alreadyHasRecord) {
        if (!players[level.verifier]) {
          players[level.verifier] = { points: 0, completions: 0 };
        }
        players[level.verifier].points += points;
        players[level.verifier].completions += 1;
      }
    }
  });

  const sortedPlayers = Object.keys(players)
    .map(name => ({ name, ...players[name] }))
    .sort((a, b) => b.points - a.points);

  if (sortedPlayers.length === 0) {
    leaderboardContainer.innerHTML = '<p class="text-center text-muted mb-0">No records available for leaderboards.</p>';
    return;
  }

  let leaderboardHTML = `
    <table class="table table-hover mb-0">
      <thead>
        <tr>
          <th>#</th>
          <th>Player</th>
          <th>Points</th>
          <th>100% Records</th>
        </tr>
      </thead>
      <tbody>
  `;

  sortedPlayers.forEach((player, idx) => {
    leaderboardHTML += `
      <tr>
        <td><strong>#${idx + 1}</strong></td>
        <td>${player.name}</td>
        <td><strong>${player.points}</strong> pts</td>
        <td>${player.completions}</td>
      </tr>
    `;
  });

  leaderboardHTML += `</tbody></table>`;
  leaderboardContainer.innerHTML = leaderboardHTML;
}

document.addEventListener('DOMContentLoaded', loadListData);
