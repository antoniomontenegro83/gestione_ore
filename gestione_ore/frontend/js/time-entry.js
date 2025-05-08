/**
 * Script per la gestione dei turni di lavoro
 * Questo file gestisce le funzionalità dell'inserimento turni
 */

document.addEventListener("DOMContentLoaded", function () {
  // Inizializzazione dell'interfaccia utente
  initUI();
  
  // Caricamento dati iniziali
  caricaDipendenti();
  caricaSedi();
  setTodayDate();
  
  // Configurazione event listeners
  setupEventListeners();
});

/**
 * Inizializza l'interfaccia utente con i dati dell'utente corrente
 */
function initUI() {
  // Visualizza il ruolo dell'utente
  const currentUser = JSON.parse(localStorage.getItem("user") || "{}");
  document.getElementById('userRoleDisplay').textContent = currentUser.ruolo || 'user';
  
  // Inizializza il div di stato come vuoto
  clearStatus();
}

/**
 * Configura gli event listeners per gli elementi della pagina
 */
function setupEventListeners() {
  // Gestione logout
  document.getElementById("logoutBtn").addEventListener("click", function() {
    localStorage.removeItem("user");
    window.location.href = "login.html";
  });
  
  // Gestione invio form
  document.getElementById("shift-form").addEventListener("submit", handleFormSubmit);
}

// Array per memorizzare i dipendenti caricati
let dipendenti = [];

/**
 * Carica l'elenco dei dipendenti dal server
 */
async function caricaDipendenti() {
  try {
    // Usa il percorso specifico per il file list.php nella cartella dipendenti
    const res = await fetch("../backend_gestione_ore/dipendenti/list.php");
    
    if (!res.ok) {
      throw new Error(`Errore HTTP: ${res.status}`);
    }
    
    dipendenti = await res.json();
    aggiornaSelect("");
    
    // Configura il filtro di ricerca dipendenti
    document.getElementById("employee-search").addEventListener("input", function(e) {
      aggiornaSelect(e.target.value);
    });
  } catch (err) {
    console.error("Errore nel caricamento dipendenti:", err);
    updateStatus("Impossibile caricare l'elenco dei dipendenti: " + err.message, "danger");
  }
}

/**
 * Aggiorna il select dei dipendenti in base al filtro di ricerca
 * @param {string} filtro - Testo di ricerca
 */
function aggiornaSelect(filtro) {
  const select = document.getElementById("employee_id");
  select.innerHTML = '<option value="">-- Seleziona --</option>';

  if (filtro.length > 0 && filtro.length < 3) return;

  const filtroLower = filtro.toLowerCase();
  const risultati = dipendenti.filter(function(emp) {
    const descrizione = emp.cognome + " " + emp.nome + " – " + (emp.qualifica || "") + " – " + (emp.sede || "");
    return descrizione.toLowerCase().includes(filtroLower);
  });

  risultati.forEach(function(emp) {
    const opt = document.createElement("option");
    opt.value = emp.id;
    opt.textContent = emp.cognome + " " + emp.nome + " – " + (emp.qualifica || "") + " – " + (emp.sede || "");
    select.appendChild(opt);
  });

  // Seleziona automaticamente se c'è un solo risultato
  if (risultati.length === 1) {
    select.value = risultati[0].id;
  }
}

/**
 * Carica l'elenco delle sedi dal server
 */
async function caricaSedi() {
  try {
    // Usa il percorso specifico per il file list.php nella cartella sedi
    const res = await fetch("../backend_gestione_ore/sedi/list.php");
    
    if (!res.ok) {
      throw new Error(`Errore HTTP: ${res.status}`);
    }
    
    const sedi = await res.json();
    
    const select = document.getElementById("entry_sede");
    select.innerHTML = '<option value="">-- Facoltativa --</option>';
    
    sedi.forEach(function(s) {
      const opt = document.createElement("option");
      opt.value = s.nome;
      opt.textContent = s.nome;
      select.appendChild(opt);
    });
  } catch (err) {
    console.error("Errore nel caricamento sedi:", err);
    updateStatus("Impossibile caricare l'elenco delle sedi. Le funzionalità del form potrebbero essere limitate.", "warning");
  }
}

/**
 * Imposta la data odierna nei campi data
 */
function setTodayDate() {
  const today = new Date().toISOString().split('T')[0];
  document.getElementById('entry_date').value = today;
  document.getElementById('exit_date').value = today;
}

/**
 * Gestisce l'invio del form con validazioni aggiuntive
 * @param {Event} e - Evento submit
 */
