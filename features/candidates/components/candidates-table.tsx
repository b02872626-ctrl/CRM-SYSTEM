import Link from "next/link";
import {
  getInterviewStatus,
  getPlacementStatus,
  getScreeningStatus,
  getShortlistStatus
} from "@/features/candidates/constants";

type CandidateRow = {
  id: string;
  first_name: string;
  last_name: string;
  source: string | null;
  stage: string;
  application:
    | {
        id: string;
        status: string;
        deal: { id: string; title: string } | { id: string; title: string }[] | null;
      }[]
    | null;
};

function getSingleRelation<T>(value: T | T[] | null): T | null {
  if (Array.isArray(value)) {
    return value[0] ?? null;
  }

  return value;
}

function StatusCell({ value }: { value: string }) {
  return <span className="text-sm text-slate-700">{value}</span>;
}

export function CandidatesTable({ candidates }: { candidates: CandidateRow[] }) {
  if (candidates.length === 0) {
    return (
      <div className="crm-empty-state">
        <h3 className="text-base font-semibold text-slate-950">No candidates match these filters</h3>
        <p className="mt-1 text-sm text-slate-600">
          Try another filter set or add a new candidate.
        </p>
      </div>
    );
  }

  return (
    <div className="crm-table-shell">
      <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead className="crm-table-head">
            <tr>
              <th className="crm-table-th">Candidate</th>
              <th className="crm-table-th">Linked deal</th>
              <th className="crm-table-th">Source</th>
              <th className="crm-table-th">Screening</th>
              <th className="crm-table-th">Interview</th>
              <th className="crm-table-th">Shortlist</th>
              <th className="crm-table-th">Placement</th>
            </tr>
          </thead>
          <tbody>
            {candidates.map((candidate) => {
              const primaryApplication = candidate.application?.[0] ?? null;
              const linkedDeal = getSingleRelation(primaryApplication?.deal ?? null);

              return (
                <tr key={candidate.id} className="crm-table-row">
                  <td className="crm-table-td">
                    <Link
                      href={`/candidates/${candidate.id}`}
                      className="font-medium text-slate-950 hover:underline"
                    >
                      {candidate.first_name} {candidate.last_name}
                    </Link>
                  </td>
                  <td className="crm-table-td">
                    {linkedDeal ? (
                      <Link href={`/deals/${linkedDeal.id}`} className="hover:underline">
                        {linkedDeal.title}
                      </Link>
                    ) : (
                      "Not linked"
                    )}
                  </td>
                  <td className="crm-table-td">{candidate.source ?? "Unknown"}</td>
                  <td className="crm-table-td">
                    <StatusCell
                      value={getScreeningStatus(candidate.stage, primaryApplication?.status)}
                    />
                  </td>
                  <td className="crm-table-td">
                    <StatusCell
                      value={getInterviewStatus(candidate.stage, primaryApplication?.status)}
                    />
                  </td>
                  <td className="crm-table-td">
                    <StatusCell
                      value={getShortlistStatus(candidate.stage, primaryApplication?.status)}
                    />
                  </td>
                  <td className="crm-table-td">
                    <StatusCell
                      value={getPlacementStatus(candidate.stage, primaryApplication?.status)}
                    />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
