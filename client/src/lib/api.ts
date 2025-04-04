import { SummaryWithScreenshots, YoutubeUrlInput, User, AdminInsertUser, UpdateUser, InviteUser } from "@shared/schema";
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
