import Link from "next/link";
import { createCandidateAction, updateCandidateAction } from "@/features/candidates/actions";
import {
  applicationStatusOptions,
  candidateStageOptions,
  formatEnumLabel
} from "@/features/candidates/constants";

type RecruiterOption = {
  id: string;
  full_name: string;
};

type DealOption = {
  id: string;
  title: string;
};

type CandidateRecord = {
  id: string;
  first_name: string;
  last_name: string;
  email: string | null;
  phone: string | null;
  location: string | null;
  source: string | null;
  stage: string;
  current_title: string | null;
  linkedin_url: string | null;
  notes: string | null;
  assigned_profile_id: string | null;
  applications?:
    | Array<{
        id: string;
        status: string;
        notes: string | null;
        deal: { id: string; title: string } | { id: string; title: string }[] | null;
      }>
    | null;
};

type CandidateFormProps = {
  mode: "create" | "edit";
  deals: DealOption[];
  recruiters: RecruiterOption[];
  candidate?: CandidateRecord | null;
};

function getSingleRelation<T>(value: T | T[] | null): T | null {
  if (Array.isArray(value)) {
    return value[0] ?? null;
  }

  return value;
}

export function CandidateForm({
  mode,
  deals,
  recruiters,
  candidate
}: CandidateFormProps) {
  const action = mode === "create" ? createCandidateAction : updateCandidateAction;
  const primaryApplication = candidate?.applications?.[0] ?? null;
  const linkedDeal = getSingleRelation(primaryApplication?.deal ?? null);

  return (
    <form action={action} className="crm-stat-card h-auto space-y-8">
      {candidate ? <input type="hidden" name="id" value={candidate.id} /> : null}
      {primaryApplication ? (
        <input type="hidden" name="primary_application_id" value={primaryApplication.id} />
      ) : null}

      <div className="grid gap-6 md:grid-cols-2">
        <div className="crm-field">
          <label htmlFor="first_name" className="crm-label">
            First name
          </label>
          <input
            id="first_name"
            name="first_name"
            defaultValue={candidate?.first_name ?? ""}
            autoFocus
            required
            className="crm-input"
          />
        </div>

        <div className="crm-field">
          <label htmlFor="last_name" className="crm-label">
            Last name
          </label>
          <input
            id="last_name"
            name="last_name"
            defaultValue={candidate?.last_name ?? ""}
            required
            className="crm-input"
          />
        </div>

        <div className="crm-field">
          <label htmlFor="email" className="crm-label">
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            defaultValue={candidate?.email ?? ""}
            className="crm-input"
          />
        </div>

        <div className="crm-field">
          <label htmlFor="phone" className="crm-label">
            Phone
          </label>
          <input
            id="phone"
            name="phone"
            defaultValue={candidate?.phone ?? ""}
            className="crm-input"
          />
        </div>

        <div className="crm-field">
          <label htmlFor="current_title" className="crm-label">
            Current title
          </label>
          <input
            id="current_title"
            name="current_title"
            defaultValue={candidate?.current_title ?? ""}
            className="crm-input"
          />
        </div>

        <div className="crm-field">
          <label htmlFor="location" className="crm-label">
            Location
          </label>
          <input
            id="location"
            name="location"
            defaultValue={candidate?.location ?? ""}
            className="crm-input"
          />
        </div>

        <div className="crm-field">
          <label htmlFor="source" className="crm-label">
            Source
          </label>
          <input
            id="source"
            name="source"
            defaultValue={candidate?.source ?? ""}
            className="crm-input"
            placeholder="Referral"
          />
        </div>

        <div className="crm-field">
          <label htmlFor="assigned_profile_id" className="crm-label">
            Assigned recruiter
          </label>
          <select
            id="assigned_profile_id"
            name="assigned_profile_id"
            defaultValue={candidate?.assigned_profile_id ?? ""}
            className="crm-select"
          >
            <option value="">Unassigned</option>
            {recruiters.map((recruiter) => (
              <option key={recruiter.id} value={recruiter.id}>
                {recruiter.full_name}
              </option>
            ))}
          </select>
        </div>

        <div className="crm-field">
          <label htmlFor="stage" className="crm-label">
            Pipeline stage
          </label>
          <select
            id="stage"
            name="stage"
            defaultValue={candidate?.stage ?? "sourced"}
            className="crm-select"
          >
            {candidateStageOptions.map((stage) => (
              <option key={stage} value={stage}>
                {formatEnumLabel(stage)}
              </option>
            ))}
          </select>
        </div>

        <div className="crm-field">
          <label htmlFor="linkedin_url" className="crm-label">
            LinkedIn URL
          </label>
          <input
            id="linkedin_url"
            name="linkedin_url"
            defaultValue={candidate?.linkedin_url ?? ""}
            className="crm-input"
          />
        </div>

        <div className="crm-field">
          <label htmlFor="linked_deal_id" className="crm-label">
            Linked deal
          </label>
          <select
            id="linked_deal_id"
            name="linked_deal_id"
            defaultValue={linkedDeal?.id ?? ""}
            className="crm-select"
          >
            <option value="">No linked deal</option>
            {deals.map((deal) => (
              <option key={deal.id} value={deal.id}>
                {deal.title}
              </option>
            ))}
          </select>
        </div>

        <div className="crm-field">
          <label htmlFor="application_status" className="crm-label">
            Deal application status
          </label>
          <select
            id="application_status"
            name="application_status"
            defaultValue={primaryApplication?.status ?? "applied"}
            className="crm-select"
          >
            {applicationStatusOptions.map((status) => (
              <option key={status} value={status}>
                {formatEnumLabel(status)}
              </option>
            ))}
          </select>
        </div>

        <div className="crm-field md:col-span-2">
          <label htmlFor="notes" className="crm-label">
            Candidate notes
          </label>
          <textarea
            id="notes"
            name="notes"
            rows={3}
            defaultValue={candidate?.notes ?? ""}
            className="crm-input h-auto py-2"
          />
        </div>

        <div className="crm-field md:col-span-2">
          <label htmlFor="application_notes" className="crm-label">
            Application notes
          </label>
          <textarea
            id="application_notes"
            name="application_notes"
            rows={2}
            defaultValue={primaryApplication?.notes ?? ""}
            className="crm-input h-auto py-2"
          />
        </div>
      </div>

      <div className="flex items-center gap-3 pt-4">
        <button
          type="submit"
          className="crm-primary-button px-8"
        >
          {mode === "create" ? "Create candidate" : "Save changes"}
        </button>
        <Link
          href={candidate ? `/candidates/${candidate.id}` : "/candidates"}
          className="crm-secondary-button"
        >
          Cancel
        </Link>
      </div>
    </form>
  );
}
