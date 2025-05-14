/**
 * Script per la gestione degli utenti
 */
import { Auth, Api, Notifications } from './main.js';
import AuthCommon from './auth-common.js';

// Variabile per tracciare lo stato di caricamento
let isLoading = false;

// Inizializzazione all'avvio
document.addEventListener('DOMContentLoaded', async () => {
  console.log("DOM caricato, avvio gestione utenti...");
  
  // Verifico ruolo admin
  verificaAccessoAdmin();
  
  // Carica utenti
  await caricaUtenti();
  
  // Setup event listeners
  setupEventListeners();
});

/**
 * Verifica che l'utente sia un admin
 */
function verificaAccessoAdmin() {
  console.log("Verifica accesso admin...");
  const user = Auth.getCurrentUser();
  
  if (!user || user.ruolo !== 'admin') {
    console.error("Accesso non autorizzato");
    Notifications.error("Accesso riservato agli amministratori");
    setTimeout(() => {
      window.location.href = 'dashboard.html';
    }, 2000);
  }
}

/**
 * Configura gli event listener
 */
function setupEventListeners() {
  console.log("Configurazione event listeners...");
  
  // Form per aggiunta/modifica utente
  const form = document.getElementById("user-form");
  if (form) {
    form.addEventListener("submit", handleSubmitUser);
  }
}

/**
 * Carica l'elenco degli utenti dal server
 */
async function caricaUtenti() {
  // Evita caricamenti multipli
  if (isLoading) return;
  isLoading = true;
  
  try {
    console.log("Caricamento utenti in corso...");
    
    // Ottieni i dati tramite l'API
    const utenti = await Api.get("users/list.php");
    console.log("Utenti ottenuti:", utenti.length);
    
    const tbody = document.querySelector("#users-table tbody");
    if (!tbody) {
      console.error("Elemento tbody non trovato!");
      return;
    }
    
    // Svuota la tabella prima di aggiungervi dati
    tbody.innerHTML = '';

    // Aggiunge ogni utente alla tabella
    utenti.forEach(u => {
      const row = document.createElement("tr");
      row.innerHTML = `
        <td>${u.id}</td>
        <td>${u.username || ''}</td>
        <td>${u.ruolo || ''}</td>
        <td>
          <button class='btn btn-sm btn-warning me-1' onclick="modificaUtente(${u.id}, '${u.username}', '${u.ruolo}')">Modifica</button>
          <button class='btn btn-sm btn-danger' onclick="eliminaUtente(${u.id})">Elimina</button>
        </td>
      `;
      tbody.appendChild(row);
    });
    
    console.log("Utenti caricati con successo");
  } catch (error) {
    console.error("Errore nel caricamento degli utenti:", error);
    Notifications.error("Errore nel caricamento degli utenti: " + Api.handleError(error));
  } finally {
    isLoading = false;
  }
}

/**
 * Gestisce l'invio del form per aggiungere/modificare un utente
 * @param {Event} e - Evento submit
 */
async function handleSubmitUser(e) {
  e.preventDefault();
  
  // Evita invii multipli
  if (isLoading) return;
  isLoading = true;
  
  try {
    // Raccogli i dati dal form
    const id = document.getElementById("userId").value;
    const username = document.getElementById("username").value.trim();
    const password = document.getElementById("password").value;
    const ruolo = document.getElementById("ruolo").value;
    
    console.log(`${id ? 'Modifica' : 'Aggiunta'} utente: ${username}`);
    
    // Validazione
    if (!username) {
      Notifications.warning("Username obbligatorio");
      return;
    }
    
    if (!id && !password) {
      Notifications.warning("Password obbligatoria per i nuovi utenti");
      return;
    }
    
    // Prepara i dati da inviare
    const userData = { id, username, ruolo };
    if (password) userData.password = password;
    
    // Usa l'API per inviare i dati
    const url = id ? "users/update.php" : "users/add.php";
    const result = await Api.post(url, userData);
    
    if (result.success) {
      Notifications.success(`Utente ${id ? 'modificato' : 'aggiunto'} con successo!`);
      await caricaUtenti();
      resetForm();
    } else {
      Notifications.error("Errore: " + (result.error || "Errore sconosciuto"));
    }
  } catch (error) {
    console.error("Errore durante il salvataggio:", error);
    Notifications.error("Errore durante il salvataggio: " + Api.handleError(error));
  } finally {
    isLoading = false;
  }
}

/**
 * Imposta il form per la modifica di un utente
 * @param {number} id - ID dell'utente
 * @param {string} username - Nome utente
 * @param {string} ruolo - Ruolo utente
 */
function modificaUtente(id, username, ruolo) {
  console.log("Modifica utente ID:", id);
  
  document.getElementById("userId").value = id;
  document.getElementById("username").value = username;
  document.getElementById("password").value = ""; // Reset password field
  document.getElementById("ruolo").value = ruolo;
  
  // Scorri alla sezione del form
  document.getElementById("user-form").scrollIntoView({ behavior: 'smooth' });
}

/**
 * Elimina un utente
 * @param {number} id - ID dell'utente da eliminare
 */
async function eliminaUtente(id) {
  if (!confirm("Sei sicuro di voler eliminare questo utente?")) return;
  
  // Evita operazioni multiple
  if (isLoading) return;
  isLoading = true;
  
  try {
    console.log("Eliminazione utente ID:", id);
    
    // Usa l'API per eliminare l'utente
    const result = await Api.get(`users/delete.php?id=${id}`);
    
    if (result.success) {
      Notifications.success("Utente eliminato con successo!");
      await caricaUtenti();
    } else {
      Notifications.error("Errore durante l'eliminazione: " + (result.error || "Errore sconosciuto"));
    }
  } catch (error) {
    console.error("Errore durante l'eliminazione:", error);
    Notifications.error("Errore durante l'eliminazione: " + Api.handleError(error));
  } finally {
    isLoading = false;
  }
}

/**
 * Resetta il form per l'aggiunta di un nuovo utente
 */
function resetForm() {
  console.log("Reset form...");
  
  document.getElementById("userId").value = "";
  document.getElementById("username").value = "";
  document.getElementById("password").value = "";
  document.getElementById("ruolo").value = "user";
}

// Esponi le funzioni per l'utilizzo nell'HTML
window.caricaUtenti = caricaUtenti;
window.modificaUtente = modificaUtente;
window.eliminaUtente = eliminaUtente;
window.resetForm = resetForm;

// Esporta per uso modulare
export default {
  caricaUtenti,
  modificaUtente,
  eliminaUtente,
  resetForm
};