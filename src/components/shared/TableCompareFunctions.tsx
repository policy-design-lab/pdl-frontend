export function compareWithDollarSign(rowA: any, rowB: any, id: string): number {
    const aVal = rowA.values[id];
    const bVal = rowB.values[id];
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
        } else if (bVal === undefined || bVal === null || bVal === "") {
            b = 0;
        }
    } catch (error) {
        console.warn("Error parsing value for sorting:", error);
        a = 0;
        b = 0;
    }
    if (Number.isNaN(a)) a = 0;
    if (Number.isNaN(b)) b = 0;
    const comparison = a - b;
    return comparison;
}

export function compareWithPercentSign(rowA: any, rowB: any, id: string): number {
    const a = Number.parseFloat(rowA.values[id].replaceAll("%", ""));
    const b = Number.parseFloat(rowB.values[id].replaceAll("%", ""));
    return a - b;
}

export function compareWithAlphabetic(rowA: any, rowB: any, id: string): number {
    const a = rowA.values[id] || "";
    const b = rowB.values[id] || "";
    const comparison = a.localeCompare(b);
    return comparison;
}

export function sortByDollars(jsonArray: any[], key: string): void {
    jsonArray.sort((a, b) => {
        const paymentA = Number(a[key].replace(/[^0-9.-]+/g, ""));
        const paymentB = Number(b[key].replace(/[^0-9.-]+/g, ""));
        return paymentB - paymentA;
    });
}

export function compareWithNumber(rowA: any, rowB: any, id: string): number {
    const aVal = rowA.values[id];
    const bVal = rowB.values[id];
    if (aVal === undefined || aVal === null) return 1;
    if (bVal === undefined || bVal === null) return -1;
    let a;
    let b;
    if (typeof aVal === "number") {
        a = aVal;
    } else if (typeof aVal === "string") {
        a = Number(aVal.replace(/,/g, ""));
    } else {
        a = 0;
    }
    if (typeof bVal === "number") {
        b = bVal;
    } else if (typeof bVal === "string") {
        b = Number(bVal.replace(/,/g, ""));
    } else {
        b = 0;
    }
    if (Number.isNaN(a)) a = 0;
    if (Number.isNaN(b)) b = 0;
    return a - b;
}
