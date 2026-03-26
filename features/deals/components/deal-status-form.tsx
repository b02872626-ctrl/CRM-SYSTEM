import { updateDealStatusAction } from "@/features/deals/actions";
import { dealStageOptions, formatEnumLabel } from "@/features/deals/constants";

type DealStatusFormProps = {
  dealId: string;
  currentStage: string;
  returnPath: string;
};

export function DealStatusForm({
  dealId,
  currentStage,
  returnPath
}: DealStatusFormProps) {
  return (
    <form action={updateDealStatusAction} className="flex items-center gap-1.5">
      <input type="hidden" name="id" value={dealId} />
      <input type="hidden" name="return_path" value={returnPath} />
      <select
        name="stage"
        defaultValue={currentStage}
        className="h-8 rounded-md border border-slate-300 bg-white px-2.5 text-sm text-slate-700"
      >
        {dealStageOptions.map((stage) => (
          <option key={stage} value={stage}>
            {formatEnumLabel(stage)}
          </option>
        ))}
      </select>
      <button
        type="submit"
        className="inline-flex h-8 items-center rounded-md border border-slate-300 bg-white px-3 text-sm font-medium text-slate-700"
      >
        Update
      </button>
    </form>
  );
}
