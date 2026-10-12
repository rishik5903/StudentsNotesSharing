package com.campusnotes.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * NoteResponse DTO — the JSON shape returned to the frontend.
 *
 * We use a DTO (Data Transfer Object) instead of the raw entity so that:
 *  - We control exactly which fields are exposed.
 *  - We never accidentally expose internal server paths or sensitive data.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class NoteResponse {
    private Long id;
    private String title;
    private String subject;
    private Integer semester;
    private String uploaderName;
    private String description;
    private String originalFileName;
    private Long fileSize;
    private LocalDateTime uploadedAt;
}

