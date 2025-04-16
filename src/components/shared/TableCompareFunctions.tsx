export function compareWithDollarSign(rowA, rowB, id, desc) {
    const aVal = rowA.values[id];
    const bVal = rowB.values[id];

    if (aVal === undefined || aVal === null) return 1;
    if (bVal === undefined || bVal === null) return -1;

    if (
        (aVal === "$0.00" || aVal === "" || aVal === undefined) &&
        (bVal === "$0.00" || bVal === "" || bVal === undefined)
    ) {
        const countyA = rowA.values.county || "";
        const countyB = rowB.values.county || "";
        return countyA.localeCompare(countyB);
    }

    if (aVal === "$0.00" || aVal === "" || aVal === 0) return 1;
    if (bVal === "$0.00" || bVal === "" || bVal === 0) return -1;

    let a = 0;
    let b = 0;

    try {
        if (typeof aVal === "string" && aVal.startsWith("$")) {
            a = Number.parseFloat(aVal.substring(1).replaceAll(",", ""));
        } else if (typeof aVal === "number") {
            a = aVal;
        }

        if (typeof bVal === "string" && bVal.startsWith("$")) {
            b = Number.parseFloat(bVal.substring(1).replaceAll(",", ""));
        } else if (typeof bVal === "number") {
            b = bVal;
        }
    } catch (error) {
        console.warn("Error parsing value for sorting:", error);
    }

    const sortOrder = desc === false ? 1 : -1;

    if (a > b) return -1 * sortOrder;
    if (a < b) return 1 * sortOrder;

    const countyA = rowA.values.county || "";
    const countyB = rowB.values.county || "";
    return countyA.localeCompare(countyB);
}

export function compareWithPercentSign(rowA, rowB, id, desc) {
    const a = Number.parseFloat(rowA.values[id].replaceAll("%", ""));
    const b = Number.parseFloat(rowB.values[id].replaceAll("%", ""));
    if (a > b) return 1;
    if (a < b) return -1;
    return 0;
}

export function compareWithAlphabetic(rowA, rowB, id, desc) {
    const a = rowA.values[id];
    const b = rowB.values[id];
    if (a > b) return 1;
    if (a < b) return -1;
    return 0;
}

export function sortByDollars(jsonArray, key): void {
    jsonArray.sort((a, b) => {
        const paymentA = Number(a[key].replace(/[^0-9.-]+/g, ""));
        const paymentB = Number(b[key].replace(/[^0-9.-]+/g, ""));
        return paymentB - paymentA;
    });
}

export function compareWithNumber(rowA, rowB, id, desc) {
    const a = Number(rowA.values[id].replace(/,/g, ""));
    const b = Number(rowB.values[id].replace(/,/g, ""));
    if (a > b) return 1;
    if (a < b) return -1;
    return 0;
}
