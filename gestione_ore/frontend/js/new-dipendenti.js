/**
 * Script per l'aggiunta di nuovi dipendenti
 */
import { Auth, Api, Notifications } from './main.js';
import AuthCommon from './auth-common.js';

// Variabile per tracciare lo stato di caricamento
let isLoading = false;

// Inizializzazione all'avvio
document.addEventListener('DOMContentLoaded', async () => {
  console.log("DOM caricato, inizializzazione form nuovo dipendente...");
  
  // Carica dati per le select
  await Promise.all([
    caricaQualifiche(),
    caricaSedi()
  ]);
  
  // Setup event listeners
  setupForm();
});

/**
 * Configura il form e i suoi listener
 */
function setupForm() {
  console.log("Configurazione form...");
  
  const form = document.getElementById('add-form');
  if (form) {
    form.addEventListener('submit', handleSubmit);
  } else {
    console.error("Form add-form non trovato!");
  }
}

/**
 * Carica l'elenco delle qualifiche
 */
async function caricaQualifiche() {
  try {
    console.log("Caricamento qualifiche...");
    
    const qualificheSelect = document.getElementById('qualifica');
    if (!qualificheSelect) {
      console.error("Select qualifica non trovato!");
      return;
    }
    
    // Richiedi le qualifiche dal server
    const qualifiche = await Api.get("qualifiche/list.php");
    console.log("Risposta qualifiche:", qualifiche);
    
    // Conserva l'opzione predefinita
    const defaultOption = qualificheSelect.options[0];
    qualificheSelect.innerHTML = '';
    qualificheSelect.appendChild(defaultOption);
    
    // Aggiungi le opzioni
    if (Array.isArray(qualifiche)) {
      qualifiche.forEach(q => {
        const option = document.createElement('option');
        option.value = q.qualifica;
        option.textContent = q.qualifica;
        qualificheSelect.appendChild(option);
      });
      console.log("Qualifiche caricate:", qualifiche.length);
    } else {
      console.error("Formato qualifiche non valido:", qualifiche);
      Notifications.warning("Formato dati qualifiche non valido");
    }
  } catch (error) {
    console.error("Errore caricamento qualifiche:", error);
    Notifications.error("Errore nel caricamento delle qualifiche");
  }
}

/**
 * Carica l'elenco delle sedi
 */
async function caricaSedi() {
  try {
    console.log("Caricamento sedi...");
    
    const sediSelect = document.getElementById('sede');
    if (!sediSelect) {
      console.error("Select sede non trovato!");
      return;
    }
    
    // Richiedi le sedi dal server
    const sedi = await Api.get("sedi/list.php");
    console.log("Risposta sedi:", sedi);
    
    // Conserva l'opzione predefinita
    const defaultOption = sediSelect.options[0];
    sediSelect.innerHTML = '';
    sediSelect.appendChild(defaultOption);
    
    // Aggiungi le opzioni
    if (Array.isArray(sedi)) {
      sedi.forEach(s => {
        const option = document.createElement('option');
        option.value = s.nome;
        option.textContent = s.nome;
        sediSelect.appendChild(option);
      });
      console.log("Sedi caricate:", sedi.length);
    } else {
      console.error("Formato sedi non valido:", sedi);
      Notifications.warning("Formato dati sedi non valido");
    }
  } catch (error) {
    console.error("Errore caricamento sedi:", error);
    Notifications.error("Errore nel caricamento delle sedi");
  }
}

/**
 * Gestisce l'invio del form
 * @param {Event} e - Evento submit
 */
async function handleSubmit(e) {
  e.preventDefault();
  
  // Evita invii multipli
  if (isLoading) return;
  isLoading = true;
  
  try {
    console.log("Invio form nuovo dipendente...");
    
    // Raccogli i dati dal form
    const cognome = document.getElementById('cognome').value.trim().toUpperCase();
    const nome = document.getElementById('nome').value.trim().toUpperCase();
    const qualifica = document.getElementById('qualifica').value;
    const sede = document.getElementById('sede').value;
    
    // Log dei dati raccolti
    console.log("Dati raccolti dal form:", { cognome, nome, qualifica, sede });
    
    // Validazione
    if (!cognome || !nome) {
      Notifications.warning("Nome e cognome sono obbligatori");
      isLoading = false;
      return;
    }
    
    if (!qualifica || qualifica === "") {
      Notifications.warning("Seleziona una qualifica");
      isLoading = false;
      return;
    }
    
    if (!sede || sede === "") {
      Notifications.warning("Seleziona una sede");
      isLoading = false;
      return;
    }
    
    // Prepara i dati
    const dipendente = {
      cognome: cognome,
      nome: nome,
      qualifica: qualifica,
      sede: sede
    };
    
    console.log("Dati da inviare:", dipendente);
    
    // Usa l'endpoint add.php
    const result = await Api.post("dipendenti/add.php", dipendente);
    console.log("Risposta server:", result);
    
    if (result && result.success) {
      Notifications.success("Dipendente aggiunto con successo!");
      
      // Reset form
      document.getElementById('add-form').reset();
      
      // Feedback visivo
      const resultDiv = document.getElementById('result');
      if (resultDiv) {
        resultDiv.innerHTML = `
          <div class="alert alert-success">
            <strong>Successo!</strong> Dipendente ${cognome} ${nome} aggiunto correttamente.
          </div>
        `;
        
        // Nascondi il feedback dopo 5 secondi
        setTimeout(() => {
          resultDiv.innerHTML = '';
        }, 5000);
      }
    } else {
      const errorMsg = result && result.error ? result.error : "Errore sconosciuto";
      Notifications.error("Errore durante l'inserimento: " + errorMsg);
      console.error("Errore risposta server:", result);
    }
  } catch (error) {
    console.error("Errore completo:", error);
    Notifications.error("Errore di comunicazione con il server");
  } finally {
    isLoading = false;
  }
}

// Esponi le funzioni per l'utilizzo nell'HTML
window.caricaQualifiche = caricaQualifiche;
window.caricaSedi = caricaSedi;
window.handleSubmit = handleSubmit;

// Esporta per uso modulare
export default {
  caricaQualifiche,
  caricaSedi,
  handleSubmit
};