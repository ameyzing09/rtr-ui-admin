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
 * - Step 3: Visibility (isPublic, publishAt, expireAt, externalApplyUrl)
 * - Step 4: Custom Fields (EPIC E placeholder)
 * - Validation (title required, expireAt > publishAt, URL validation)
 * - On success: toast + redirect to job detail
 */
export default function CreateJobPage() {
  return (
    <div className="flex h-full flex-col">
      <CreateJobWizard />
    </div>
  );
}
