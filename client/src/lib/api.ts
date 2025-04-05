import { SummaryWithScreenshots, YoutubeUrlInput, User, AdminInsertUser, UpdateUser, InviteUser, Screenshot } from "@shared/schema";
import { apiRequest } from "./queryClient";

// Create a new summary from a YouTube URL
export async function createSummary(input: YoutubeUrlInput): Promise<SummaryWithScreenshots> {
  const response = await apiRequest("POST", "/api/summaries", input);
  return response.json();
}

// Get all summaries
export async function getSummaries(): Promise<SummaryWithScreenshots[]> {
  const response = await apiRequest("GET", "/api/summaries");
  return response.json();
}

// Get a single summary by ID
export async function getSummary(id: number): Promise<SummaryWithScreenshots> {
  const response = await apiRequest("GET", `/api/summaries/${id}`);
  return response.json();
}

// Delete a summary
export async function deleteSummary(id: number): Promise<void> {
  await apiRequest("DELETE", `/api/summaries/${id}`);
}

// Admin API functions
export async function getAllSummaries(): Promise<SummaryWithScreenshots[]> {
  const response = await apiRequest("GET", "/api/admin/summaries");
  return response.json();
}

// Get only non-admin summaries (for admin tab view)
export async function getNonAdminSummaries(): Promise<SummaryWithScreenshots[]> {
  const response = await apiRequest("GET", "/api/admin/summaries");
  const allSummaries: SummaryWithScreenshots[] = await response.json();
  return allSummaries.filter((summary: SummaryWithScreenshots) => summary.userId !== 1); // Filter out admin summaries (admin userId is 1)
}

export async function getUsers(): Promise<Omit<User, "password">[]> {
  const response = await apiRequest("GET", "/api/admin/users");
  return response.json();
}

export async function createUser(user: AdminInsertUser): Promise<Omit<User, "password">> {
  const response = await apiRequest("POST", "/api/admin/users", user);
  return response.json();
}

export async function updateUser(id: number, data: UpdateUser): Promise<Omit<User, "password">> {
  const response = await apiRequest("PATCH", `/api/admin/users/${id}`, data);
  return response.json();
}

export async function deleteUser(id: number): Promise<void> {
  await apiRequest("DELETE", `/api/admin/users/${id}`);
}

export async function promoteToAdmin(id: number): Promise<Omit<User, "password">> {
  const response = await apiRequest("POST", `/api/admin/users/${id}/promote`);
  return response.json();
}

export async function demoteFromAdmin(id: number): Promise<Omit<User, "password">> {
  const response = await apiRequest("POST", `/api/admin/users/${id}/demote`);
  return response.json();
}

// Invitation API functions
export async function createInvitation(data: InviteUser): Promise<{ user: Omit<User, "password">; invitationLink: string }> {
  const response = await apiRequest("POST", "/api/admin/invitations", data);
  return response.json();
}

export async function validateInvitationToken(token: string): Promise<{ valid: boolean; username?: string; message?: string }> {
  const response = await apiRequest("GET", `/api/validate-invitation?token=${encodeURIComponent(token)}`);
  return response.json();
}

export async function acceptInvitation(token: string, newPassword: string): Promise<User> {
  const response = await apiRequest("POST", "/api/accept-invitation", { token, newPassword });
  return response.json();
}

// Regenerate invitation link for an existing user
export async function regenerateInvitationLink(userId: number): Promise<{ invitationLink: string }> {
  const response = await apiRequest("POST", `/api/admin/users/${userId}/regenerate-invitation`);
  return response.json();
}

// Add a custom screenshot to a summary
export async function addCustomScreenshot(
  summaryId: number, 
  timestamp: number, 
  description?: string
): Promise<Screenshot> {
  const response = await apiRequest("POST", `/api/summaries/${summaryId}/screenshots`, {
    timestamp,
    description
  });
  return response.json();
}

// New function to preview a frame at a specific timestamp without saving it
export async function previewVideoFrame(
  videoId: string,
  timestamp: number
): Promise<string> {
  const response = await apiRequest("POST", `/api/preview-frame`, {
    videoId, 
    timestamp
  });
  
  const result = await response.json();
  return `data:image/jpeg;base64,${result.imageData}`;
}
