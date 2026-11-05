import { useUrlMultiSelect } from "../../../utils/useUrlMultiSelect";
import PracticeNameMatch from "./PracticeNameMatch";
import { ALL_PRACTICES } from "./PracticeSelector";

const DEFAULT_PRACTICES = [ALL_PRACTICES];
const NO_PRACTICES: string[] = [];

export default function usePracticeUrlSelection(
    practiceNames: string[] | undefined,
    enabled: boolean
): [string[], (next: string[]) => void] {
    return useUrlMultiSelect({
        param: "practices",
        options: practiceNames ?? NO_PRACTICES,
        defaultSelected: DEFAULT_PRACTICES,
        toToken: PracticeNameMatch,
        enabled
    });
}
