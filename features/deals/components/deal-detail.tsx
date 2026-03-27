import Link from "next/link";
import { ActivityForm } from "@/features/activities/components/activity-form";
import { ActivityTimeline } from "@/features/activities/components/activity-timeline";
import { DealStageBadge, DealUrgencyBadge } from "@/features/deals/components/deal-badges";
import { DealStatusForm } from "@/features/deals/components/deal-status-form";
import { formatEnumLabel } from "@/features/deals/constants";

type DealDetailProps = {
  deal: {
    id: string;
    title: string;
    number_of_hires: number;
    seniority: string;
    urgency: string;
    stage: string;
    value: number | null;
    currency: string;
    expected_close_date: string | null;
    notes: string | null;
    company:
      | { id: string; name: string; industry: string | null; country: string | null; website: string | null }
      | { id: string; name: string; industry: string | null; country: string | null; website: string | null }[]
      | null;
    recruiter:
      | { id: string; full_name: string | null; email: string | null }
      | { id: string; full_name: string | null; email: string | null }[]
      | null;
  };
  candidates: Array<{
    id: string;
    status: string;
    applied_at: string;
    last_stage_at: string;
    notes: string | null;
    candidate:
      | {
          id: string;
          first_name: string;
          last_name: string;
          email: string | null;
          phone: string | null;
          stage: string;
          current_title: string | null;
        }
      | {
          id: string;
          first_name: string;
          last_name: string;
          email: string | null;
          phone: string | null;
          stage: string;
          current_title: string | null;
        }[]
      | null;
  }>;
  activities: Array<{
    id: string;
    activity_type: string;
    summary: string;
    details: string | null;
    created_at: string;
    due_at?: string | null;
    profile:
      | {
          id: string;
          full_name: string;
        }
      | {
          id: string;
          full_name: string;
        }[]
      | null;
  }>;
};

function getSingleRelation<T>(value: T | T[] | null): T | null {
  if (Array.isArray(value)) {
    return value[0] ?? null;
  }

  return value;
}

function formatCurrency(value: number | null, currency: string) {
  if (value === null) {
    return "Not set";
  }

  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency
  }).format(value);
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

export function DealDetail({ deal, candidates, activities }: DealDetailProps) {
  const company = getSingleRelation(deal.company);
  const recruiter = getSingleRelation(deal.recruiter);

  return (
    <section className="space-y-6">
      <div className="flex flex-col gap-6 crm-stat-card h-auto lg:flex-row lg:items-center lg:justify-between">
        <div className="space-y-4">
          <div className="flex flex-wrap items-center gap-3">
            <DealStageBadge stage={deal.stage} />
            <DealUrgencyBadge urgency={deal.urgency} />
          </div>
          <div>
            <h2 className="crm-page-title">{deal.title}</h2>
            <p className="crm-page-copy mt-1">
              {company?.name ?? "Unlinked company"} | {deal.number_of_hires} hires |{" "}
              {formatEnumLabel(deal.seniority)}
            </p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row lg:flex-col gap-3">
          <DealStatusForm
            dealId={deal.id}
            currentStage={deal.stage}
            returnPath={`/deals/${deal.id}`}
          />
          <Link
            href={`/deals/${deal.id}/edit`}
            className="crm-secondary-button justify-center"
          >
            Edit deal
          </Link>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.3fr_0.7fr]">
        <div className="space-y-6">
          <div className="crm-stat-card h-auto">
            <h3 className="text-lg font-bold text-white tracking-tight">Role details</h3>
            <dl className="mt-6 grid gap-6 sm:grid-cols-2">
              <div className="crm-field">
                <dt className="crm-label">
                  Linked company
                </dt>
                <dd className="mt-1 text-sm font-semibold text-white/70">{company?.name ?? "Unlinked company"}</dd>
              </div>
              <div className="crm-field">
                <dt className="crm-label">
                  Assigned recruiter
                </dt>
                <dd className="mt-1 text-sm font-semibold text-white/70">{recruiter?.full_name ?? "Unassigned"}</dd>
              </div>
              <div className="crm-field">
                <dt className="crm-label">
                  Expected revenue
                </dt>
                <dd className="mt-1 text-sm font-semibold text-white/70">
                  {formatCurrency(deal.value, deal.currency)}
                </dd>
              </div>
              <div className="crm-field">
                <dt className="crm-label">
                  Expected close
                </dt>
                <dd className="mt-1 text-sm font-semibold text-white/70">{formatDate(deal.expected_close_date)}</dd>
              </div>
            </dl>

            <div className="mt-8 border-t border-white/5 pt-6">
              <p className="crm-label">Notes</p>
              <p className="mt-3 text-sm leading-relaxed text-white/40">
                {deal.notes ?? "No notes added yet."}
              </p>
            </div>
          </div>

          <div className="crm-stat-card h-auto">
            <div className="flex items-center justify-between gap-4">
              <h3 className="text-lg font-bold text-white tracking-tight">Candidate list</h3>
              <span className="text-[10px] font-black uppercase tracking-widest text-white/20 bg-white/5 px-2 py-0.5 rounded-sm">{candidates.length} linked</span>
            </div>

            <div className="mt-6 space-y-4">
              {candidates.length === 0 ? (
                <div className="crm-empty-state py-12">
                  <p className="text-sm text-white/40">No candidates linked to this deal yet.</p>
                </div>
              ) : (
                candidates.map((application) => {
                  const candidate = getSingleRelation(application.candidate);

                  return (
                    <div
                      key={application.id}
                      className="rounded-sm border border-white/5 bg-white/[0.02] px-5 py-4 hover:border-white/10 transition-colors"
                    >
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                        <div>
                          <h4 className="font-bold text-white">
                            {candidate ? (
                              <Link href={`/candidates/${candidate.id}`} className="hover:text-[#2383E2] transition-colors">
                                {candidate.first_name} {candidate.last_name}
                              </Link>
                            ) : (
                              "Unknown candidate"
                            )}
                          </h4>
                          <p className="mt-1 text-xs font-bold uppercase tracking-widest text-white/20">
                            <span className="text-white/40">{candidate?.current_title ?? "No title"}</span>
                            {" | "}
                            <span>{formatEnumLabel(application.status)}</span>
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

          <ActivityTimeline
            title="Activity timeline"
            items={activities}
            emptyMessage="No activity logged for this deal yet."
          />
        </div>

        <div>
          <ActivityForm target={{ dealId: deal.id }} returnPath={`/deals/${deal.id}`} />
        </div>
      </div>
    </section>
  );
}
