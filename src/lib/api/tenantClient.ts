// zod is used for schema validation in imports
import { fetcher, apiResponseSchema, paginatedResponseSchema } from './fetcher';
import { 
  tenantSchema,
  createTenantSchema,
  tenantSettingsSchema,
  type Tenant,
  type CreateTenantData,
  type TenantSettings
} from '@/features/tenant/types';

// Tenant API response schemas
const tenantResponseSchema = apiResponseSchema(tenantSchema);
const tenantsResponseSchema = paginatedResponseSchema(tenantSchema);
const tenantSettingsResponseSchema = apiResponseSchema(tenantSettingsSchema);

// Tenant client class
export class TenantClient {
  // Get all tenants (admin only)
  async getTenants(page = 1, limit = 20): Promise<{
    data: Tenant[];
    pagination: { page: number; limit: number; total: number; totalPages: number };
  }> {
    const response = await fetcher.get(
      `/tenants?page=${page}&limit=${limit}`,
      tenantsResponseSchema
    );
    
    return {
      data: response.data,
      pagination: response.pagination,
    };
  }

  // Get tenant by ID
  async getTenant(id: string): Promise<Tenant> {
    const response = await fetcher.get(`/tenants/${id}`, tenantResponseSchema);
    return response.data;
  }

  // Get tenant by slug
  async getTenantBySlug(slug: string): Promise<Tenant> {
    const response = await fetcher.get(`/tenants/slug/${slug}`, tenantResponseSchema);
    return response.data;
  }

  // Get current tenant
  async getCurrentTenant(): Promise<Tenant> {
    const response = await fetcher.get('/tenants/current', tenantResponseSchema);
    return response.data;
  }

  // Create new tenant
  async createTenant(data: CreateTenantData): Promise<Tenant> {
    // Validate input
    const validatedData = createTenantSchema.parse(data);
    
    const response = await fetcher.post(
      '/tenants',
      validatedData,
      tenantResponseSchema
    );
    
    return response.data;
  }

  // Update tenant
  async updateTenant(id: string, data: Partial<Tenant>): Promise<Tenant> {
    const response = await fetcher.patch(
      `/tenants/${id}`,
      data,
      tenantResponseSchema
    );
    
    return response.data;
  }

  // Delete tenant
  async deleteTenant(id: string): Promise<void> {
    await fetcher.delete(`/tenants/${id}`);
  }

  // Get tenant settings
  async getTenantSettings(tenantId: string): Promise<TenantSettings> {
    const response = await fetcher.get(
      `/tenants/${tenantId}/settings`,
      tenantSettingsResponseSchema
    );
    
    return response.data;
  }

  // Update tenant settings
  async updateTenantSettings(
    tenantId: string,
    settings: Partial<TenantSettings>
  ): Promise<TenantSettings> {
    const response = await fetcher.patch(
      `/tenants/${tenantId}/settings`,
      settings,
      tenantSettingsResponseSchema
    );
    
    return response.data;
  }

  // Upload tenant logo
  async uploadLogo(tenantId: string, file: File): Promise<{ url: string }> {
    const formData = new FormData();
    formData.append('logo', file);
    
    const response = await fetch(`/api/tenants/${tenantId}/logo`, {
      method: 'POST',
      body: formData,
    });
    
    if (!response.ok) {
      throw new Error('Failed to upload logo');
    }
    
    return response.json();
  }

  // Check if slug is available
  async checkSlugAvailability(slug: string): Promise<boolean> {
    try {
      const response = await fetcher.get(`/tenants/check-slug/${slug}`) as { available: boolean };
      return response.available;
    } catch {
      return false;
    }
  }

  // Get tenant statistics
  async getTenantStats(tenantId: string): Promise<{
    userCount: number;
    activeUsers: number;
    storageUsed: number;
    apiCalls: number;
  }> {
    const response = await fetcher.get(`/tenants/${tenantId}/stats`) as { 
      data: { userCount: number; activeUsers: number; storageUsed: number; apiCalls: number } 
    };
    return response.data;
  }

  // Switch tenant context (for users with access to multiple tenants)
  async switchTenant(tenantId: string): Promise<Tenant> {
    const response = await fetcher.post(
      '/tenants/switch',
      { tenantId },
      tenantResponseSchema
    );
    
    return response.data;
  }
}

// Default tenant client instance
export const tenantClient = new TenantClient();

// Tenant helpers
export const tenantHelpers = {
  // Generate slug from name
  generateSlug(name: string): string {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');
  },

  // Validate slug format
  isValidSlug(slug: string): boolean {
    return /^[a-z0-9-]+$/.test(slug) && slug.length >= 2;
  },

  // Get tenant display name
  getDisplayName(tenant: Tenant): string {
    return tenant.name || tenant.slug;
  },

  // Get tenant avatar URL
  getAvatarUrl(tenant: Tenant): string {
    return tenant.logo || `https://api.dicebear.com/7.x/initials/svg?seed=${tenant.name}`;
  },

  // Check if tenant is active
  isActive(tenant: Tenant): boolean {
    return tenant.isActive;
  },

  // Get plan display name
  getPlanDisplayName(plan: string): string {
    const plans = {
      free: 'Free',
      pro: 'Professional',
      enterprise: 'Enterprise',
    };
    
    return plans[plan as keyof typeof plans] || plan;
  },

  // Format storage usage
  formatStorageUsage(bytes: number): string {
    const units = ['B', 'KB', 'MB', 'GB', 'TB'];
    let size = bytes;
    let unitIndex = 0;
    
    while (size >= 1024 && unitIndex < units.length - 1) {
      size /= 1024;
      unitIndex++;
    }
    
    return `${size.toFixed(1)} ${units[unitIndex]}`;
  },
};
