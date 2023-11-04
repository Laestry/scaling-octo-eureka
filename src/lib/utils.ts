export function debounce<F extends (...args: unknown[]) => void>(
	func: F,
	timeout: number = 300
): (...args: Parameters<F>) => void {
	let timer: ReturnType<typeof setTimeout> | null;
	return (...args: Parameters<F>) => {
		if (timer !== null) {
			clearTimeout(timer);
		}
		timer = setTimeout(() => func(...args), timeout);
	};
}

export function getNumberFromId(gid: string) {
	const matches = gid.match(/\d+/g);
	if (matches) {
		return matches.join('');
	}
	return '';
}
