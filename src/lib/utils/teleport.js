export function teleport(node, name) {
	
	let teleportContainer = document.getElementById(name);
	teleportContainer.appendChild(node);

	return {
		destroy() {
			node.remove();
		}
	}
}