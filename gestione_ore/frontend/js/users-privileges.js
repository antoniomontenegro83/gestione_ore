// Codice JavaScript per la gestione dei privilegi utenti
document.addEventListener("DOMContentLoaded", function() {
  console.log("DOM caricato");
  
  // Funzione per caricare gli utenti
  async function caricaUtenti() {
    try {
      const response = await fetch("../backend_gestione_ore/users/list.php");
      const utenti = await response.json();
      console.log("Dati ricevuti:", utenti.length, "utenti");
      
      // Verifica se l'elemento tbody esiste
      const tbody = document.querySelector("#users-table tbody");
      if (!tbody) {
        console.error("Elemento tbody non trovato!");
        return;
      }
      
      // Svuota la tabella
      tbody.innerHTML = "";
      
      // Popola la tabella con i dati
      utenti.forEach(utente => {
        const row = document.createElement("tr");
        row.innerHTML = `
          <td>${utente.id}</td>
          <td>${utente.username}</td>
          <td>${utente.ruolo}</td>
          <td>
            <button class="btn btn-sm btn-warning me-1" onclick="modificaUtente(${utente.id}, '${utente.username}', '${utente.ruolo}')">Modifica</button>
            <button class="btn btn-sm btn-danger" onclick="eliminaUtente(${utente.id})">Elimina</button>
          </td>
        `;
        tbody.appendChild(row);
      });
    } catch (error) {
      console.error("Errore nel caricamento degli utenti:", error);
      alert("Errore nel caricamento degli utenti: " + error.message);
    }
  }
  
  // Esegui il caricamento
  caricaUtenti();
});

// Funzioni di base per gestire le azioni dei pulsanti
function modificaUtente(id, username, ruolo) {
  console.log("Modifica utente:", id, username, ruolo);
  document.getElementById("userId").value = id;
  document.getElementById("username").value = username;
  document.getElementById("password").value = "";
  document.getElementById("ruolo").value = ruolo;
}

function eliminaUtente(id) {
  console.log("Richiesta eliminazione utente:", id);
  if (confirm("Sei sicuro di voler eliminare questo utente?")) {
    fetch("../backend_gestione_ore/users/delete.php?id=" + id)
      .then(response => response.json())
      .then(result => {
        if (result.success) {
          alert("Utente eliminato con successo");
          location.reload();
        } else {
          alert("Errore nell'eliminazione: " + (result.error || "Errore sconosciuto"));
        }
      })
      .catch(error => {
        console.error("Errore di rete:", error);
        alert("Errore di connessione: " + error.message);
      });
  }
}

// Funzione per il form di salvataggio
document.getElementById("formUtente").addEventListener("submit", function(e) {
  e.preventDefault();
  console.log("Form inviato");
  
  const id = document.getElementById("userId").value;
  const username = document.getElementById("username").value;
  const password = document.getElementById("password").value;
  const ruolo = document.getElementById("ruolo").value;
  
  if (!username) {
    alert("Username obbligatorio");
    return;
  }
  
  if (!id && !password) {
    alert("Password obbligatoria per nuovi utenti");
    return;
  }
  
  const url = id ? "../backend_gestione_ore/users/update.php" : "../backend_gestione_ore/users/add.php";
  const payload = { id, username, ruolo };
  if (password) {
    payload.password = password;
  }
  
  fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  })
  .then(response => response.json())
  .then(result => {
    if (result.success) {
      alert("Operazione completata con successo");
      location.reload();
    } else {
      alert("Errore: " + (result.error || "Errore sconosciuto"));
    }
  })
  .catch(error => {
    console.error("Errore di rete:", error);
    alert("Errore di connessione: " + error.message);
  });
});

// Funzione per resettare il form
function resetForm() {
  document.getElementById("userId").value = "";
  document.getElementById("username").value = "";
  document.getElementById("password").value = "";
  document.getElementById("ruolo").value = "user";
}