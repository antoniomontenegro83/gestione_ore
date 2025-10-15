-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Creato il: Ott 15, 2025 alle 16:29
-- Versione del server: 10.4.32-MariaDB
-- Versione PHP: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `gestioneoredb`
--
CREATE DATABASE IF NOT EXISTS `gestioneoredb` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;
USE `gestioneoredb`;

-- --------------------------------------------------------

--
-- Struttura della tabella `dipendenti`
--

CREATE TABLE `dipendenti` (
  `id` bigint(20) NOT NULL,
  `attivo` bit(1) NOT NULL,
  `cognome` varchar(100) NOT NULL,
  `data_creazione` datetime(6) NOT NULL,
  `data_modifica` datetime(6) NOT NULL,
  `nome` varchar(100) NOT NULL,
  `qualifica` varchar(100) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dump dei dati per la tabella `dipendenti`
--

INSERT INTO `dipendenti` (`id`, `attivo`, `cognome`, `data_creazione`, `data_modifica`, `nome`, `qualifica`) VALUES
(1, b'1', 'Rossi', '2025-05-05 18:14:24.000000', '2025-05-05 18:14:24.000000', 'Mario', 'Dirigente'),
(2, b'1', 'Bianchi', '2025-05-05 18:14:24.000000', '2025-05-05 18:14:24.000000', 'Giuseppe', 'Impiegato'),
(3, b'1', 'Verdi', '2025-05-05 18:14:24.000000', '2025-05-05 18:14:24.000000', 'Antonio', 'Tecnico'),
(4, b'1', 'Neri', '2025-05-05 18:14:24.000000', '2025-05-05 18:14:24.000000', 'Francesca', 'Amministrativo');

-- --------------------------------------------------------

--
-- Struttura della tabella `turni`
--

CREATE TABLE `turni` (
  `id` bigint(20) NOT NULL,
  `data_creazione` datetime(6) NOT NULL,
  `data_modifica` datetime(6) NOT NULL,
  `data_ora_ingresso` datetime(6) NOT NULL,
  `data_ora_uscita` datetime(6) NOT NULL,
  `ore_feriali` decimal(10,2) DEFAULT NULL,
  `ore_festivo_diurno` decimal(10,2) DEFAULT NULL,
  `ore_notturno_festivo` decimal(10,2) DEFAULT NULL,
  `ore_totali` decimal(10,2) DEFAULT NULL,
  `dipendente_id` bigint(20) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dump dei dati per la tabella `turni`
--

INSERT INTO `turni` (`id`, `data_creazione`, `data_modifica`, `data_ora_ingresso`, `data_ora_uscita`, `ore_feriali`, `ore_festivo_diurno`, `ore_notturno_festivo`, `ore_totali`, `dipendente_id`) VALUES
(1, '2025-05-05 18:14:24.000000', '2025-05-05 18:14:24.000000', '2023-06-05 08:00:00.000000', '2023-06-05 16:00:00.000000', 8.00, 0.00, 0.00, 8.00, 1),
(2, '2025-05-05 18:14:24.000000', '2025-05-05 18:14:24.000000', '2023-06-06 08:00:00.000000', '2023-06-06 17:00:00.000000', 9.00, 0.00, 0.00, 9.00, 1),
(3, '2025-05-05 18:14:24.000000', '2025-05-05 18:14:24.000000', '2023-06-15 14:00:00.000000', '2023-06-15 22:30:00.000000', 8.00, 0.00, 0.50, 8.50, 1),
(4, '2025-05-05 18:14:24.000000', '2025-05-05 18:14:24.000000', '2023-06-05 09:00:00.000000', '2023-06-05 18:00:00.000000', 9.00, 0.00, 0.00, 9.00, 2);

-- --------------------------------------------------------

--
-- Struttura della tabella `utenti`
--

CREATE TABLE `utenti` (
  `id` bigint(20) NOT NULL,
  `attivo` bit(1) NOT NULL,
  `password` varchar(255) NOT NULL,
  `ruolo` varchar(255) NOT NULL,
  `username` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dump dei dati per la tabella `utenti`
--

INSERT INTO `utenti` (`id`, `attivo`, `password`, `ruolo`, `username`) VALUES
(1, b'1', '$2a$10$q8YiQzXImG4FtNp/RWLcB.MtEBQEAAGgXKsU9D3BiBhyT0H7xXl2i', 'ADMIN', 'admin');

--
-- Indici per le tabelle scaricate
--

--
-- Indici per le tabelle `dipendenti`
--
ALTER TABLE `dipendenti`
  ADD PRIMARY KEY (`id`);

--
-- Indici per le tabelle `turni`
--
ALTER TABLE `turni`
  ADD PRIMARY KEY (`id`),
  ADD KEY `FKk7p84fkbelp4jvnoly2je80bs` (`dipendente_id`);

--
-- Indici per le tabelle `utenti`
--
ALTER TABLE `utenti`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `UKtn8mwk6h2wn28yyj7fco65gls` (`username`);

--
-- AUTO_INCREMENT per le tabelle scaricate
--

--
-- AUTO_INCREMENT per la tabella `dipendenti`
--
ALTER TABLE `dipendenti`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT per la tabella `turni`
--
ALTER TABLE `turni`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT per la tabella `utenti`
--
ALTER TABLE `utenti`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- Limiti per le tabelle scaricate
--

--
-- Limiti per la tabella `turni`
--
ALTER TABLE `turni`
  ADD CONSTRAINT `FKk7p84fkbelp4jvnoly2je80bs` FOREIGN KEY (`dipendente_id`) REFERENCES `dipendenti` (`id`);
--
-- Database: `gestione_ore`
--
CREATE DATABASE IF NOT EXISTS `gestione_ore` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;
USE `gestione_ore`;

-- --------------------------------------------------------

--
-- Struttura della tabella `calcolo_ore`
--

CREATE TABLE `calcolo_ore` (
  `id` int(11) NOT NULL,
  `turno_id` int(11) NOT NULL,
  `employee_id` int(11) NOT NULL,
  `cognome` varchar(100) NOT NULL,
  `nome` varchar(100) NOT NULL,
  `qualifica` varchar(100) DEFAULT NULL,
  `entry_date` date NOT NULL,
  `entry_time` time NOT NULL,
  `exit_date` date NOT NULL,
  `exit_time` time NOT NULL,
  `feriali_diurne` decimal(10,2) DEFAULT 0.00,
  `feriali_notturne` decimal(10,2) DEFAULT 0.00,
  `festive_diurne` decimal(10,2) DEFAULT 0.00,
  `festive_notturne` decimal(10,2) DEFAULT 0.00,
  `totale_ore` decimal(10,2) DEFAULT 0.00,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `sede` varchar(100) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dump dei dati per la tabella `calcolo_ore`
--

INSERT INTO `calcolo_ore` (`id`, `turno_id`, `employee_id`, `cognome`, `nome`, `qualifica`, `entry_date`, `entry_time`, `exit_date`, `exit_time`, `feriali_diurne`, `feriali_notturne`, `festive_diurne`, `festive_notturne`, `totale_ore`, `created_at`, `updated_at`, `sede`) VALUES
(54, 54, 17, 'BALDARI', 'SALVATORE', 'VE', '2025-05-12', '08:00:00', '2025-05-12', '11:05:00', 3.08, 0.00, 0.00, 0.00, 3.08, '2025-05-12 15:41:36', '2025-05-12 15:41:36', 'Francavilla Fontana'),
(55, 55, 14, 'AYMONETTO', 'ALESSIO', 'VV', '2025-05-12', '09:00:00', '2025-05-12', '11:00:00', 2.00, 0.00, 0.00, 0.00, 2.00, '2025-05-12 20:06:31', '2025-05-12 20:06:31', 'Centrale'),
(56, 56, 5, 'ANELLI', 'SANDRO', 'DSLG', '2025-05-12', '08:00:00', '2025-05-12', '11:03:00', 3.05, 0.00, 0.00, 0.00, 3.05, '2025-05-12 20:08:37', '2025-05-12 20:08:37', 'Ostuni'),
(57, 57, 37, 'CALIA', 'ANTONIO', 'CQE', '2025-05-12', '08:00:00', '2025-05-12', '11:03:00', 3.03, 0.00, 0.00, 0.00, 3.03, '2025-05-12 20:14:21', '2025-05-12 20:14:21', 'Centrale'),
(58, 58, 7, 'ARGENTIERO', 'ANTONIO', 'VESC', '2025-05-12', '08:00:00', '2025-05-12', '11:03:00', 3.00, 0.00, 0.00, 0.00, 3.00, '2025-05-12 20:29:52', '2025-05-12 20:29:52', 'Ostuni'),
(59, 59, 188, 'MAGRI\'', 'MASSIMO', 'VV', '2025-05-12', '08:00:00', '2025-05-12', '11:03:00', 3.00, 0.00, 0.00, 0.00, 3.00, '2025-05-12 20:30:28', '2025-05-12 20:30:28', 'Centrale'),
(60, 60, 13, 'AVALLONE', 'EMILIO', 'VV', '2025-05-12', '08:00:00', '2025-05-12', '11:03:00', 3.00, 0.00, 0.00, 0.00, 3.00, '2025-05-12 20:34:20', '2025-05-12 20:34:20', 'Centrale'),
(61, 61, 73, 'CORVAGLIA', 'GIUSEPPE', 'NMI', '2025-05-12', '08:00:00', '2025-05-12', '11:03:00', 3.05, 0.00, 0.00, 0.00, 3.05, '2025-05-12 20:41:49', '2025-05-12 20:41:49', 'Centrale'),
(65, 65, 8, 'ARGENTIERO', 'VITO', 'CR', '2025-05-12', '08:00:00', '2025-05-13', '23:00:00', 30.00, 9.00, 0.00, 0.00, 39.00, '2025-05-12 21:23:44', '2025-05-12 21:23:44', 'Ostuni'),
(68, 68, 1, 'ALEMANNO', 'ENEA', 'VE', '2025-05-12', '08:00:00', '2025-05-12', '20:00:00', 12.00, 0.00, 0.00, 0.00, 12.00, '2025-05-12 21:27:35', '2025-05-12 21:27:35', 'Centrale'),
(69, 69, 4, 'ANDRISANI', 'ROCCO', 'VC', '2025-05-12', '08:00:00', '2025-05-12', '22:00:00', 14.00, 0.00, 0.00, 0.00, 14.00, '2025-05-12 21:32:31', '2025-05-12 21:32:31', 'Centrale'),
(70, 70, 15, 'BACCHINI', 'BRUNO', 'VV', '2025-05-12', '08:00:00', '2025-05-12', '23:00:00', 14.00, 1.00, 0.00, 0.00, 15.00, '2025-05-12 21:38:16', '2025-05-12 21:38:16', 'Centrale'),
(72, 74, 21, 'BASSO', 'EUPREMIO', 'VV', '2025-05-12', '08:00:00', '2025-05-12', '22:00:00', 14.00, 0.00, 0.00, 0.00, 14.00, '2025-05-12 21:58:06', '2025-05-12 21:58:06', 'Centrale'),
(73, 75, 61, 'CHIONNA', 'VINCENZO', 'NCCR', '2025-05-12', '08:00:00', '2025-05-12', '12:15:00', 4.25, 0.00, 0.00, 0.00, 4.25, '2025-05-12 22:50:41', '2025-05-12 22:50:41', 'Nucleo Nautico'),
(97, 80, 17, 'BALDARI', 'SALVATORE', 'VE', '2025-05-14', '20:00:00', '2025-05-15', '09:00:00', 5.00, 8.00, 0.00, 0.00, 13.00, '2025-05-14 13:51:29', '2025-05-14 13:51:29', 'Nucleo Sommozzatori'),
(98, 82, 2, 'ANCONA', 'TEODORO', 'VC', '2025-05-15', '15:21:00', '2025-05-15', '20:00:00', 4.65, 0.00, 0.00, 0.00, 4.65, '2025-05-14 17:22:23', '2025-05-14 17:22:23', 'Centrale'),
(99, 83, 2, 'ANCONA', 'TEODORO', 'VC', '2025-05-18', '19:22:00', '2025-05-18', '22:22:00', 0.00, 0.00, 3.00, 0.00, 3.00, '2025-05-14 17:23:04', '2025-05-14 17:23:04', 'Centrale'),
(102, 85, 275, 'PILIEGO', 'LUIGI', 'CR', '2025-05-15', '08:00:00', '2025-05-15', '20:00:00', 12.00, 0.00, 0.00, 0.00, 12.00, '2025-05-15 16:16:37', '2025-05-15 16:16:37', 'Centrale'),
(105, 88, 19, 'BARCA', 'FLAVIA', 'OPER', '2025-05-15', '08:00:00', '2025-05-15', '22:00:00', 14.00, 0.00, 0.00, 0.00, 14.00, '2025-05-15 19:42:52', '2025-05-15 19:42:52', 'Bari'),
(106, 89, 80, 'D\'AMORE', 'CARMINE', 'VIG', '2025-05-15', '08:00:00', '2025-05-15', '21:00:00', 13.00, 0.00, 0.00, 0.00, 13.00, '2025-05-15 19:52:08', '2025-05-15 19:52:08', 'Bari'),
(108, 91, 6, 'APRILE', 'GIANLUCA', 'CS', '2025-05-15', '08:00:00', '2025-05-16', '09:00:00', 17.00, 8.00, 0.00, 0.00, 25.00, '2025-05-15 20:24:35', '2025-05-15 20:24:35', 'Francavilla Fontana'),
(109, 92, 24, 'BONIFACIO', 'LEONZIO', 'VV', '2025-05-15', '08:00:00', '2025-05-15', '22:00:00', 14.00, 0.00, 0.00, 0.00, 14.00, '2025-05-15 20:24:53', '2025-05-15 20:24:53', 'Bari'),
(112, 90, 275, 'PILIEGO', 'LUIGI', 'CR', '2025-05-20', '22:30:00', '2025-05-21', '08:00:00', 1.50, 8.00, 0.00, 0.00, 9.50, '2025-05-17 19:55:12', '2025-05-17 19:55:12', 'Centrale'),
(113, 94, 61, 'CHIONNA', 'VINCENZO', 'NCCR', '2025-05-19', '08:00:00', '2025-05-19', '22:00:00', 14.00, 0.00, 0.00, 0.00, 14.00, '2025-05-19 07:18:34', '2025-05-19 07:18:34', 'Nucleo Nautico'),
(114, 95, 61, 'CHIONNA', 'VINCENZO', 'NCCR', '2025-05-20', '22:00:00', '2025-05-21', '08:00:00', 2.00, 8.00, 0.00, 0.00, 10.00, '2025-05-19 07:21:06', '2025-05-19 07:21:06', 'Nucleo Nautico'),
(116, 97, 61, 'CHIONNA', 'VINCENZO', 'NCCR', '2025-05-10', '20:00:00', '2025-05-11', '08:00:00', 2.00, 2.00, 2.00, 6.00, 12.00, '2025-05-19 09:56:42', '2025-05-19 09:56:42', 'Nucleo Nautico'),
(119, 86, 275, 'PILIEGO', 'LUIGI', 'CR', '2025-05-23', '11:00:00', '2025-05-24', '10:30:00', 15.50, 8.00, 0.00, 0.00, 23.50, '2025-05-22 08:58:18', '2025-05-22 08:58:18', 'Centrale'),
(120, 99, 13, 'AVALLONE', 'EMILIO', 'VV', '2025-05-22', '20:57:00', '2025-05-22', '21:57:00', 1.00, 0.00, 0.00, 0.00, 1.00, '2025-05-22 13:57:06', '2025-05-22 13:57:06', 'Centrale'),
(121, 96, 61, 'CHIONNA', 'VINCENZO', 'NCCR', '2025-05-25', '08:00:00', '2025-05-25', '20:00:00', 0.00, 0.00, 12.00, 0.00, 12.00, '2025-05-25 06:37:21', '2025-05-25 06:37:21', 'Francavilla Fontana'),
(122, 100, 54, 'CAZZATO', 'ALESSANDRO', 'VC', '2025-05-02', '08:00:00', '2025-05-02', '22:00:00', 14.00, 0.00, 0.00, 0.00, 14.00, '2025-05-25 06:44:30', '2025-05-25 06:44:30', 'Centrale'),
(125, 102, 54, 'CAZZATO', 'ALESSANDRO', 'VC', '2025-05-05', '08:00:00', '2025-05-05', '20:15:00', 12.25, 0.00, 0.00, 0.00, 12.25, '2025-05-25 06:47:45', '2025-05-25 06:47:45', 'Centrale'),
(126, 103, 54, 'CAZZATO', 'ALESSANDRO', 'VC', '2025-05-06', '20:00:00', '2025-05-07', '08:00:00', 4.00, 8.00, 0.00, 0.00, 12.00, '2025-05-25 06:48:30', '2025-05-25 06:48:30', 'Centrale'),
(127, 104, 54, 'CAZZATO', 'ALESSANDRO', 'VC', '2025-05-09', '08:00:00', '2025-05-09', '20:00:00', 12.00, 0.00, 0.00, 0.00, 12.00, '2025-05-25 06:50:23', '2025-05-25 06:50:23', 'Centrale'),
(128, 105, 54, 'CAZZATO', 'ALESSANDRO', 'VC', '2025-05-10', '08:15:00', '2025-05-10', '21:30:00', 13.25, 0.00, 0.00, 0.00, 13.25, '2025-05-25 06:53:05', '2025-05-25 06:53:05', 'Centrale'),
(129, 106, 54, 'CAZZATO', 'ALESSANDRO', 'VC', '2025-05-13', '20:00:00', '2025-05-14', '08:00:00', 4.00, 8.00, 0.00, 0.00, 12.00, '2025-05-25 06:53:42', '2025-05-25 06:53:42', 'Centrale'),
(130, 107, 54, 'CAZZATO', 'ALESSANDRO', 'VC', '2025-05-11', '08:00:00', '2025-05-11', '22:00:00', 0.00, 0.00, 14.00, 0.00, 14.00, '2025-05-25 06:54:46', '2025-05-25 06:54:46', 'Centrale'),
(133, 110, 54, 'CAZZATO', 'ALESSANDRO', 'VC', '2025-05-26', '08:00:00', '2025-05-26', '20:00:00', 12.00, 0.00, 0.00, 0.00, 12.00, '2025-05-25 07:27:58', '2025-05-25 07:27:58', 'Centrale'),
(134, 111, 54, 'CAZZATO', 'ALESSANDRO', 'VC', '2025-05-27', '08:00:00', '2025-05-27', '20:00:00', 12.00, 0.00, 0.00, 0.00, 12.00, '2025-05-25 07:28:44', '2025-05-25 07:28:44', 'Centrale'),
(136, 113, 54, 'CAZZATO', 'ALESSANDRO', 'VC', '2025-05-15', '08:00:00', '2025-05-15', '20:00:00', 12.00, 0.00, 0.00, 0.00, 12.00, '2025-05-25 07:30:47', '2025-05-25 07:30:47', 'Centrale'),
(137, 114, 54, 'CAZZATO', 'ALESSANDRO', 'VC', '2025-05-16', '08:00:00', '2025-05-16', '20:00:00', 12.00, 0.00, 0.00, 0.00, 12.00, '2025-05-25 07:31:08', '2025-05-25 07:31:08', 'Centrale'),
(138, 115, 54, 'CAZZATO', 'ALESSANDRO', 'VC', '2025-05-17', '08:00:00', '2025-05-17', '20:02:00', 12.03, 0.00, 0.00, 0.00, 12.03, '2025-05-25 07:31:32', '2025-05-25 07:31:32', 'Centrale'),
(139, 116, 54, 'CAZZATO', 'ALESSANDRO', 'VC', '2025-05-18', '08:00:00', '2025-05-18', '20:00:00', 0.00, 0.00, 12.00, 0.00, 12.00, '2025-05-25 07:31:50', '2025-05-25 07:31:50', 'Centrale'),
(140, 117, 54, 'CAZZATO', 'ALESSANDRO', 'VC', '2025-05-19', '08:00:00', '2025-05-19', '20:00:00', 12.00, 0.00, 0.00, 0.00, 12.00, '2025-05-25 07:32:07', '2025-05-25 07:32:07', 'Centrale'),
(141, 118, 54, 'CAZZATO', 'ALESSANDRO', 'VC', '2025-05-20', '08:00:00', '2025-05-20', '20:00:00', 12.00, 0.00, 0.00, 0.00, 12.00, '2025-05-25 07:32:31', '2025-05-25 07:32:31', 'Centrale'),
(142, 119, 54, 'CAZZATO', 'ALESSANDRO', 'VC', '2025-05-21', '08:00:00', '2025-05-21', '22:00:00', 14.00, 0.00, 0.00, 0.00, 14.00, '2025-05-25 07:32:53', '2025-05-25 07:32:53', 'Centrale'),
(143, 120, 16, 'BALDARI', 'LUIGI ANTONIO', 'VC', '2025-05-10', '08:00:00', '2025-05-10', '20:00:00', 12.00, 0.00, 0.00, 0.00, 12.00, '2025-05-26 13:20:34', '2025-05-26 13:20:34', 'Francavilla Fontana'),
(144, 121, 16, 'BALDARI', 'LUIGI ANTONIO', 'VC', '2025-05-26', '12:00:00', '2025-05-26', '20:00:00', 8.00, 0.00, 0.00, 0.00, 8.00, '2025-05-26 13:21:06', '2025-05-26 13:21:06', 'Ostuni'),
(158, 122, 81, 'D\'AMURI', 'FABRIZIO', 'VV', '2025-05-26', '08:00:00', '2025-05-26', '20:00:00', 12.00, 0.00, 0.00, 0.00, 12.00, '2025-05-28 07:18:03', '2025-05-28 07:18:03', 'Nucleo Nautico'),
(164, 109, 54, 'CAZZATO', 'ALESSANDRO', 'VC', '2025-05-25', '08:00:00', '2025-05-25', '22:00:00', 0.00, 0.00, 14.00, 0.00, 14.00, '2025-05-28 13:08:21', '2025-05-28 13:08:21', 'Centrale'),
(167, 124, 54, 'CAZZATO', 'ALESSANDRO', 'VC', '2025-05-01', '08:00:00', '2025-05-01', '20:00:00', 0.00, 0.00, 12.00, 0.00, 12.00, '2025-05-28 19:16:55', '2025-05-28 19:16:55', 'Centrale'),
(168, 125, 54, 'CAZZATO', 'ALESSANDRO', 'VC', '2025-05-31', '08:00:00', '2025-05-31', '20:00:00', 12.00, 0.00, 0.00, 0.00, 12.00, '2025-05-28 19:17:36', '2025-05-28 19:17:36', 'Centrale'),
(169, 126, 54, 'CAZZATO', 'ALESSANDRO', 'VC', '2025-05-29', '08:00:00', '2025-05-29', '22:00:00', 14.00, 0.00, 0.00, 0.00, 14.00, '2025-05-28 19:18:42', '2025-05-28 19:18:42', 'Centrale'),
(171, 128, 54, 'CAZZATO', 'ALESSANDRO', 'VC', '2025-05-24', '08:00:00', '2025-05-24', '20:00:00', 12.00, 0.00, 0.00, 0.00, 12.00, '2025-05-28 19:19:32', '2025-05-28 19:19:32', 'Centrale'),
(175, 129, 13, 'AVALLONE', 'EMILIO', 'VV', '2025-05-28', '08:00:00', '2025-05-28', '20:00:00', 12.00, 0.00, 0.00, 0.00, 12.00, '2025-05-28 20:22:26', '2025-05-28 20:22:26', 'Brindisi (Aeroportuale)'),
(176, 123, 134, 'GIUDICE', 'ALESSANDRO', 'CS', '2025-05-26', '20:00:00', '2025-05-27', '18:00:00', 14.00, 8.00, 0.00, 0.00, 22.00, '2025-06-06 20:59:39', '2025-06-06 20:59:39', 'Centrale'),
(177, 127, 54, 'CAZZATO', 'ALESSANDRO', 'VC', '2025-05-23', '08:00:00', '2025-05-23', '20:00:00', 12.00, 0.00, 0.00, 0.00, 12.00, '2025-06-06 21:07:28', '2025-06-06 21:07:28', 'Brindisi (Aeroportuale)'),
(178, 101, 54, 'CAZZATO', 'ALESSANDRO', 'VC', '2025-05-03', '20:00:00', '2025-05-04', '08:30:00', 2.00, 2.00, 2.50, 6.00, 12.50, '2025-06-06 21:07:36', '2025-06-06 21:07:36', 'Nucleo Sommozzatori');

-- --------------------------------------------------------

--
-- Struttura della tabella `dipendenti`
--

CREATE TABLE `dipendenti` (
  `id` int(11) NOT NULL,
  `qualifica` varchar(100) DEFAULT NULL,
  `cognome` varchar(100) NOT NULL,
  `nome` varchar(100) NOT NULL,
  `sede` varchar(100) DEFAULT NULL,
  `version` int(11) DEFAULT 1,
  `last_modified` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `modified_by` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dump dei dati per la tabella `dipendenti`
--

INSERT INTO `dipendenti` (`id`, `qualifica`, `cognome`, `nome`, `sede`, `version`, `last_modified`, `modified_by`) VALUES
(1, 'VE', 'ALEMANNO', 'ENEA', 'Centrale', 1, '2025-05-22 10:09:35', NULL),
(2, 'VC', 'ANCONA', 'TEODORO', 'Centrale', 1, '2025-05-22 10:09:35', NULL),
(3, 'VE', 'ANDRIOLA', 'COSIMO', 'Ostuni', 1, '2025-05-22 10:09:35', NULL),
(4, 'VC', 'ANDRISANI', 'ROCCO', 'Ostuni', 1, '2025-05-22 10:09:35', NULL),
(5, 'DSLG', 'ANELLI', 'SANDRO', 'Centrale', 1, '2025-05-22 10:09:35', NULL),
(6, 'CS', 'APRILE', 'GIANLUCA', 'Francavilla Fontana', 1, '2025-05-22 10:09:35', NULL),
(7, 'VESC', 'ARGENTIERO', 'ANTONIO', 'Ostuni', 1, '2025-05-22 10:09:35', NULL),
(8, 'CR', 'ARGENTIERO', 'VITO', 'Ostuni', 1, '2025-05-28 10:18:50', NULL),
(9, 'VV', 'ARPA', 'DAVIDE', 'Centrale', 1, '2025-05-22 10:09:35', NULL),
(10, 'VE', 'ARSENA', 'FLORIANA', 'Francavilla Fontana', 1, '2025-05-22 10:09:35', NULL),
(11, 'VV', 'AUGURIO', 'VALERIO', 'Centrale', 1, '2025-05-22 10:09:35', NULL),
(12, 'VV', 'AUGUSTO', 'LUCA', 'Centrale', 1, '2025-05-22 10:09:35', NULL),
(13, 'VV', 'AVALLONE', 'EMILIO', 'Centrale', 1, '2025-05-22 10:09:35', NULL),
(14, 'VV', 'AYMONETTO', 'ALESSIO', 'Centrale', 1, '2025-05-22 10:09:35', NULL),
(15, 'VV', 'BACCHINI', 'BRUNO', 'Centrale', 1, '2025-05-22 10:09:35', NULL),
(16, 'VC', 'BALDARI', 'LUIGI ANTONIO', 'Centrale', 1, '2025-05-22 10:09:35', NULL),
(17, 'VE', 'BALDARI', 'SALVATORE', 'Francavilla Fontana', 1, '2025-05-22 10:09:35', NULL),
(18, 'VV', 'BALESTRA', 'GIUSEPPE', 'Centrale', 1, '2025-05-22 10:09:35', NULL),
(19, 'OPER', 'BARCA', 'FLAVIA', 'Centrale', 1, '2025-05-22 10:09:35', NULL),
(20, 'VV', 'BARLETTA', 'ANTONIO', 'Centrale', 1, '2025-05-22 10:09:35', NULL),
(21, 'VV', 'BASSO', 'EUPREMIO', 'Centrale', 1, '2025-05-22 10:09:35', NULL),
(22, 'VV', 'BELLANOVA', 'CESARE', 'Centrale', 1, '2025-05-22 10:09:35', NULL),
(23, 'VESC', 'BOLOGNESE', 'SALVATORE', 'Brindisi (Aeroportuale)', 1, '2025-05-22 10:09:35', NULL),
(24, 'VV', 'BONIFACIO', 'LEONZIO', 'Centrale', 1, '2025-05-22 10:09:35', NULL),
(25, 'VC', 'BOROMEI', 'LUIGI', 'Centrale', 1, '2025-05-22 10:09:35', NULL),
(26, 'VE', 'BORROMEO', 'MARIO', 'Brindisi (Aeroportuale)', 1, '2025-05-22 10:09:35', NULL),
(27, 'NMVFC', 'BRUNETTI', 'GIANLUCA SALVATORE', 'Nucleo Nautico', 1, '2025-05-22 10:09:35', NULL),
(28, 'VV', 'BRUNO', 'GIACOMO', 'Centrale', 1, '2025-05-22 10:09:35', NULL),
(29, 'VCSC', 'BUFANO', 'GIOVANNI', 'Ostuni', 1, '2025-05-22 10:09:35', NULL),
(30, 'VESC', 'BUONGIORNO', 'COSIMO', 'Francavilla Fontana', 1, '2025-05-22 10:09:35', NULL),
(31, 'VC', 'BUONGIORNO', 'ERASMO ANTONIO', 'Ostuni', 1, '2025-05-22 10:09:35', NULL),
(32, 'VV', 'BUONGIORNO', 'FRANCESCO', 'Centrale', 1, '2025-05-22 10:09:35', NULL),
(33, 'CS', 'CAFARELLA', 'DANILO', 'Centrale', 1, '2025-05-22 10:09:35', NULL),
(34, 'VV', 'CAFORIO', 'ELISABETTA', 'Centrale', 1, '2025-05-22 10:09:35', NULL),
(35, 'VC', 'CAFORIO', 'TEODORO', 'Centrale', 1, '2025-05-22 10:09:35', NULL),
(36, 'VV', 'CAIULO', 'MAURIZIO', 'Centrale', 1, '2025-05-22 10:09:35', NULL),
(37, 'CQE', 'CALIA', 'ANTONIO', 'Centrale', 1, '2025-05-22 10:09:35', NULL),
(38, 'VC', 'CAMPISI', 'GIUSEPPE', 'Brindisi (Aeroportuale)', 1, '2025-05-22 10:09:35', NULL),
(39, 'VV', 'CAPODIECI', 'SANDRO', 'Centrale', 1, '2025-05-22 10:09:35', NULL),
(40, 'VC', 'CAPONE', 'PAOLO', 'Brindisi (Aeroportuale)', 1, '2025-05-22 10:09:35', NULL),
(41, 'VE', 'CAPONE', 'PIERPAOLO', 'Francavilla Fontana', 1, '2025-05-22 10:09:35', NULL),
(42, 'NCVFC', 'CAPPELLI', 'FABIO', 'Nucleo Nautico', 1, '2025-05-22 10:09:35', NULL),
(43, 'VV', 'CAPRIGLIA', 'ANGELO', 'Centrale', 1, '2025-05-22 10:09:35', NULL),
(44, 'VV', 'CAPRIGLIA', 'GIANNI', 'Centrale', 1, '2025-05-22 10:09:35', NULL),
(45, 'OPERESC', 'CARRIERI', 'MAURIZIO', 'Centrale', 1, '2025-05-22 10:09:35', NULL),
(46, 'CR', 'CARRIERO', 'COSIMO', 'Centrale', 1, '2025-05-22 10:09:35', NULL),
(47, 'VC', 'CASTAGNANOVA', 'ALESSIO', 'Centrale', 1, '2025-05-22 10:09:35', NULL),
(48, 'VV', 'CATALANO', 'COSIMO', 'Centrale', 1, '2025-05-22 10:09:35', NULL),
(49, 'VV', 'CATALDI', 'SALVATORE', 'Centrale', 1, '2025-05-22 10:09:35', NULL),
(50, 'VC', 'CAVALLO', 'ANTONIO', 'Brindisi (Aeroportuale)', 1, '2025-05-22 10:09:35', NULL),
(51, 'CR', 'CAVALLO', 'MICHELE', 'Ostuni', 1, '2025-05-22 10:09:35', NULL),
(52, 'VE', 'CAVALLO', 'STEFANO', 'Ostuni', 1, '2025-05-22 10:09:35', NULL),
(53, 'VESC', 'CAVALLO', 'VITO ANTONIO', 'Ostuni', 1, '2025-05-22 10:09:35', NULL),
(54, 'VC', 'CAZZATO', 'ALESSANDRO', 'Centrale', 1, '2025-05-22 10:09:35', NULL),
(55, 'VC', 'CHIANURA', 'EGIDIO FRANCESCO', 'Francavilla Fontana', 1, '2025-05-22 10:09:35', NULL),
(56, 'VC', 'CHIATANTE', 'PIERO', 'Centrale', 1, '2025-05-22 10:09:35', NULL),
(57, 'VV', 'CHIEGO', 'GIOVANNI', 'Centrale', 1, '2025-05-22 10:09:35', NULL),
(58, 'VV', 'CHIERA', 'PAOLO', 'Centrale', 1, '2025-05-22 10:09:35', NULL),
(59, 'VV', 'CHIONNA', 'LUIGI', 'Centrale', 1, '2025-05-22 10:09:35', NULL),
(60, 'VV', 'CHIONNA', 'RAIMONDO', 'Centrale', 1, '2025-05-22 10:09:35', NULL),
(61, 'NCCR', 'CHIONNA', 'VINCENZO', 'Nucleo Nautico', 1, '2025-05-22 10:09:35', NULL),
(62, 'VE', 'CHIRI', 'MARCO', 'Brindisi (Aeroportuale)', 1, '2025-05-22 10:09:35', NULL),
(63, 'VESC', 'CIONFOLI', 'ADRIANO', 'Francavilla Fontana', 1, '2025-05-22 10:09:35', NULL),
(64, 'CR', 'CIRACI\'', 'LUIGI', 'Brindisi (Aeroportuale)', 1, '2025-05-22 10:09:35', NULL),
(65, 'VV', 'COLELLI', 'STEFANO', 'Centrale', 1, '2025-05-22 10:09:35', NULL),
(66, 'VE', 'COLUCCI', 'DAMIANO ANGELO', 'Ostuni', 1, '2025-05-22 10:09:35', NULL),
(67, 'VV', 'CONTE', 'ROCCO', 'Centrale', 1, '2025-05-22 10:09:35', NULL),
(68, 'CR', 'CONVERTINO', 'VITO', 'Ostuni', 1, '2025-05-22 10:09:35', NULL),
(69, 'VE', 'COPPOLA', 'ANTONIO', 'Francavilla Fontana', 1, '2025-05-22 10:09:35', NULL),
(70, 'VESC', 'CORRADO', 'PIER MARCELLO', 'Brindisi (Aeroportuale)', 1, '2025-05-22 10:09:35', NULL),
(71, 'VV', 'CORSA', 'GIANPAOLO', 'Centrale', 1, '2025-05-22 10:09:35', NULL),
(72, 'NCVFCSC', 'CORSA', 'MASSIMO', 'Nucleo Nautico', 1, '2025-05-22 10:09:35', NULL),
(73, 'NMI', 'CORVAGLIA', 'GIUSEPPE', 'Centrale', 1, '2025-05-22 10:09:35', NULL),
(74, 'VV', 'COSENTINO', 'FABIO', 'Centrale', 1, '2025-05-22 10:09:35', NULL),
(75, 'VC', 'COSTA', 'SAMUELE', 'Brindisi (Aeroportuale)', 1, '2025-05-22 10:09:35', NULL),
(76, 'VV', 'D\'ACCICO', 'COSIMO', 'Brindisi (Aeroportuale)', 1, '2025-05-22 10:09:35', NULL),
(77, 'VCSC', 'D\'ADAMO', 'ROBERTO', 'Francavilla Fontana', 1, '2025-05-22 10:09:35', NULL),
(78, 'VC', 'D\'AMBROSIO', 'SANTO', 'Francavilla Fontana', 1, '2025-05-22 10:09:35', NULL),
(79, 'VV', 'D\'AMICO', 'GIANLUCA', 'Centrale', 1, '2025-05-22 10:09:35', NULL),
(80, 'VIG', 'D\'AMORE', 'CARMINE', 'Francavilla Fontana', 1, '2025-05-22 10:09:35', NULL),
(81, 'VV', 'D\'AMURI', 'FABRIZIO', 'Centrale', 1, '2025-05-22 10:09:35', NULL),
(82, 'NCVFC', 'DE CASTRO', 'ANTONIO', 'Nucleo Nautico', 1, '2025-05-22 10:09:35', NULL),
(83, 'VV', 'DE CESARE', 'ANTONIO', 'Centrale', 1, '2025-05-22 10:09:35', NULL),
(84, 'VC', 'DE FAZIO', 'VINCENZO', 'Centrale', 1, '2025-05-22 10:09:35', NULL),
(85, 'VC', 'DE GIORGI', 'DIEGO', 'Centrale', 1, '2025-05-22 10:09:35', NULL),
(86, 'VE', 'DE GIORGI', 'GIANNI', 'Centrale', 1, '2025-05-22 10:09:35', NULL),
(87, 'VV', 'DE LORENZO', 'SERENA', 'Centrale', 1, '2025-05-22 10:09:35', NULL),
(88, 'IA', 'DE MILATO', 'ORONZO', 'Centrale', 1, '2025-05-22 10:09:35', NULL),
(89, 'VV', 'DE NUZZO', 'ANDREA', 'Centrale', 1, '2025-05-22 10:09:35', NULL),
(90, 'DCSLG', 'DE STAVOLA', 'MARCELLA', 'Centrale', 1, '2025-05-22 10:09:35', NULL),
(91, 'VV', 'DEANGELIS', 'VALERIA', 'Centrale', 1, '2025-05-22 10:09:35', NULL),
(92, 'VIGP', 'DELLA CORTE', 'FABIANA', 'Centrale', 1, '2025-05-22 10:09:35', NULL),
(93, 'VV', 'DELL\'AQUILA', 'ANTIMO', 'Centrale', 1, '2025-05-22 10:09:35', NULL),
(94, 'VV', 'DELLI NOCI', 'EMILIO', 'Centrale', 1, '2025-05-22 10:09:35', NULL),
(95, 'VC', 'DELLISANTI', 'PAOLO', 'Ostuni', 1, '2025-05-22 10:09:35', NULL),
(96, 'VESC', 'DI DOMENICO', 'FRANCESCO', 'Centrale', 1, '2025-05-22 10:09:35', NULL),
(97, 'VC', 'DI MAURO', 'GIUSEPPE', 'Brindisi (Aeroportuale)', 1, '2025-05-22 10:09:35', NULL),
(98, 'VC', 'DI PRESA', 'VINCENZO', 'Centrale', 1, '2025-05-22 10:09:35', NULL),
(99, 'VE', 'DICEMBRE', 'POMPEO', 'Ostuni', 1, '2025-05-22 10:09:35', NULL),
(100, 'VE', 'DIMA', 'ANDREA', 'Brindisi (Aeroportuale)', 1, '2025-05-22 10:09:35', NULL),
(101, 'VV', 'DIMASTRODONATO', 'GIOVANNI', 'Centrale', 1, '2025-05-22 10:09:35', NULL),
(102, 'CR', 'DIMONTE', 'FORTUNATO', 'Centrale', 1, '2025-05-22 10:09:35', NULL),
(103, 'VE', 'DIODICIBUS', 'GIROLAMO', 'Brindisi (Aeroportuale)', 1, '2025-05-22 10:09:35', NULL),
(104, 'NMVFC', 'DIONISIO', 'JEAN', 'Nucleo Nautico', 1, '2025-05-22 10:09:35', NULL),
(105, 'IA', 'ETNA', 'ANDREA', 'Centrale', 1, '2025-05-22 10:09:35', NULL),
(106, 'VV', 'FAGGIANO', 'ANTONIO', 'Centrale', 1, '2025-05-22 10:09:35', NULL),
(107, 'NMCRSC', 'FAGGIANO', 'LUIGI', 'Nucleo Nautico', 1, '2025-05-22 10:09:35', NULL),
(108, 'CS', 'FALCONE', 'ANTONIO', 'Brindisi (Aeroportuale)', 1, '2025-05-22 10:09:35', NULL),
(109, 'VV', 'FALCONIERI', 'PASQUALE', 'Centrale', 1, '2025-05-22 10:09:35', NULL),
(110, 'VESC', 'FANELLI', 'IVAN', 'Ostuni', 1, '2025-05-22 10:09:35', NULL),
(111, 'VC', 'FANIZZI', 'NICOLA', 'Ostuni', 1, '2025-05-22 10:09:35', NULL),
(112, 'VC', 'FERRARA', 'COSIMO', 'Francavilla Fontana', 1, '2025-05-22 10:09:35', NULL),
(113, 'VV', 'FINO', 'ANDREA', 'Centrale', 1, '2025-05-22 10:09:35', NULL),
(114, 'VE', 'FIORDALISO', 'CAMILLO', 'Ostuni', 1, '2025-05-22 10:09:35', NULL),
(115, 'IA', 'FIUSCO', 'ALESSANDRO', 'Centrale', 1, '2025-05-22 10:09:35', NULL),
(116, 'CS', 'FRANCIOSO', 'ANGELO', 'Centrale', 1, '2025-05-22 10:09:35', NULL),
(117, 'CS', 'FRANCIOSO', 'DIEGO', 'Centrale', 1, '2025-05-22 10:09:35', NULL),
(118, 'SVFC', 'FRANCONE', 'DARIO', 'Nucleo Sommozzatori', 1, '2025-05-22 10:09:35', NULL),
(119, 'NCVFC', 'FRATTI', 'NICOLA', 'Nucleo Nautico', 1, '2025-05-22 10:09:35', NULL),
(120, 'VV', 'FUSCO', 'RAFFAELE', 'Centrale', 1, '2025-05-22 10:09:35', NULL),
(121, 'PD', 'GALGANO', 'GIUSEPPE', 'Centrale', 1, '2025-05-22 10:09:35', NULL),
(122, 'CQE', 'GALIULO', 'ANTONIO', 'Francavilla Fontana', 1, '2025-05-22 10:09:35', NULL),
(123, 'VC', 'GALLONE', 'SIMONE', 'Centrale', 1, '2025-05-22 10:09:35', NULL),
(124, 'VESC', 'GALLUZZO', 'COSIMO', 'Centrale', 1, '2025-05-22 10:09:35', NULL),
(125, 'DCS', 'GALLUZZO', 'ROBERTO', 'Centrale', 1, '2025-05-22 10:09:35', NULL),
(126, 'CS', 'GELSOMINO', 'LUCA', 'Centrale', 1, '2025-05-22 10:09:35', NULL),
(127, 'VC', 'GEMMA', 'COSIMO', 'Francavilla Fontana', 1, '2025-05-22 10:09:35', NULL),
(128, 'VE', 'GEMMA', 'GIOVANNI', 'Francavilla Fontana', 1, '2025-05-22 10:09:35', NULL),
(129, 'VC', 'GEMMA', 'RAFFAELE', 'Francavilla Fontana', 1, '2025-05-22 10:09:35', NULL),
(130, 'CRSC', 'GENNARO', 'ANTONIO', 'Brindisi (Aeroportuale)', 1, '2025-05-22 10:09:35', NULL),
(131, 'VV', 'GIAMMARRUCO', 'MARCO', 'Centrale', 1, '2025-05-22 10:09:35', NULL),
(132, 'VV', 'GIORDANO', 'VINCENZO', 'Centrale', 1, '2025-05-22 10:09:35', NULL),
(133, 'VCSC', 'GIOSA', 'TEODORO', 'Centrale', 1, '2025-05-22 10:09:35', NULL),
(134, 'CS', 'GIUDICE', 'ALESSANDRO', 'Centrale', 1, '2025-05-22 10:09:35', NULL),
(135, 'VC', 'GOFFREDO', 'GIONATA', 'Brindisi (Aeroportuale)', 1, '2025-05-22 10:09:35', NULL),
(136, 'VE', 'GRAMMATICO', 'FABIO', 'Brindisi (Aeroportuale)', 1, '2025-05-22 10:09:35', NULL),
(137, 'VE', 'GRAZIOSO', 'ANDREA', 'Centrale', 1, '2025-05-22 10:09:35', NULL),
(138, 'NCVFC', 'GRAZIOSO', 'MICHELE', 'Nucleo Nautico', 1, '2025-05-22 10:09:35', NULL),
(139, 'CQE', 'GRECO', 'CESARE', 'Centrale', 1, '2025-05-22 10:09:35', NULL),
(140, 'CQE', 'GRECO', 'MICHELANGELO', 'Brindisi (Aeroportuale)', 1, '2025-05-22 10:09:35', NULL),
(141, 'NCVFC', 'GRECO', 'ROBERTO', 'Nucleo Nautico', 1, '2025-05-22 10:09:35', NULL),
(142, 'CS', 'GROSSO', 'DOMENICO', 'Francavilla Fontana', 1, '2025-05-22 10:09:35', NULL),
(143, 'VV', 'GUADALUPI', 'ANTIMO', 'Centrale', 1, '2025-05-22 10:09:35', NULL),
(144, 'VE', 'GUARINI', 'PAOLO', 'Centrale', 1, '2025-05-22 10:09:35', NULL),
(145, 'VV', 'GUIDA', 'LEONARDO', 'Centrale', 1, '2025-05-22 10:09:35', NULL),
(146, 'VV', 'IACOBBI', 'ALESSANDRO', 'Centrale', 1, '2025-05-22 10:09:35', NULL),
(147, 'VV', 'IACOBBI', 'MARCELLO', 'Centrale', 1, '2025-05-22 10:09:35', NULL),
(148, 'CS', 'IAIA', 'ANGELO', 'Centrale', 1, '2025-05-22 10:09:35', NULL),
(149, 'VE', 'IAIA', 'ANTONIO', 'Centrale', 1, '2025-05-22 10:09:35', NULL),
(150, 'VE', 'INCALZA', 'DAMIANO', 'Francavilla Fontana', 1, '2025-05-22 10:09:35', NULL),
(151, 'VV', 'INCALZA', 'ORONZO', 'Centrale', 1, '2025-05-22 10:09:35', NULL),
(152, 'CS', 'INGROSSO', 'DANIELE', 'Brindisi (Aeroportuale)', 1, '2025-05-22 10:09:35', NULL),
(153, 'VC', 'INGROSSO', 'VITO ANTONIO', 'Brindisi (Aeroportuale)', 1, '2025-05-22 10:09:35', NULL),
(154, 'CQE', 'INTIGLIETTA', 'COSIMO', 'Centrale', 1, '2025-05-22 10:09:35', NULL),
(155, 'VCSC', 'INVIDIA', 'MARCO', 'Brindisi (Aeroportuale)', 1, '2025-05-22 10:09:35', NULL),
(156, 'CS', 'ITTA', 'MASSIMO', 'Francavilla Fontana', 1, '2025-05-22 10:09:35', NULL),
(157, 'VV', 'LAFUENTI', 'ALESSIO', 'Centrale', 1, '2025-05-22 10:09:35', NULL),
(158, 'NMCSE', 'LAFUENTI', 'GIULIO', 'Nucleo Nautico', 1, '2025-05-22 10:09:35', NULL),
(159, 'SCS', 'LALA', 'MASSIMO', 'Nucleo Sommozzatori', 1, '2025-05-22 10:09:35', NULL),
(160, 'VIG', 'LANEVE', 'MARIO', 'Francavilla Fontana', 1, '2025-05-22 10:09:35', NULL),
(161, 'VV', 'LANZILAO', 'ANTONIO', 'Centrale', 1, '2025-05-22 10:09:35', NULL),
(162, 'VCSC', 'LANZILLOTTI', 'FERNANDO', 'Brindisi (Aeroportuale)', 1, '2025-05-22 10:09:35', NULL),
(163, 'VC', 'LATORRE', 'ALESSANDRO', 'Ostuni', 1, '2025-05-22 10:09:35', NULL),
(164, 'ILGE', 'LAURENZANA', 'ANNA', 'Centrale', 1, '2025-05-22 10:09:35', NULL),
(165, 'VCSC', 'LAZZARI', 'DAVIDE', 'Centrale', 1, '2025-05-22 10:09:35', NULL),
(166, 'VC', 'LAZZOI', 'MARCO', 'Centrale', 1, '2025-05-22 10:09:35', NULL),
(167, 'CQE', 'LEGROTTAGLIE', 'ANGELO', 'Francavilla Fontana', 1, '2025-05-22 10:09:35', NULL),
(168, 'CQE', 'LEO', 'GIOVANNI', 'Brindisi (Aeroportuale)', 1, '2025-05-22 10:09:35', NULL),
(169, 'ILGE', 'LEO', 'MAURIZIO', 'Centrale', 1, '2025-05-22 10:09:35', NULL),
(170, 'CQE', 'LEO', 'MAURIZIO', 'Brindisi (Aeroportuale)', 1, '2025-05-22 10:09:35', NULL),
(171, 'VV', 'LERNA', 'PITER', 'Centrale', 1, '2025-05-22 10:09:35', NULL),
(172, 'VV', 'LEUZZI', 'NICOLA', 'Centrale', 1, '2025-05-22 10:09:35', NULL),
(173, 'VC', 'LEUZZI', 'SERGIO', 'Brindisi (Aeroportuale)', 1, '2025-05-22 10:09:35', NULL),
(174, 'VV', 'LIBRALE', 'ANTONIO', 'Centrale', 1, '2025-05-22 10:09:35', NULL),
(175, 'VV', 'LICCHELLO', 'GIOVANNI', 'Centrale', 1, '2025-05-22 10:09:35', NULL),
(176, 'NMVFC', 'LIGORIO', 'ALESSANDRO', 'Nucleo Nautico', 1, '2025-05-22 10:09:35', NULL),
(177, 'VE', 'LIGORIO', 'MARCO VALERIO', 'Francavilla Fontana', 1, '2025-05-22 10:09:35', NULL),
(178, 'CS', 'LISANTI', 'PIERO', 'Francavilla Fontana', 1, '2025-05-22 10:09:35', NULL),
(179, 'VCSC', 'LIUZZI', 'FRANCESCO', 'Ostuni', 1, '2025-05-22 10:09:35', NULL),
(180, 'CR', 'LOCOCCIOLO', 'ANTONIO', 'Ostuni', 1, '2025-05-22 10:09:35', NULL),
(181, 'VV', 'LOPEZ', 'DIEGO', 'Centrale', 1, '2025-05-22 10:09:35', NULL),
(182, 'VCSC', 'LOTTATORE', 'ROCCO EMANUELE', 'Ostuni', 1, '2025-05-22 10:09:35', NULL),
(183, 'VV', 'LUPO', 'DANIELE', 'Centrale', 1, '2025-05-22 10:09:35', NULL),
(184, 'CR', 'MACCHITELLA', 'ANGELO', 'Ostuni', 1, '2025-05-22 10:09:35', NULL),
(185, 'CQE', 'MAGGIO', 'AUGUSTO', 'Centrale', 1, '2025-05-22 10:09:35', NULL),
(186, 'VC', 'MAGGIORE', 'ALESSANDRO', 'Ostuni', 1, '2025-05-22 10:09:35', NULL),
(187, 'VE', 'MAGGIORE', 'COSIMO', 'Centrale', 1, '2025-05-22 10:09:35', NULL),
(188, 'VV', 'MAGRI\'', 'MASSIMO', 'Centrale', 1, '2025-05-22 10:09:35', NULL),
(189, 'VESC', 'MALATESTA', 'ANDREA', 'Centrale', 1, '2025-05-22 10:09:35', NULL),
(190, 'VC', 'MALDARELLA', 'COSIMO', 'Ostuni', 1, '2025-05-22 10:09:35', NULL),
(191, 'CR', 'MALORZO', 'GABRIELE', 'Brindisi (Aeroportuale)', 1, '2025-05-22 10:09:35', NULL),
(192, 'IA', 'MALORZO', 'ROBERTO', 'Centrale', 1, '2025-05-22 10:09:35', NULL),
(193, 'VC', 'MARCHESE', 'ANGELO', 'Brindisi (Aeroportuale)', 1, '2025-05-22 10:09:35', NULL),
(194, 'VCSC', 'MARGHERITA', 'ALESSANDRO', 'Brindisi (Aeroportuale)', 1, '2025-05-22 10:09:35', NULL),
(195, 'VE', 'MARIANO', 'MARIO', 'Centrale', 1, '2025-05-22 10:09:35', NULL),
(196, 'D', 'MARRA', 'FRANCESCO', 'Centrale', 1, '2025-05-22 10:09:35', NULL),
(197, 'VV', 'MARRAZZA', 'ROSARIO', 'Centrale', 1, '2025-05-22 10:09:35', NULL),
(198, 'VV', 'MARTELLO', 'CRISTIANO', 'Centrale', 1, '2025-05-22 10:09:35', NULL),
(199, 'VV', 'MARTELLO', 'SIMONE', 'Centrale', 1, '2025-05-22 10:09:35', NULL),
(200, 'VV', 'MARTELLOTTI', 'LORENZO', 'Centrale', 1, '2025-05-22 10:09:35', NULL),
(201, 'VV', 'MARTENA', 'DANIELE', 'Centrale', 1, '2025-05-22 10:09:35', NULL),
(202, 'VV', 'MARTENA', 'MARCELLO', 'Centrale', 1, '2025-05-22 10:09:35', NULL),
(203, 'SCR', 'MARTI', 'DAVIDE', 'Nucleo Sommozzatori', 1, '2025-05-22 10:09:35', NULL),
(204, 'VESC', 'MARULLI', 'FELICE', 'Ostuni', 1, '2025-05-22 10:09:35', NULL),
(205, 'VC', 'MASI', 'FRANCESCO', 'Centrale', 1, '2025-05-22 10:09:35', NULL),
(206, 'CQE', 'MAURO', 'FERRUCCIO', 'Centrale', 1, '2025-05-22 10:09:35', NULL),
(207, 'SCS', 'MAZZEO', 'UMBERTO', 'Nucleo Sommozzatori', 1, '2025-05-22 10:09:35', NULL),
(208, 'VE', 'MELACCA', 'DAVIDE', 'Brindisi (Aeroportuale)', 1, '2025-05-22 10:09:35', NULL),
(209, 'CQE', 'MELACCA', 'FRANCESCO', 'Centrale', 1, '2025-05-22 10:09:35', NULL),
(210, 'VE', 'MELLONE', 'ANDREA', 'Brindisi (Aeroportuale)', 1, '2025-05-22 10:09:35', NULL),
(211, 'VV', 'MEMMOLA', 'ELIO', 'Centrale', 1, '2025-05-22 10:09:35', NULL),
(212, 'VCSC', 'MENDUNI', 'DANILO', 'Brindisi (Aeroportuale)', 1, '2025-05-22 10:09:35', NULL),
(213, 'VC', 'MICCOLI', 'ANGELO', 'Francavilla Fontana', 1, '2025-05-22 10:09:35', NULL),
(214, 'VCSC', 'MICCOLI', 'ANTONIO', 'Brindisi (Aeroportuale)', 1, '2025-05-22 10:09:35', NULL),
(215, 'VE', 'MICCOLI', 'ARTURO', 'Centrale', 1, '2025-05-22 10:09:35', NULL),
(216, 'VCSC', 'MICCOLI', 'FRANCESCO', 'Ostuni', 1, '2025-05-22 10:09:35', NULL),
(217, 'ILGE', 'MICCOLI', 'MARIA', 'Centrale', 1, '2025-05-22 10:09:35', NULL),
(218, 'CQE', 'MICCOLI', 'VITO', 'Francavilla Fontana', 1, '2025-05-22 10:09:35', NULL),
(219, 'VC', 'MIGALETTI', 'MAURIZIO', 'Centrale', 1, '2025-05-22 10:09:35', NULL),
(220, 'VE', 'MINELLI', 'MARCO', 'Centrale', 1, '2025-05-22 10:09:35', NULL),
(221, 'VV', 'MINGHETTI', 'PIERLUIGI SIMONE', 'Centrale', 1, '2025-05-22 10:09:35', NULL),
(222, 'VCSC', 'MINGOLLA', 'GIOSUE\'', 'Centrale', 1, '2025-05-22 10:09:35', NULL),
(223, 'VC', 'MOLA', 'ANTONIO', 'Ostuni', 1, '2025-05-22 10:09:35', NULL),
(224, 'VV', 'MONDELLI', 'GIOVANNI', 'Centrale', 1, '2025-05-22 10:09:35', NULL),
(225, 'VE', 'MONSELLATO', 'GIOVANNI', 'Centrale', 1, '2025-05-22 10:09:35', NULL),
(226, 'VE', 'MONTANARO', 'ANDREA', 'Centrale', 1, '2025-05-22 10:09:35', NULL),
(227, 'VV', 'MORCIANO', 'CRISTIAN', 'Centrale', 1, '2025-05-22 10:09:35', NULL),
(228, 'CQE', 'MORCIANO', 'ROBERTO', 'Brindisi (Aeroportuale)', 1, '2025-05-22 10:09:35', NULL),
(229, 'VC', 'MORELLI', 'PAOLO', 'Centrale', 1, '2025-05-22 10:09:35', NULL),
(230, 'VC', 'MORELLO', 'ALESSANDRO', 'Brindisi (Aeroportuale)', 1, '2025-05-22 10:09:35', NULL),
(231, 'VC', 'MORETTI', 'FILOMENO', 'Ostuni', 1, '2025-05-22 10:09:35', NULL),
(232, 'VV', 'MUCCIO', 'COSIMO', 'Centrale', 1, '2025-05-22 10:09:35', NULL),
(233, 'VC', 'MUOLO', 'ANTONIO', 'Brindisi (Aeroportuale)', 1, '2025-05-22 10:09:35', NULL),
(234, 'VCSC', 'MUOLO', 'PIETRO', 'Brindisi (Aeroportuale)', 1, '2025-05-22 10:09:35', NULL),
(235, 'VC', 'MUSCIO', 'TEODORO VALTER', 'Centrale', 1, '2025-05-22 10:09:35', NULL),
(236, 'CS', 'MUSIO', 'ANTONIO', 'Brindisi (Aeroportuale)', 1, '2025-05-22 10:09:35', NULL),
(237, 'VC', 'NACCARATO', 'MASSIMILIANO', 'Brindisi (Aeroportuale)', 1, '2025-05-22 10:09:35', NULL),
(238, 'VV', 'NEGLIE', 'NICOLA', 'Centrale', 1, '2025-05-22 10:09:35', NULL),
(239, 'VC', 'NISI', 'CATALDO', 'Centrale', 1, '2025-05-22 10:09:35', NULL),
(240, 'VV', 'NOCENTE', 'MIMMO', 'Centrale', 1, '2025-05-22 10:09:35', NULL),
(241, 'VV', 'NOTARO', 'DOMENICO', 'Centrale', 1, '2025-05-22 10:09:35', NULL),
(242, 'VV', 'ORASSI', 'FRANCESCO', 'Centrale', 1, '2025-05-22 10:09:35', NULL),
(243, 'VC', 'ORFANO', 'SALVATORE', 'Brindisi (Aeroportuale)', 1, '2025-05-22 10:09:35', NULL),
(244, 'VE', 'OSTUNI', 'ALESSIO', 'Brindisi (Aeroportuale)', 1, '2025-05-22 10:09:35', NULL),
(245, 'CQE', 'OSTUNI', 'GIANLUCA', 'Brindisi (Aeroportuale)', 1, '2025-05-22 10:09:35', NULL),
(246, 'CS', 'OSTUNI', 'LUIGI', 'Brindisi (Aeroportuale)', 1, '2025-05-22 10:09:35', NULL),
(247, 'DCS', 'OSTUNI', 'MARCO', 'Centrale', 1, '2025-05-22 10:09:35', NULL),
(248, 'VCSC', 'OSTUNI', 'MASSIMO', 'Centrale', 1, '2025-05-22 10:09:35', NULL),
(249, 'VV', 'PACE', 'PIERGIUSEPPE', 'Centrale', 1, '2025-05-22 10:09:35', NULL),
(250, 'VESC', 'PAGLIARA', 'ANGELO', 'Centrale', 1, '2025-05-22 10:09:35', NULL),
(251, 'VV', 'PAGLIARA', 'SILVIO', 'Centrale', 1, '2025-05-22 10:09:35', NULL),
(252, 'VV', 'PALAZZO', 'ANGELO', 'Centrale', 1, '2025-05-22 10:09:35', NULL),
(253, 'VE', 'PALMA', 'DIEGO', 'Centrale', 1, '2025-05-22 10:09:35', NULL),
(254, 'VV', 'PALMA', 'SALVATORE', 'Centrale', 1, '2025-05-22 10:09:35', NULL),
(255, 'VESC', 'PALMISANO', 'ANTONIO', 'Brindisi (Aeroportuale)', 1, '2025-05-22 10:09:35', NULL),
(256, 'VE', 'PALMISANO', 'ANTONIO', 'Francavilla Fontana', 1, '2025-05-22 10:09:35', NULL),
(257, 'OPERESC', 'PALMISANO', 'FEDELE', 'Centrale', 1, '2025-05-22 10:09:35', NULL),
(258, 'VC', 'PALUMBO', 'ANTONIO', 'Brindisi (Aeroportuale)', 1, '2025-05-22 10:09:35', NULL),
(259, 'VE', 'PANAREO', 'CLAUDIO', 'Centrale', 1, '2025-05-22 10:09:35', NULL),
(260, 'VV', 'PANELLI', 'VINCENZO', 'Centrale', 1, '2025-05-22 10:09:35', NULL),
(261, 'VV', 'PAPA', 'ANTONIO', 'Centrale', 1, '2025-05-22 10:09:35', NULL),
(262, 'VV', 'PARISI', 'COSIMO', 'Centrale', 1, '2025-05-22 10:09:35', NULL),
(263, 'VC', 'PASCARIELLO', 'FRANCO', 'Centrale', 1, '2025-05-22 10:09:35', NULL),
(264, 'VE', 'PELLEGRINO', 'COSIMO', 'Brindisi (Aeroportuale)', 1, '2025-05-22 10:09:35', NULL),
(265, 'IIE', 'PELLEGRINO', 'VINCENZO', 'Centrale', 1, '2025-05-22 10:09:35', NULL),
(266, 'VE', 'PEPE ESPOSITO', 'MARCO', 'Brindisi (Aeroportuale)', 1, '2025-05-22 10:09:35', NULL),
(267, 'IIE', 'PERRONE', 'ALESSANDRO', 'Centrale', 1, '2025-05-22 10:09:35', NULL),
(268, 'VCSC', 'PERRONE', 'ANDREA', 'Brindisi (Aeroportuale)', 1, '2025-05-22 10:09:35', NULL),
(269, 'CS', 'PERRONE', 'GIUSEPPE', 'Brindisi (Aeroportuale)', 1, '2025-05-22 10:09:35', NULL),
(270, 'VV', 'PERRUCCI', 'ORSOLA', 'Centrale', 1, '2025-05-22 10:09:35', NULL),
(271, 'VV', 'PERRUCI', 'ORSOLA', 'Centrale', 1, '2025-05-22 10:09:35', NULL),
(272, 'VC', 'PETITI', 'CARMELO COSIMO', 'Centrale', 1, '2025-05-22 10:09:35', NULL),
(273, 'VV', 'PETRACHI', 'COSIMO', 'Centrale', 1, '2025-05-22 10:09:35', NULL),
(274, 'CS', 'PETRACHI', 'DAMIANO', 'Centrale', 1, '2025-05-22 10:09:35', NULL),
(275, 'CR', 'PILIEGO', 'LUIGI', 'Centrale', 1, '2025-05-22 10:09:35', NULL),
(276, 'VC', 'PILIEGO', 'TEODORO', 'Centrale', 1, '2025-05-22 10:09:35', NULL),
(277, 'VV', 'PINTO', 'TEODORO', 'Centrale', 1, '2025-05-22 10:09:35', NULL),
(278, 'VE', 'PIRO', 'COSIMO', 'Francavilla Fontana', 1, '2025-05-22 10:09:35', NULL),
(279, 'VV', 'PORTOLANO', 'LUCIANO', 'Centrale', 1, '2025-05-22 10:09:35', NULL),
(280, 'VV', 'PRATICO\'', 'PAOLO', 'Centrale', 1, '2025-05-22 10:09:35', NULL),
(281, 'VV', 'PRIMICERI', 'COSIMO', 'Centrale', 1, '2025-05-22 10:09:35', NULL),
(282, 'VESC', 'PRIMICERI', 'LUIGI', 'Brindisi (Aeroportuale)', 1, '2025-05-22 10:09:35', NULL),
(283, 'VV', 'PRINCIPE', 'DANIELE', 'Centrale', 1, '2025-05-22 10:09:35', NULL),
(284, 'VV', 'PRONTERA', 'FABIO', 'Centrale', 1, '2025-05-22 10:09:35', NULL),
(285, 'VC', 'PULLI', 'GIUSEPPE', 'Centrale', 1, '2025-05-22 10:09:35', NULL),
(286, 'NCVFC', 'PUNZONI', 'FRANCESCO', 'Nucleo Nautico', 1, '2025-05-22 10:09:35', NULL),
(287, 'AVIG', 'QUARTA', 'ADRIANO', 'Centrale', 1, '2025-05-22 10:09:35', NULL),
(288, 'VESC', 'QUARTA', 'ANTONIO', 'Centrale', 1, '2025-05-22 10:09:35', NULL),
(289, 'VE', 'QUARTA', 'GIAMMARCO', 'Brindisi (Aeroportuale)', 1, '2025-05-22 10:09:35', NULL),
(290, 'VIG', 'QUARTA', 'MARCO', 'Brindisi (Aeroportuale)', 1, '2025-05-22 10:09:35', NULL),
(291, 'VV', 'QUARTA', 'TEODORO', 'Centrale', 1, '2025-05-22 10:09:35', NULL),
(292, 'CR', 'QUARTULLI', 'PIETRO', 'Ostuni', 1, '2025-05-22 10:09:35', NULL),
(293, 'OPER', 'RAGNO', 'ANTONELLA', 'Centrale', 1, '2025-05-22 10:09:35', NULL),
(294, 'VESC', 'RAPISARDA', 'ROBERTO', 'Brindisi (Aeroportuale)', 1, '2025-05-22 10:09:35', NULL),
(295, 'VV', 'RECCHIA', 'ROBERTO', 'Centrale', 1, '2025-05-22 10:09:35', NULL),
(296, 'VCSC', 'RENNA', 'RUGGERO', 'Centrale', 1, '2025-05-22 10:09:35', NULL),
(297, 'VV', 'RIBEZZI', 'EMILIANO', 'Centrale', 1, '2025-05-22 10:09:35', NULL),
(298, 'VC', 'RISO', 'DAVIDE', 'Centrale', 1, '2025-05-22 10:09:35', NULL),
(299, 'VE', 'RIZZELLI', 'FABIO', 'Brindisi (Aeroportuale)', 1, '2025-05-22 10:09:35', NULL),
(300, 'VE', 'ROCHIRA', 'COSIMO DAMIANO', 'Brindisi (Aeroportuale)', 1, '2025-05-22 10:09:35', NULL),
(301, 'VV', 'RODIA', 'RENATO', 'Centrale', 1, '2025-05-22 10:09:35', NULL),
(302, 'CS', 'ROMA', 'ANTONIO', 'Francavilla Fontana', 1, '2025-05-22 10:09:35', NULL),
(303, 'CS', 'ROMA', 'PIETRO', 'Centrale', 1, '2025-05-22 10:09:35', NULL),
(304, 'VV', 'ROMANELLI', 'MARCELLO', 'Centrale', 1, '2025-05-22 10:09:35', NULL),
(305, 'IIE', 'ROMANO', 'DANIELE', 'Centrale', 1, '2025-05-22 10:09:35', NULL),
(306, 'CRESC AIB', 'ROSSELLI', 'TOMMASO', 'Centrale', 1, '2025-05-22 10:09:35', NULL),
(307, 'VC', 'RUBINO', 'ANGELO', 'Centrale', 1, '2025-05-22 10:09:35', NULL),
(308, 'VE', 'RUBINO', 'MATTIA FRANCESCO', 'Centrale', 1, '2025-05-22 10:09:35', NULL),
(309, 'CR', 'RUBINO', 'SALVATORE', 'Centrale', 1, '2025-05-22 10:09:35', NULL),
(310, 'VDLG', 'RUCCO', 'LIDALBA MARIA', 'Centrale', 1, '2025-05-22 10:09:35', NULL),
(311, 'VIG', 'RUGGERI', 'VALENTINA', 'Centrale', 1, '2025-05-22 10:09:35', NULL),
(312, 'VC', 'RUOTOLO', 'NICOLA', 'Brindisi (Aeroportuale)', 1, '2025-05-22 10:09:35', NULL),
(313, 'VV', 'SALONNA', 'FRANCESCO', 'Centrale', 1, '2025-05-22 10:09:35', NULL),
(314, 'VE', 'SANTORO', 'ALESSANDRO', 'Brindisi (Aeroportuale)', 1, '2025-05-22 10:09:35', NULL),
(315, 'VV', 'SANTORO', 'AMILCARE MARCELLO', 'Centrale', 1, '2025-05-22 10:09:35', NULL),
(316, 'VE', 'SANTORO', 'BENIAMINO', 'Centrale', 1, '2025-05-22 10:09:35', NULL),
(317, 'VCSC', 'SANTORO', 'COSIMO', 'Brindisi (Aeroportuale)', 1, '2025-05-22 10:09:35', NULL),
(318, 'VCSC', 'SANTORO', 'MARIO', 'Ostuni', 1, '2025-05-22 10:09:35', NULL),
(319, 'NMVFC', 'SAPONARO', 'GIUSEPPE', 'Nucleo Nautico', 1, '2025-05-22 10:09:35', NULL),
(320, 'VCSC', 'SAPONARO', 'LORENZO', 'Ostuni', 1, '2025-05-22 10:09:35', NULL),
(321, 'VV', 'SAPONARO', 'MAURIZIO', 'Centrale', 1, '2025-05-22 10:09:35', NULL),
(322, 'CR', 'SAPONARO', 'ORONZO', 'Centrale', 1, '2025-05-22 10:09:35', NULL),
(323, 'VV', 'SARACINO', 'MARIA FONTANA', 'Centrale', 1, '2025-05-22 10:09:35', NULL),
(324, 'VV', 'SARCINELLA', 'ANGELO', 'Centrale', 1, '2025-05-22 10:09:35', NULL),
(325, 'VESC', 'SARDIELLO', 'MICHELE', 'Francavilla Fontana', 1, '2025-05-22 10:09:35', NULL),
(326, 'VV', 'SASSO', 'DANIELA', 'Centrale', 1, '2025-05-22 10:09:35', NULL),
(327, 'VV', 'SASSO', 'MIRKO', 'Centrale', 1, '2025-05-22 10:09:35', NULL),
(328, 'VV', 'SCARAFILE', 'GIUSEPPE', 'Centrale', 1, '2025-05-22 10:09:35', NULL),
(329, 'VC', 'SCARCIA', 'ANTONIO', 'Brindisi (Aeroportuale)', 1, '2025-05-22 10:09:35', NULL),
(330, 'VE', 'SCARCIA', 'ERMANNO', 'Brindisi (Aeroportuale)', 1, '2025-05-22 10:09:35', NULL),
(331, 'VIG', 'SCIOLTI', 'GIUSEPPE', 'Francavilla Fontana', 1, '2025-05-22 10:09:35', NULL),
(332, 'SCR', 'SCORRANO', 'GIANCARLO', 'Centrale', 1, '2025-05-22 10:09:35', NULL),
(333, 'CS', 'SEMERARO', 'FILIPPO', 'Centrale', 1, '2025-05-22 10:09:35', NULL),
(334, 'VV', 'SERGIO', 'COSIMO', 'Centrale', 1, '2025-05-22 10:09:35', NULL),
(335, 'VC', 'SICILIANO', 'GIANLUCA', 'Centrale', 1, '2025-05-22 10:09:35', NULL),
(336, 'OPERESC', 'SIGNORILE', 'NICOLA', 'Centrale', 1, '2025-05-22 10:09:35', NULL),
(337, 'NMCSE', 'SIRAGO', 'GIUSEPPE', 'Nucleo Nautico', 1, '2025-05-22 10:09:35', NULL),
(338, 'CR', 'SOROBERTO', 'ANTONIO', 'Centrale', 1, '2025-05-22 10:09:35', NULL),
(339, 'VC', 'SOROBERTO', 'MASSIMO', 'Centrale', 1, '2025-05-22 10:09:35', NULL),
(340, 'VV', 'SPADONI', 'DANIELE', 'Centrale', 1, '2025-05-22 10:09:35', NULL),
(341, 'VE', 'SPADONI', 'DAVIDE', 'Brindisi (Aeroportuale)', 1, '2025-05-22 10:09:35', NULL),
(342, 'VV', 'SPAGNOLO', 'FABIO', 'Centrale', 1, '2025-05-22 10:09:35', NULL),
(343, 'CQE', 'SPENNATI', 'GIUSEPPE', 'Centrale', 1, '2025-05-22 10:09:35', NULL),
(344, 'CRSC', 'SPERTO', 'FRANCESCO', 'Centrale', 1, '2025-05-22 10:09:35', NULL),
(345, 'VV', 'SPIRITO', 'RAFFAELE', 'Centrale', 1, '2025-05-22 10:09:35', NULL),
(346, 'VE', 'STANISCI', 'GIANLUCA', 'Centrale', 1, '2025-05-22 10:09:35', NULL),
(347, 'VIGP', 'SURANO', 'DARIO UGO', 'Centrale', 1, '2025-05-22 10:09:35', NULL),
(348, 'VC', 'SURANO', 'UGO', 'Centrale', 1, '2025-05-22 10:09:35', NULL),
(349, 'VV', 'TANZARELLA', 'VINCENZO', 'Centrale', 1, '2025-05-22 10:09:35', NULL),
(350, 'D', 'TARANTINI', 'MARIA CONSIGLIA', 'Centrale', 1, '2025-05-22 10:09:35', NULL),
(351, 'VV', 'TARANTINO', 'ANDREA', 'Centrale', 1, '2025-05-22 10:09:35', NULL),
(352, 'VC', 'TARANTINO', 'ANDREA', 'Brindisi (Aeroportuale)', 1, '2025-05-22 10:09:35', NULL),
(353, 'VCSC', 'TASCO', 'ALESSANDRO', 'Brindisi (Aeroportuale)', 1, '2025-05-22 10:09:35', NULL),
(354, 'CS', 'TASCO', 'ANTONIO', 'Centrale', 1, '2025-05-22 10:09:35', NULL),
(355, 'VE', 'TASSO', 'CIRIACO', 'Centrale', 1, '2025-05-22 10:09:35', NULL),
(356, 'IAE', 'TASSO', 'COSIMO', 'Centrale', 1, '2025-05-22 10:09:35', NULL),
(357, 'VESC', 'TASSO', 'GIUSEPPE', 'Centrale', 1, '2025-05-22 10:09:35', NULL),
(358, 'CS', 'TASSO', 'MASSIMO', 'Centrale', 1, '2025-05-22 10:09:35', NULL),
(359, 'VV', 'TAURISANO', 'ALESSANDRO', 'Centrale', 1, '2025-05-22 10:09:35', NULL),
(360, 'VV', 'TEDESCHI', 'FRANCESCA', 'Centrale', 1, '2025-05-22 10:09:35', NULL),
(361, 'VE', 'TODISCO', 'MARCO', 'Brindisi (Aeroportuale)', 1, '2025-05-22 10:09:35', NULL),
(362, 'CS', 'TONDO', 'MARIO', 'Brindisi (Aeroportuale)', 1, '2025-05-22 10:09:35', NULL),
(363, 'VE', 'TRAPANI', 'ALESSANDRO', 'Centrale', 1, '2025-05-22 10:09:35', NULL),
(364, 'VV', 'URSO', 'CARLO', 'Centrale', 1, '2025-05-22 10:09:35', NULL),
(365, 'VE', 'VACCA', 'COTRINO', 'Francavilla Fontana', 1, '2025-05-22 10:09:35', NULL),
(366, 'SCR', 'VACCA', 'DANIELE', 'Nucleo Sommozzatori', 1, '2025-05-22 10:09:35', NULL),
(367, 'VC', 'VALENTE', 'MARCO', 'Centrale', 1, '2025-05-22 10:09:35', NULL),
(368, 'VV', 'VALENTE', 'MASSIMO', 'Centrale', 1, '2025-05-22 10:09:35', NULL),
(369, 'SCS', 'VALLONE', 'DAVIDE', 'Nucleo Sommozzatori', 1, '2025-05-22 10:09:35', NULL),
(370, 'VV', 'VANTAGGIATO', 'FEDERICO', 'Centrale', 1, '2025-05-22 10:09:35', NULL),
(371, 'VV', 'VENDETTA', 'STELLA', 'Centrale', 1, '2025-05-22 10:09:35', NULL),
(372, 'VESC', 'VERGALLO', 'DIEGO', 'Centrale', 1, '2025-05-22 10:09:35', NULL),
(373, 'VV', 'VERGALLO', 'PIETRO PAOLO', 'Centrale', 1, '2025-05-22 10:09:35', NULL),
(374, 'CR', 'VILLANI', 'GIUSEPPE', 'Centrale', 1, '2025-05-22 10:09:35', NULL),
(375, 'VE', 'VINCENTI', 'GIANLUCA', 'Brindisi (Aeroportuale)', 1, '2025-05-22 10:09:35', NULL),
(376, 'OPERESC', 'VITA', 'LUIGI', 'Centrale', 1, '2025-05-22 10:09:35', NULL),
(377, 'VE', 'VITALE', 'STEFANO', 'Francavilla Fontana', 1, '2025-05-22 10:09:35', NULL),
(378, 'VV', 'ZANELLI', 'PIERPAOLO', 'Centrale', 1, '2025-05-22 10:09:35', NULL),
(379, 'NCCR', 'ZANTONINI', 'ETTORE', 'Nucleo Nautico', 1, '2025-05-22 10:09:35', NULL),
(380, 'CS', 'ZIPPO', 'CLAUDIO', 'Brindisi (Aeroportuale)', 1, '2025-05-22 10:09:35', NULL),
(381, 'CS', 'ZIZZI', 'ROBERTO', 'Centrale', 1, '2025-05-22 10:09:35', NULL),
(382, 'VCSC', 'ZIZZO', 'GILBERTO', 'Brindisi (Aeroportuale)', 1, '2025-05-22 10:09:35', NULL),
(383, 'VC', 'ZONNO', 'FRANCESCO', 'Centrale', 1, '2025-05-22 10:09:35', NULL),
(384, 'CS', 'ZULLINO', 'ELIO', 'Brindisi (Aeroportuale)', 1, '2025-05-22 10:09:35', NULL),
(385, 'VE', 'ZULLINO', 'PASQUALE SIMONE', 'Centrale', 1, '2025-05-22 10:09:35', NULL),
(386, 'VE', 'ZULLINO', 'ROBERTA', 'Centrale', 1, '2025-05-22 10:09:35', NULL),
(387, 'CR', 'ZURLO', 'DOMENICO', 'Ostuni', 1, '2025-05-22 10:09:35', NULL),
(388, 'CR', 'ZURLO', 'GIOVANNI', 'Brindisi (Aeroportuale)', 1, '2025-05-22 10:09:35', NULL),
(389, 'CR', 'ZURLO', 'MAURIZIO', 'Ostuni', 1, '2025-05-22 10:09:35', NULL);

-- --------------------------------------------------------

--
-- Struttura della tabella `log_modifiche`
--

CREATE TABLE `log_modifiche` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `turno_id` int(11) NOT NULL,
  `dipendente` varchar(255) NOT NULL,
  `old_entry_date` date DEFAULT NULL,
  `old_entry_time` time DEFAULT NULL,
  `old_exit_date` date DEFAULT NULL,
  `old_exit_time` time DEFAULT NULL,
  `old_sede` varchar(100) DEFAULT NULL,
  `new_entry_date` date NOT NULL,
  `new_entry_time` time NOT NULL,
  `new_exit_date` date NOT NULL,
  `new_exit_time` time NOT NULL,
  `new_sede` varchar(100) DEFAULT NULL,
  `modified_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dump dei dati per la tabella `log_modifiche`
--

INSERT INTO `log_modifiche` (`id`, `user_id`, `turno_id`, `dipendente`, `old_entry_date`, `old_entry_time`, `old_exit_date`, `old_exit_time`, `old_sede`, `new_entry_date`, `new_entry_time`, `new_exit_date`, `new_exit_time`, `new_sede`, `modified_at`) VALUES
(1, 2, 123, 'GIUDICE ALESSANDRO', '2025-05-26', '21:00:00', '2025-05-27', '08:00:00', 'Centrale', '2025-05-26', '21:00:00', '2025-05-27', '09:00:00', 'Centrale', '2025-05-28 06:21:48'),
(2, 2, 123, 'GIUDICE ALESSANDRO', '2025-05-26', '21:00:00', '2025-05-27', '09:00:00', 'Centrale', '2025-05-26', '20:00:00', '2025-05-27', '09:00:00', 'Centrale', '2025-05-28 06:22:32'),
(3, 2, 123, 'GIUDICE ALESSANDRO', '2025-05-26', '20:00:00', '2025-05-27', '09:00:00', 'Centrale', '2025-05-26', '20:00:00', '2025-05-27', '09:00:00', 'Francavilla Fontana', '2025-05-28 06:23:11'),
(4, 2, 123, 'GIUDICE ALESSANDRO', '2025-05-26', '20:00:00', '2025-05-27', '09:00:00', 'Francavilla Fontana', '2025-05-26', '20:00:00', '2025-05-27', '10:00:00', 'Centrale', '2025-05-28 06:27:03'),
(5, 2, 123, 'GIUDICE ALESSANDRO', '2025-05-26', '20:00:00', '2025-05-27', '10:00:00', 'Centrale', '2025-05-26', '20:00:00', '2025-05-27', '10:00:00', 'Brindisi (Aeroportuale)', '2025-05-28 06:30:47'),
(6, 2, 123, 'GIUDICE ALESSANDRO', '2025-05-26', '20:00:00', '2025-05-27', '10:00:00', 'Brindisi (Aeroportuale)', '2025-05-26', '20:00:00', '2025-05-27', '09:00:00', 'Centrale', '2025-05-28 06:39:33'),
(7, 2, 123, 'GIUDICE ALESSANDRO', '2025-05-26', '20:00:00', '2025-05-27', '09:00:00', 'Centrale', '2025-05-26', '20:00:00', '2025-05-27', '09:00:00', 'Nucleo Sommozzatori', '2025-05-28 06:42:06'),
(8, 2, 123, 'GIUDICE ALESSANDRO', '2025-05-26', '20:00:00', '2025-05-27', '09:00:00', 'Nucleo Sommozzatori', '2025-05-26', '20:00:00', '2025-05-27', '11:00:00', 'Centrale', '2025-05-28 06:47:39'),
(9, 2, 123, 'GIUDICE ALESSANDRO', '2025-05-26', '20:00:00', '2025-05-27', '11:00:00', 'Centrale', '2025-05-26', '20:00:00', '2025-05-27', '13:00:00', 'Centrale', '2025-05-28 07:17:01'),
(10, 2, 123, 'GIUDICE ALESSANDRO', '2025-05-26', '20:00:00', '2025-05-27', '13:00:00', 'Centrale', '2025-05-26', '20:00:00', '2025-05-27', '13:00:00', 'Nucleo Nautico', '2025-05-28 07:17:08'),
(11, 2, 122, 'D\'AMURI FABRIZIO', '2025-05-26', '08:00:00', '2025-05-26', '20:00:00', NULL, '2025-05-26', '08:00:00', '2025-05-26', '20:00:00', 'Nucleo Nautico', '2025-05-28 07:18:03'),
(12, 2, 112, 'CAZZATO ALESSANDRO', '2025-05-28', '08:00:00', '2025-05-28', '20:00:00', NULL, '2025-05-28', '08:00:00', '2025-05-28', '20:00:00', 'Ostuni', '2025-05-28 07:30:23'),
(13, 2, 112, 'CAZZATO ALESSANDRO', '2025-05-28', '08:00:00', '2025-05-28', '20:00:00', 'Ostuni', '2025-05-28', '08:00:00', '2025-05-28', '20:00:00', 'Ostuni', '2025-05-28 07:42:05'),
(14, 2, 112, 'CAZZATO ALESSANDRO', '2025-05-28', '08:00:00', '2025-05-28', '20:00:00', 'Ostuni', '2025-05-28', '08:00:00', '2025-05-28', '20:00:00', 'Francavilla Fontana', '2025-05-28 07:42:50'),
(15, 2, 112, 'CAZZATO ALESSANDRO', '2025-05-28', '08:00:00', '2025-05-28', '20:00:00', 'Francavilla Fontana', '2025-05-28', '08:00:00', '2025-05-28', '21:00:00', 'Francavilla Fontana', '2025-05-28 07:43:00'),
(16, 2, 112, 'CAZZATO ALESSANDRO', '2025-05-28', '08:00:00', '2025-05-28', '21:00:00', 'Francavilla Fontana', '2025-05-28', '08:00:00', '2025-05-28', '21:00:00', 'Centrale', '2025-05-28 07:47:26'),
(17, 2, 109, 'CAZZATO ALESSANDRO', '2025-05-25', '08:00:00', '2025-05-25', '22:00:00', 'Francavilla Fontana', '2025-05-25', '08:00:00', '2025-05-25', '22:00:00', 'Centrale', '2025-05-28 13:08:21'),
(18, 2, 112, 'CAZZATO ALESSANDRO', '2025-05-28', '08:00:00', '2025-05-28', '21:00:00', 'Centrale', '2025-05-28', '08:00:00', '2025-05-28', '21:00:00', 'Francavilla Fontana', '2025-05-28 13:15:19'),
(19, 2, 112, 'CAZZATO ALESSANDRO', '2025-05-28', '08:00:00', '2025-05-28', '21:00:00', 'Francavilla Fontana', '2025-05-28', '08:00:00', '2025-05-28', '21:00:00', 'Brindisi (Aeroportuale)', '2025-05-28 13:21:01'),
(20, 2, 127, 'CAZZATO ALESSANDRO', '2025-05-23', '08:00:00', '2025-05-23', '20:00:00', 'Nucleo Sommozzatori', '2025-05-23', '08:00:00', '2025-05-23', '20:00:00', 'Ostuni', '2025-05-28 19:59:33'),
(21, 2, 129, 'AVALLONE EMILIO', '2025-05-28', '08:00:00', '2025-05-28', '20:00:00', 'Bari corso Sommozzatori', '2025-05-28', '08:00:00', '2025-05-28', '20:00:00', 'Brindisi corso sommozzatori', '2025-05-28 20:20:43'),
(22, 2, 129, 'AVALLONE EMILIO', '2025-05-28', '08:00:00', '2025-05-28', '20:00:00', 'Brindisi corso sommozzatori', '2025-05-28', '08:00:00', '2025-05-28', '20:00:00', 'Brindisi (Aeroportuale)', '2025-05-28 20:22:26'),
(23, 5, 123, 'GIUDICE ALESSANDRO', '2025-05-26', '20:00:00', '2025-05-27', '13:00:00', 'Nucleo Nautico', '2025-05-26', '20:00:00', '2025-05-27', '18:00:00', 'Centrale', '2025-06-06 20:59:39'),
(24, 3, 127, 'CAZZATO ALESSANDRO', '2025-05-23', '08:00:00', '2025-05-23', '20:00:00', 'Ostuni', '2025-05-23', '08:00:00', '2025-05-23', '20:00:00', 'Brindisi (Aeroportuale)', '2025-06-06 21:07:28'),
(25, 3, 101, 'CAZZATO ALESSANDRO', '2025-05-03', '20:00:00', '2025-05-04', '08:30:00', 'Centrale', '2025-05-03', '20:00:00', '2025-05-04', '08:30:00', 'Nucleo Sommozzatori', '2025-06-06 21:07:36');

-- --------------------------------------------------------

--
-- Struttura della tabella `qualifiche`
--

CREATE TABLE `qualifiche` (
  `id` int(11) NOT NULL,
  `qualifica` varchar(50) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dump dei dati per la tabella `qualifiche`
--

INSERT INTO `qualifiche` (`id`, `qualifica`) VALUES
(32, 'AVIG'),
(11, 'CQE'),
(6, 'CR'),
(33, 'CRESC AIB'),
(25, 'CRSC'),
(4, 'CS'),
(29, 'D'),
(24, 'DCS'),
(19, 'DCSLG'),
(3, 'DSLG'),
(18, 'IA'),
(35, 'IAE'),
(31, 'IIE'),
(28, 'ILGE'),
(14, 'NCCR'),
(12, 'NCVFC'),
(15, 'NCVFCSC'),
(21, 'NMCRSC'),
(26, 'NMCSE'),
(16, 'NMI'),
(9, 'NMVFC'),
(8, 'OPER'),
(13, 'OPERESC'),
(23, 'PD'),
(30, 'SCR'),
(27, 'SCS'),
(22, 'SVFC'),
(2, 'VC'),
(10, 'VCSC'),
(34, 'VDLG'),
(1, 'VE'),
(5, 'VESC'),
(17, 'VIG'),
(20, 'VIGP'),
(7, 'VV');

-- --------------------------------------------------------

--
-- Struttura della tabella `sedi`
--

CREATE TABLE `sedi` (
  `id` int(11) NOT NULL,
  `nome` varchar(100) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dump dei dati per la tabella `sedi`
--

INSERT INTO `sedi` (`id`, `nome`) VALUES
(4, 'Brindisi (Aeroportuale)'),
(1, 'Centrale'),
(3, 'Francavilla Fontana'),
(5, 'Nucleo Nautico'),
(6, 'Nucleo Sommozzatori'),
(2, 'Ostuni');

-- --------------------------------------------------------

--
-- Struttura della tabella `turni`
--

CREATE TABLE `turni` (
  `id` int(11) NOT NULL,
  `employee_id` int(11) NOT NULL,
  `entry_date` date NOT NULL,
  `entry_time` time NOT NULL,
  `exit_date` date NOT NULL,
  `exit_time` time NOT NULL,
  `created_at` datetime DEFAULT current_timestamp(),
  `created_by` varchar(50) DEFAULT NULL,
  `sede` varchar(100) DEFAULT NULL,
  `version` int(11) DEFAULT 1,
  `last_modified` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `modified_by` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dump dei dati per la tabella `turni`
--

INSERT INTO `turni` (`id`, `employee_id`, `entry_date`, `entry_time`, `exit_date`, `exit_time`, `created_at`, `created_by`, `sede`, `version`, `last_modified`, `modified_by`) VALUES
(54, 17, '2025-05-12', '08:00:00', '2025-05-12', '11:05:00', '2025-05-12 17:41:36', NULL, 'Francavilla Fontana', 1, '2025-05-22 10:09:35', NULL),
(55, 14, '2025-05-12', '09:00:00', '2025-05-12', '11:00:00', '2025-05-12 22:06:31', NULL, 'Centrale', 1, '2025-05-22 10:09:35', NULL),
(56, 5, '2025-05-12', '08:00:00', '2025-05-12', '11:03:00', '2025-05-12 22:08:37', NULL, 'Ostuni', 1, '2025-05-22 10:09:35', NULL),
(57, 37, '2025-05-12', '08:00:00', '2025-05-12', '11:03:00', '2025-05-12 22:14:21', NULL, 'Centrale', 1, '2025-05-22 10:09:35', NULL),
(58, 7, '2025-05-12', '08:00:00', '2025-05-12', '11:03:00', '2025-05-12 22:29:51', NULL, 'Ostuni', 1, '2025-05-22 10:09:35', NULL),
(59, 188, '2025-05-12', '08:00:00', '2025-05-12', '11:03:00', '2025-05-12 22:30:28', NULL, 'Centrale', 1, '2025-05-22 10:09:35', NULL),
(60, 13, '2025-05-12', '08:00:00', '2025-05-12', '11:03:00', '2025-05-12 22:34:20', NULL, 'Centrale', 1, '2025-05-22 10:09:35', NULL),
(61, 73, '2025-05-12', '08:00:00', '2025-05-12', '11:03:00', '2025-05-12 22:41:49', NULL, 'Centrale', 1, '2025-05-22 10:09:35', NULL),
(65, 8, '2025-05-12', '08:00:00', '2025-05-13', '23:00:00', '2025-05-12 23:23:44', NULL, NULL, 1, '2025-05-22 10:09:35', NULL),
(68, 1, '2025-05-12', '08:00:00', '2025-05-12', '20:00:00', '2025-05-12 23:27:35', NULL, NULL, 1, '2025-05-22 10:09:35', NULL),
(69, 4, '2025-05-12', '08:00:00', '2025-05-12', '22:00:00', '2025-05-12 23:32:31', NULL, 'Centrale', 1, '2025-05-22 10:09:35', NULL),
(70, 15, '2025-05-12', '08:00:00', '2025-05-12', '23:00:00', '2025-05-12 23:38:16', NULL, NULL, 1, '2025-05-22 10:09:35', NULL),
(74, 21, '2025-05-12', '08:00:00', '2025-05-12', '22:00:00', '2025-05-12 23:58:06', NULL, NULL, 1, '2025-05-22 10:09:35', NULL),
(75, 61, '2025-05-12', '08:00:00', '2025-05-12', '12:15:00', '2025-05-13 00:50:41', NULL, NULL, 1, '2025-05-22 10:09:35', NULL),
(80, 17, '2025-05-14', '20:00:00', '2025-05-15', '09:00:00', '2025-05-14 00:14:13', NULL, 'Nucleo Sommozzatori', 1, '2025-05-22 10:09:35', NULL),
(82, 2, '2025-05-15', '15:21:00', '2025-05-15', '20:00:00', '2025-05-14 19:22:23', NULL, NULL, 1, '2025-05-22 10:09:35', NULL),
(83, 2, '2025-05-18', '19:22:00', '2025-05-18', '22:22:00', '2025-05-14 19:23:04', NULL, NULL, 1, '2025-05-22 10:09:35', NULL),
(85, 275, '2025-05-15', '08:00:00', '2025-05-15', '20:00:00', '2025-05-15 18:16:37', NULL, NULL, 1, '2025-05-22 10:09:35', NULL),
(86, 275, '2025-05-23', '11:00:00', '2025-05-24', '10:30:00', '2025-05-15 18:17:10', NULL, 'Centrale', 1, '2025-05-22 10:09:35', NULL),
(88, 19, '2025-05-15', '08:00:00', '2025-05-15', '22:00:00', '2025-05-15 21:42:52', NULL, 'Bari', 1, '2025-05-22 10:09:35', NULL),
(89, 80, '2025-05-15', '08:00:00', '2025-05-15', '21:00:00', '2025-05-15 21:52:08', NULL, 'Bari', 1, '2025-05-22 10:09:35', NULL),
(90, 275, '2025-05-20', '22:30:00', '2025-05-21', '08:00:00', '2025-05-15 22:20:23', NULL, NULL, 1, '2025-05-22 10:09:35', NULL),
(91, 6, '2025-05-15', '08:00:00', '2025-05-16', '09:00:00', '2025-05-15 22:24:35', NULL, NULL, 1, '2025-05-22 10:09:35', NULL),
(92, 24, '2025-05-15', '08:00:00', '2025-05-15', '22:00:00', '2025-05-15 22:24:53', NULL, 'Bari', 1, '2025-05-22 10:09:35', NULL),
(94, 61, '2025-05-19', '08:00:00', '2025-05-19', '22:00:00', '2025-05-19 09:18:34', NULL, NULL, 1, '2025-05-22 10:09:35', NULL),
(95, 61, '2025-05-20', '22:00:00', '2025-05-21', '08:00:00', '2025-05-19 09:21:06', NULL, NULL, 1, '2025-05-22 10:09:35', NULL),
(96, 61, '2025-05-25', '08:00:00', '2025-05-25', '20:00:00', '2025-05-19 11:54:42', NULL, 'Francavilla Fontana', 1, '2025-05-25 06:37:21', NULL),
(97, 61, '2025-05-10', '20:00:00', '2025-05-11', '08:00:00', '2025-05-19 11:56:42', NULL, NULL, 1, '2025-05-22 10:09:35', NULL),
(99, 13, '2025-05-22', '20:57:00', '2025-05-22', '21:57:00', '2025-05-22 15:57:06', NULL, NULL, 1, '2025-05-22 13:57:06', NULL),
(100, 54, '2025-05-02', '08:00:00', '2025-05-02', '22:00:00', '2025-05-25 08:44:30', NULL, NULL, 1, '2025-05-25 06:44:30', NULL),
(101, 54, '2025-05-03', '20:00:00', '2025-05-04', '08:30:00', '2025-05-25 08:45:25', NULL, 'Nucleo Sommozzatori', 1, '2025-06-06 21:07:36', NULL),
(102, 54, '2025-05-05', '08:00:00', '2025-05-05', '20:15:00', '2025-05-25 08:47:45', NULL, NULL, 1, '2025-05-25 06:47:45', NULL),
(103, 54, '2025-05-06', '20:00:00', '2025-05-07', '08:00:00', '2025-05-25 08:48:30', NULL, NULL, 1, '2025-05-25 06:48:30', NULL),
(104, 54, '2025-05-09', '08:00:00', '2025-05-09', '20:00:00', '2025-05-25 08:50:23', NULL, NULL, 1, '2025-05-25 06:50:23', NULL),
(105, 54, '2025-05-10', '08:15:00', '2025-05-10', '21:30:00', '2025-05-25 08:53:05', NULL, NULL, 1, '2025-05-25 06:53:05', NULL),
(106, 54, '2025-05-13', '20:00:00', '2025-05-14', '08:00:00', '2025-05-25 08:53:42', NULL, NULL, 1, '2025-05-25 06:53:42', NULL),
(107, 54, '2025-05-11', '08:00:00', '2025-05-11', '22:00:00', '2025-05-25 08:54:46', NULL, NULL, 1, '2025-05-25 06:54:46', NULL),
(109, 54, '2025-05-25', '08:00:00', '2025-05-25', '22:00:00', '2025-05-25 08:58:53', NULL, 'Centrale', 1, '2025-05-28 13:08:21', NULL),
(110, 54, '2025-05-26', '08:00:00', '2025-05-26', '20:00:00', '2025-05-25 09:27:58', NULL, NULL, 1, '2025-05-25 07:27:58', NULL),
(111, 54, '2025-05-27', '08:00:00', '2025-05-27', '20:00:00', '2025-05-25 09:28:44', NULL, NULL, 1, '2025-05-25 07:28:44', NULL),
(113, 54, '2025-05-15', '08:00:00', '2025-05-15', '20:00:00', '2025-05-25 09:30:47', NULL, NULL, 1, '2025-05-25 07:30:47', NULL),
(114, 54, '2025-05-16', '08:00:00', '2025-05-16', '20:00:00', '2025-05-25 09:31:08', NULL, NULL, 1, '2025-05-25 07:31:08', NULL),
(115, 54, '2025-05-17', '08:00:00', '2025-05-17', '20:02:00', '2025-05-25 09:31:32', NULL, NULL, 1, '2025-05-25 07:31:32', NULL),
(116, 54, '2025-05-18', '08:00:00', '2025-05-18', '20:00:00', '2025-05-25 09:31:50', NULL, NULL, 1, '2025-05-25 07:31:50', NULL),
(117, 54, '2025-05-19', '08:00:00', '2025-05-19', '20:00:00', '2025-05-25 09:32:07', NULL, NULL, 1, '2025-05-25 07:32:07', NULL),
(118, 54, '2025-05-20', '08:00:00', '2025-05-20', '20:00:00', '2025-05-25 09:32:31', NULL, NULL, 1, '2025-05-25 07:32:31', NULL),
(119, 54, '2025-05-21', '08:00:00', '2025-05-21', '22:00:00', '2025-05-25 09:32:53', NULL, NULL, 1, '2025-05-25 07:32:53', NULL),
(120, 16, '2025-05-10', '08:00:00', '2025-05-10', '20:00:00', '2025-05-26 15:20:34', NULL, 'Francavilla Fontana', 1, '2025-05-26 13:20:34', NULL),
(121, 16, '2025-05-26', '12:00:00', '2025-05-26', '20:00:00', '2025-05-26 15:21:06', NULL, 'Ostuni', 1, '2025-05-26 13:21:06', NULL),
(122, 81, '2025-05-26', '08:00:00', '2025-05-26', '20:00:00', '2025-05-26 16:05:33', NULL, 'Nucleo Nautico', 1, '2025-05-28 07:18:03', NULL),
(123, 134, '2025-05-26', '20:00:00', '2025-05-27', '18:00:00', '2025-05-26 16:13:58', '5', 'Centrale', 1, '2025-06-06 20:59:39', NULL),
(124, 54, '2025-05-01', '08:00:00', '2025-05-01', '20:00:00', '2025-05-28 21:16:55', NULL, NULL, 1, '2025-05-28 19:16:55', NULL),
(125, 54, '2025-05-31', '08:00:00', '2025-05-31', '20:00:00', '2025-05-28 21:17:36', NULL, NULL, 1, '2025-05-28 19:17:36', NULL),
(126, 54, '2025-05-29', '08:00:00', '2025-05-29', '22:00:00', '2025-05-28 21:18:42', NULL, NULL, 1, '2025-05-28 19:18:42', NULL),
(127, 54, '2025-05-23', '08:00:00', '2025-05-23', '20:00:00', '2025-05-28 21:19:05', NULL, 'Brindisi (Aeroportuale)', 1, '2025-06-06 21:07:28', NULL),
(128, 54, '2025-05-24', '08:00:00', '2025-05-24', '20:00:00', '2025-05-28 21:19:32', NULL, NULL, 1, '2025-05-28 19:19:32', NULL),
(129, 13, '2025-05-28', '08:00:00', '2025-05-28', '20:00:00', '2025-05-28 22:06:05', NULL, 'Brindisi (Aeroportuale)', 1, '2025-05-28 20:22:26', NULL);

-- --------------------------------------------------------

--
-- Struttura della tabella `users`
--

CREATE TABLE `users` (
  `id` int(11) NOT NULL,
  `username` varchar(50) NOT NULL,
  `password` varchar(100) NOT NULL,
  `ruolo` enum('admin','user','supervisor','superadmin') NOT NULL DEFAULT 'user'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dump dei dati per la tabella `users`
--

INSERT INTO `users` (`id`, `username`, `password`, `ruolo`) VALUES
(1, 'user', '$2y$10$srRJmW0ESjKB1vVeIMmkeufT5U7qWRK3l50BfE1cV863zxMPRexWi', 'user'),
(2, 'admin', '$2b$12$Y83gcuudnuobBeqWaxUk0e9xb.3Fo9dZ/PRqrmFnm7cOTXi73vaD.', 'admin'),
(3, 'rootadmin', '$2b$12$Y83gcuudnuobBeqWaxUk0e9xb.3Fo9dZ/PRqrmFnm7cOTXi73vaD.', 'superadmin'),
(4, 'antonella_ragno', '$2y$10$gS7g3re3MBHraBBuJ6QcdONILg6m2vfFeN.Orc5LiQtYr3wJ62bWa', 'admin'),
(5, 'flavia_barca', '$2y$10$cYs/2rZTKY6tZijWaSkh9e4iaZUwASws6/o.crsP2RlBgv2IiUwNa', 'admin');

-- --------------------------------------------------------

--
-- Struttura della tabella `users_sessions`
--

CREATE TABLE `users_sessions` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `login_time` datetime NOT NULL,
  `logout_time` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Indici per le tabelle scaricate
--

--
-- Indici per le tabelle `calcolo_ore`
--
ALTER TABLE `calcolo_ore`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `turno_id` (`turno_id`),
  ADD KEY `employee_id` (`employee_id`),
  ADD KEY `entry_date` (`entry_date`);

--
-- Indici per le tabelle `dipendenti`
--
ALTER TABLE `dipendenti`
  ADD PRIMARY KEY (`id`);

--
-- Indici per le tabelle `log_modifiche`
--
ALTER TABLE `log_modifiche`
  ADD PRIMARY KEY (`id`),
  ADD KEY `turno_id` (`turno_id`),
  ADD KEY `user_id` (`user_id`),
  ADD KEY `modified_at` (`modified_at`);

--
-- Indici per le tabelle `qualifiche`
--
ALTER TABLE `qualifiche`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `nome` (`qualifica`);

--
-- Indici per le tabelle `sedi`
--
ALTER TABLE `sedi`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `nome` (`nome`);

--
-- Indici per le tabelle `turni`
--
ALTER TABLE `turni`
  ADD PRIMARY KEY (`id`),
  ADD KEY `employee_id` (`employee_id`);

--
-- Indici per le tabelle `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`);

--
-- Indici per le tabelle `users_sessions`
--
ALTER TABLE `users_sessions`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user_id` (`user_id`);

--
-- AUTO_INCREMENT per le tabelle scaricate
--

--
-- AUTO_INCREMENT per la tabella `calcolo_ore`
--
ALTER TABLE `calcolo_ore`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=179;

--
-- AUTO_INCREMENT per la tabella `dipendenti`
--
ALTER TABLE `dipendenti`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=405;

--
-- AUTO_INCREMENT per la tabella `log_modifiche`
--
ALTER TABLE `log_modifiche`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=26;

--
-- AUTO_INCREMENT per la tabella `qualifiche`
--
ALTER TABLE `qualifiche`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=39;

--
-- AUTO_INCREMENT per la tabella `sedi`
--
ALTER TABLE `sedi`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=14;

--
-- AUTO_INCREMENT per la tabella `turni`
--
ALTER TABLE `turni`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=130;

--
-- AUTO_INCREMENT per la tabella `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT per la tabella `users_sessions`
--
ALTER TABLE `users_sessions`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- Limiti per le tabelle scaricate
--

--
-- Limiti per la tabella `calcolo_ore`
--
ALTER TABLE `calcolo_ore`
  ADD CONSTRAINT `calcolo_ore_ibfk_1` FOREIGN KEY (`turno_id`) REFERENCES `turni` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `calcolo_ore_ibfk_2` FOREIGN KEY (`employee_id`) REFERENCES `dipendenti` (`id`) ON DELETE CASCADE;

--
-- Limiti per la tabella `turni`
--
ALTER TABLE `turni`
  ADD CONSTRAINT `turni_ibfk_1` FOREIGN KEY (`employee_id`) REFERENCES `dipendenti` (`id`) ON DELETE CASCADE;

--
-- Limiti per la tabella `users_sessions`
--
ALTER TABLE `users_sessions`
  ADD CONSTRAINT `users_sessions_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`);
--
-- Database: `phpmyadmin`
--
CREATE DATABASE IF NOT EXISTS `phpmyadmin` DEFAULT CHARACTER SET utf8 COLLATE utf8_bin;
USE `phpmyadmin`;

-- --------------------------------------------------------

--
-- Struttura della tabella `pma__bookmark`
--

CREATE TABLE `pma__bookmark` (
  `id` int(10) UNSIGNED NOT NULL,
  `dbase` varchar(255) NOT NULL DEFAULT '',
  `user` varchar(255) NOT NULL DEFAULT '',
  `label` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL DEFAULT '',
  `query` text NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_bin COMMENT='Bookmarks';

-- --------------------------------------------------------

--
-- Struttura della tabella `pma__central_columns`
--

CREATE TABLE `pma__central_columns` (
  `db_name` varchar(64) NOT NULL,
  `col_name` varchar(64) NOT NULL,
  `col_type` varchar(64) NOT NULL,
  `col_length` text DEFAULT NULL,
  `col_collation` varchar(64) NOT NULL,
  `col_isNull` tinyint(1) NOT NULL,
  `col_extra` varchar(255) DEFAULT '',
  `col_default` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_bin COMMENT='Central list of columns';

-- --------------------------------------------------------

--
-- Struttura della tabella `pma__column_info`
--

CREATE TABLE `pma__column_info` (
  `id` int(5) UNSIGNED NOT NULL,
  `db_name` varchar(64) NOT NULL DEFAULT '',
  `table_name` varchar(64) NOT NULL DEFAULT '',
  `column_name` varchar(64) NOT NULL DEFAULT '',
  `comment` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL DEFAULT '',
  `mimetype` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL DEFAULT '',
  `transformation` varchar(255) NOT NULL DEFAULT '',
  `transformation_options` varchar(255) NOT NULL DEFAULT '',
  `input_transformation` varchar(255) NOT NULL DEFAULT '',
  `input_transformation_options` varchar(255) NOT NULL DEFAULT ''
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_bin COMMENT='Column information for phpMyAdmin';

-- --------------------------------------------------------

--
-- Struttura della tabella `pma__designer_settings`
--

CREATE TABLE `pma__designer_settings` (
  `username` varchar(64) NOT NULL,
  `settings_data` text NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_bin COMMENT='Settings related to Designer';

-- --------------------------------------------------------

--
-- Struttura della tabella `pma__export_templates`
--

CREATE TABLE `pma__export_templates` (
  `id` int(5) UNSIGNED NOT NULL,
  `username` varchar(64) NOT NULL,
  `export_type` varchar(10) NOT NULL,
  `template_name` varchar(64) NOT NULL,
  `template_data` text NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_bin COMMENT='Saved export templates';

-- --------------------------------------------------------

--
-- Struttura della tabella `pma__favorite`
--

CREATE TABLE `pma__favorite` (
  `username` varchar(64) NOT NULL,
  `tables` text NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_bin COMMENT='Favorite tables';

-- --------------------------------------------------------

--
-- Struttura della tabella `pma__history`
--

CREATE TABLE `pma__history` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `username` varchar(64) NOT NULL DEFAULT '',
  `db` varchar(64) NOT NULL DEFAULT '',
  `table` varchar(64) NOT NULL DEFAULT '',
  `timevalue` timestamp NOT NULL DEFAULT current_timestamp(),
  `sqlquery` text NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_bin COMMENT='SQL history for phpMyAdmin';

-- --------------------------------------------------------

--
-- Struttura della tabella `pma__navigationhiding`
--

CREATE TABLE `pma__navigationhiding` (
  `username` varchar(64) NOT NULL,
  `item_name` varchar(64) NOT NULL,
  `item_type` varchar(64) NOT NULL,
  `db_name` varchar(64) NOT NULL,
  `table_name` varchar(64) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_bin COMMENT='Hidden items of navigation tree';

-- --------------------------------------------------------

--
-- Struttura della tabella `pma__pdf_pages`
--

CREATE TABLE `pma__pdf_pages` (
  `db_name` varchar(64) NOT NULL DEFAULT '',
  `page_nr` int(10) UNSIGNED NOT NULL,
  `page_descr` varchar(50) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL DEFAULT ''
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_bin COMMENT='PDF relation pages for phpMyAdmin';

-- --------------------------------------------------------

--
-- Struttura della tabella `pma__recent`
--

CREATE TABLE `pma__recent` (
  `username` varchar(64) NOT NULL,
  `tables` text NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_bin COMMENT='Recently accessed tables';

--
-- Dump dei dati per la tabella `pma__recent`
--

INSERT INTO `pma__recent` (`username`, `tables`) VALUES
('root', '[{\"db\":\"gestione_ore\",\"table\":\"users\"},{\"db\":\"gestione_ore\",\"table\":\"turni\"},{\"db\":\"gestione_ore\",\"table\":\"log_modifiche\"},{\"db\":\"gestione_ore\",\"table\":\"users_sessions\"},{\"db\":\"gestione_ore\",\"table\":\"qualifiche\"},{\"db\":\"gestione_ore\",\"table\":\"calcolo_ore\"},{\"db\":\"gestione_ore\",\"table\":\"dipendenti\"},{\"db\":\"gestione_ore\",\"table\":\"sedi\"},{\"db\":\"gestioneoredb\",\"table\":\"dipendenti\"},{\"db\":\"gestione_turni\",\"table\":\"turni\"}]');

-- --------------------------------------------------------

--
-- Struttura della tabella `pma__relation`
--

CREATE TABLE `pma__relation` (
  `master_db` varchar(64) NOT NULL DEFAULT '',
  `master_table` varchar(64) NOT NULL DEFAULT '',
  `master_field` varchar(64) NOT NULL DEFAULT '',
  `foreign_db` varchar(64) NOT NULL DEFAULT '',
  `foreign_table` varchar(64) NOT NULL DEFAULT '',
  `foreign_field` varchar(64) NOT NULL DEFAULT ''
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_bin COMMENT='Relation table';

-- --------------------------------------------------------

--
-- Struttura della tabella `pma__savedsearches`
--

CREATE TABLE `pma__savedsearches` (
  `id` int(5) UNSIGNED NOT NULL,
  `username` varchar(64) NOT NULL DEFAULT '',
  `db_name` varchar(64) NOT NULL DEFAULT '',
  `search_name` varchar(64) NOT NULL DEFAULT '',
  `search_data` text NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_bin COMMENT='Saved searches';

-- --------------------------------------------------------

--
-- Struttura della tabella `pma__table_coords`
--

CREATE TABLE `pma__table_coords` (
  `db_name` varchar(64) NOT NULL DEFAULT '',
  `table_name` varchar(64) NOT NULL DEFAULT '',
  `pdf_page_number` int(11) NOT NULL DEFAULT 0,
  `x` float UNSIGNED NOT NULL DEFAULT 0,
  `y` float UNSIGNED NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_bin COMMENT='Table coordinates for phpMyAdmin PDF output';

-- --------------------------------------------------------

--
-- Struttura della tabella `pma__table_info`
--

CREATE TABLE `pma__table_info` (
  `db_name` varchar(64) NOT NULL DEFAULT '',
  `table_name` varchar(64) NOT NULL DEFAULT '',
  `display_field` varchar(64) NOT NULL DEFAULT ''
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_bin COMMENT='Table information for phpMyAdmin';

-- --------------------------------------------------------

--
-- Struttura della tabella `pma__table_uiprefs`
--

CREATE TABLE `pma__table_uiprefs` (
  `username` varchar(64) NOT NULL,
  `db_name` varchar(64) NOT NULL,
  `table_name` varchar(64) NOT NULL,
  `prefs` text NOT NULL,
  `last_update` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_bin COMMENT='Tables'' UI preferences';

--
-- Dump dei dati per la tabella `pma__table_uiprefs`
--

INSERT INTO `pma__table_uiprefs` (`username`, `db_name`, `table_name`, `prefs`, `last_update`) VALUES
('root', 'gestione_ore', 'qualifiche', '[]', '2025-05-22 12:41:35'),
('root', 'gestione_ore', 'turni', '{\"sorted_col\":\"`created_by` ASC\"}', '2025-06-06 21:01:47'),
('root', 'gestione_turni', 'dipendenti', '{\"CREATE_TIME\":\"2025-04-27 19:27:47\",\"col_order\":[1,0,3,2,4,5],\"col_visib\":[1,1,1,1,1,1]}', '2025-04-30 19:26:27');

-- --------------------------------------------------------

--
-- Struttura della tabella `pma__tracking`
--

CREATE TABLE `pma__tracking` (
  `db_name` varchar(64) NOT NULL,
  `table_name` varchar(64) NOT NULL,
  `version` int(10) UNSIGNED NOT NULL,
  `date_created` datetime NOT NULL,
  `date_updated` datetime NOT NULL,
  `schema_snapshot` text NOT NULL,
  `schema_sql` text DEFAULT NULL,
  `data_sql` longtext DEFAULT NULL,
  `tracking` set('UPDATE','REPLACE','INSERT','DELETE','TRUNCATE','CREATE DATABASE','ALTER DATABASE','DROP DATABASE','CREATE TABLE','ALTER TABLE','RENAME TABLE','DROP TABLE','CREATE INDEX','DROP INDEX','CREATE VIEW','ALTER VIEW','DROP VIEW') DEFAULT NULL,
  `tracking_active` int(1) UNSIGNED NOT NULL DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_bin COMMENT='Database changes tracking for phpMyAdmin';

-- --------------------------------------------------------

--
-- Struttura della tabella `pma__userconfig`
--

CREATE TABLE `pma__userconfig` (
  `username` varchar(64) NOT NULL,
  `timevalue` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `config_data` text NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_bin COMMENT='User preferences storage for phpMyAdmin';

--
-- Dump dei dati per la tabella `pma__userconfig`
--

INSERT INTO `pma__userconfig` (`username`, `timevalue`, `config_data`) VALUES
('root', '2025-10-15 14:27:51', '{\"Console\\/Mode\":\"collapse\",\"lang\":\"it\",\"NavigationWidth\":276}');

-- --------------------------------------------------------

--
-- Struttura della tabella `pma__usergroups`
--

CREATE TABLE `pma__usergroups` (
  `usergroup` varchar(64) NOT NULL,
  `tab` varchar(64) NOT NULL,
  `allowed` enum('Y','N') NOT NULL DEFAULT 'N'
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_bin COMMENT='User groups with configured menu items';

-- --------------------------------------------------------

--
-- Struttura della tabella `pma__users`
--

CREATE TABLE `pma__users` (
  `username` varchar(64) NOT NULL,
  `usergroup` varchar(64) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_bin COMMENT='Users and their assignments to user groups';

--
-- Indici per le tabelle scaricate
--

--
-- Indici per le tabelle `pma__bookmark`
--
ALTER TABLE `pma__bookmark`
  ADD PRIMARY KEY (`id`);

--
-- Indici per le tabelle `pma__central_columns`
--
ALTER TABLE `pma__central_columns`
  ADD PRIMARY KEY (`db_name`,`col_name`);

--
-- Indici per le tabelle `pma__column_info`
--
ALTER TABLE `pma__column_info`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `db_name` (`db_name`,`table_name`,`column_name`);

--
-- Indici per le tabelle `pma__designer_settings`
--
ALTER TABLE `pma__designer_settings`
  ADD PRIMARY KEY (`username`);

--
-- Indici per le tabelle `pma__export_templates`
--
ALTER TABLE `pma__export_templates`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `u_user_type_template` (`username`,`export_type`,`template_name`);

--
-- Indici per le tabelle `pma__favorite`
--
ALTER TABLE `pma__favorite`
  ADD PRIMARY KEY (`username`);

--
-- Indici per le tabelle `pma__history`
--
ALTER TABLE `pma__history`
  ADD PRIMARY KEY (`id`),
  ADD KEY `username` (`username`,`db`,`table`,`timevalue`);

--
-- Indici per le tabelle `pma__navigationhiding`
--
ALTER TABLE `pma__navigationhiding`
  ADD PRIMARY KEY (`username`,`item_name`,`item_type`,`db_name`,`table_name`);

--
-- Indici per le tabelle `pma__pdf_pages`
--
ALTER TABLE `pma__pdf_pages`
  ADD PRIMARY KEY (`page_nr`),
  ADD KEY `db_name` (`db_name`);

--
-- Indici per le tabelle `pma__recent`
--
ALTER TABLE `pma__recent`
  ADD PRIMARY KEY (`username`);

--
-- Indici per le tabelle `pma__relation`
--
ALTER TABLE `pma__relation`
  ADD PRIMARY KEY (`master_db`,`master_table`,`master_field`),
  ADD KEY `foreign_field` (`foreign_db`,`foreign_table`);

--
-- Indici per le tabelle `pma__savedsearches`
--
ALTER TABLE `pma__savedsearches`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `u_savedsearches_username_dbname` (`username`,`db_name`,`search_name`);

--
-- Indici per le tabelle `pma__table_coords`
--
ALTER TABLE `pma__table_coords`
  ADD PRIMARY KEY (`db_name`,`table_name`,`pdf_page_number`);

--
-- Indici per le tabelle `pma__table_info`
--
ALTER TABLE `pma__table_info`
  ADD PRIMARY KEY (`db_name`,`table_name`);

--
-- Indici per le tabelle `pma__table_uiprefs`
--
ALTER TABLE `pma__table_uiprefs`
  ADD PRIMARY KEY (`username`,`db_name`,`table_name`);

--
-- Indici per le tabelle `pma__tracking`
--
ALTER TABLE `pma__tracking`
  ADD PRIMARY KEY (`db_name`,`table_name`,`version`);

--
-- Indici per le tabelle `pma__userconfig`
--
ALTER TABLE `pma__userconfig`
  ADD PRIMARY KEY (`username`);

--
-- Indici per le tabelle `pma__usergroups`
--
ALTER TABLE `pma__usergroups`
  ADD PRIMARY KEY (`usergroup`,`tab`,`allowed`);

--
-- Indici per le tabelle `pma__users`
--
ALTER TABLE `pma__users`
  ADD PRIMARY KEY (`username`,`usergroup`);

--
-- AUTO_INCREMENT per le tabelle scaricate
--

--
-- AUTO_INCREMENT per la tabella `pma__bookmark`
--
ALTER TABLE `pma__bookmark`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT per la tabella `pma__column_info`
--
ALTER TABLE `pma__column_info`
  MODIFY `id` int(5) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT per la tabella `pma__export_templates`
--
ALTER TABLE `pma__export_templates`
  MODIFY `id` int(5) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT per la tabella `pma__history`
--
ALTER TABLE `pma__history`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT per la tabella `pma__pdf_pages`
--
ALTER TABLE `pma__pdf_pages`
  MODIFY `page_nr` int(10) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT per la tabella `pma__savedsearches`
--
ALTER TABLE `pma__savedsearches`
  MODIFY `id` int(5) UNSIGNED NOT NULL AUTO_INCREMENT;
--
-- Database: `test`
--
CREATE DATABASE IF NOT EXISTS `test` DEFAULT CHARACTER SET latin1 COLLATE latin1_swedish_ci;
USE `test`;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
