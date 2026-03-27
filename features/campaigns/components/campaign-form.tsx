import Link from "next/link";
import { createCampaignAction, updateCampaignAction } from "@/features/campaigns/actions";
import { campaignStatusOptions } from "@/features/campaigns/constants";

type OwnerOption = {
  id: string;
  full_name: string;
};

type CampaignRecord = {
  id: string;
  name: string;
  description: string | null;
  campaign_type: string | null;
  target_audience: string | null;
  status: string;
  owner_id: string | null;
  start_date: string | null;
  end_date: string | null;
  notes: string | null;
};

type CampaignFormProps = {
  mode: "create" | "edit";
  owners: OwnerOption[];
  campaign?: CampaignRecord | null;
  defaultOwnerId?: string;
  onCancel?: () => void;
};

export function CampaignForm({ mode, owners, campaign, defaultOwnerId, onCancel }: CampaignFormProps) {
  const action = mode === "create" ? createCampaignAction : updateCampaignAction;

  return (
    <form action={action} className="space-y-6">
      {campaign ? <input type="hidden" name="id" value={campaign.id} /> : null}

      <div className="grid gap-6 md:grid-cols-2">
        <div className="crm-field md:col-span-2">
          <label htmlFor="name" className="crm-label">Campaign name</label>
          <input id="name" name="name" defaultValue={campaign?.name ?? ""} autoFocus required className="crm-input" placeholder="Q2 sales hiring campaign" />
        </div>

        <div className="crm-field md:col-span-2">
          <label htmlFor="description" className="crm-label">Description</label>
          <textarea id="description" name="description" rows={2} defaultValue={campaign?.description ?? ""} className="crm-input h-auto py-2" placeholder="Short internal note about the campaign focus" />
        </div>

        <div className="crm-field">
          <label htmlFor="campaign_type" className="crm-label">Type</label>
          <input id="campaign_type" name="campaign_type" defaultValue={campaign?.campaign_type ?? ""} className="crm-input" placeholder="Outbound, re-activation, segment" />
        </div>

        <div className="crm-field">
          <label htmlFor="target_audience" className="crm-label">Target audience</label>
          <input id="target_audience" name="target_audience" defaultValue={campaign?.target_audience ?? ""} className="crm-input" placeholder="Addis tech startups" />
        </div>

        <div className="crm-field">
          <label htmlFor="status" className="crm-label">Status</label>
          <select id="status" name="status" defaultValue={campaign?.status ?? "Draft"} className="crm-select">
            {campaignStatusOptions.map((status) => <option key={status} value={status}>{status}</option>)}
          </select>
        </div>

        <div className="crm-field">
          <label htmlFor="owner_id" className="crm-label">Owner</label>
          <select id="owner_id" name="owner_id" defaultValue={campaign?.owner_id ?? defaultOwnerId ?? ""} className="crm-select">
            <option value="">Unassigned</option>
            {owners.map((owner) => <option key={owner.id} value={owner.id}>{owner.full_name}</option>)}
          </select>
        </div>

        <div className="crm-field">
          <label htmlFor="start_date" className="crm-label">Start date</label>
          <input id="start_date" name="start_date" type="date" defaultValue={campaign?.start_date ?? ""} className="crm-input" />
        </div>

        <div className="crm-field">
          <label htmlFor="end_date" className="crm-label">End date</label>
          <input id="end_date" name="end_date" type="date" defaultValue={campaign?.end_date ?? ""} className="crm-input" />
        </div>

        <div className="crm-field md:col-span-2">
          <label htmlFor="notes" className="crm-label">Notes</label>
          <textarea id="notes" name="notes" rows={3} defaultValue={campaign?.notes ?? ""} className="crm-input h-auto py-2" placeholder="Optional internal notes" />
        </div>
      </div>

      <div className="flex items-center gap-3 pt-4 border-t border-white/5">
        <button
          type="submit"
          className="crm-primary-button px-6"
        >
          {mode === "create" ? "Create campaign" : "Save changes"}
        </button>
        {onCancel ? (
          <button
            type="button"
            onClick={onCancel}
            className="crm-secondary-button px-6"
          >
            Cancel
          </button>
        ) : (
          <Link
            href={campaign ? `/campaigns/${campaign.id}` : "/campaigns"}
            className="crm-secondary-button px-6"
          >
            Cancel
          </Link>
        )}
      </div>
    </form>
  );
}
