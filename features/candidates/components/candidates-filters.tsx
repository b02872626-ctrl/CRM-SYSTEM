import Link from "next/link";
import { candidateStageOptions, formatEnumLabel } from "@/features/candidates/constants";

type DealOption = {
  id: string;
  title: string;
};

type CandidatesFiltersProps = {
  deals: DealOption[];
  sources: string[];
  selectedStage?: string;
  selectedSource?: string;
  selectedDeal?: string;
};

export function CandidatesFilters({
  deals,
  sources,
  selectedStage = "all",
  selectedSource = "all",
  selectedDeal = "all"
}: CandidatesFiltersProps) {
  return (
    <form className="crm-filter-bar">
      <div className="crm-field">
        <label htmlFor="stage" className="crm-label">
          Pipeline stage
        </label>
        <select id="stage" name="stage" defaultValue={selectedStage} className="crm-select">
          <option value="all">All stages</option>
          {candidateStageOptions.map((stage) => (
            <option key={stage} value={stage}>
              {formatEnumLabel(stage)}
            </option>
          ))}
        </select>
      </div>

      <div className="crm-field">
        <label htmlFor="source" className="crm-label">
          Source
        </label>
        <select id="source" name="source" defaultValue={selectedSource} className="crm-select">
          <option value="all">All sources</option>
          {sources.map((source) => (
            <option key={source} value={source}>
              {source}
            </option>
          ))}
        </select>
      </div>

      <div className="crm-field">
        <label htmlFor="deal" className="crm-label">
          Linked deal
        </label>
        <select id="deal" name="deal" defaultValue={selectedDeal} className="crm-select">
          <option value="all">All deals</option>
          {deals.map((deal) => (
            <option key={deal.id} value={deal.id}>
              {deal.title}
            </option>
          ))}
        </select>
      </div>

      <div className="flex items-end gap-2">
        <button type="submit" className="crm-primary-button">
          Apply
        </button>
        <Link href="/candidates" className="crm-secondary-button">
          Reset
        </Link>
      </div>
    </form>
  );
}
