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
    <form action={createCompanyAction} className="space-y-8">
      <div className="grid gap-6 md:grid-cols-2">
        <div className="crm-field md:col-span-2">
          <label htmlFor="company_name" className="crm-label">
            Company name
          </label>
          <input
            id="company_name"
            name="company_name"
            autoFocus
            required
            className="crm-input"
            placeholder="Acme Outsourcing"
          />
        </div>

        <div className="crm-field">
          <label htmlFor="industry" className="crm-label">
            Industry
          </label>
          <input
            id="industry"
            name="industry"
            className="crm-input"
            placeholder="BPO, tech, NGO"
          />
        </div>

        <div className="crm-field">
          <label htmlFor="company_size" className="crm-label">
            Company size
          </label>
          <input
            id="company_size"
            name="company_size"
            className="crm-input"
            placeholder="11-50"
          />
        </div>

        <div className="crm-field">
          <label htmlFor="location" className="crm-label">
            Location
          </label>
          <input
            id="location"
            name="location"
            className="crm-input"
            placeholder="Addis Ababa"
          />
        </div>

        <div className="crm-field">
          <label htmlFor="source" className="crm-label">
            Source
          </label>
          <input
            id="source"
            name="source"
            className="crm-input"
            placeholder="Referral, LinkedIn, outbound"
          />
        </div>

        <div className="crm-field">
          <label htmlFor="hiring_signal" className="crm-label">
            Hiring signal
          </label>
          <input
            id="hiring_signal"
            name="hiring_signal"
            className="crm-input"
            placeholder="Hiring page, repeat openings"
          />
        </div>

        <div className="crm-field">
          <label htmlFor="status" className="crm-label">
            Status
          </label>
          <select
            id="status"
            name="status"
            defaultValue="target"
            className="crm-select"
          >
            {companyStatusOptions.map((status) => (
              <option key={status.value} value={status.value}>
                {status.label}
              </option>
            ))}
          </select>
        </div>

        <div className="crm-field">
          <label htmlFor="priority" className="crm-label">
            Priority
          </label>
          <select
            id="priority"
            name="priority"
            defaultValue="Medium"
            className="crm-select"
          >
            {priorityOptions.map((priority) => (
              <option key={priority} value={priority}>
                {priority}
              </option>
            ))}
          </select>
        </div>

        <div className="crm-field">
          <label htmlFor="owner_id" className="crm-label">
            Owner
          </label>
          <select
            id="owner_id"
            name="owner_id"
            defaultValue=""
            className="crm-select"
          >
            <option value="">Unassigned</option>
            {owners.map((owner) => (
              <option key={owner.id} value={owner.id}>
                {owner.full_name}
              </option>
            ))}
          </select>
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

        <div className="crm-field md:col-span-2">
          <label htmlFor="next_step" className="crm-label">
            Next step
          </label>
          <input
            id="next_step"
            name="next_step"
            className="crm-input"
            placeholder="Send intro email"
          />
        </div>

        <div className="crm-field md:col-span-2">
          <label htmlFor="notes" className="crm-label">
            Notes
          </label>
          <textarea
            id="notes"
            name="notes"
            rows={3}
            className="crm-input h-auto py-2"
            placeholder="Short internal notes"
          />
        </div>
      </div>

      <div className="border-t border-white/5 pt-8">
        <h3 className="text-sm font-bold text-white uppercase tracking-[0.2em] mb-6">Primary contact</h3>
        <div className="mt-3 grid gap-6 md:grid-cols-2">
          <div className="crm-field">
            <label htmlFor="contact_full_name" className="crm-label">
              Full name
            </label>
            <input
              id="contact_full_name"
              name="contact_full_name"
              className="crm-input"
              placeholder="Jane Doe"
            />
          </div>

          <div className="crm-field">
            <label htmlFor="contact_role_title" className="crm-label">
              Role title
            </label>
            <input
              id="contact_role_title"
              name="contact_role_title"
              className="crm-input"
              placeholder="HR Manager"
            />
          </div>

          <div className="crm-field">
            <label htmlFor="contact_phone" className="crm-label">
              Phone
            </label>
            <input
              id="contact_phone"
              name="contact_phone"
              className="crm-input"
              placeholder="+251..."
            />
          </div>

          <div className="crm-field">
            <label htmlFor="contact_email" className="crm-label">
              Email
            </label>
            <input
              id="contact_email"
              name="contact_email"
              type="email"
              className="crm-input"
              placeholder="jane@company.com"
            />
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3 pt-8 border-t border-white/5">
        <button
          type="submit"
          className="crm-primary-button px-6"
        >
          Add company
        </button>
        <Link
          href="/companies"
          className="crm-secondary-button px-6"
        >
          Cancel
        </Link>
      </div>
    </form>
  );
}
