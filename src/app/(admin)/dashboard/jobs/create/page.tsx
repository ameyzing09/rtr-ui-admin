import { CreateJobWizard } from './CreateJobWizard';

export const metadata = {
  title: 'Create Job | Dashboard',
  description: 'Create a new job posting',
};

/**
 * Create Job Page (Server Component)
 * B2: Create Job - POST /job
 *
 * Features:
 * - Multi-step wizard (4 steps)
 * - Step 1: Basics (title, department, location, openings)
 * - Step 2: Description (rich text, attachments)
 * - Step 3: Visibility (is_public, publish_at, expire_at, external_apply_url)
 * - Step 4: Custom Fields (EPIC E placeholder)
 * - Validation (title required, expire_at > publish_at, URL validation)
 * - On success: toast + redirect to job detail
 */
export default function CreateJobPage() {
  return (
    <div className="flex h-full flex-col">
      <CreateJobWizard />
    </div>
  );
}
