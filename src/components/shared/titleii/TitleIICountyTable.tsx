import React from "react";
import { compareWithDollarSign, compareWithPercentSign } from "../TableCompareFunctions";
import { formatCurrency } from "../ConvertionFormats";
import CountyDataTable, { CountyTableColumn } from "../countyMap/CountyDataTable";
import { getPracticeTotal } from "./PracticeMethods";
import {
    getActivePractices,
    getCategoryLabel,
    getCategoryPayment,
    getCategoryPercentageNationwide,
    getCategoryPercentageWithinState,
    isTotalCategory,
    stripPracticeCode,
    TitleIICountyProgram
} from "./TitleIICountyMethods";
import { TitleIICountyDistribution, TitleIICountyRecord } from "./Interface";

interface TitleIICountyTableProps {
    program: TitleIICountyProgram;
    category: string;
    tableTitle: string;
    stateCodes: Record<string, string>;
    countyData: TitleIICountyDistribution;
    year: string;
    selectedState: string;
    onStateChange: (state: string) => void;
    selectedPractices?: string[];
}

function TitleIICountyTable({
    program,
    category,
    tableTitle,
    stateCodes,
    countyData,
    year,
    selectedState,
    onStateChange,
    selectedPractices = []
}: TitleIICountyTableProps): JSX.Element {
    const activePractices = React.useMemo(() => getActivePractices(selectedPractices), [selectedPractices]);

    const columns: CountyTableColumn[] = React.useMemo(() => {
        const categoryLabel = getCategoryLabel(program, category);
        const columnPrep: CountyTableColumn[] = [
            {
                key: "categoryBenefit",
                header: `${categoryLabel} Benefit`.toUpperCase(),
                format: (county: TitleIICountyRecord) =>
                    formatCurrency(getCategoryPayment(program, county, category), 0),
                sortType: compareWithDollarSign
            }
        ];
        if (!isTotalCategory(program, category)) {
            columnPrep.push({
                key: "categoryPercentage",
                header: `${categoryLabel} Percentage Within County`.toUpperCase(),
                format: (county: TitleIICountyRecord) =>
                    `${getCategoryPercentageWithinState(program, county, category)}%`,
                sortType: compareWithPercentSign
            });
            columnPrep.push({
                key: "programBenefit",
                header: `${program.name} BENEFITS`,
                format: (county: TitleIICountyRecord) => formatCurrency(Number(county.totalPaymentInDollars) || 0, 0),
                sortType: compareWithDollarSign
            });
        }
        columnPrep.push({
            key: "percentage",
            header: "PCT. NATIONWIDE",
            format: (county: TitleIICountyRecord) => `${getCategoryPercentageNationwide(program, county, category)}%`,
            sortType: compareWithPercentSign
        });
        activePractices.forEach((practice) => {
            columnPrep.push({
                key: `practice_${practice}`,
                header: stripPracticeCode(practice).toUpperCase(),
                format: (county: TitleIICountyRecord) => formatCurrency(getPracticeTotal(county, practice), 0),
                sortType: compareWithDollarSign
            });
        });
        return columnPrep;
    }, [program, category, activePractices]);

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

export default TitleIICountyTable;