async function handleFormSubmit(e) {
  e.preventDefault();
  
  // Ottieni i valori dal form
  const employeeId = document.getElementById('employee_id').value;
  const entryDate = document.getElementById('entry_date').value;
  const entryTime = document.getElementById('entry_time').value;
  const exitDate = document.getElementById('exit_date').value;
  const exitTime = document.getElementById('exit_time').value;
  
  // Pulisci eventuali messaggi di stato precedenti
  clearStatus();
  
  // Validazione campi obbligatori
  if (!employeeId || !entryDate || !entryTime || !exitDate || !exitTime) {
    updateStatus("Errore: Tutti i campi sono obbligatori", "danger");
    return;
  }
  
  // Validazione data/ora
  const entryDateTime = new Date(`${entryDate}T${entryTime}`);
  const exitDateTime = new Date(`${exitDate}T${exitTime}`);
  
  if (isNaN(entryDateTime.getTime()) || isNaN(exitDateTime.getTime())) {
    updateStatus("Errore: Date o orari non validi", "danger");
    return;
  }
  
  // Confronto solo le date (senza considerare l'ora)
  const entryDateOnly = new Date(entryDate);
  const exitDateOnly = new Date(exitDate);
  
  if (exitDateOnly < entryDateOnly) {
    updateStatus("Errore: La data di uscita deve essere uguale o successiva alla data di ingresso", "danger");
    return;
  }
  
  // Confronto data e ora insieme
  if (exitDateTime <= entryDateTime) {
    updateStatus("Errore: L'orario di uscita deve essere successivo all'orario di ingresso", "danger");
    return;
  }
  
  // Verifica durata minima (es. 30 minuti)
  const diffMinutes = (exitDateTime - entryDateTime) / (1000 * 60);
  if (diffMinutes < 30) {
    updateStatus("Errore: La durata del turno deve essere di almeno 30 minuti", "danger");
    return;
  }
  
  // Preparazione dati per l'invio
  const shift = {
    employee_id: employeeId,
    entry_date: entryDate,
    entry_time: entryTime,
    exit_date: exitDate,
    exit_time: exitTime
  };
  
  // Visualizzazione stato di invio
  updateStatus("Invio in corso...", "info");
  
  try {
    const res = await fetch('../backend_gestione_ore/turni/add.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(shift)
    });
    
    // Verifica del tipo di contenuto
    const contentType = res.headers.get("content-type");
    if (contentType && contentType.indexOf("application/json") !== -1) {
      const data = await res.json();
      
      if (data.success) {
        // Pulisci il messaggio "Invio in corso..."
        clearStatus();
        
        // Mostra il modale di successo invece di un alert
        showSuccessModal();
        resetForm();
      } else {
        // Gestione migliorata dei messaggi di errore dal server
        const errorMsg = data.error || "Errore sconosciuto";
        let userMessage = "Errore nell'inserimento: " + errorMsg;
        
        // Messaggi personalizzati per errori specifici
        if (errorMsg.includes("La data/ora di uscita deve essere successiva")) {
          userMessage = "Errore di validazione: " + errorMsg;
        } else if (errorMsg.includes("Esiste già un turno")) {
          userMessage = "Errore: " + errorMsg;
        }
        
        updateStatus(userMessage, "danger");
      }
    } else {
      // Gestione risposta non-JSON
      const text = await res.text();
      console.error("Risposta non JSON (invio turno):", text);
      updateStatus("Errore: Risposta non valida dal server", "danger");
    }
  } catch (error) {
    console.error('Errore:', error);
    updateStatus("Errore durante il salvataggio: " + error.message, "danger");
  }
}

/**
 * Mostra il modale di successo
 */
function showSuccessModal() {
  const successModal = new bootstrap.Modal(document.getElementById('successModal'));
  successModal.show();
  
  // Quando il modale viene chiuso, pulisci lo stato
  document.getElementById('successModal').addEventListener('hidden.bs.modal', function () {
    clearStatus();
  });
}

/**
 * Aggiorna il messaggio di stato
 * @param {string} message - Messaggio da visualizzare
 * @param {string} type - Tipo di messaggio (success, danger, info, warning)
 */
function updateStatus(message, type) {
  const statusElement = document.getElementById('status');
  statusElement.innerHTML = `<div class="alert alert-${type} py-2 mb-0">${message}</div>`;
}

/**
 * Pulisce il messaggio di stato
 */
function clearStatus() {
  const statusElement = document.getElementById('status');
  statusElement.innerHTML = '';
}

/**
 * Resetta il form dopo un invio riuscito
 */
function resetForm() {
  document.getElementById('employee-search').value = "";
  document.getElementById('employee_id').selectedIndex = 0;
  document.getElementById('entry_time').value = "";
  document.getElementById('exit_time').value = "";
  setTodayDate();
}