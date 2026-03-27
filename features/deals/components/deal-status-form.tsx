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
        className="crm-select h-9 text-xs"
      >
        {dealStageOptions.map((stage) => (
          <option key={stage} value={stage}>
            {formatEnumLabel(stage)}
          </option>
        ))}
      </select>
      <button
        type="submit"
        className="crm-secondary-button h-9 px-4"
      >
        Update
      </button>
    </form>
  );
}
