/**
 * dashboard.js - Logica per la dashboard principale
 * Versione modularizzata
 */
import { Auth } from './main.js';
import AuthCommon from './auth-common.js';

// Funzione principale che viene eseguita al caricamento della pagina
document.addEventListener('DOMContentLoaded', function() {
  console.log("Dashboard: DOM caricato");
  
  // Debug - Mostra ruolo utente nella console
  const user = Auth.getCurrentUser();
  console.log("DEBUG - Ruolo utente:", user?.ruolo);

  // Mostra il card dei privilegi solo per superadmin
  if (Auth.hasRole("superadmin")) {
    const card = document.getElementById("card-privilegi");
    if (card) {
      card.classList.remove("d-none");
      console.log("Dashboard: Mostrati privilegi superadmin");
    }
  }
});

// Non è necessario esportare nulla da dashboard.js
// poiché è usato solo come script specifico della pagina