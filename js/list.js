// Point allocation per position
function getPointsForPosition(position) {
  const pointScale = {
    1: 100,
    2: 75,
    3: 50,
    4: 35,
    5: 25
  };
  return pointScale[position] || 10; // Default 10 points for position 6+
}

async function loadListData() {
  try {
    const response = await fetch('data/list.json');
    const levels = await response.json();

    renderList(levels);
    renderLeaderboard(levels);
  } catch (err) {
    console.error("Error loading level data:", err);
  }
}

// Render level list panels
function renderList(levels) {
  const container = document.getElementById('list-container');
  container.innerHTML = '';

  levels.forEach((level, index) => {
    const points = getPointsForPosition(level.position);
    const modalId = `modal-${level.id}`;

    // Build modal record list
    let recordsHTML = '<p class="text-muted">No records submitted yet.</p>';
    if (level.records && level.records.length > 0) {
      recordsHTML = '<ul class="list-group list-group-flush">';
      level.records.forEach(r => {
        recordsHTML += `
          <li class="list-group-item d-flex justify-content-between align-items-center">
            <div>
              <strong>${r.user}</strong> (${r.percent}% - ${r.hz})
            </div>
            <a href="${r.link}" target="_blank" class="btn btn-sm btn-outline-primary">Proof</a>
          </li>`;
      });
      recordsHTML += '</ul>';
    }

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
              View Records (${level.records.length})
            </button>
          </div>
        </div>
      </div>

      <!-- Modal -->
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
          </div>
        </div>
      </div>
    `;

    container.appendChild(card);
  });
}

// Compute & render player leaderboards based on records and verifications
function renderLeaderboard(levels) {
  const leaderboardContainer = document.getElementById('leaderboard-container');
  const players = {};

  levels.forEach(level => {
    const points = getPointsForPosition(level.position);

    // Process record completions
    level.records.forEach(record => {
      if (!players[record.user]) {
        players[record.user] = { points: 0, completions: 0, verifications: 0 };
      }
      if (record.percent === 100) {
        players[record.user].points += points;
        players[record.user].completions += 1;
      }
    });

    // Process verifier (if not already counted in records)
    if (level.verifier) {
      if (!players[level.verifier]) {
        players[level.verifier] = { points: 0, completions: 0, verifications: 0 };
      }
      players[level.verifier].verifications += 1;
    }
  });

  // Sort players by total points descending
  const sortedPlayers = Object.keys(players)
    .map(name => ({ name, ...players[name] }))
    .sort((a, b) => b.points - a.points);

  let leaderboardHTML = `
    <table class="table table-transparent text-white">
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
