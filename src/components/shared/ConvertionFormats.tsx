export function ShortFormat(labelValue, position?: number) {
    const absoluteValue = Math.abs(Number.parseFloat(labelValue));
    let decimalPart = "";
    let result = "";
    if (absoluteValue >= 1.0e9) {
        result =
            (absoluteValue / 1.0e9) % 1 !== 0 ? `${(absoluteValue / 1.0e9).toFixed(1)}B` : `${absoluteValue / 1.0e9}B`;
        decimalPart = (absoluteValue / 1.0e9) % 1 !== 0 ? result.match(/\.(.*)B$/)[1] : "";
    } else if (absoluteValue >= 1.0e6) {
        result =
            (absoluteValue / 1.0e6) % 1 !== 0 ? `${(absoluteValue / 1.0e6).toFixed(1)}M` : `${absoluteValue / 1.0e6}M`;
        decimalPart = (absoluteValue / 1.0e6) % 1 !== 0 ? result.match(/\.(.*)M$/)[1] : "";
    } else if (absoluteValue >= 1.0e3) {
        result =
            (absoluteValue / 1.0e3) % 1 !== 0 ? `${(absoluteValue / 1.0e3).toFixed(1)}K` : `${absoluteValue / 1.0e3}K`;
        decimalPart = (absoluteValue / 1.0e3) % 1 !== 0 ? result.match(/\.(.*)K$/)[1] : "";
    } else {
        result = absoluteValue % 1 !== 0 ? `${absoluteValue.toFixed(1)}` : `${absoluteValue}`;
    }
    if (labelValue.toString().includes("-")) {
        result = `-${result}`;
    }
    if (decimalPart.length > 0) {
        const numberPart = result.match(/^(.*).$/)?.[1];
        if (position === 0) {
            result = result.replace(/^(.*)(.)$/, `${Math.floor(Number(numberPart))}$2`);
        } else if (position !== undefined) {
            result = result.replace(/^(.*)(.)$/, `${Math.ceil(Number(numberPart))}$2`);
        }
    }
    return result;
}
export function ToPercentageString(value: string): string {
    return `${parseFloat(value).toFixed(2)}%`;
}
export function ToDollarString(value: string, decimals: number): string {
    if (decimals === 3) {
        return `${Number(parseFloat(value) / 10 ** decimals).toLocaleString(undefined, {
            maximumFractionDigits: 2
        })}K`;
    }
    if (decimals === 6) {
        return `${Number(parseFloat(value) / 10 ** decimals).toLocaleString(undefined, {
            maximumFractionDigits: 2
        })}M`;
    }
    if (decimals === 9) {
        return `${Number(parseFloat(value) / 10 ** decimals).toLocaleString(undefined, {
            maximumFractionDigits: 2
        })}B`;
    }
    return Number(parseFloat(value) / 10 ** decimals).toLocaleString(undefined, {
        maximumFractionDigits: 2
    });
}
