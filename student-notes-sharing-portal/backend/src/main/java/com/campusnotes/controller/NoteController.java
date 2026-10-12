package com.campusnotes.controller;

import com.campusnotes.dto.NoteResponse;
import com.campusnotes.dto.StatsResponse;
import com.campusnotes.service.NoteService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

/**
 * NoteController — exposes all REST API endpoints for the notes feature.
 *
 * Base URL: /api/notes
 *
 * All responses are JSON (except file downloads which are PDF streams).
 */
@RestController
@RequestMapping("/api/notes")
@RequiredArgsConstructor
@Slf4j
public class NoteController {

    private final NoteService noteService;

    // -------------------------------------------------------
    // GET /api/notes
    // Supports optional query params: search, subject, semester
    // -------------------------------------------------------
    @GetMapping
    public ResponseEntity<List<NoteResponse>> getNotes(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String subject,
            @RequestParam(required = false) Integer semester
    ) {
        List<NoteResponse> notes;

        if (search != null && !search.isBlank()) {
            notes = noteService.searchNotes(search);
        } else if (subject != null && !subject.isBlank()) {
            notes = noteService.getNotesBySubject(subject);
        } else if (semester != null) {
            notes = noteService.getNotesBySemester(semester);
        } else {
            notes = noteService.getAllNotes();
        }

        return ResponseEntity.ok(notes);
    }

    // -------------------------------------------------------
    // GET /api/notes/stats
    // Must be declared BEFORE /api/notes/{id} to avoid clash
    // -------------------------------------------------------
    @GetMapping("/stats")
    public ResponseEntity<StatsResponse> getStats() {
        return ResponseEntity.ok(noteService.getStats());
    }

    // -------------------------------------------------------
    // GET /api/notes/subjects
    // -------------------------------------------------------
    @GetMapping("/subjects")
    public ResponseEntity<List<String>> getSubjects() {
        return ResponseEntity.ok(noteService.getAllSubjects());
    }

    // -------------------------------------------------------
    // GET /api/notes/{id}
    // -------------------------------------------------------
    @GetMapping("/{id}")
    public ResponseEntity<NoteResponse> getNoteById(@PathVariable Long id) {
        return ResponseEntity.ok(noteService.getNoteById(id));
    }

    // -------------------------------------------------------
    // POST /api/notes
    // Accepts multipart/form-data with the PDF file
    // -------------------------------------------------------
    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<NoteResponse> uploadNote(
            @RequestParam("title")        String title,
            @RequestParam("subject")      String subject,
            @RequestParam("semester")     Integer semester,
            @RequestParam("uploaderName") String uploaderName,
            @RequestParam(value = "description", required = false) String description,
            @RequestParam("file")         MultipartFile file
    ) throws IOException {

        log.info("Received upload: title='{}', subject='{}', semester={}, uploader='{}'",
                title, subject, semester, uploaderName);

        NoteResponse saved = noteService.saveNote(
                title, subject, semester, uploaderName, description, file
        );

        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }

    // -------------------------------------------------------
    // GET /api/notes/{id}/download
    // Streams the PDF file to the client
    // -------------------------------------------------------
    @GetMapping("/{id}/download")
    public ResponseEntity<Resource> downloadNote(@PathVariable Long id) {
        Resource resource = noteService.downloadNote(id);

        // Suggest the original filename to the browser
        NoteResponse note = noteService.getNoteById(id);
        String contentDisposition = "attachment; filename=\"" + note.getOriginalFileName() + "\"";

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, contentDisposition)
                .contentType(MediaType.APPLICATION_PDF)
                .body(resource);
    }

    // -------------------------------------------------------
    // DELETE /api/notes/{id}
    // -------------------------------------------------------
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteNote(@PathVariable Long id) {
        noteService.deleteNote(id);
        return ResponseEntity.noContent().build();  // 204 No Content
    }
}

