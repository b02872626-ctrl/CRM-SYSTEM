import Link from "next/link";
import { dealStageOptions, dealUrgencyOptions, formatEnumLabel } from "@/features/deals/constants";

type FilterOption = {
  id: string;
  full_name: string;
};

type DealsFiltersProps = {
  recruiters: FilterOption[];
  selectedStatus?: string;
  selectedRecruiter?: string;
  selectedUrgency?: string;
};

export function DealsFilters({
  recruiters,
  selectedStatus = "all",
  selectedRecruiter = "all",
  selectedUrgency = "all"
}: DealsFiltersProps) {
  return (
    <form className="crm-filter-bar">
      <div className="crm-field">
        <label htmlFor="status" className="crm-label">
          Status
        </label>
        <select id="status" name="status" defaultValue={selectedStatus} className="crm-select">
          <option value="all">All statuses</option>
          {dealStageOptions.map((stage) => (
            <option key={stage} value={stage}>
              {formatEnumLabel(stage)}
            </option>
          ))}
        </select>
      </div>

      <div className="crm-field">
        <label htmlFor="recruiter" className="crm-label">
          Recruiter
        </label>
        <select id="recruiter" name="recruiter" defaultValue={selectedRecruiter} className="crm-select">
          <option value="all">All recruiters</option>
          {recruiters.map((recruiter) => (
            <option key={recruiter.id} value={recruiter.id}>
              {recruiter.full_name}
            </option>
          ))}
        </select>
      </div>

      <div className="crm-field">
        <label htmlFor="urgency" className="crm-label">
          Urgency
        </label>
        <select id="urgency" name="urgency" defaultValue={selectedUrgency} className="crm-select">
          <option value="all">All urgency levels</option>
          {dealUrgencyOptions.map((urgency) => (
            <option key={urgency} value={urgency}>
              {formatEnumLabel(urgency)}
            </option>
          ))}
        </select>
      </div>

      <div className="flex items-end gap-2">
        <button type="submit" className="crm-primary-button">
          Apply
        </button>
        <Link href="/deals" className="crm-secondary-button">
          Reset
        </Link>
      </div>
    </form>
  );
}
