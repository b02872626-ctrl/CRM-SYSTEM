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
    <form action={action} className="space-y-5 rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
      {deal ? <input type="hidden" name="id" value={deal.id} /> : null}

      <div className="grid gap-3 md:grid-cols-2">
        <div className="space-y-1">
          <label htmlFor="company_id" className="text-sm font-medium text-slate-700">
            Company
          </label>
          <select
            id="company_id"
            name="company_id"
            defaultValue={deal?.company_id ?? ""}
            required
            className="h-10 w-full rounded-md border border-slate-300 bg-white px-3 text-sm"
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

        <div className="space-y-1">
          <label htmlFor="assigned_profile_id" className="text-sm font-medium text-slate-700">
            Assigned recruiter
          </label>
          <select
            id="assigned_profile_id"
            name="assigned_profile_id"
            defaultValue={deal?.assigned_profile_id ?? ""}
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

        <div className="space-y-1 md:col-span-2">
          <label htmlFor="title" className="text-sm font-medium text-slate-700">
            Role title
          </label>
          <input
            id="title"
            name="title"
            defaultValue={deal?.title ?? ""}
            autoFocus
            required
            className="h-10 w-full rounded-md border border-slate-300 px-3 text-sm"
            placeholder="Customer Support Associate"
          />
        </div>

        <div className="space-y-1">
          <label htmlFor="number_of_hires" className="text-sm font-medium text-slate-700">
            Number of hires
          </label>
          <input
            id="number_of_hires"
            name="number_of_hires"
            type="number"
            min="1"
            defaultValue={deal?.number_of_hires ?? 1}
            required
            className="h-10 w-full rounded-md border border-slate-300 px-3 text-sm"
          />
        </div>

        <div className="space-y-1">
          <label htmlFor="seniority" className="text-sm font-medium text-slate-700">
            Seniority
          </label>
          <select
            id="seniority"
            name="seniority"
            defaultValue={deal?.seniority ?? "mid"}
            className="h-10 w-full rounded-md border border-slate-300 bg-white px-3 text-sm"
          >
            {dealSeniorityOptions.map((seniority) => (
              <option key={seniority} value={seniority}>
                {formatEnumLabel(seniority)}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-1">
          <label htmlFor="urgency" className="text-sm font-medium text-slate-700">
            Urgency
          </label>
          <select
            id="urgency"
            name="urgency"
            defaultValue={deal?.urgency ?? "medium"}
            className="h-10 w-full rounded-md border border-slate-300 bg-white px-3 text-sm"
          >
            {dealUrgencyOptions.map((urgency) => (
              <option key={urgency} value={urgency}>
                {formatEnumLabel(urgency)}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-1">
          <label htmlFor="stage" className="text-sm font-medium text-slate-700">
            Status
          </label>
          <select
            id="stage"
            name="stage"
            defaultValue={deal?.stage ?? "new"}
            className="h-10 w-full rounded-md border border-slate-300 bg-white px-3 text-sm"
          >
            {dealStageOptions.map((stage) => (
              <option key={stage} value={stage}>
                {formatEnumLabel(stage)}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-1">
          <label htmlFor="value" className="text-sm font-medium text-slate-700">
            Expected revenue
          </label>
          <input
            id="value"
            name="value"
            type="number"
            min="0"
            step="0.01"
            defaultValue={deal?.value ?? ""}
            className="h-10 w-full rounded-md border border-slate-300 px-3 text-sm"
            placeholder="18000"
          />
        </div>

        <div className="space-y-1">
          <label htmlFor="currency" className="text-sm font-medium text-slate-700">
            Currency
          </label>
          <input
            id="currency"
            name="currency"
            maxLength={3}
            defaultValue={deal?.currency ?? "USD"}
            className="h-10 w-full rounded-md border border-slate-300 px-3 text-sm uppercase"
          />
        </div>

        <div className="space-y-1">
          <label htmlFor="expected_close_date" className="text-sm font-medium text-slate-700">
            Expected close date
          </label>
          <input
            id="expected_close_date"
            name="expected_close_date"
            type="date"
            defaultValue={deal?.expected_close_date ?? ""}
            className="h-10 w-full rounded-md border border-slate-300 px-3 text-sm"
          />
        </div>

        <div className="space-y-1 md:col-span-2">
          <label htmlFor="notes" className="text-sm font-medium text-slate-700">
            Notes
          </label>
          <textarea
            id="notes"
            name="notes"
            rows={4}
            defaultValue={deal?.notes ?? ""}
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
            placeholder="Add hiring scope or commercial notes"
          />
        </div>
      </div>

      <div className="flex items-center gap-2">
        <button
          type="submit"
          className="inline-flex h-10 items-center rounded-md bg-slate-900 px-4 text-sm font-medium text-white"
        >
          {mode === "create" ? "Create deal" : "Save changes"}
        </button>
        <Link
          href={deal ? `/deals/${deal.id}` : "/deals"}
          className="inline-flex h-10 items-center rounded-md border border-slate-300 bg-white px-4 text-sm font-medium text-slate-700"
        >
          Cancel
        </Link>
      </div>
    </form>
  );
}
