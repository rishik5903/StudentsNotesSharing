package com.campusnotes.repository;

import com.campusnotes.model.Note;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * NoteRepository — Spring Data JPA repository for the Note entity.
 *
 * Spring automatically generates the SQL for all methods below —
 * no manual SQL or boilerplate DAO code needed.
 */
@Repository
public interface NoteRepository extends JpaRepository<Note, Long> {

    /**
     * Search notes whose title, subject, or uploader name contains the keyword.
     * LOWER() makes the search case-insensitive.
     */
    @Query("SELECT n FROM Note n WHERE " +
           "LOWER(n.title) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
           "LOWER(n.subject) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
           "LOWER(n.uploaderName) LIKE LOWER(CONCAT('%', :keyword, '%'))")
    List<Note> searchNotes(@Param("keyword") String keyword);

    /**
     * Find all notes for a specific subject (case-insensitive).
     */
    List<Note> findBySubjectIgnoreCase(String subject);

    /**
     * Find all notes for a specific semester.
     */
    List<Note> findBySemester(Integer semester);

    /**
     * Retrieve all distinct subject names — used to populate the filter dropdown.
     */
    @Query("SELECT DISTINCT n.subject FROM Note n ORDER BY n.subject ASC")
    List<String> findDistinctSubjects();

    /**
     * Count total notes uploaded.
     */
    long count();

    /**
     * Count distinct subjects.
     */
    @Query("SELECT COUNT(DISTINCT n.subject) FROM Note n")
    long countDistinctSubjects();
}

