/**
 * Helper function to make API requests
 * Automatically handles JSON parsing and error handling
 * @param url The API endpoint URL
 * @param options Request options including method, headers, body, etc.
 * @returns Promise with the response data
 */
export async function apiRequest(url: string, options: RequestInit = {}) {
  // Set default headers if not provided
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };
  
  try {
    const response = await fetch(url, {
      ...options,
      headers,
    });
    
    return response;
  } catch (error) {
    console.error('API request error:', error);
    throw error;
  }
}

/**
 * Regenerate a summary with a different prompt template
 * @param summaryId The ID of the summary to regenerate
 * @param promptType The type of prompt to use for regeneration
 * @returns The updated summary with screenshots
 */
export async function regenerateSummary(summaryId: number, promptType: string) {
  try {
    const response = await apiRequest(`/api/summaries/${summaryId}/regenerate`, {
      method: 'POST',
      body: JSON.stringify({ promptType }),
    });

    if (!response.ok) {
      throw new Error(`Failed to regenerate summary: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error regenerating summary:', error);
    throw error;
  }
}

/**
 * Fetch the transcript for a summary that doesn't have one stored
 * @param summaryId The ID of the summary to fetch transcript for
 * @returns The updated summary with transcript
 */
export async function fetchTranscriptForSummary(summaryId: number) {
  try {
    const response = await apiRequest(`/api/summaries/${summaryId}/fetch-transcript`, {
      method: 'POST',
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch transcript: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching transcript:', error);
    throw error;
  }
}

/**
 * Create a new summary from a YouTube URL
 * @param data Object containing the YouTube URL
 * @returns The created summary with screenshots
 */
export async function createSummary(data: { url: string }) {
  try {
    const response = await apiRequest('/api/summaries', {
      method: 'POST',
      body: JSON.stringify({ youtubeUrl: data.url }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Failed to create summary: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error creating summary:', error);
    throw error;
  }
}

/**
 * Get a specific summary by ID
 * @param summaryId The ID of the summary to fetch
 * @returns The summary with screenshots
 */
export async function getSummary(summaryId: number) {
  try {
    const response = await apiRequest(`/api/summaries/${summaryId}`);

    if (!response.ok) {
      throw new Error(`Failed to fetch summary: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching summary:', error);
    throw error;
  }
}

/**
 * Delete a summary by ID
 * @param summaryId The ID of the summary to delete
 * @returns Success status
 */
export async function deleteSummary(summaryId: number) {
  try {
    const response = await apiRequest(`/api/summaries/${summaryId}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      throw new Error(`Failed to delete summary: ${response.statusText}`);
    }

    return true;
  } catch (error) {
    console.error('Error deleting summary:', error);
    throw error;
  }
}

/**
 * Get all summaries for the current user
 * @returns Array of summaries with screenshots
 */
export async function getAllSummaries() {
  try {
    const response = await apiRequest('/api/summaries');

    if (!response.ok) {
      throw new Error(`Failed to fetch summaries: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching summaries:', error);
    throw error;
  }
}

/**
 * Get summaries for non-admin users (current user's summaries only)
 * @returns Array of summaries with screenshots for the current user
 */
export async function getNonAdminSummaries() {
  try {
    const response = await apiRequest('/api/user/summaries');

    if (!response.ok) {
      throw new Error(`Failed to fetch user summaries: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching user summaries:', error);
    throw error;
  }
}

/**
 * Get all summaries (alias for getAllSummaries for backward compatibility)
 * @returns Array of summaries with screenshots
 */
export async function getSummaries() {
  return getAllSummaries();
}

/**
 * Create invitation for a new user
 * @param data The invitation data including username
 * @returns The created invitation with token
 */
export async function createInvitation(data: { username: string }) {
  try {
    const response = await apiRequest('/api/admin/invitations', {
      method: 'POST',
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Failed to create invitation: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error creating invitation:', error);
    throw error;
  }
}

/**
 * Create a new user based on invitation details
 * @param data The user data including token, password
 * @returns Success status
 */
export async function createUser(data: { token: string; password: string }) {
  try {
    const response = await apiRequest('/api/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Failed to create user: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error creating user:', error);
    throw error;
  }
}

/**
 * Delete a user by ID (admin only)
 * @param userId The ID of the user to delete
 * @returns Success status
 */
export async function deleteUser(userId: number) {
  try {
    const response = await apiRequest(`/api/admin/users/${userId}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      throw new Error(`Failed to delete user: ${response.statusText}`);
    }

    return true;
  } catch (error) {
    console.error('Error deleting user:', error);
    throw error;
  }
}

/**
 * Demote a user from admin role (admin only)
 * @param userId The ID of the user to demote
 * @returns The updated user
 */
export async function demoteFromAdmin(userId: number) {
  try {
    const response = await apiRequest(`/api/admin/users/${userId}/demote`, {
      method: 'POST',
    });

    if (!response.ok) {
      throw new Error(`Failed to demote user: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error demoting user:', error);
    throw error;
  }
}

/**
 * Get all users (admin only)
 * @returns Array of users
 */
export async function getUsers() {
  try {
    const response = await apiRequest('/api/admin/users');

    if (!response.ok) {
      throw new Error(`Failed to fetch users: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching users:', error);
    throw error;
  }
}

/**
 * Promote a user to admin role (admin only)
 * @param userId The ID of the user to promote
 * @returns The updated user
 */
export async function promoteToAdmin(userId: number) {
  try {
    const response = await apiRequest(`/api/admin/users/${userId}/promote`, {
      method: 'POST',
    });

    if (!response.ok) {
      throw new Error(`Failed to promote user: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error promoting user:', error);
    throw error;
  }
}

/**
 * Regenerate invitation link for a user (admin only)
 * @param userId The ID of the user to regenerate invitation link for
 * @returns The updated invitation with new token
 */
export async function regenerateInvitationLink(userId: number) {
  try {
    const response = await apiRequest(`/api/admin/users/${userId}/regenerate-invitation`, {
      method: 'POST',
    });

    if (!response.ok) {
      throw new Error(`Failed to regenerate invitation link: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error regenerating invitation link:', error);
    throw error;
  }
}

/**
 * Validate invitation token
 * @param token The invitation token to validate
 * @returns Response with validation status and username if valid
 */
export async function validateInvitationToken(token: string) {
  try {
    const response = await apiRequest(`/api/validate-invitation?token=${encodeURIComponent(token)}`);

    if (!response.ok) {
      throw new Error(`Failed to validate invitation token: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error validating invitation token:', error);
    throw error;
  }
}

/**
 * Accept invitation and set password for a new user
 * @param token The invitation token
 * @param password The new password for the user
 * @returns Response with the created user details
 */
export async function acceptInvitation(token: string, password: string) {
  try {
    const response = await apiRequest('/api/accept-invitation', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ token, newPassword: password }),
    });

    if (!response.ok) {
      throw new Error(`Failed to accept invitation: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error accepting invitation:', error);
    throw error;
  }
}

/**
 * Add a custom screenshot to a summary
 * @param summaryId The ID of the summary to add the screenshot to
 * @param timestamp The timestamp in seconds where the screenshot should be captured
 * @param description Optional description for the screenshot
 * @param svgContent Optional SVG content to use instead of a video frame
 * @returns The created screenshot
 */
export async function addCustomScreenshot(
  summaryId: number, 
  timestamp: number, 
  description?: string,
  svgContent?: string
) {
  try {
    const response = await apiRequest(`/api/summaries/${summaryId}/screenshots`, {
      method: 'POST',
      body: JSON.stringify({ 
        timestamp, 
        description,
        svgContent
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Failed to add screenshot: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error adding custom screenshot:', error);
    throw error;
  }
}