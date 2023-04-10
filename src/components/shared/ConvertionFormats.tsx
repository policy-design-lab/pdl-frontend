export function ShortFormat(labelValue) {
	return Math.abs(Number(labelValue)) >= 1.0e9
		? `${Math.abs(Number(labelValue)) / 1.0e9}B`
		: Math.abs(Number(labelValue)) >= 1.0e6
			? `${Math.abs(Number(labelValue)) / 1.0e6}M`
			: Math.abs(Number(labelValue)) >= 1.0e3
				? `${Math.abs(Number(labelValue)) / 1.0e3}K`
				: Math.abs(Number(labelValue));
}
export function ToPercentageString(value: string): string {
	return `${parseFloat(value).toFixed(2)}%`;
}
export function ToDollarString(value: string, decimals: number = 6): string {
	return Number(parseFloat(value) / Math.pow(10, decimals)).toLocaleString(
		undefined,
		{
			maximumFractionDigits: 2,
		}
	);
}
