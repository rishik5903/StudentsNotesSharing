package com.campusnotes.exception;

/**
 * ResourceNotFoundException — thrown when a requested note is not found in the database.
 * Spring will map this to a 404 Not Found HTTP response via GlobalExceptionHandler.
 */
public class ResourceNotFoundException extends RuntimeException {

    public ResourceNotFoundException(String message) {
        super(message);
    }

    public ResourceNotFoundException(String resourceName, Long id) {
        super(resourceName + " with id " + id + " was not found.");
    }
}

