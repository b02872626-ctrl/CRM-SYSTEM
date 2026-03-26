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
};

export function CampaignForm({ mode, owners, campaign }: CampaignFormProps) {
  const action = mode === "create" ? createCampaignAction : updateCampaignAction;

  return (
    <form action={action} className="space-y-5 rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
      {campaign ? <input type="hidden" name="id" value={campaign.id} /> : null}

      <div className="grid gap-3 md:grid-cols-2">
        <div className="space-y-1 md:col-span-2">
          <label htmlFor="name" className="text-sm font-medium text-slate-700">
            Campaign name
          </label>
          <input
            id="name"
            name="name"
            defaultValue={campaign?.name ?? ""}
            autoFocus
            required
            className="h-10 w-full rounded-md border border-slate-300 px-3 text-sm"
            placeholder="Q2 sales hiring campaign"
          />
        </div>

        <div className="space-y-1 md:col-span-2">
          <label htmlFor="description" className="text-sm font-medium text-slate-700">
            Description
          </label>
          <textarea
            id="description"
            name="description"
            rows={2}
            defaultValue={campaign?.description ?? ""}
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
            placeholder="Short internal note about the campaign focus"
          />
        </div>

        <div className="space-y-1">
          <label htmlFor="campaign_type" className="text-sm font-medium text-slate-700">
            Type
          </label>
          <input
            id="campaign_type"
            name="campaign_type"
            defaultValue={campaign?.campaign_type ?? ""}
            className="h-10 w-full rounded-md border border-slate-300 px-3 text-sm"
            placeholder="Outbound, re-activation, segment"
          />
        </div>

        <div className="space-y-1">
          <label htmlFor="target_audience" className="text-sm font-medium text-slate-700">
            Target audience
          </label>
          <input
            id="target_audience"
            name="target_audience"
            defaultValue={campaign?.target_audience ?? ""}
            className="h-10 w-full rounded-md border border-slate-300 px-3 text-sm"
            placeholder="Addis tech startups"
          />
        </div>

        <div className="space-y-1">
          <label htmlFor="status" className="text-sm font-medium text-slate-700">
            Status
          </label>
          <select
            id="status"
            name="status"
            defaultValue={campaign?.status ?? "Draft"}
            className="h-10 w-full rounded-md border border-slate-300 bg-white px-3 text-sm"
          >
            {campaignStatusOptions.map((status) => (
              <option key={status} value={status}>
                {status}
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
            defaultValue={campaign?.owner_id ?? ""}
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
          <label htmlFor="start_date" className="text-sm font-medium text-slate-700">
            Start date
          </label>
          <input
            id="start_date"
            name="start_date"
            type="date"
            defaultValue={campaign?.start_date ?? ""}
            className="h-10 w-full rounded-md border border-slate-300 px-3 text-sm"
          />
        </div>

        <div className="space-y-1">
          <label htmlFor="end_date" className="text-sm font-medium text-slate-700">
            End date
          </label>
          <input
            id="end_date"
            name="end_date"
            type="date"
            defaultValue={campaign?.end_date ?? ""}
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
            rows={3}
            defaultValue={campaign?.notes ?? ""}
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
            placeholder="Optional internal notes"
          />
        </div>
      </div>

      <div className="flex items-center gap-2">
        <button
          type="submit"
          className="inline-flex h-10 items-center rounded-md bg-slate-900 px-4 text-sm font-medium text-white"
        >
          {mode === "create" ? "Create campaign" : "Save changes"}
        </button>
        <Link
          href={campaign ? `/campaigns/${campaign.id}` : "/campaigns"}
          className="inline-flex h-10 items-center rounded-md border border-slate-300 bg-white px-4 text-sm font-medium text-slate-700"
        >
          Cancel
        </Link>
      </div>
    </form>
  );
}
