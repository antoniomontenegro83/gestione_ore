GESTIONE ORE LAVORO - INSTALLAZIONE E DEPLOY

────────────────────────────────────────────────────────
📌 1. INSTALLAZIONE IN LOCALE (XAMPP)
────────────────────────────────────────────────────────

1.1 Requisiti:
 - Windows + XAMPP (scaricabile da https://www.apachefriends.org)
 - Apache e MySQL attivi

1.2 Copia file:
 - Estrai questa cartella in: C:/xampp/htdocs/gestione_ore/

1.3 Crea il database:
 - Vai su: http://localhost/phpmyadmin
 - Crea un database chiamato: gestione_ore
 - Importa il file: backend_gestione_ore/gestione_ore.sql

1.4 Accedi all'app:
 - Visita: http://localhost/gestione_ore/frontend/index.html
 - Login: admin / password

────────────────────────────────────────────────────────
🌐 2. INSTALLAZIONE SU HOSTING ONLINE
────────────────────────────────────────────────────────

2.1 Requisiti:
 - Hosting con supporto PHP >= 7.4 e MySQL
 - Accesso a phpMyAdmin o pannello DB

2.2 Carica i file:
 - Carica "frontend/" e "backend_gestione_ore/" nella root del tuo hosting
   es: /public_html/

2.3 Crea e configura il DB:
 - Crea un database
 - Importa "backend_gestione_ore/gestione_ore.sql"
 - Modifica "backend_gestione_ore/db.php" con:
    $host = "host_mysql";
    $db   = "nome_database";
    $user = "nome_utente";
    $pass = "password_mysql";

2.4 Accedi dal dominio:
 - Esempio: https://iltuodominio.it/frontend/index.html

────────────────────────────────────────────────────────
📂 3. STRUTTURA DEL PROGETTO
────────────────────────────────────────────────────────

gestione_ore/
├── frontend/               → File HTML + JS (UI moderna con Bootstrap)
├── backend_gestione_ore/   → PHP API (login, turni, report)
├── gestione_ore.sql        → Script SQL DB
├── README.txt              → Questa guida

────────────────────────────────────────────────────────
🔐 4. LOGIN DEFAULT
────────────────────────────────────────────────────────
 - Username: admin
 - Password: password

────────────────────────────────────────────────────────

✅ Progetto completo e funzionante!