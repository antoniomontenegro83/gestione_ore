CREATE DATABASE IF NOT EXISTS gestione_ore;
USE gestione_ore;

CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL,
    password VARCHAR(100) NOT NULL
);

INSERT INTO users (username, password) VALUES ('admin', 'password');