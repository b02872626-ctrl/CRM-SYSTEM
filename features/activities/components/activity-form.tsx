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
    <form action={createActivityAction} className="crm-stat-card h-auto space-y-6">
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
        <h3 className="text-base font-bold text-white tracking-tight">Log activity</h3>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="crm-field">
          <label htmlFor="activity_type" className="crm-label">
            Type
          </label>
          <select
            id="activity_type"
            name="activity_type"
            defaultValue="note"
            className="crm-select"
          >
            <option value="note">Note</option>
            <option value="call">Call</option>
            <option value="email">Email</option>
            <option value="meeting">Meeting</option>
            <option value="status_change">Status change</option>
            <option value="task">Task</option>
          </select>
        </div>

        <div className="crm-field">
          <label htmlFor="activity_date" className="crm-label">
            Date
          </label>
          <input
            id="activity_date"
            name="activity_date"
            type="date"
            defaultValue={today}
            className="crm-input"
          />
        </div>

        <div className="crm-field md:col-span-2">
          <label htmlFor="summary" className="crm-label">
            Summary
          </label>
          <input
            id="summary"
            name="summary"
            required
            autoFocus
            className="crm-input"
            placeholder="Shared pricing update with client"
          />
        </div>

        <div className="crm-field md:col-span-2">
          <label htmlFor="next_step" className="crm-label">
            Next step
          </label>
          <input
            id="next_step"
            name="next_step"
            className="crm-input"
            placeholder="Follow up on feedback"
          />
        </div>

        <div className="crm-field">
          <label htmlFor="next_step_date" className="crm-label">
            Next step date
          </label>
          <input
            id="next_step_date"
            name="next_step_date"
            type="date"
            className="crm-input"
          />
        </div>
      </div>

      <button
        type="submit"
        className="crm-primary-button w-full justify-center mt-2"
      >
        Save activity
      </button>
    </form>
  );
}
