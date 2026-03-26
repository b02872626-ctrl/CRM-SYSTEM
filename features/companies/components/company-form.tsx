import Link from "next/link";
import { createCompanyAction } from "@/features/companies/actions";

const companyStatusOptions = [
  { value: "target", label: "Target" },
  { value: "researching", label: "Researching" },
  { value: "contacted", label: "Contacted" },
  { value: "qualified", label: "Qualified" },
  { value: "inactive", label: "Inactive" }
];

const priorityOptions = ["Low", "Medium", "High", "Critical"];

type OwnerOption = {
  id: string;
  full_name: string;
};

export function CompanyForm({ owners }: { owners: OwnerOption[] }) {
  return (
    <form action={createCompanyAction} className="space-y-5 rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
      <div className="grid gap-3 md:grid-cols-2">
        <div className="space-y-1 md:col-span-2">
          <label htmlFor="company_name" className="text-sm font-medium text-slate-700">
            Company name
          </label>
          <input
            id="company_name"
            name="company_name"
            autoFocus
            required
            className="h-10 w-full rounded-md border border-slate-300 px-3 text-sm"
            placeholder="Acme Outsourcing"
          />
        </div>

        <div className="space-y-1">
          <label htmlFor="industry" className="text-sm font-medium text-slate-700">
            Industry
          </label>
          <input
            id="industry"
            name="industry"
            className="h-10 w-full rounded-md border border-slate-300 px-3 text-sm"
            placeholder="BPO, tech, NGO"
          />
        </div>

        <div className="space-y-1">
          <label htmlFor="company_size" className="text-sm font-medium text-slate-700">
            Company size
          </label>
          <input
            id="company_size"
            name="company_size"
            className="h-10 w-full rounded-md border border-slate-300 px-3 text-sm"
            placeholder="11-50"
          />
        </div>

        <div className="space-y-1">
          <label htmlFor="location" className="text-sm font-medium text-slate-700">
            Location
          </label>
          <input
            id="location"
            name="location"
            className="h-10 w-full rounded-md border border-slate-300 px-3 text-sm"
            placeholder="Addis Ababa"
          />
        </div>

        <div className="space-y-1">
          <label htmlFor="source" className="text-sm font-medium text-slate-700">
            Source
          </label>
          <input
            id="source"
            name="source"
            className="h-10 w-full rounded-md border border-slate-300 px-3 text-sm"
            placeholder="Referral, LinkedIn, outbound"
          />
        </div>

        <div className="space-y-1">
          <label htmlFor="hiring_signal" className="text-sm font-medium text-slate-700">
            Hiring signal
          </label>
          <input
            id="hiring_signal"
            name="hiring_signal"
            className="h-10 w-full rounded-md border border-slate-300 px-3 text-sm"
            placeholder="Hiring page, repeat openings"
          />
        </div>

        <div className="space-y-1">
          <label htmlFor="status" className="text-sm font-medium text-slate-700">
            Status
          </label>
          <select
            id="status"
            name="status"
            defaultValue="target"
            className="h-10 w-full rounded-md border border-slate-300 bg-white px-3 text-sm"
          >
            {companyStatusOptions.map((status) => (
              <option key={status.value} value={status.value}>
                {status.label}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-1">
          <label htmlFor="priority" className="text-sm font-medium text-slate-700">
            Priority
          </label>
          <select
            id="priority"
            name="priority"
            defaultValue="Medium"
            className="h-10 w-full rounded-md border border-slate-300 bg-white px-3 text-sm"
          >
            {priorityOptions.map((priority) => (
              <option key={priority} value={priority}>
                {priority}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-1">
          <label htmlFor="owner_id" className="text-sm font-medium text-slate-700">
            Owner
          </label>
          <select
            id="owner_id"
            name="owner_id"
            defaultValue=""
            className="h-10 w-full rounded-md border border-slate-300 bg-white px-3 text-sm"
          >
            <option value="">Unassigned</option>
            {owners.map((owner) => (
              <option key={owner.id} value={owner.id}>
                {owner.full_name}
              </option>
            ))}
          </select>
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

        <div className="space-y-1 md:col-span-2">
          <label htmlFor="next_step" className="text-sm font-medium text-slate-700">
            Next step
          </label>
          <input
            id="next_step"
            name="next_step"
            className="h-10 w-full rounded-md border border-slate-300 px-3 text-sm"
            placeholder="Send intro email"
          />
        </div>

        <div className="space-y-1 md:col-span-2">
          <label htmlFor="notes" className="text-sm font-medium text-slate-700">
            Notes
          </label>
          <textarea
            id="notes"
            name="notes"
            rows={3}
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
            placeholder="Short internal notes"
          />
        </div>
      </div>

      <div className="border-t border-slate-200 pt-5">
        <h3 className="text-base font-semibold text-slate-950">Primary contact</h3>
        <div className="mt-3 grid gap-3 md:grid-cols-2">
          <div className="space-y-1">
            <label htmlFor="contact_full_name" className="text-sm font-medium text-slate-700">
              Full name
            </label>
            <input
              id="contact_full_name"
              name="contact_full_name"
              className="h-10 w-full rounded-md border border-slate-300 px-3 text-sm"
              placeholder="Jane Doe"
            />
          </div>

          <div className="space-y-1">
            <label htmlFor="contact_role_title" className="text-sm font-medium text-slate-700">
              Role title
            </label>
            <input
              id="contact_role_title"
              name="contact_role_title"
              className="h-10 w-full rounded-md border border-slate-300 px-3 text-sm"
              placeholder="HR Manager"
            />
          </div>

          <div className="space-y-1">
            <label htmlFor="contact_phone" className="text-sm font-medium text-slate-700">
              Phone
            </label>
            <input
              id="contact_phone"
              name="contact_phone"
              className="h-10 w-full rounded-md border border-slate-300 px-3 text-sm"
              placeholder="+251..."
            />
          </div>

          <div className="space-y-1">
            <label htmlFor="contact_email" className="text-sm font-medium text-slate-700">
              Email
            </label>
            <input
              id="contact_email"
              name="contact_email"
              type="email"
              className="h-10 w-full rounded-md border border-slate-300 px-3 text-sm"
              placeholder="jane@company.com"
            />
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <button
          type="submit"
          className="inline-flex h-10 items-center rounded-md bg-slate-900 px-4 text-sm font-medium text-white"
        >
          Add company
        </button>
        <Link
          href="/companies"
          className="inline-flex h-10 items-center rounded-md border border-slate-300 bg-white px-4 text-sm font-medium text-slate-700"
        >
          Cancel
        </Link>
      </div>
    </form>
  );
}
