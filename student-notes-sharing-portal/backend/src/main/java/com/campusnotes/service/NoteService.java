package com.campusnotes.service;

import com.campusnotes.dto.NoteResponse;
import com.campusnotes.dto.StatsResponse;
import com.campusnotes.exception.ResourceNotFoundException;
import com.campusnotes.model.Note;
import com.campusnotes.repository.NoteRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.net.MalformedURLException;
import java.nio.file.*;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

/**
 * NoteService — contains all the business logic for the notes feature.
 *
 * This class sits between the controller (HTTP layer) and the repository (database layer).
 * It handles file storage, validation, and data transformation.
 */
@Service
@RequiredArgsConstructor    // Lombok: injects all final fields via constructor (best practice)
@Slf4j                      // Lombok: provides a log.info() / log.error() logger
public class NoteService {

    private final NoteRepository noteRepository;

    /** Directory where uploaded PDFs are stored. Configured in application.properties. */
    @Value("${app.upload.dir:uploads}")
    private String uploadDir;

    // =====================================================================
    // PUBLIC METHODS
    // =====================================================================

    /**
     * Retrieve ALL notes from the database, ordered newest-first.
     */
    public List<NoteResponse> getAllNotes() {
        return noteRepository.findAll().stream()
                .sorted((a, b) -> b.getUploadedAt().compareTo(a.getUploadedAt()))
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    /**
     * Search notes by keyword (title, subject, or uploader name).
     */
    public List<NoteResponse> searchNotes(String keyword) {
        if (keyword == null || keyword.isBlank()) {
            return getAllNotes();
        }
        return noteRepository.searchNotes(keyword.trim()).stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    /**
     * Filter notes by subject name.
     */
    public List<NoteResponse> getNotesBySubject(String subject) {
        return noteRepository.findBySubjectIgnoreCase(subject).stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    /**
     * Filter notes by semester number (1-8).
     */
    public List<NoteResponse> getNotesBySemester(Integer semester) {
        return noteRepository.findBySemester(semester).stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    /**
     * Get a single note by its ID.
     */
    public NoteResponse getNoteById(Long id) {
        Note note = findNoteOrThrow(id);
        return toResponse(note);
    }

    /**
     * Save a new note: validate the file, store it on disk, save metadata to DB.
     */
    public NoteResponse saveNote(
            String title,
            String subject,
            Integer semester,
            String uploaderName,
            String description,
            MultipartFile file
    ) throws IOException {

        // --- File validation ---
        validatePdfFile(file);

        // --- Create the uploads directory if it does not exist ---
        Path uploadPath = Paths.get(uploadDir).toAbsolutePath().normalize();
        Files.createDirectories(uploadPath);

        // --- Generate a unique file name to prevent conflicts and path traversal ---
        String originalName = StringUtils.cleanPath(file.getOriginalFilename());
        String extension = getExtension(originalName);           // ".pdf"
        String storedName = UUID.randomUUID().toString() + extension;

        // --- Write the file to disk ---
        Path targetPath = uploadPath.resolve(storedName);
        Files.copy(file.getInputStream(), targetPath, StandardCopyOption.REPLACE_EXISTING);
        log.info("Saved PDF: {} -> {}", originalName, targetPath);

        // --- Save metadata to MySQL ---
        Note note = Note.builder()
                .title(title.trim())
                .subject(subject.trim())
                .semester(semester)
                .uploaderName(uploaderName.trim())
                .description(description != null ? description.trim() : null)
                .originalFileName(originalName)
                .storedFileName(storedName)
                .fileSize(file.getSize())
                .build();

        Note saved = noteRepository.save(note);
        log.info("Note saved to DB with id={}", saved.getId());

        return toResponse(saved);
    }

    /**
     * Load a stored PDF as a Spring Resource for download.
     */
    public Resource downloadNote(Long id) {
        Note note = findNoteOrThrow(id);

        try {
            Path uploadPath = Paths.get(uploadDir).toAbsolutePath().normalize();
            Path filePath = uploadPath.resolve(note.getStoredFileName()).normalize();

            // Security check: ensure the resolved path is inside the upload directory
            if (!filePath.startsWith(uploadPath)) {
                throw new IllegalArgumentException("Invalid file path detected.");
            }

            Resource resource = new UrlResource(filePath.toUri());
            if (!resource.exists() || !resource.isReadable()) {
                throw new ResourceNotFoundException("File not found on server for note id=" + id);
            }
            return resource;

        } catch (MalformedURLException ex) {
            throw new ResourceNotFoundException("Could not read file for note id=" + id);
        }
    }

    /**
     * Delete a note: remove from DB and delete the stored PDF from disk.
     */
    public void deleteNote(Long id) {
        Note note = findNoteOrThrow(id);

        // Delete the physical file first
        try {
            Path uploadPath = Paths.get(uploadDir).toAbsolutePath().normalize();
            Path filePath = uploadPath.resolve(note.getStoredFileName()).normalize();
            Files.deleteIfExists(filePath);
            log.info("Deleted file: {}", filePath);
        } catch (IOException ex) {
            // Log but don't fail — still remove the DB record
            log.warn("Could not delete file for note id={}: {}", id, ex.getMessage());
        }

        noteRepository.deleteById(id);
        log.info("Deleted note id={} from database", id);
    }

    /**
     * Return all distinct subject names for the filter dropdown.
     */
    public List<String> getAllSubjects() {
        return noteRepository.findDistinctSubjects();
    }

    /**
     * Return dashboard statistics (total notes + total subjects).
     */
    public StatsResponse getStats() {
        long totalNotes = noteRepository.count();
        long totalSubjects = noteRepository.countDistinctSubjects();
        return StatsResponse.builder()
                .totalNotes(totalNotes)
                .totalSubjects(totalSubjects)
                .build();
    }

    // =====================================================================
    // PRIVATE HELPERS
    // =====================================================================

    /** Fetch a note from DB, throw 404 if not found. */
    private Note findNoteOrThrow(Long id) {
        return noteRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Note", id));
    }

    /** Convert a Note entity to a safe NoteResponse DTO. */
    private NoteResponse toResponse(Note note) {
        return NoteResponse.builder()
                .id(note.getId())
                .title(note.getTitle())
                .subject(note.getSubject())
                .semester(note.getSemester())
                .uploaderName(note.getUploaderName())
                .description(note.getDescription())
                .originalFileName(note.getOriginalFileName())
                .fileSize(note.getFileSize())
                .uploadedAt(note.getUploadedAt())
                .build();
    }

    /**
     * Validate that the uploaded file:
     *  - is not null / empty
     *  - has a .pdf extension
     *  - does not exceed 15 MB
     */
    private void validatePdfFile(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("Please upload a PDF file.");
        }

        String originalName = file.getOriginalFilename();
        if (originalName == null || !originalName.toLowerCase().endsWith(".pdf")) {
            throw new IllegalArgumentException("Only PDF files are allowed.");
        }

        long maxSizeBytes = 15L * 1024 * 1024; // 15 MB
        if (file.getSize() > maxSizeBytes) {
            throw new IllegalArgumentException(
                    "File size exceeds the 15 MB limit. Your file is " +
                    (file.getSize() / (1024 * 1024)) + " MB.");
        }
    }

    /** Extract the file extension (including the dot) from a filename. */
    private String getExtension(String filename) {
        int dotIndex = filename.lastIndexOf('.');
        return (dotIndex >= 0) ? filename.substring(dotIndex) : "";
    }
}

