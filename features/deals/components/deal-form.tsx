import Link from "next/link";
import { createDealAction, updateDealAction } from "@/features/deals/actions";
import {
  dealSeniorityOptions,
  dealStageOptions,
  dealUrgencyOptions,
  formatEnumLabel
} from "@/features/deals/constants";

type CompanyOption = {
  id: string;
  name: string;
};

type RecruiterOption = {
  id: string;
  full_name: string;
};

type DealRecord = {
  id: string;
  company_id: string | null;
  assigned_profile_id: string | null;
  title: string;
  number_of_hires: number;
  seniority: string;
  urgency: string;
  stage: string;
  value: number | null;
  currency: string;
  expected_close_date: string | null;
  notes: string | null;
};

type DealFormProps = {
  mode: "create" | "edit";
  companies: CompanyOption[];
  recruiters: RecruiterOption[];
  deal?: DealRecord | null;
};

export function DealForm({ mode, companies, recruiters, deal }: DealFormProps) {
  const action = mode === "create" ? createDealAction : updateDealAction;

  return (
    <form action={action} className="crm-stat-card h-auto space-y-8">
      {deal ? <input type="hidden" name="id" value={deal.id} /> : null}

      <div className="grid gap-6 md:grid-cols-2">
        <div className="crm-field">
          <label htmlFor="company_id" className="crm-label">
            Company
          </label>
          <select
            id="company_id"
            name="company_id"
            defaultValue={deal?.company_id ?? ""}
            required
            className="crm-select"
          >
            <option value="" disabled>
              Select a company
            </option>
            {companies.map((company) => (
              <option key={company.id} value={company.id}>
                {company.name}
              </option>
            ))}
          </select>
        </div>

        <div className="crm-field">
          <label htmlFor="assigned_profile_id" className="crm-label">
            Assigned recruiter
          </label>
          <select
            id="assigned_profile_id"
            name="assigned_profile_id"
            defaultValue={deal?.assigned_profile_id ?? ""}
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

        <div className="crm-field md:col-span-2">
          <label htmlFor="title" className="crm-label">
            Role title
          </label>
          <input
            id="title"
            name="title"
            defaultValue={deal?.title ?? ""}
            autoFocus
            required
            className="crm-input"
            placeholder="Customer Support Associate"
          />
        </div>

        <div className="crm-field">
          <label htmlFor="number_of_hires" className="crm-label">
            Number of hires
          </label>
          <input
            id="number_of_hires"
            name="number_of_hires"
            type="number"
            min="1"
            defaultValue={deal?.number_of_hires ?? 1}
            required
            className="crm-input"
          />
        </div>

        <div className="crm-field">
          <label htmlFor="seniority" className="crm-label">
            Seniority
          </label>
          <select
            id="seniority"
            name="seniority"
            defaultValue={deal?.seniority ?? "mid"}
            className="crm-select"
          >
            {dealSeniorityOptions.map((seniority) => (
              <option key={seniority} value={seniority}>
                {formatEnumLabel(seniority)}
              </option>
            ))}
          </select>
        </div>

        <div className="crm-field">
          <label htmlFor="urgency" className="crm-label">
            Urgency
          </label>
          <select
            id="urgency"
            name="urgency"
            defaultValue={deal?.urgency ?? "medium"}
            className="crm-select"
          >
            {dealUrgencyOptions.map((urgency) => (
              <option key={urgency} value={urgency}>
                {formatEnumLabel(urgency)}
              </option>
            ))}
          </select>
        </div>

        <div className="crm-field">
          <label htmlFor="stage" className="crm-label">
            Status
          </label>
          <select
            id="stage"
            name="stage"
            defaultValue={deal?.stage ?? "new"}
            className="crm-select"
          >
            {dealStageOptions.map((stage) => (
              <option key={stage} value={stage}>
                {formatEnumLabel(stage)}
              </option>
            ))}
          </select>
        </div>

        <div className="crm-field">
          <label htmlFor="value" className="crm-label">
            Expected revenue
          </label>
          <input
            id="value"
            name="value"
            type="number"
            min="0"
            step="0.01"
            defaultValue={deal?.value ?? ""}
            className="crm-input"
            placeholder="18000"
          />
        </div>

        <div className="crm-field">
          <label htmlFor="currency" className="crm-label">
            Currency
          </label>
          <input
            id="currency"
            name="currency"
            maxLength={3}
            defaultValue={deal?.currency ?? "USD"}
            className="crm-input uppercase"
          />
        </div>

        <div className="crm-field">
          <label htmlFor="expected_close_date" className="crm-label">
            Expected close date
          </label>
          <input
            id="expected_close_date"
            name="expected_close_date"
            type="date"
            defaultValue={deal?.expected_close_date ?? ""}
            className="crm-input"
          />
        </div>

        <div className="crm-field md:col-span-2">
          <label htmlFor="notes" className="crm-label">
            Notes
          </label>
          <textarea
            id="notes"
            name="notes"
            rows={4}
            defaultValue={deal?.notes ?? ""}
            className="crm-input h-auto py-2"
            placeholder="Add hiring scope or commercial notes"
          />
        </div>
      </div>

      <div className="flex items-center gap-3 pt-4">
        <button
          type="submit"
          className="crm-primary-button px-8"
        >
          {mode === "create" ? "Create deal" : "Save changes"}
        </button>
        <Link
          href={deal ? `/deals/${deal.id}` : "/deals"}
          className="crm-secondary-button"
        >
          Cancel
        </Link>
      </div>
    </form>
  );
}
