import React from "react";
import { compareWithDollarSign, compareWithPercentSign } from "../shared/TableCompareFunctions";
import { formatCurrency } from "../shared/ConvertionFormats";
import CountyDataTable, { CountyTableColumn } from "../shared/countyMap/CountyDataTable";
import { getPracticeTotal } from "../shared/titleii/PracticeMethods";
import {
    getCategoryPayment,
    getCategoryPercentageNationwide,
    getCategoryPercentageWithinState,
    isTotalCategory
} from "./EQIPCategoryMethods";

interface EQIPCountyTableProps {
    category: string;
    tableTitle: string;
    stateCodes: Record<string, string>;
    countyData: any;
    year: string;
    selectedState: string;
    onStateChange: (state: string) => void;
    selectedPractices?: string[];
}

function EQIPCountyTable({
    category,
    tableTitle,
    stateCodes,
    countyData,
    year,
    selectedState,
    onStateChange,
    selectedPractices = []
}: EQIPCountyTableProps): JSX.Element {
    const activePractices = React.useMemo(
        () => selectedPractices.filter((practice) => practice && practice !== "All Practices"),
        [selectedPractices]
    );

    const columns: CountyTableColumn[] = React.useMemo(() => {
        const categoryLabel = isTotalCategory(category) ? "Total EQIP" : category;
        const columnPrep: CountyTableColumn[] = [
            {
                key: "categoryBenefit",
                header: `${categoryLabel} Benefit`.toUpperCase(),
                format: (county: any) => formatCurrency(getCategoryPayment(county, category), 0),
                sortType: compareWithDollarSign
            }
        ];
        if (!isTotalCategory(category)) {
            columnPrep.push({
                key: "categoryPercentage",
                header: `${categoryLabel} Percentage Within County`.toUpperCase(),
                format: (county: any) => `${getCategoryPercentageWithinState(county, category)}%`,
                sortType: compareWithPercentSign
            });
            columnPrep.push({
                key: "eqipBenefit",
                header: "EQIP BENEFITS",
                format: (county: any) => formatCurrency(Number(county.totalPaymentInDollars) || 0, 0),
                sortType: compareWithDollarSign
            });
        }
        columnPrep.push({
            key: "percentage",
            header: "PCT. NATIONWIDE",
            format: (county: any) => `${getCategoryPercentageNationwide(county, category)}%`,
            sortType: compareWithPercentSign
        });
        activePractices.forEach((practice) => {
            columnPrep.push({
                key: `practice_${practice}`,
                header: practice.replace(/\s*\([a-zA-Z0-9]+\)$/, "").toUpperCase(),
                format: (county: any) => formatCurrency(getPracticeTotal(county, practice), 0),
                sortType: compareWithDollarSign
            });
        });
        return columnPrep;
    }, [category, activePractices]);

    return (
        <CountyDataTable
            tableTitle={tableTitle}
            columns={columns}
            stateCodes={stateCodes}
            countyData={countyData}
            year={year}
            selectedState={selectedState}
            onStateChange={onStateChange}
        />
    );
}

export default EQIPCountyTable;
