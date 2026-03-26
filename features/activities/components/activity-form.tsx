import { createActivityAction } from "@/features/activities/actions";

type ActivityFormProps = {
  target:
    | { companyId: string; dealId?: never; candidateId?: never }
    | { companyId?: never; dealId: string; candidateId?: never }
    | { companyId?: never; dealId?: never; candidateId: string };
  returnPath: string;
};

export function ActivityForm({ target, returnPath }: ActivityFormProps) {
  const today = new Date().toISOString().slice(0, 10);

  return (
    <form action={createActivityAction} className="space-y-3 rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
      <input type="hidden" name="return_path" value={returnPath} />
      {"companyId" in target && target.companyId ? (
        <input type="hidden" name="company_id" value={target.companyId} />
      ) : null}
      {"dealId" in target && target.dealId ? (
        <input type="hidden" name="deal_id" value={target.dealId} />
      ) : null}
      {"candidateId" in target && target.candidateId ? (
        <input type="hidden" name="candidate_id" value={target.candidateId} />
      ) : null}

      <div className="flex items-center justify-between gap-4">
        <h3 className="text-base font-semibold text-slate-950">Log activity</h3>
      </div>

      <div className="grid gap-2.5 md:grid-cols-2">
        <div className="space-y-1">
          <label htmlFor="activity_type" className="text-sm font-medium text-slate-700">
            Type
          </label>
          <select
            id="activity_type"
            name="activity_type"
            defaultValue="note"
            className="h-10 w-full rounded-md border border-slate-300 bg-white px-3 text-sm"
          >
            <option value="note">Note</option>
            <option value="call">Call</option>
            <option value="email">Email</option>
            <option value="meeting">Meeting</option>
            <option value="status_change">Status change</option>
            <option value="task">Task</option>
          </select>
        </div>

        <div className="space-y-1">
          <label htmlFor="activity_date" className="text-sm font-medium text-slate-700">
            Date
          </label>
          <input
            id="activity_date"
            name="activity_date"
            type="date"
            defaultValue={today}
            className="h-10 w-full rounded-md border border-slate-300 px-3 text-sm"
          />
        </div>

        <div className="space-y-1 md:col-span-2">
          <label htmlFor="summary" className="text-sm font-medium text-slate-700">
            Summary
          </label>
          <input
            id="summary"
            name="summary"
            required
            autoFocus
            className="h-10 w-full rounded-md border border-slate-300 px-3 text-sm"
            placeholder="Shared pricing update with client"
          />
        </div>

        <div className="space-y-1 md:col-span-2">
          <label htmlFor="next_step" className="text-sm font-medium text-slate-700">
            Next step
          </label>
          <input
            id="next_step"
            name="next_step"
            className="h-10 w-full rounded-md border border-slate-300 px-3 text-sm"
            placeholder="Follow up on feedback"
          />
        </div>

        <div className="space-y-1">
          <label htmlFor="next_step_date" className="text-sm font-medium text-slate-700">
            Next step date
          </label>
          <input
            id="next_step_date"
            name="next_step_date"
            type="date"
            className="h-10 w-full rounded-md border border-slate-300 px-3 text-sm"
          />
        </div>
      </div>

      <button
        type="submit"
        className="inline-flex h-10 items-center rounded-md bg-slate-900 px-4 text-sm font-medium text-white"
      >
        Save activity
      </button>
    </form>
  );
}
