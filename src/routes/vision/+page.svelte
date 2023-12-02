<script>
	import Header from '$lib/components/Header.svelte';
	import Logo from '$lib/components/Logo.svelte';
</script>

<Header color="#fff" class="lg:-mb-[176px]" />

<div class="backdrop" />

<div class="w-full flex justify-center">
	<div class="w-[1130px] flex flex-col">
		<div class="title -mt-[228px]">Our Manifesto</div>
		<div class="content">
			We place human values at the heart of our experience and in the origin of the import leo justo
			enim et in. Lorem ipsum dolor sit amet consectetur. Leo justo enim et in. Aliquam at feugiat
			tortor purus quis eu ultrices quis tincidunt. Tellus integer egestas lectus.Tortor purus quis
			eu ultrices quis tincidunt.
		</div>
		<div class="self-end">
			<Logo color="#4975B8" />
		</div>
	</div>
</div>

<style>
	.backdrop {
		width: 100%;
		height: 752px;
		background-image: url('/images/purring_wine.png');
		background-size: cover;
		background-repeat: no-repeat;
		background-position: center center;
	}

	.title {
		color: #191c1c;
		font-family: 'Overpass';
		font-size: 30px;
		font-style: normal;
		font-weight: 400;
		line-height: 125%;
	}
	.content {
		color: #de6643;
		font-family: 'Overpass';
		font-size: 100px;
		font-style: normal;
		font-weight: 400;
		line-height: normal;
	}
</style>
