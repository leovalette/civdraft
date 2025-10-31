import { memo } from "react";
import { CivPrimaryButton } from "./CivPrimaryButton";

type DraftActionsProps = {
  currentStatus: `${"PICK" | "BAN" | "MAPBAN"}${number}`;
  canPlay: boolean;
  onPickBan: () => void;
  isObserver: boolean;
  disabled?: boolean;
};
export const DraftActions = memo(({
  currentStatus,
  canPlay,
  onPickBan,
  isObserver,
  disabled,
}: DraftActionsProps) => (
  <div>
    <CivPrimaryButton onClick={onPickBan} disabled={!canPlay || disabled}>
      {canPlay ? getPhase(currentStatus) : getAction(isObserver)}
    </CivPrimaryButton>
  </div>
));

DraftActions.displayName = "DraftActions";

const getPhase = (
  currentStatus: `${"PICK" | "BAN" | "MAPBAN"}${number}`,
): "BAN" | "PICK" | "BAN MAP" =>
  currentStatus?.includes("BAN")
    ? "BAN"
    : currentStatus?.includes("MAPBAN")
      ? "BAN MAP"
      : "PICK";

const getAction = (
  isObserver: boolean,
): "Waiting for other team" | "Spectating" =>
  isObserver ? "Spectating" : "Waiting for other team";
