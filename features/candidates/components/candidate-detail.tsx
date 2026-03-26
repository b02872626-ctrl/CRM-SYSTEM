import Link from "next/link";
import {
  formatEnumLabel,
  getInterviewStatus,
  getPlacementStatus,
  getScreeningStatus,
  getShortlistStatus
} from "@/features/candidates/constants";

type CandidateDetailProps = {
  candidate: {
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
    recruiter:
      | { id: string; full_name: string | null; email: string | null }
      | { id: string; full_name: string | null; email: string | null }[]
      | null;
    applications:
      | Array<{
          id: string;
          status: string;
          applied_at: string;
          last_stage_at: string;
          notes: string | null;
          deal: { id: string; title: string; stage: string } | { id: string; title: string; stage: string }[] | null;
          recruiter:
            | { id: string; full_name: string | null }
            | { id: string; full_name: string | null }[]
            | null;
        }>
      | null;
  };
};

function getSingleRelation<T>(value: T | T[] | null): T | null {
  if (Array.isArray(value)) {
    return value[0] ?? null;
  }

  return value;
}

function formatDate(value: string | null) {
  if (!value) {
    return "Not set";
  }

  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric"
  }).format(new Date(value));
}

export function CandidateDetail({ candidate }: CandidateDetailProps) {
  const recruiter = getSingleRelation(candidate.recruiter);
  const primaryApplication = candidate.applications?.[0] ?? null;

  return (
    <section className="space-y-6">
      <div className="flex flex-col gap-4 rounded-lg border border-slate-200 bg-white p-6 shadow-sm lg:flex-row lg:items-start lg:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
            Candidate Pipeline
          </p>
          <h2 className="mt-2 text-2xl font-semibold text-slate-950">
            {candidate.first_name} {candidate.last_name}
          </h2>
          <p className="mt-1 text-sm text-slate-600">
            {candidate.current_title ?? "No title"} | {formatEnumLabel(candidate.stage)}
          </p>
        </div>

        <Link
          href={`/candidates/${candidate.id}/edit`}
          className="inline-flex h-10 items-center rounded-md border border-slate-300 bg-white px-4 text-sm font-medium text-slate-700"
        >
          Edit candidate
        </Link>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <div className="space-y-6">
          <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-slate-950">Candidate profile</h3>
            <dl className="mt-4 grid gap-4 sm:grid-cols-2">
              <div>
                <dt className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">Source</dt>
                <dd className="mt-1 text-sm text-slate-800">{candidate.source ?? "Unknown"}</dd>
              </div>
              <div>
                <dt className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">Recruiter</dt>
                <dd className="mt-1 text-sm text-slate-800">{recruiter?.full_name ?? "Unassigned"}</dd>
              </div>
              <div>
                <dt className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">Email</dt>
                <dd className="mt-1 text-sm text-slate-800">{candidate.email ?? "Not set"}</dd>
              </div>
              <div>
                <dt className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">Phone</dt>
                <dd className="mt-1 text-sm text-slate-800">{candidate.phone ?? "Not set"}</dd>
              </div>
              <div>
                <dt className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">Location</dt>
                <dd className="mt-1 text-sm text-slate-800">{candidate.location ?? "Not set"}</dd>
              </div>
              <div>
                <dt className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">LinkedIn</dt>
                <dd className="mt-1 text-sm text-slate-800">
                  {candidate.linkedin_url ? (
                    <a href={candidate.linkedin_url} className="hover:underline" target="_blank" rel="noreferrer">
                      Open profile
                    </a>
                  ) : (
                    "Not set"
                  )}
                </dd>
              </div>
            </dl>

            <div className="mt-6 border-t border-slate-200 pt-4">
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">Notes</p>
              <p className="mt-2 text-sm leading-6 text-slate-700">
                {candidate.notes ?? "No notes added yet."}
              </p>
            </div>
          </div>

          <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between gap-4">
              <h3 className="text-lg font-semibold text-slate-950">Linked deals</h3>
              <span className="text-sm text-slate-500">{candidate.applications?.length ?? 0} links</span>
            </div>

            <div className="mt-4 space-y-3">
              {(candidate.applications?.length ?? 0) === 0 ? (
                <div className="rounded-md border border-dashed border-slate-300 px-4 py-8 text-sm text-slate-600">
                  This candidate is not linked to a deal yet.
                </div>
              ) : (
                candidate.applications?.map((application) => {
                  const deal = getSingleRelation(application.deal);
                  const applicationRecruiter = getSingleRelation(application.recruiter);

                  return (
                    <div key={application.id} className="rounded-md border border-slate-200 p-4">
                      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                        <div>
                          {deal ? (
                            <Link href={`/deals/${deal.id}`} className="font-medium text-slate-950 hover:underline">
                              {deal.title}
                            </Link>
                          ) : (
                            <p className="font-medium text-slate-950">Unlinked deal</p>
                          )}
                          <p className="mt-1 text-sm text-slate-600">
                            {formatEnumLabel(application.status)} | Recruiter:{" "}
                            {applicationRecruiter?.full_name ?? "Unassigned"}
                          </p>
                        </div>
                        <div className="text-sm text-slate-500">
                          Updated {formatDate(application.last_stage_at)}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-slate-950">Pipeline summary</h3>
            <dl className="mt-4 space-y-3">
              <div className="flex items-center justify-between gap-4 border-b border-slate-100 pb-3">
                <dt className="text-sm text-slate-600">Screening</dt>
                <dd className="text-sm font-medium text-slate-900">
                  {getScreeningStatus(candidate.stage, primaryApplication?.status)}
                </dd>
              </div>
              <div className="flex items-center justify-between gap-4 border-b border-slate-100 pb-3">
                <dt className="text-sm text-slate-600">Interview</dt>
                <dd className="text-sm font-medium text-slate-900">
                  {getInterviewStatus(candidate.stage, primaryApplication?.status)}
                </dd>
              </div>
              <div className="flex items-center justify-between gap-4 border-b border-slate-100 pb-3">
                <dt className="text-sm text-slate-600">Shortlist</dt>
                <dd className="text-sm font-medium text-slate-900">
                  {getShortlistStatus(candidate.stage, primaryApplication?.status)}
                </dd>
              </div>
              <div className="flex items-center justify-between gap-4">
                <dt className="text-sm text-slate-600">Placement</dt>
                <dd className="text-sm font-medium text-slate-900">
                  {getPlacementStatus(candidate.stage, primaryApplication?.status)}
                </dd>
              </div>
            </dl>
          </div>
        </div>
      </div>
    </section>
  );
}
