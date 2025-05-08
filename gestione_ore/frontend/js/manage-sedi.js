/**
 * Script per la gestione delle sedi
 */

// Visualizza il ruolo dell'utente
const currentUser = JSON.parse(localStorage.getItem("user") || "{}");
document.getElementById('userRoleDisplay').textContent = currentUser.ruolo || 'user';

// Gestione logout
document.getElementById("logoutBtn").addEventListener("click", function() {
  localStorage.removeItem("user");
  window.location.href = "login.html";
});

// Funzione per mostrare un alert
function showAlert(message, type) {
  // Crea un elemento di alert se non esiste già
  let alertContainer = document.getElementById('alert-container');
  if (!alertContainer) {
    alertContainer = document.createElement('div');
    alertContainer.id = 'alert-container';
    alertContainer.className = 'position-fixed top-0 start-50 translate-middle-x p-3';
    alertContainer.style.zIndex = '1050';
    document.body.appendChild(alertContainer);
  }
  
  const alertEl = document.createElement('div');
  alertEl.className = `alert alert-${type} alert-dismissible fade show`;
  alertEl.innerHTML = `
    ${message}
    <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
  `;
  
  alertContainer.appendChild(alertEl);
  
  // Rimuovi l'alert dopo 3 secondi
  setTimeout(() => {
    alertEl.classList.remove('show');
    setTimeout(() => {
      alertEl.remove();
    }, 300);
  }, 3000);
}

// Funzione per pulire la risposta da eventuali commenti
function cleanResponse(responseText) {
  // Se la risposta inizia con un commento, troviamo l'inizio del JSON ('{' o '[')
  const jsonStart = responseText.indexOf('[');
  if (jsonStart > 0) {
    return responseText.substring(jsonStart);
  }
  return responseText;
}

/**
 * Carica l'elenco delle sedi dal server
 */
async function caricaSedi() {
  try {
    const res = await fetch("../backend_gestione_ore/sedi/list.php");
    
    // Ottieni la risposta come testo
    const responseText = await res.text();
    
    // Pulisci la risposta
    const cleanedResponse = cleanResponse(responseText);
    
    try {
      // Parsa il JSON
      const sedi = JSON.parse(cleanedResponse);
      
      // Aggiorna la lista nell'interfaccia
      const lista = document.getElementById("sedi-list");
      lista.innerHTML = '';
      
      if (sedi.length === 0) {
        const emptyMessage = document.createElement("li");
        emptyMessage.className = "list-group-item text-center text-muted";
        emptyMessage.textContent = "Nessuna sede presente";
        lista.appendChild(emptyMessage);
        return;
      }
      
      sedi.forEach(s => {
        const li = document.createElement("li");
        li.className = "list-group-item d-flex justify-content-between align-items-center";
        li.textContent = s.nome || '';
        
        const btn = document.createElement("button");
        btn.className = "btn btn-sm btn-danger";
        btn.textContent = "Elimina";
        btn.onclick = () => eliminaSede(s.id);
        
        li.appendChild(btn);
        lista.appendChild(li);
      });
    } catch (jsonError) {
      console.error("Errore nel parsing JSON:", jsonError);
      console.error("Risposta server:", responseText);
      showAlert("Errore nel caricamento delle sedi: " + jsonError.message, "danger");
    }
  } catch (error) {
    console.error("Errore di rete:", error);
    showAlert("Errore di connessione: " + error.message, "danger");
  }
}

/**
 * Elimina una sede dal database
 * @param {number} id - ID della sede da eliminare
 */
async function eliminaSede(id) {
  // Chiedi conferma prima di eliminare
  if (!confirm("Sei sicuro di voler eliminare questa sede?")) return;
  
  try {
    const res = await fetch("../backend_gestione_ore/sedi/delete.php", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id })
    });
    
    // Ottieni la risposta come testo
    const responseText = await res.text();
    
    // Pulisci la risposta
    const cleanedResponse = cleanResponse(responseText);
    
    try {
      // Parsa il JSON
      const result = JSON.parse(cleanedResponse);
      
      if (result.success) {
        showAlert("Sede eliminata con successo!", "success");
        // Ricarica l'elenco delle sedi
        caricaSedi();
      } else {
        showAlert("Errore nell'eliminazione: " + (result.error || "Errore sconosciuto"), "danger");
      }
    } catch (jsonError) {
      console.error("Errore nel parsing JSON:", jsonError);
      console.error("Risposta server:", responseText);
      showAlert("Errore nell'analisi della risposta dal server", "danger");
    }
  } catch (error) {
    console.error("Errore di rete:", error);
    showAlert("Errore di connessione: " + error.message, "danger");
  }
}

// Gestione del form per l'aggiunta di una nuova sede
document.getElementById("add-sede-form").addEventListener("submit", async (e) => {
  e.preventDefault();
  
  // Ottieni il nome della sede dal form
  const nome = document.getElementById("sede-nome").value.trim();
  if (!nome) return;
  
  try {
    const res = await fetch("../backend_gestione_ore/sedi/add.php", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nome })
    });
    
    // Ottieni la risposta come testo
    const responseText = await res.text();
    
    // Pulisci la risposta
    const cleanedResponse = cleanResponse(responseText);
    
    try {
      // Parsa il JSON
      const result = JSON.parse(cleanedResponse);
      
      if (result.success) {
        showAlert("Sede aggiunta con successo!", "success");
        // Resetta il campo di input
        document.getElementById("sede-nome").value = '';
        
        // Ricarica l'elenco delle sedi
        caricaSedi();
      } else {
        showAlert("Errore nell'aggiunta: " + (result.error || "Errore sconosciuto"), "danger");
      }
    } catch (jsonError) {
      console.error("Errore nel parsing JSON:", jsonError);
      console.error("Risposta server:", responseText);
      showAlert("Errore nell'analisi della risposta dal server", "danger");
    }
  } catch (error) {
    console.error("Errore di rete:", error);
    showAlert("Errore di connessione: " + error.message, "danger");
  }
});

// Carica le sedi quando il documento è pronto
document.addEventListener('DOMContentLoaded', () => {
  caricaSedi();
});