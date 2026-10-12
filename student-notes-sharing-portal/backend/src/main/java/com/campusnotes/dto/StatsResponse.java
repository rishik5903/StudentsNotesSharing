package com.campusnotes.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * StatsResponse DTO — returned by GET /api/notes/stats
 * Used to populate the Home Dashboard counters.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class StatsResponse {
    private long totalNotes;
    private long totalSubjects;
}

