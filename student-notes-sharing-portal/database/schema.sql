-- ============================================================
-- CampusNotes — Student Notes Sharing Portal
-- Database Schema
-- ============================================================
-- Run this file after creating the database:
--   mysql -u YOUR_USERNAME -p student_notes_db < database/schema.sql
-- ============================================================

CREATE DATABASE IF NOT EXISTS student_notes_db
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE student_notes_db;

-- -------------------------------------------------------
-- Table: notes
-- Stores metadata for every uploaded note (PDF stored on disk)
-- -------------------------------------------------------
CREATE TABLE IF NOT EXISTS notes (
    id               BIGINT          NOT NULL AUTO_INCREMENT,
    title            VARCHAR(255)    NOT NULL,
    subject          VARCHAR(255)    NOT NULL,
    semester         INT             NOT NULL,
    uploader_name    VARCHAR(255)    NOT NULL,
    description      TEXT,
    original_file_name VARCHAR(255)  NOT NULL,
    stored_file_name VARCHAR(255)    NOT NULL UNIQUE,
    file_size        BIGINT,
    uploaded_at      TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY (id),
    INDEX idx_subject   (subject),
    INDEX idx_semester  (semester),
    INDEX idx_uploaded_at (uploaded_at),
    FULLTEXT INDEX ft_search (title, subject, uploader_name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -------------------------------------------------------
-- Optional: insert a few demo rows so the UI is not empty
-- on first launch. Remove or comment these out if you
-- prefer to start with an empty database.
-- -------------------------------------------------------
-- INSERT INTO notes
--   (title, subject, semester, uploader_name, description,
--    original_file_name, stored_file_name, file_size, uploaded_at)
-- VALUES
--   ('Data Structures Notes', 'Data Structures', 3, 'Rishik',
--    'Complete chapter-wise notes for DS unit 1-5.',
--    'ds-notes.pdf', 'demo-ds-notes.pdf', 204800, NOW()),
--   ('DBMS Short Notes', 'Database Management', 4, 'Priya',
--    'Quick revision notes for DBMS exam.',
--    'dbms-short.pdf', 'demo-dbms-short.pdf', 153600, NOW()),
--   ('OS Module 3', 'Operating Systems', 5, 'Arjun',
--    'Process scheduling and memory management.',
--    'os-mod3.pdf', 'demo-os-mod3.pdf', 307200, NOW());

