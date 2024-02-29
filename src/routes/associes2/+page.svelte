<script>
	import Header from '$lib/components/Header.svelte';
	import Logo from '$lib/components/Logo.svelte';
</script>

<Header page="associes" color="#fff" class="lg:-mb-[176px]" />

<!-- <div class="backdrop" /> -->

<div class="w-full flex justify-center">
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

		<div class="flex">
			<div>
				<div class="title mt-[58px] mb-[10px]">Our Story</div>
				<div class="flex">
					<div class="w-[464px] content2 mr-[15px]">
						Lorem ipsum dolor sit amet consectetur. Leo justo enim et in. Aliquam at feugiat tortor purus quis eu ultrices quis tincidunt. Tellus integer egestas lectus. Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. 
					</div>

					<div class="w-[464px] content2">
						Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia/
					</div>
				</div>
			</div>
			<div class="ml-[65px] mt-[36px]">
				<Logo color="#DE6643" height={132} />
			</div>
		</div>

		<div class="flex mt-[136px] gap-4">
			<div class="flex flex-col gap-3">
				<img class='w-[368px] h-[518px]' src="/images/thirstyPerson.png" alt="">
				<p class="name">Events</p>
			</div>
			<div class="flex flex-col gap-3">
				<img class='w-[368px] h-[518px]' src="/images/associes-img-01.png" alt="">
				<p class="name">Wine Makers</p>
			</div>
			<div class="flex flex-col gap-3">
				<img class='w-[368px] h-[518px]' src="/images/associes-img-02.png" alt="">
				<p class="name">Regions</p>
			</div>
		</div>

		<div class="w-[844px] content2 mt-[60px]">
			Lorem ipsum dolor sit amet consectetur. Leo justo enim et in. Aliquam at feugiat tortor purus quis eu ultrices quis tincidunt. Tellus integer egestas lectus ac.
		</div>
	</div>
</div>

<!-- <div class="h-[442px] w-full bg-[#4975B8] -mb-[53px] content3" style="padding: 81px 0 0 152px">
	<div class="w-[943px]">
		Never miss a drop. <br />
		Be the first to know about our exclusive imports, latest releases & events.
	</div>
	<div class="mt-[35px]">
		<input type="text" placeholder="Email Address" />
		<button>Subscribe</button>
	</div>
</div> -->

<style>
	button {
		background: white;
		height: 24px;
		width: 176px;
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

	input {
		height: 24px;
		width: 176px;
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

	input:focus {
		outline: none;
	}

	input::placeholder {
		color: #000;
		text-align: center;
		font-family: Overpass, sans-serif;
		font-size: 12px;
		font-style: normal;
		font-weight: 500;
		line-height: 150%; /* 18px */
		letter-spacing: -0.132px;
	}

	.backdrop {
		width: 100%;
		height: 752px;
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
