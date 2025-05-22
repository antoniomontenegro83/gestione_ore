/**
 * dashboard.js - Logica per la dashboard principale con protezione ruoli
 */
import { Auth, Notifications } from './main.js';
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

  // Aggiungi protezione ai link delle card
  setupCardProtection();
});

/**
 * Configura la protezione per le card che richiedono ruoli specifici
 */
function setupCardProtection() {
  console.log("Dashboard: Configurazione protezione card...");
  
  // Definisci le pagine che richiedono ruoli specifici
  const protectedPages = {
    'new-dipendenti.html': ['admin', 'superadmin'],
    'edit-dipendenti.html': ['admin', 'superadmin'],
    'manage-qualifiche.html': ['admin', 'superadmin'],
    'management-turni.html': ['admin', 'superadmin'],
    'manage-sedi.html': ['admin', 'superadmin'],
    'time-entry.html': ['admin', 'superadmin'],
    'users-privileges.html': ['superadmin']
  };

  // Trova tutti i link nella dashboard
  const links = document.querySelectorAll('a[href]');
  
  links.forEach(link => {
    const href = link.getAttribute('href');
    
    // Controlla se questo link è protetto
    if (protectedPages[href]) {
      const requiredRoles = protectedPages[href];
      
      // Sostituisci il comportamento del click
      link.addEventListener('click', function(e) {
        e.preventDefault(); // Blocca il click normale
        
        const user = Auth.getCurrentUser();
        
        if (!user) {
          Notifications.error("Devi effettuare il login per accedere a questa sezione");
          setTimeout(() => {
            window.location.href = 'login.html';
          }, 2000);
          return;
        }
        
        // Controlla se l'utente ha uno dei ruoli richiesti
        const hasRequiredRole = requiredRoles.includes(user.ruolo);
        
        if (!hasRequiredRole) {
          console.log(`Accesso negato a ${href} per ruolo ${user.ruolo}`);
          Notifications.error("Accesso riservato agli amministratori");
          return;
        }
        
        // Se ha il ruolo giusto, naviga normalmente
        console.log(`Accesso consentito a ${href} per ruolo ${user.ruolo}`);
        window.location.href = href;
      });
      
      console.log(`Dashboard: Protezione aggiunta per ${href} (richiede: ${requiredRoles.join(', ')})`);
    }
  });
}

// Esporta per uso esterno se necessario
export default {
  setupCardProtection
};