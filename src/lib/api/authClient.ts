// zod is used for schema validation in imports
import { fetcher, apiResponseSchema } from './fetcher';
import { 
  userSchema, 
  loginSchema, 
  registerSchema, 
  sessionSchema,
  type LoginData,
  type RegisterData,
  type User,
  type Session
} from '@/features/auth/types';

// Auth API response schemas
const loginResponseSchema = apiResponseSchema(sessionSchema);
const registerResponseSchema = apiResponseSchema(userSchema);
const userResponseSchema = apiResponseSchema(userSchema);

// Auth client class
export class AuthClient {
  // Login user
  async login(credentials: LoginData): Promise<Session> {
    // Validate input
    const validatedCredentials = loginSchema.parse(credentials);
    
    const response = await fetcher.post(
      '/auth/login',
      validatedCredentials,
      loginResponseSchema
    );
    
    return response.data;
  }

  // Register user
  async register(userData: RegisterData): Promise<User> {
    // Validate input
    const validatedUserData = registerSchema.parse(userData);
    
    const response = await fetcher.post(
      '/auth/register',
      validatedUserData,
      registerResponseSchema
    );
    
    return response.data;
  }

  // Get current user
  async getCurrentUser(): Promise<User> {
    const response = await fetcher.get('/auth/me', userResponseSchema);
    return response.data;
  }

  // Refresh token
  async refreshToken(refreshToken: string): Promise<Session> {
    const response = await fetcher.post(
      '/auth/refresh',
      { refreshToken },
      loginResponseSchema
    );
    
    return response.data;
  }

  // Logout
  async logout(): Promise<void> {
    await fetcher.post('/auth/logout');
  }

  // Request password reset
  async requestPasswordReset(email: string): Promise<void> {
    await fetcher.post('/auth/password-reset/request', { email });
  }

  // Reset password
  async resetPassword(token: string, newPassword: string): Promise<void> {
    await fetcher.post('/auth/password-reset/confirm', {
      token,
      newPassword,
    });
  }

  // Verify email
  async verifyEmail(token: string): Promise<void> {
    await fetcher.post('/auth/verify-email', { token });
  }

  // Resend verification email
  async resendVerificationEmail(): Promise<void> {
    await fetcher.post('/auth/verify-email/resend');
  }

  // Update profile
  async updateProfile(data: Partial<User>): Promise<User> {
    const response = await fetcher.patch('/auth/profile', data, userResponseSchema);
    return response.data;
  }

  // Change password
  async changePassword(currentPassword: string, newPassword: string): Promise<void> {
    await fetcher.post('/auth/change-password', {
      currentPassword,
      newPassword,
    });
  }

  // Check if email exists
  async checkEmailExists(email: string): Promise<boolean> {
    try {
      const response = await fetcher.post('/auth/check-email', { email }) as { exists: boolean };
      return response.exists;
    } catch {
      return false;
    }
  }
}

// Default auth client instance
export const authClient = new AuthClient();

// Auth helpers
export const authHelpers = {
  // Check if user has permission
  hasPermission(user: User, _permission?: string): boolean {
    // Implementation depends on your permission system
    // This is a placeholder
    if (user.role === 'admin') return true;
    
    // Add your permission checking logic here
    return false;
  },

  // Check if user has role
  hasRole(user: User, role: string): boolean {
    return user.role === role;
  },

  // Get user initials for avatar
  getUserInitials(user: User): string {
    return user.name
      .split(' ')
      .map(name => name.charAt(0).toUpperCase())
      .slice(0, 2)
      .join('');
  },

  // Format user display name
  getDisplayName(user: User): string {
    return user.name || user.email;
  },

  // Check if session is expired
  isSessionExpired(session: Session): boolean {
    return new Date() > session.expiresAt;
  },

  // Get time until session expires
  getSessionTimeRemaining(session: Session): number {
    return Math.max(0, session.expiresAt.getTime() - Date.now());
  },
};
