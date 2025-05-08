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

// Carica le qualifiche dal database
async function caricaQualifiche() {
  try {
    const response = await fetch('../backend_gestione_ore/qualifiche/list.php');
    
    // Ottieni la risposta come testo
    const responseText = await response.text();
    
    // Pulisci la risposta
    const cleanedResponse = cleanResponse(responseText);
    
    // Parsa il JSON
    const qualifiche = JSON.parse(cleanedResponse);
    
    const select = document.getElementById('qualifica');
    qualifiche.forEach(q => {
      const option = document.createElement('option');
      option.value = q.nome || q.qualifica || q.id; // Adatta in base alla struttura dei tuoi dati
      option.textContent = q.nome || q.qualifica || q.id;
      select.appendChild(option);
    });
  } catch (error) {
    console.error("Errore nel caricamento delle qualifiche:", error);
    showAlert("Impossibile caricare le qualifiche. " + error.message, "danger");
  }
}

// Carica le sedi dal database
async function caricaSedi() {
  try {
    const response = await fetch('../backend_gestione_ore/sedi/list.php');
    
    // Ottieni la risposta come testo
    const responseText = await response.text();
    
    // Pulisci la risposta
    const cleanedResponse = cleanResponse(responseText);
    
    // Parsa il JSON
    const sedi = JSON.parse(cleanedResponse);
    
    const select = document.getElementById('sede');
    sedi.forEach(s => {
      const option = document.createElement('option');
      option.value = s.nome || s.sede || s.id; // Adatta in base alla struttura dei tuoi dati
      option.textContent = s.nome || s.sede || s.id;
      select.appendChild(option);
    });
  } catch (error) {
    console.error("Errore nel caricamento delle sedi:", error);
    showAlert("Impossibile caricare le sedi. " + error.message, "danger");
  }
}

// Carica i dati quando il documento è pronto
document.addEventListener('DOMContentLoaded', function() {
  caricaQualifiche();
  caricaSedi();
});

// Gestione del form
document.getElementById("add-form").addEventListener("submit", async (e) => {
  e.preventDefault();
  
  const form = new FormData(e.target);
  const data = Object.fromEntries(form.entries());
  
  try {
    // Modifica: Cambiato percorso da employees a dipendenti
    const res = await fetch('../backend_gestione_ore/dipendenti/add.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    
    // Ottieni la risposta come testo
    const responseText = await res.text();
    
    // Pulisci la risposta
    const cleanedResponse = cleanResponse(responseText);
    
    try {
      // Parsa il JSON
      const out = JSON.parse(cleanedResponse);
      
      if (out.success) {
        showAlert("Dipendente aggiunto con successo!", "success");
        e.target.reset();
        // Ripristina i select
        document.getElementById('qualifica').selectedIndex = 0;
        document.getElementById('sede').selectedIndex = 0;
      } else {
        showAlert("Errore nell'aggiunta: " + (out.error || "Errore sconosciuto"), "danger");
      }
    } catch (jsonError) {
      console.error("Errore nel parsing JSON:", jsonError);
      console.error("Risposta server:", responseText);
      showAlert("Errore nell'analisi della risposta dal server", "danger");
    }
  } catch (error) {
    showAlert("Errore di connessione: " + error.message, "danger");
  }
});