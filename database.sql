-- phpMyAdmin SQL Dump
-- version 4.8.5
-- https://www.phpmyadmin.net/
--
-- Generation Time: Aug 14, 2021 at 06:57 PM
-- Server version: 10.5.3-MariaDB-log
-- PHP Version: 7.2.25

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET AUTOCOMMIT = 0;
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database
--

-- --------------------------------------------------------

--
-- Table structure for table `invites`
--

CREATE TABLE `invites` (
  `serverid` varchar(18) NOT NULL,
  `userid` varchar(18) NOT NULL,
  `inviterid` varchar(18) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Dumping data for table `invites`
--

INSERT INTO `invites` (`serverid`, `userid`, `inviterid`) VALUES
('849074734109163570', '850887542852419644', '691383309065912331');

-- --------------------------------------------------------

--
-- Table structure for table `serverconfig`
--

CREATE TABLE `serverconfig` (
  `serverid` varchar(18) NOT NULL,
  `joinchannel` varchar(18) DEFAULT NULL,
  `leavechannel` varchar(18) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Dumping data for table `serverconfig`
--

INSERT INTO `serverconfig` (`serverid`, `joinchannel`, `leavechannel`) VALUES
('849074734109163570', '849074734109163573', '0');

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `serverid` varchar(18) NOT NULL,
  `userid` varchar(18) NOT NULL,
  `invites` int(11) DEFAULT NULL,
  `leaves` int(11) DEFAULT NULL,
  `totalinvites` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`serverid`, `userid`, `invites`, `leaves`, `totalinvites`) VALUES
('849074734109163570', '850887542852419644', 1, 0, 1),
('849074734109163570', '691383309065912331', 1, 0, 1);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
