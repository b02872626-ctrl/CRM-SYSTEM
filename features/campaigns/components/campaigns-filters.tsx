import Link from "next/link";
import { campaignStatusOptions } from "@/features/campaigns/constants";

type OwnerOption = {
  id: string;
  full_name: string;
};

type CampaignsFiltersProps = {
  owners: OwnerOption[];
  selectedSearch?: string;
  selectedStatus?: string;
  selectedOwner?: string;
};

export function CampaignsFilters({
  owners,
  selectedSearch = "",
  selectedStatus = "all",
  selectedOwner = "all"
}: CampaignsFiltersProps) {
  return (
    <form className="crm-filter-bar">
      <div className="crm-field">
        <label htmlFor="search" className="crm-label">
          Search
        </label>
        <input
          id="search"
          name="search"
          defaultValue={selectedSearch}
          placeholder="Campaign name or audience"
          className="crm-input"
        />
      </div>

      <div className="crm-field">
        <label htmlFor="status" className="crm-label">
          Status
        </label>
        <select id="status" name="status" defaultValue={selectedStatus} className="crm-select">
          <option value="all">All statuses</option>
          {campaignStatusOptions.map((status) => (
            <option key={status} value={status}>
              {status}
            </option>
          ))}
        </select>
      </div>

      <div className="crm-field">
        <label htmlFor="owner" className="crm-label">
          Owner
        </label>
        <select id="owner" name="owner" defaultValue={selectedOwner} className="crm-select">
          <option value="all">All owners</option>
          {owners.map((owner) => (
            <option key={owner.id} value={owner.id}>
              {owner.full_name}
            </option>
          ))}
        </select>
      </div>

      <div className="flex items-end gap-2">
        <button type="submit" className="crm-primary-button">
          Apply
        </button>
        <Link href="/campaigns" className="crm-secondary-button">
          Reset
        </Link>
      </div>
    </form>
  );
}
