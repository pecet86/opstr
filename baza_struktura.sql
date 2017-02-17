-- phpMyAdmin SQL Dump
-- version 4.0.10.14
-- http://www.phpmyadmin.net
--
-- Host: localhost:3306
-- Czas wygenerowania: 17 Lut 2017, 17:01
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
-- Struktura tabeli dla tabeli `str_admin_level2`
--

CREATE TABLE IF NOT EXISTS `str_admin_level2` (
  `ID` int(11) NOT NULL AUTO_INCREMENT,
  `PROVINCE` varchar(30) CHARACTER SET latin2 NOT NULL,
  `PROVINCE_SORT` text CHARACTER SET latin2 NOT NULL,
  `DISTRICT` varchar(30) CHARACTER SET latin2 NOT NULL,
  `COMMUNE` varchar(30) CHARACTER SET latin2 NOT NULL,
  PRIMARY KEY (`ID`)
) ENGINE=InnoDB  DEFAULT CHARSET=utf8 AUTO_INCREMENT=76 ;

-- --------------------------------------------------------

--
-- Struktura tabeli dla tabeli `str_elements2`
--

CREATE TABLE IF NOT EXISTS `str_elements2` (
  `ID` int(11) NOT NULL AUTO_INCREMENT,
  PRIMARY KEY (`ID`)
) ENGINE=InnoDB  DEFAULT CHARSET=utf8 AUTO_INCREMENT=32460 ;

-- --------------------------------------------------------

--
-- Struktura tabeli dla tabeli `str_nodes2`
--

CREATE TABLE IF NOT EXISTS `str_nodes2` (
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
-- Struktura tabeli dla tabeli `str_ways2`
--

CREATE TABLE IF NOT EXISTS `str_ways2` (
  `FK_ID` int(11) NOT NULL,
  `ENVELOPE` polygon NOT NULL,
  `DISTANCE` double DEFAULT NULL,
  `ONEWAY` tinyint(1) DEFAULT '1',
  `NODE_START` int(11) DEFAULT NULL,
  `NODE_END` int(11) DEFAULT NULL,
  `TYPE` enum('base','green','paving','semifixed') NOT NULL DEFAULT 'base',
  PRIMARY KEY (`FK_ID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- --------------------------------------------------------

--
-- Struktura tabeli dla tabeli `str_way_nodes2`
--

CREATE TABLE IF NOT EXISTS `str_way_nodes2` (
  `ID` int(11) NOT NULL AUTO_INCREMENT,
  `FK_way` int(11) NOT NULL,
  `FK_node` int(11) NOT NULL,
  PRIMARY KEY (`ID`)
) ENGINE=InnoDB  DEFAULT CHARSET=utf8 AUTO_INCREMENT=33207 ;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
