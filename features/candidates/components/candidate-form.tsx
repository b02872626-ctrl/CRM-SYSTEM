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
    <form action={action} className="space-y-5 rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
      {candidate ? <input type="hidden" name="id" value={candidate.id} /> : null}
      {primaryApplication ? (
        <input type="hidden" name="primary_application_id" value={primaryApplication.id} />
      ) : null}

      <div className="grid gap-3 md:grid-cols-2">
        <div className="space-y-1">
          <label htmlFor="first_name" className="text-sm font-medium text-slate-700">
            First name
          </label>
          <input
            id="first_name"
            name="first_name"
            defaultValue={candidate?.first_name ?? ""}
            autoFocus
            required
            className="h-10 w-full rounded-md border border-slate-300 px-3 text-sm"
          />
        </div>

        <div className="space-y-1">
          <label htmlFor="last_name" className="text-sm font-medium text-slate-700">
            Last name
          </label>
          <input
            id="last_name"
            name="last_name"
            defaultValue={candidate?.last_name ?? ""}
            required
            className="h-10 w-full rounded-md border border-slate-300 px-3 text-sm"
          />
        </div>

        <div className="space-y-1">
          <label htmlFor="email" className="text-sm font-medium text-slate-700">
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            defaultValue={candidate?.email ?? ""}
            className="h-10 w-full rounded-md border border-slate-300 px-3 text-sm"
          />
        </div>

        <div className="space-y-1">
          <label htmlFor="phone" className="text-sm font-medium text-slate-700">
            Phone
          </label>
          <input
            id="phone"
            name="phone"
            defaultValue={candidate?.phone ?? ""}
            className="h-10 w-full rounded-md border border-slate-300 px-3 text-sm"
          />
        </div>

        <div className="space-y-1">
          <label htmlFor="current_title" className="text-sm font-medium text-slate-700">
            Current title
          </label>
          <input
            id="current_title"
            name="current_title"
            defaultValue={candidate?.current_title ?? ""}
            className="h-10 w-full rounded-md border border-slate-300 px-3 text-sm"
          />
        </div>

        <div className="space-y-1">
          <label htmlFor="location" className="text-sm font-medium text-slate-700">
            Location
          </label>
          <input
            id="location"
            name="location"
            defaultValue={candidate?.location ?? ""}
            className="h-10 w-full rounded-md border border-slate-300 px-3 text-sm"
          />
        </div>

        <div className="space-y-1">
          <label htmlFor="source" className="text-sm font-medium text-slate-700">
            Source
          </label>
          <input
            id="source"
            name="source"
            defaultValue={candidate?.source ?? ""}
            className="h-10 w-full rounded-md border border-slate-300 px-3 text-sm"
            placeholder="Referral"
          />
        </div>

        <div className="space-y-1">
          <label htmlFor="assigned_profile_id" className="text-sm font-medium text-slate-700">
            Assigned recruiter
          </label>
          <select
            id="assigned_profile_id"
            name="assigned_profile_id"
            defaultValue={candidate?.assigned_profile_id ?? ""}
            className="h-10 w-full rounded-md border border-slate-300 bg-white px-3 text-sm"
          >
            <option value="">Unassigned</option>
            {recruiters.map((recruiter) => (
              <option key={recruiter.id} value={recruiter.id}>
                {recruiter.full_name}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-1">
          <label htmlFor="stage" className="text-sm font-medium text-slate-700">
            Pipeline stage
          </label>
          <select
            id="stage"
            name="stage"
            defaultValue={candidate?.stage ?? "sourced"}
            className="h-10 w-full rounded-md border border-slate-300 bg-white px-3 text-sm"
          >
            {candidateStageOptions.map((stage) => (
              <option key={stage} value={stage}>
                {formatEnumLabel(stage)}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-1">
          <label htmlFor="linkedin_url" className="text-sm font-medium text-slate-700">
            LinkedIn URL
          </label>
          <input
            id="linkedin_url"
            name="linkedin_url"
            defaultValue={candidate?.linkedin_url ?? ""}
            className="h-10 w-full rounded-md border border-slate-300 px-3 text-sm"
          />
        </div>

        <div className="space-y-1">
          <label htmlFor="linked_deal_id" className="text-sm font-medium text-slate-700">
            Linked deal
          </label>
          <select
            id="linked_deal_id"
            name="linked_deal_id"
            defaultValue={linkedDeal?.id ?? ""}
            className="h-10 w-full rounded-md border border-slate-300 bg-white px-3 text-sm"
          >
            <option value="">No linked deal</option>
            {deals.map((deal) => (
              <option key={deal.id} value={deal.id}>
                {deal.title}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-1">
          <label htmlFor="application_status" className="text-sm font-medium text-slate-700">
            Deal application status
          </label>
          <select
            id="application_status"
            name="application_status"
            defaultValue={primaryApplication?.status ?? "applied"}
            className="h-10 w-full rounded-md border border-slate-300 bg-white px-3 text-sm"
          >
            {applicationStatusOptions.map((status) => (
              <option key={status} value={status}>
                {formatEnumLabel(status)}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-1 md:col-span-2">
          <label htmlFor="notes" className="text-sm font-medium text-slate-700">
            Candidate notes
          </label>
          <textarea
            id="notes"
            name="notes"
            rows={3}
            defaultValue={candidate?.notes ?? ""}
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
          />
        </div>

        <div className="space-y-1 md:col-span-2">
          <label htmlFor="application_notes" className="text-sm font-medium text-slate-700">
            Application notes
          </label>
          <textarea
            id="application_notes"
            name="application_notes"
            rows={2}
            defaultValue={primaryApplication?.notes ?? ""}
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
          />
        </div>
      </div>

      <div className="flex items-center gap-2">
        <button
          type="submit"
          className="inline-flex h-10 items-center rounded-md bg-slate-900 px-4 text-sm font-medium text-white"
        >
          {mode === "create" ? "Create candidate" : "Save changes"}
        </button>
        <Link
          href={candidate ? `/candidates/${candidate.id}` : "/candidates"}
          className="inline-flex h-10 items-center rounded-md border border-slate-300 bg-white px-4 text-sm font-medium text-slate-700"
        >
          Cancel
        </Link>
      </div>
    </form>
  );
}
