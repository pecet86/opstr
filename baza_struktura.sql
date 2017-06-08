-- phpMyAdmin SQL Dump
-- version 4.0.10.14
-- http://www.phpmyadmin.net
--
-- Host: localhost:3306
-- Czas wygenerowania: 08 Cze 2017, 12:22
-- Wersja serwera: 5.5.49-cll
-- Wersja PHP: 5.4.31

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8 */;

--
-- Baza danych: `swidnikm_str`
--

-- --------------------------------------------------------

--
-- Struktura tabeli dla tabeli `str_admin_level`
--

DROP TABLE IF EXISTS `str_admin_level`;
CREATE TABLE IF NOT EXISTS `str_admin_level` (
  `ID` int(11) NOT NULL AUTO_INCREMENT,
  `PROVINCE` varchar(30) NOT NULL,
  `PROVINCE_SORT` text NOT NULL,
  `DISTRICT` varchar(30) NOT NULL,
  `COMMUNE` varchar(30) NOT NULL,
  PRIMARY KEY (`ID`)
) ENGINE=InnoDB  DEFAULT CHARSET=utf8 AUTO_INCREMENT=224 ;

-- --------------------------------------------------------

--
-- Struktura tabeli dla tabeli `str_elements`
--

DROP TABLE IF EXISTS `str_elements`;
CREATE TABLE IF NOT EXISTS `str_elements` (
  `ID` int(11) NOT NULL AUTO_INCREMENT,
  PRIMARY KEY (`ID`)
) ENGINE=InnoDB  DEFAULT CHARSET=utf8 AUTO_INCREMENT=66398 ;

-- --------------------------------------------------------

--
-- Struktura tabeli dla tabeli `str_nodes`
--

DROP TABLE IF EXISTS `str_nodes`;
CREATE TABLE IF NOT EXISTS `str_nodes` (
  `FK_ID` int(11) NOT NULL,
  `GPS` point NOT NULL,
  `ELEVATION` double DEFAULT NULL,
  `TYPE` enum('base','main') NOT NULL DEFAULT 'base',
  `NUMBER` int(11) DEFAULT NULL,
  `FK_ADMIN_LEVEL` int(11) DEFAULT NULL,
  PRIMARY KEY (`FK_ID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- --------------------------------------------------------

--
-- Struktura tabeli dla tabeli `str_ways`
--

DROP TABLE IF EXISTS `str_ways`;
CREATE TABLE IF NOT EXISTS `str_ways` (
  `FK_ID` int(11) NOT NULL,
  `PATH` linestring DEFAULT NULL,
  `ENVELOPE` polygon NOT NULL,
  `DISTANCE` double DEFAULT NULL,
  `ONEWAY` tinyint(1) DEFAULT '1',
  `NODE_START` int(11) DEFAULT NULL,
  `NODE_END` int(11) DEFAULT NULL,
  `TYPE` enum('hard','green','paving','semifixed') NOT NULL DEFAULT 'hard',
  `FK_WAY` int(11) NOT NULL,
  PRIMARY KEY (`FK_ID`),
  KEY `FK_WAY` (`FK_WAY`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- --------------------------------------------------------

--
-- Struktura tabeli dla tabeli `str_way_nodes`
--

DROP TABLE IF EXISTS `str_way_nodes`;
CREATE TABLE IF NOT EXISTS `str_way_nodes` (
  `ID` int(11) NOT NULL AUTO_INCREMENT,
  `FK_way` int(11) NOT NULL,
  `FK_node` int(11) NOT NULL,
  PRIMARY KEY (`ID`)
) ENGINE=InnoDB  DEFAULT CHARSET=utf8 AUTO_INCREMENT=74296 ;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
