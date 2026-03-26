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
      <div className="flex flex-col gap-4 rounded-lg border border-slate-200 bg-white p-6 shadow-sm lg:flex-row lg:items-start lg:justify-between">
        <div className="space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <DealStageBadge stage={deal.stage} />
            <DealUrgencyBadge urgency={deal.urgency} />
          </div>
          <div>
            <h2 className="text-2xl font-semibold text-slate-950">{deal.title}</h2>
            <p className="mt-1 text-sm text-slate-600">
              {company?.name ?? "Unlinked company"} | {deal.number_of_hires} hires |{" "}
              {formatEnumLabel(deal.seniority)}
            </p>
          </div>
        </div>

        <div className="space-y-3">
          <DealStatusForm
            dealId={deal.id}
            currentStage={deal.stage}
            returnPath={`/deals/${deal.id}`}
          />
          <Link
            href={`/deals/${deal.id}/edit`}
            className="inline-flex h-9 items-center rounded-md border border-slate-300 bg-white px-3 text-sm font-medium text-slate-700"
          >
            Edit deal
          </Link>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.3fr_0.7fr]">
        <div className="space-y-6">
          <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-slate-950">Role details</h3>
            <dl className="mt-4 grid gap-4 sm:grid-cols-2">
              <div>
                <dt className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
                  Linked company
                </dt>
                <dd className="mt-1 text-sm text-slate-800">{company?.name ?? "Unlinked company"}</dd>
              </div>
              <div>
                <dt className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
                  Assigned recruiter
                </dt>
                <dd className="mt-1 text-sm text-slate-800">{recruiter?.full_name ?? "Unassigned"}</dd>
              </div>
              <div>
                <dt className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
                  Expected revenue
                </dt>
                <dd className="mt-1 text-sm text-slate-800">
                  {formatCurrency(deal.value, deal.currency)}
                </dd>
              </div>
              <div>
                <dt className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
                  Expected close
                </dt>
                <dd className="mt-1 text-sm text-slate-800">{formatDate(deal.expected_close_date)}</dd>
              </div>
            </dl>

            <div className="mt-6 border-t border-slate-200 pt-4">
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">Notes</p>
              <p className="mt-2 text-sm leading-6 text-slate-700">
                {deal.notes ?? "No notes added yet."}
              </p>
            </div>
          </div>

          <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between gap-4">
              <h3 className="text-lg font-semibold text-slate-950">Candidate list</h3>
              <span className="text-sm text-slate-500">{candidates.length} linked</span>
            </div>

            <div className="mt-4 space-y-3">
              {candidates.length === 0 ? (
                <div className="rounded-md border border-dashed border-slate-300 px-4 py-8 text-sm text-slate-600">
                  No candidates linked to this deal yet.
                </div>
              ) : (
                candidates.map((application) => {
                  const candidate = getSingleRelation(application.candidate);

                  return (
                    <div
                      key={application.id}
                      className="rounded-md border border-slate-200 px-4 py-3"
                    >
                      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                        <div>
                          <h4 className="font-medium text-slate-950">
                            {candidate ? (
                              <Link href={`/candidates/${candidate.id}`} className="hover:underline">
                                {candidate.first_name} {candidate.last_name}
                              </Link>
                            ) : (
                              "Unknown candidate"
                            )}
                          </h4>
                          <p className="text-sm text-slate-600">
                            {candidate?.current_title ?? "No title"} |{" "}
                            {formatEnumLabel(application.status)}
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
