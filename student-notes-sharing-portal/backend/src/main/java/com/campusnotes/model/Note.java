package com.campusnotes.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

/**
 * Note entity — maps to the `notes` table in MySQL.
 * Each row stores metadata for one uploaded PDF note.
 */
@Entity
@Table(name = "notes")
@Data                   // Lombok: generates getters, setters, equals, hashCode, toString
@NoArgsConstructor      // Lombok: generates a no-arg constructor (required by JPA)
@AllArgsConstructor     // Lombok: generates a constructor with all fields
@Builder                // Lombok: enables the builder pattern for cleaner object creation
public class Note {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "Title is required")
    @Size(max = 255, message = "Title must be at most 255 characters")
    @Column(nullable = false)
    private String title;

    @NotBlank(message = "Subject is required")
    @Size(max = 255, message = "Subject must be at most 255 characters")
    @Column(nullable = false)
    private String subject;

    @NotNull(message = "Semester is required")
    @Min(value = 1, message = "Semester must be between 1 and 8")
    @Max(value = 8, message = "Semester must be between 1 and 8")
    @Column(nullable = false)
    private Integer semester;

    @NotBlank(message = "Uploader name is required")
    @Size(max = 255, message = "Uploader name must be at most 255 characters")
    @Column(name = "uploader_name", nullable = false)
    private String uploaderName;

    @Column(columnDefinition = "TEXT")
    private String description;

    @NotBlank
    @Column(name = "original_file_name", nullable = false)
    private String originalFileName;

    @NotBlank
    @Column(name = "stored_file_name", nullable = false, unique = true)
    private String storedFileName;

    @Column(name = "file_size")
    private Long fileSize;

    @CreationTimestamp
    @Column(name = "uploaded_at", nullable = false, updatable = false)
    private LocalDateTime uploadedAt;
}

