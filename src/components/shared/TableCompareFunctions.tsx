export function compareWithDollarSign(rowA, rowB, id, desc) {
    const a = Number.parseFloat(rowA.values[id].substring(1).replaceAll(",", ""));
    const b = Number.parseFloat(rowB.values[id].substring(1).replaceAll(",", ""));
    if (a > b) return 1;
    if (a < b) return -1;
    return 0;
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
