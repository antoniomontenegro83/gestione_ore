
document.addEventListener("DOMContentLoaded", caricaUtenti);

async function caricaUtenti() {
  const res = await fetch("../backend_gestione_ore/users/list.php");
  const utenti = await res.json();
  const tbody = document.querySelector("#users-table tbody");
  tbody.innerHTML = "";
  utenti.forEach(u => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${u.id}</td>
      <td>${u.username}</td>
      <td>${u.ruolo}</td>
      <td>
        <button class='btn btn-sm btn-warning me-1' onclick="modificaUtente(${u.id}, '${u.username}', '${u.ruolo}')">Modifica</button>
        <button class='btn btn-sm btn-danger' onclick="eliminaUtente(${u.id})">Elimina</button>
      </td>
    `;
    tbody.appendChild(row);
  });
}

document.getElementById("user-form").addEventListener("submit", async function(e) {
  e.preventDefault();
  const id = document.getElementById("userId").value;
  const username = document.getElementById("username").value;
  const password = document.getElementById("password").value;
  const ruolo = document.getElementById("ruolo").value;

  const url = id ? "../backend_gestione_ore/users/update.php" : "../backend_gestione_ore/users/add.php";
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ id, username, password, ruolo })
  });

  const result = await res.json();
  if (result.success) {
    caricaUtenti();
    resetForm();
  } else {
    alert("Errore: " + result.error);
  }
});

function modificaUtente(id, username, ruolo) {
  document.getElementById("userId").value = id;
  document.getElementById("username").value = username;
  document.getElementById("password").value = "";
  document.getElementById("ruolo").value = ruolo;
}

function eliminaUtente(id) {
  if (!confirm("Confermi eliminazione utente?")) return;
  fetch("../backend_gestione_ore/users/delete.php?id=" + id)
    .then(res => res.json())
    .then(result => {
      if (result.success) {
        caricaUtenti();
      } else {
        alert("Errore: " + result.error);
      }
    });
}

function resetForm() {
  document.getElementById("userId").value = "";
  document.getElementById("username").value = "";
  document.getElementById("password").value = "";
  document.getElementById("ruolo").value = "user";
}
