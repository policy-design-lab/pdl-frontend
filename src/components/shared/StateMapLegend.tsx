import React from "react";
import * as d3 from "d3";
import DrawLegend from "./DrawLegend";
import SparseCountyLegend from "./countyMap/SparseCountyLegend";
import { getCountyScaleMode, getSparseStateEntries, StateValue } from "../../utils/countyColorScale";

const NO_MAP_DATA_MESSAGE = "No data is available for this selection.";

interface StateMapLegendProps {
    stateValues: StateValue[];
    stateCodes: Record<string, string>;
    colorScale: d3.ScaleThreshold<number, string>;
    title: React.ReactNode;
    prepColor: readonly string[];
    highlightColor: string;
    notDollar?: boolean;
    emptyState?: string[];
    grayAreasSuffix?: string;
}

const StateMapLegend = ({
    stateValues,
    stateCodes,
    title,
    highlightColor,
    notDollar = false,
    ...legendProps
}: StateMapLegendProps): JSX.Element => {
    const values = stateValues.map(({ value }) => value);
    const mode = getCountyScaleMode(values);
    if (mode !== "quantile") {
        return (
            <SparseCountyLegend
                region="state"
                title={title}
                entries={mode === "sparse" ? getSparseStateEntries(stateValues, stateCodes) : []}
                highlightColor={highlightColor}
                emptyMessage={NO_MAP_DATA_MESSAGE}
                notDollar={notDollar}
            />
        );
    }
    return <DrawLegend isRatio={false} notDollar={notDollar} title={title} programData={values} {...legendProps} />;
};

export default StateMapLegend;
