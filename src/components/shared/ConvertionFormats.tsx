export function ShortFormat(labelValue) {
    const absoluteValue = Math.abs(Number(labelValue));
    let result;
    if (absoluteValue >= 1.0e9) {
        result = `${absoluteValue / 1.0e9}B`;
    } else if (absoluteValue >= 1.0e6) {
        result = `${absoluteValue / 1.0e6}M`;
    } else if (absoluteValue >= 1.0e3) {
        result = `${absoluteValue / 1.0e3}K`;
    } else {
        result = absoluteValue;
    }
    return result;
}
export function ToPercentageString(value: string): string {
    return `${parseFloat(value).toFixed(2)}%`;
}
export function ToDollarString(value: string, decimals = 6): string {
    return Number(parseFloat(value) / 10 ** decimals).toLocaleString(undefined, {
        maximumFractionDigits: 2
    });
}
