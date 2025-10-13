import { CivPrimaryButton } from "./CivPrimaryButton";

type DraftActionsProps = {
  currentStatus: `${"PICK" | "BAN" | "MAPBAN"}${number}`;
  canPlay: boolean;
  onPickBan: () => void;
  isObserver: boolean;
};
export const DraftActions = ({
  currentStatus,
  canPlay,
  onPickBan,
  isObserver,
}: DraftActionsProps) => (
  <div>
    <CivPrimaryButton onClick={onPickBan} disabled={!canPlay}>
      {canPlay ? getPhase(currentStatus) : getAction(isObserver)}
    </CivPrimaryButton>
  </div>
);

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
