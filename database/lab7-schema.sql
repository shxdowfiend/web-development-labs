-- Лабораторна робота №7: база даних журналу прочитаних книг
CREATE DATABASE IF NOT EXISTS bookshelf
  CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE bookshelf;

CREATE TABLE IF NOT EXISTS books (
    id         INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    title      VARCHAR(150)     NOT NULL,
    author     VARCHAR(100)     NOT NULL,
    genre      VARCHAR(20)      NOT NULL,
    pages      SMALLINT UNSIGNED NOT NULL,
    rating     TINYINT UNSIGNED NOT NULL,
    review     TEXT             NOT NULL,
    email      VARCHAR(254)     NOT NULL,
    created_at TIMESTAMP        NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chk_rating CHECK (rating BETWEEN 1 AND 5),
    CONSTRAINT chk_pages  CHECK (pages BETWEEN 1 AND 5000)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
