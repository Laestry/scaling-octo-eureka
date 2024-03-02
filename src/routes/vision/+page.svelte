<script>
	import Header from '$lib/components/Header.svelte';
	import Logo from '$lib/components/Logo.svelte';
</script>

<!-- <Header color="#fff" page="vision" class="lg:-mb-[176px]" /> -->

<!-- <div class="backdrop" /> -->

<div class="w-full flex flex-col mx-auto max-w-[1130px]">
	<div class="flex flex-col mt-[137px]">
		<div class="title">Producer Name</div>
		<div class="flex gap-5 mt-5">
			<p class="content">
				We place human values at the heart of our experience and in the origin of the import leo justo enim et in. Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt  labore et dolore magna aliqua. Ut enim  minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa. 
			</p>
			<div class="flex flex-col min-w-[173px] w-[173px] gap-[30px]">
				<img src="/images/vision-img-01.png" alt="">
				<p class="text-[30px] leading-[40px]">
					Lorem ipsum dolor sit amet consectetur. Leo justo enim et in. Aliquam at feugiat tortor purus quis eu ultrices quis tincidunt.
				</p>
			</div>
		</div>
	</div>
	<div class="flex mt-[130px] justify-between items-start">
		<div class="flex gap-4 items-end">
			<img src="/images/persons/1.png" alt="">
			<p class="caption">The caption, if needed, would go here. </p>
		</div>
		<div class="flex gap-4 items-end">
			<img src="/images/associes-img-01.png" alt="">
			<p class="caption">The caption, if needed, would go here. </p>
		</div>
	</div>
</div>

<style>
	.backdrop {
		width: 100%;
		height: 772px;
		background-image: url('/images/vision.png');
		background-size: cover;
		background-repeat: no-repeat;
		background-position: center center;
	}

	.title {
		color: #191c1c;
		font-family: Overpass, sans-serif;
		font-size: 30px;
		font-style: normal;
		font-weight: 400;
		line-height: 125%;
	}
	.content {
		color: #de6643;
		font-family: Overpass, sans-serif;
		font-size: 50px;
		font-style: normal;
		font-weight: 400;
		line-height: normal;
	}
	.caption {
		color: #1E1E1E;
		font-family: Overpass;
		font-size: 12px;
		font-style: normal;
		font-weight: 400;
		line-height: 150%; /* 18px */
		max-width: 80px;
	}
</style>
