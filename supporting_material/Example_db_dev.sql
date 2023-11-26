-- -----------------
-- A starter database for your convenience
-- -----------------

SET FOREIGN_KEY_CHECKS = 0;

CREATE DATABASE IF NOT EXISTS `Example_db_dev`
  CHARACTER SET latin1 COLLATE latin1_swedish_ci;

USE `Example_db_dev`;

DROP TABLE IF EXISTS `inventory`;
CREATE TABLE `inventory` (
  `id` BINARY(16) NOT NULL ,
  `name` VARCHAR(250) DEFAULT NULL ,
  `price` FLOAT(4) DEFAULT NULL ,
  `quantity` INTEGER NOT NULL ,
  CONSTRAINT pk_inventory PRIMARY KEY (id),
  UNIQUE KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COMMENT='' COLLATE=utf8_unicode_ci; 


DROP TABLE IF EXISTS `transactions`;
CREATE TABLE `transactions` (
  `id` BINARY(16) NOT NULL ,
  `date` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP on update CURRENT_TIMESTAMP ,
  `total` FLOAT(4) DEFAULT NULL , 
  `items` LONGTEXT DEFAULT NULL ,
  `tax` FLOAT(4) DEFAULT NULL ,
  CONSTRAINT pk_transactions PRIMARY KEY (id),
  UNIQUE KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COMMENT='' COLLATE=utf8_unicode_ci; 


DROP TABLE IF EXISTS `users`;
CREATE TABLE `users` (
  `id` BINARY(16) NOT NULL , 
  `username` VARCHAR(150) NOT NULL,
  `email` VARCHAR(150) NOT NULL,
  `password` VARCHAR(150) NOT NULL,
  CONSTRAINT pk_user PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COMMENT='' COLLATE=utf8_unicode_ci;

SET FOREIGN_KEY_CHECKS = 1;

SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0;

INSERT INTO Example_db_dev.inventory (`id`,`name`,`price`,`quantity`) VALUES 
(UUID_TO_BIN(UUID()), 'Red Turtle Cheddar Cheese', 4.99, 10),
(UUID_TO_BIN(UUID()), 'Uncle Schlappy Brand Scented Potpourri', 3.99, 10),
(UUID_TO_BIN(UUID()), 'Gold Monkey Saffron', 5.99, 10);

SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS;
