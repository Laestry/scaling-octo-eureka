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

/** Dispatch event on click outside of node */
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
export function clickOutside(node) {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    const handleClick = (event) => {
        if (node && !node.contains(event.target) && !event.defaultPrevented) {
            node.dispatchEvent(new CustomEvent('click_outside', node));
        }
    };

    document.addEventListener('click', handleClick, true);

    return {
        destroy() {
            document.removeEventListener('click', handleClick, true);
        }
    };
}

export function teleport(node, name) {
    let teleportContainer = document.querySelector(name);
    teleportContainer.appendChild(node);

    return {
        destroy() {
            node.remove();
        }
    };
}

export const delay = (delayInms) => {
    return new Promise((resolve) => setTimeout(resolve, delayInms));
};
