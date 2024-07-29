<script>
	import Header from '$lib/components/Header.svelte';
	import Logo from '$lib/components/Logo.svelte';
</script>

<!-- <Header page="associes" color="#fff" class="lg:-mb-[176px]" /> -->

<!-- <div class="backdrop" /> -->

<div class="flex justify-center w-full lg:max-w-[1212px] px-[38px] md:max-w-[836px] max-w-[376px]">
	<div class="w-[1130px] flex flex-col mt-[129px]">
		<div class="content w-[944px]">
			We place human values at the heart of our experience and in the origin of the import leo justo
			enim et in.
		</div>
		<div class="title mt-[58px] mb-[10px]">Our People</div>
		<div class="flex gap-[16px]">
			<div>
				<img src="/images/persons/1.png" alt="" class="self-start" />
				<div class="nameBox">
					<div class="name">John Smith</div>
					<div class="favoriteWine">Favourite wine</div>
				</div>
			</div>
			<div>
				<img src="/images/persons/2.png" alt="" class="self-start" />
				<div class="nameBox">
					<div class="name">John Smith</div>
					<div class="favoriteWine">Favourite wine</div>
				</div>
			</div>
			<div>
				<img src="/images/persons/3.png" alt="" class="self-start" />
				<div class="nameBox">
					<div class="name">John Smith</div>
					<div class="favoriteWine">Favourite wine</div>
				</div>
			</div>
			<div>
				<img src="/images/persons/4.png" alt="" class="self-start" />
				<div class="nameBox">
					<div class="name">John Smith</div>
					<div class="favoriteWine">Favourite wine</div>
				</div>
			</div>
		</div>

		<div class="flex mb-[150px]">
			<div>
				<div class="title mt-[58px] mb-[10px]">Our Story</div>
				<div class="flex">
					<div class="w-[464px] content2 mr-[15px]">
						Lorem ipsum dolor sit amet consectetur. Leo justo enim et in. Aliquam at feugiat tortor
						purus quis eu ultrices quis tincidunt. Tellus integer egestas lectus ac.
					</div>

					<div class="w-[464px] content2">
						Lorem ipsum dolor sit amet consectetur. Leo justo enim et in. Aliquam at feugiat tortor
						purus quis eu ultrices quis tincidunt. Tellus integer egestas lectus ac.
					</div>
				</div>
			</div>
			<div class="ml-[65px] mt-[36px]">
				<Logo color="#DE6643" height={132} />
			</div>
		</div>
	</div>
</div>

<div class="h-[442px] w-full bg-[#4975B8] -mb-[53px] content3" style="padding: 81px 0 0 152px">
	<div class="w-[943px]">
		Never miss a drop. <br />
		Be the first to know about our exclusive imports, latest releases & events.
	</div>
	<div class="mt-[3px]">
		<button>I love a good form, take me there.</button>
		<button>Keep in simple, sign me up quickly!</button>
		<!-- <input type="text" placeholder="Email Address" /> -->
		<!-- <button>Subscribe</button> -->
	</div>
</div>

<style>
	button {
		@apply py-[3px] px-[13px] rounded-[12px];
		background: white;
		height: 24px;
		width: auto;
		color: #000;
		text-align: center;
		font-family: Overpass, sans-serif;
		font-size: 12px;
		font-style: normal;
		font-weight: 500;
		line-height: 150%; /* 18px */
		letter-spacing: -0.132px;
		border-top: 1px solid;
	}

	.backdrop {
		width: 100%;
		height: 772px;
		background-image: url('/images/winefermenting.png');
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
		line-height: 60px;
	}

	.name {
		color: #1e1e1e;
		font-family: Overpass, sans-serif;
		font-size: 12px;
		font-style: normal;
		font-weight: 700;
		line-height: 150%; /* 18px */
		text-transform: capitalize;
	}

	.favoriteWine {
		color: #1e1e1e;
		font-family: Overpass, sans-serif;
		font-size: 12px;
		font-style: normal;
		font-weight: 500;
		line-height: 150%; /* 18px */
		text-transform: capitalize;
	}

	.nameBox {
		margin-top: 15px;
	}

	.content2 {
		color: #191c1c;
		font-family: Overpass, sans-serif;
		font-size: 30px;
		font-style: normal;
		font-weight: 400;
		line-height: 40px; /* 133.333% */
	}

	.content3 {
		color: #f6f1f2;
		font-family: Overpass, sans-serif;
		font-size: 50px;
		font-style: normal;
		font-weight: 400;
		line-height: normal;
	}
</style>
