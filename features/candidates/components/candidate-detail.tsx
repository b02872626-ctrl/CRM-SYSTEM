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
      <div className="flex flex-col gap-6 crm-stat-card h-auto lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="crm-label">
            Candidate Pipeline
          </p>
          <h2 className="crm-page-title mt-2">
            {candidate.first_name} {candidate.last_name}
          </h2>
          <p className="crm-page-copy mt-1">
            {candidate.current_title ?? "No title"} | {formatEnumLabel(candidate.stage)}
          </p>
        </div>

        <Link
          href={`/candidates/${candidate.id}/edit`}
          className="crm-secondary-button justify-center shrink-0"
        >
          Edit candidate
        </Link>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <div className="space-y-6">
          <div className="crm-stat-card h-auto">
            <h3 className="text-lg font-bold text-white tracking-tight">Candidate profile</h3>
            <dl className="mt-6 grid gap-6 sm:grid-cols-2">
              <div className="crm-field">
                <dt className="crm-label">Source</dt>
                <dd className="mt-1 text-sm font-semibold text-white/70">{candidate.source ?? "Unknown"}</dd>
              </div>
              <div className="crm-field">
                <dt className="crm-label">Recruiter</dt>
                <dd className="mt-1 text-sm font-semibold text-white/70">{recruiter?.full_name ?? "Unassigned"}</dd>
              </div>
              <div className="crm-field">
                <dt className="crm-label">Email</dt>
                <dd className="mt-1 text-sm font-semibold text-white/70">{candidate.email ?? "Not set"}</dd>
              </div>
              <div className="crm-field">
                <dt className="crm-label">Phone</dt>
                <dd className="mt-1 text-sm font-semibold text-white/70">{candidate.phone ?? "Not set"}</dd>
              </div>
              <div className="crm-field">
                <dt className="crm-label">Location</dt>
                <dd className="mt-1 text-sm font-semibold text-white/70">{candidate.location ?? "Not set"}</dd>
              </div>
              <div className="crm-field">
                <dt className="crm-label">LinkedIn</dt>
                <dd className="mt-1 text-sm font-semibold text-white/70">
                  {candidate.linkedin_url ? (
                    <a href={candidate.linkedin_url} className="text-[#2383E2] hover:underline font-semibold" target="_blank" rel="noreferrer">
                      Open profile
                    </a>
                  ) : (
                    "Not set"
                  )}
                </dd>
              </div>
            </dl>

            <div className="mt-8 border-t border-white/5 pt-6">
              <p className="crm-label">Notes</p>
              <p className="mt-3 text-sm leading-relaxed text-white/40">
                {candidate.notes ?? "No notes added yet."}
              </p>
            </div>
          </div>

          <div className="crm-stat-card h-auto">
            <div className="flex items-center justify-between gap-4">
              <h3 className="text-lg font-bold text-white tracking-tight">Linked deals</h3>
              <span className="text-[10px] font-black uppercase tracking-widest text-white/20 bg-white/5 px-2 py-0.5 rounded-sm">{candidate.applications?.length ?? 0} links</span>
            </div>

            <div className="mt-6 space-y-4">
              {(candidate.applications?.length ?? 0) === 0 ? (
                <div className="crm-empty-state py-12">
                  <p className="text-sm text-white/40">This candidate is not linked to a deal yet.</p>
                </div>
              ) : (
                candidate.applications?.map((application) => {
                  const deal = getSingleRelation(application.deal);
                  const applicationRecruiter = getSingleRelation(application.recruiter);

                  return (
                    <div key={application.id} className="rounded-sm border border-white/5 bg-white/[0.02] p-5 hover:border-white/10 transition-colors">
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                        <div>
                          {deal ? (
                            <Link href={`/deals/${deal.id}`} className="font-bold text-white hover:text-[#2383E2] transition-colors">
                              {deal.title}
                            </Link>
                          ) : (
                            <p className="font-bold text-white">Unlinked deal</p>
                          )}
                          <p className="mt-2 text-[10px] font-black uppercase tracking-[0.15em] text-white/20 flex items-center gap-2">
                             <span className="text-white/40">{formatEnumLabel(application.status)}</span>
                             <span className="w-1 h-1 rounded-full bg-white/10"></span>
                             <span>Recruiter: {applicationRecruiter?.full_name ?? "Unassigned"}</span>
                          </p>
                        </div>
                        <div className="text-[10px] font-bold uppercase tracking-widest text-white/10">
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
          <div className="crm-stat-card h-auto">
            <h3 className="text-lg font-bold text-white tracking-tight">Pipeline summary</h3>
            <dl className="mt-6 space-y-4">
              <div className="flex items-center justify-between gap-4 border-b border-white/5 pb-4">
                <dt className="text-sm font-medium text-white/40">Screening</dt>
                <dd className="text-sm font-bold text-[#2383E2]">
                  {getScreeningStatus(candidate.stage, primaryApplication?.status)}
                </dd>
              </div>
              <div className="flex items-center justify-between gap-4 border-b border-white/5 pb-4">
                <dt className="text-sm font-medium text-white/40">Interview</dt>
                <dd className="text-sm font-bold text-white/70">
                  {getInterviewStatus(candidate.stage, primaryApplication?.status)}
                </dd>
              </div>
              <div className="flex items-center justify-between gap-4 border-b border-white/5 pb-4">
                <dt className="text-sm font-medium text-white/40">Shortlist</dt>
                <dd className="text-sm font-bold text-white/70">
                  {getShortlistStatus(candidate.stage, primaryApplication?.status)}
                </dd>
              </div>
              <div className="flex items-center justify-between gap-4">
                <dt className="text-sm font-medium text-white/40">Placement</dt>
                <dd className="text-sm font-bold text-white/70">
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
