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