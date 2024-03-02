<script>
	//need more brain to finish this, could be a cool component
	const images = ['/images/mainbackdrop.png', '/images/winefermenting.png', '/images/vision.png'];
	let selected = [false, false, true];
	export let selectedPos = 2;

	let animation;

	const timing = {
		duration: 500,
		iterations: 1,
		fill: 'forwards',
		easing: 'ease-in-out'
	};

	function animateElement(element, startPos, endPos) {
		const animation = [{ right: `${startPos}px` }, { right: `${endPos}px` }];
		element.animate(animation, timing);
	}

	function handleClick(i) {
		if (selected[i]) return;
		selected = new Array(3).fill(false);
		selected[i] = true;

		console.log(selectedPos, i);

		if (selectedPos === 2 && i === 0) {
			let element1 = document.getElementById('#element' + 2);
			let element2 = document.getElementById('#element' + 1);

			let animation2 = [
				{ right: 70 * (1 + 1) + 'px' },
				{ right: element1.clientWidth - 140 + 70 * 0 + 'px' }
			];

			animateElement(element1, 70 * (2 + 1), element1.clientWidth - 140 + 70 * 1);
			setTimeout(function () {
				element2.animate(animation2, timing);
			}, 300);
		} else if (selectedPos === 0 && i === 2) {
			let element1 = document.getElementById('#element' + 2);
			let element2 = document.getElementById('#element' + 1);
			let animation1 = [
				{ right: element1.clientWidth - 210 + 70 * 2 + 'px' },
				{ right: 70 * 2 + 'px' }
			];
			let animation2 = [
				{ right: element1.clientWidth - 210 + 70 * 1 + 'px' },
				{ right: 70 * 1 + 'px' }
			];
			element2.animate(animation2, timing);
			setTimeout(function () {
				element1.animate(animation1, timing);
			}, 300);
		} else {
			let element = document.getElementById('#element' + (i + (selectedPos > i ? 1 : 0)));
			if (selectedPos > i)
				animation = [
					{ right: 70 * (i + 1) + 'px' },
					{ right: element.clientWidth - 140 + 70 * i + 'px' }
				];
			else
				animation = [
					{ right: element.clientWidth - 210 + 70 * i + 'px' },
					{ right: 70 * i + 'px' }
				];

			element.animate(animation, timing);
		}

		selectedPos = i;
	}
</script>

<div class="">
	{#each images as c, i}
		<button
			on:click={() => handleClick(i)}
			style="height: 752px;
			width: 100%;
				background-position: calc(50% + 70px) bottom;
			 background-size: cover;
			 right: {70 * i}px;
		  	 z-index: {i};
			 background-image: url({c});"
			class="absolute w-full"
			id="#element{i}"
		/>
	{/each}
</div>
