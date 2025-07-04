/**
 *
 * @param labelValue
 * @param position: put undefined if no preference of floor or ceiling
 * @param decimals: if not defined, use 1 decimal place
 * @returns
 */
export function ShortFormat(labelValue, position?: number, decimal?: number) {
    if (labelValue === undefined || labelValue === null) {
        return "0";
    }

    const absoluteValue = Math.abs(Number.parseFloat(labelValue));
    let decimalPart = "";
    let result = "";
    const decimals = !decimal ? 1 : decimal;
    if (absoluteValue >= 1.0e9) {
        result =
            (absoluteValue / 1.0e9) % 1 !== 0
                ? `${(absoluteValue / 1.0e9).toFixed(decimals)}B`
                : `${absoluteValue / 1.0e9}B`;
        decimalPart = (absoluteValue / 1.0e9) % 1 !== 0 ? result.match(/\.(.*)B$/)?.[1] || "" : "";
    } else if (absoluteValue >= 1.0e6) {
        result =
            (absoluteValue / 1.0e6) % 1 !== 0
                ? `${(absoluteValue / 1.0e6).toFixed(decimals)}M`
                : `${absoluteValue / 1.0e6}M`;
        decimalPart = (absoluteValue / 1.0e6) % 1 !== 0 ? result.match(/\.(.*)M$/)?.[1] || "" : "";
    } else if (absoluteValue >= 1.0e3) {
        result =
            (absoluteValue / 1.0e3) % 1 !== 0
                ? `${(absoluteValue / 1.0e3).toFixed(decimals)}K`
                : `${absoluteValue / 1.0e3}K`;
        decimalPart = (absoluteValue / 1.0e3) % 1 !== 0 ? result.match(/\.(.*)K$/)?.[1] || "" : "";
    } else {
        result = absoluteValue % 1 !== 0 ? `${absoluteValue.toFixed(decimals)}` : `${absoluteValue}`;
    }
    if (labelValue.toString().includes("-")) {
        result = `-${result}`;
    }
    if (decimalPart.length > 0) {
        const numberPart = result.match(/^(.*).$/)?.[1];
        if (position === -1) {
            return result;
        }
        if (position === 0) {
            return result.replace(/^(.*)(.)$/, `${Math.floor(Number(numberPart))}$2`);
        }
        if (position !== undefined) {
            return result.replace(/^(.*)(.)$/, `${Math.ceil(Number(numberPart))}$2`);
        }
    }
    return result;
}

export function ShortFormatInteger(labelValue) {
    if (labelValue === undefined || labelValue === null) {
        return "0";
    }
    const absoluteValue = Math.abs(Math.round(Number.parseFloat(labelValue)));
    let result = "";
    if (absoluteValue >= 1.0e9) {
        result = `${Math.round(absoluteValue / 1.0e9)}B`;
    } else if (absoluteValue >= 1.0e6) {
        result = `${Math.round(absoluteValue / 1.0e6)}M`;
    } else if (absoluteValue >= 1.0e3) {
        result = `${Math.round(absoluteValue / 1.0e3)}K`;
    } else {
        result = `${absoluteValue}`;
    }
    if (labelValue.toString().includes("-")) {
        result = `-${result}`;
    }
    return result;
}

export function ShortFormatPaymentRate(labelValue, isForDifference = false) {
    if (labelValue === undefined || labelValue === null) {
        return "0";
    }
    const decimalPlaces = isForDifference ? 2 : 2;
    const absoluteValue = Math.abs(Number.parseFloat(labelValue));
    const roundedValue = Math.round(absoluteValue * 100) / 100;
    let result = "";
    if (absoluteValue >= 1.0e9) {
        const scaledValue = roundedValue / 1.0e9;
        result = `${scaledValue.toFixed(decimalPlaces)}B`;
    } else if (absoluteValue >= 1.0e6) {
        const scaledValue = roundedValue / 1.0e6;
        result = `${scaledValue.toFixed(decimalPlaces)}M`;
    } else if (absoluteValue >= 1.0e3) {
        const scaledValue = roundedValue / 1.0e3;
        result = `${scaledValue.toFixed(decimalPlaces)}K`;
    } else {
        result = `${roundedValue.toFixed(decimalPlaces)}`;
    }
    if (labelValue.toString().includes("-")) {
        result = `-${result}`;
    }
    return result;
}

export function formatPaymentRateUnified(value: number, isForDifference = false): string {
    if (value === 0 || value === null || value === undefined) return "";
    const decimalPlaces = isForDifference ? 2 : 2;
    const roundedValue = Math.round(value * 100) / 100;
    return roundedValue.toFixed(decimalPlaces);
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
export function CurrencyFormat(value: number, currency = "USD", locale = "en-US"): string {
    const isWholeNumber = value % 1 === 0;
    return new Intl.NumberFormat(locale, {
        style: "currency",
        currency,
        minimumFractionDigits: isWholeNumber ? 0 : 2,
        maximumFractionDigits: 2
    }).format(value);
}
