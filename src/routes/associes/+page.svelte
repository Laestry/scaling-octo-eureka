<script lang="ts">
	import { browser } from '$app/environment';
	import Carousel2 from '$lib/components/Carousel2.svelte';
	import { onMount } from 'svelte';

	let associes = new Array(20).fill({
		winemaker: 'Nom, Prénom',
		country: 'France',
		region: 'Champagne',
		flag: '/images/germany-flag.svg'
	});
	let carouselIndex2 = 0;

	function getCountSlidesBars() {
		if (browser) {
			if (window.innerWidth <= 679) {
				return 2;
			} else {
				return 3;
			}
		}
		return 3;
	}
	let countSlidesBars = getCountSlidesBars();
	onMount(() => {
		window.addEventListener('resize', () => {
			countSlidesBars = getCountSlidesBars();
		});
	});
</script>

<div class="about">
	<div class="container">
		<div class="about__row">
			<div class="about__col">
				<div class="about__logo">
					<svg width="132" height="133" viewBox="0 0 132 133" fill="none" xmlns="http://www.w3.org/2000/svg">
						<path
							d="M70.1996 65.1211C70.6995 63.518 71.5931 62.1563 72.7533 60.9302C73.7209 59.9074 74.5874 58.7848 75.4526 57.6709C76.2302 56.6691 76.9338 55.6093 77.6916 54.5915C79.5874 52.0432 81.7215 49.7216 84.2777 47.8103C84.975 47.2891 85.5823 46.673 86.0316 45.9275C87.7201 43.1265 87.8324 40.2283 86.4426 37.293C86.1649 36.7065 85.702 36.168 85.2157 35.7256C84.3147 34.9049 83.2434 34.8002 82.1387 35.3115C81.7956 35.4705 81.4364 35.6615 81.1797 35.9301C80.5526 36.5832 79.8898 37.2314 79.406 37.9868C77.9422 40.2763 76.2475 42.3785 74.4356 44.3945C72.7064 46.3181 70.9364 48.2071 69.2418 50.1615C67.3484 52.3451 65.813 54.7701 64.6972 57.4429C64.2454 58.5248 63.8048 59.6129 63.4247 60.7207C62.067 64.6738 60.3686 68.4667 58.1173 71.9971C57.5014 72.9632 56.8287 73.8997 56.103 74.787C55.7339 75.238 55.2167 75.5879 54.7193 75.9108C54.3009 76.1819 53.7307 76.6317 53.1753 76.1609C52.5779 75.4955 53.2209 74.1524 53.3086 73.7124C53.6764 71.8591 54.0713 71.052 54.4466 69.2011C54.8514 67.2049 55.2242 65.1988 55.0933 63.152C55.0402 62.3264 54.8934 61.4835 54.6342 60.6998C54.2034 59.396 53.232 58.6136 51.8793 58.3425C50.6524 58.096 49.4453 58.2254 48.2629 58.6123C46.7768 59.0978 45.7054 60.1034 44.8982 61.3935C44.2638 62.4077 43.6985 63.4637 43.1073 64.5038C42.4556 65.6522 41.7558 66.7773 40.7992 67.6953C38.6676 69.7409 37.1186 72.1561 36.0855 74.909C35.3548 76.8584 34.2946 78.6094 32.9678 80.2064C32.3099 80.9988 31.657 81.7961 30.9695 82.5625C29.9759 83.6679 28.9379 84.7362 27.7011 85.5766C27.2518 85.8822 26.7544 86.1644 26.2385 86.3135C25.2857 86.5895 24.6315 85.9093 24.8734 84.942C24.9462 84.6475 25.0869 84.3518 25.2647 84.1053C25.5992 83.6407 25.9645 83.1947 26.3508 82.7708C27.0926 81.9562 27.8986 81.1972 28.6009 80.3506C29.1934 79.6359 29.7204 78.8571 30.1944 78.0586C30.7053 77.1985 30.7436 76.3137 30.1314 75.4302C29.6636 74.7549 29.5402 73.9663 29.6969 73.1591C29.8747 72.2448 30.0499 71.3256 30.298 70.4285C31.4669 66.2006 33.0677 62.1243 34.7661 58.0874C35.8745 55.4528 36.7372 52.748 37.3321 49.9569C37.9024 47.2805 38.2776 44.5818 38.1159 41.8364C38.0468 40.6595 37.853 39.5037 37.2692 38.4538C36.6805 37.3953 35.7856 36.8198 34.5624 36.9196C33.9515 36.9702 33.3331 37.1217 32.753 37.3275C31.4977 37.7748 30.3783 38.4883 29.3995 39.3792C28.1788 40.4907 26.9889 41.6417 25.8497 42.8357C24.5031 44.2479 23.0812 45.5516 21.3804 46.5313C19.8697 47.4025 18.9279 48.6816 18.5058 50.387C17.4826 54.5188 16.4223 58.6419 15.3633 62.7663C14.5425 65.9628 13.76 69.1679 12.6837 72.2953C12.3443 73.2799 12.1456 74.3384 12.0604 75.3785C11.937 76.8769 11.916 78.3913 11.958 79.8947C12.037 82.7621 11.7901 85.5742 10.9928 88.3443C10.5089 90.0251 10.2448 91.7564 10.3275 93.521C10.3991 95.0379 10.9014 96.3712 11.9864 97.4618C12.29 97.7674 12.5912 98.0767 12.9071 98.3699C13.7699 99.1721 14.3327 100.137 14.7042 101.26C15.1091 102.483 15.5719 103.697 16.136 104.854C16.5396 105.682 17.0728 106.479 17.6862 107.168C18.9242 108.56 20.3745 108.694 21.9371 107.686C22.8344 107.107 23.5564 106.34 24.218 105.516C25.8781 103.451 27.1901 101.163 28.3257 98.7852C29.9129 95.4606 31.4249 92.099 32.9344 88.7386C34.0626 86.2285 35.1327 83.6913 36.5138 81.3044C36.9088 80.6217 37.326 79.9477 37.7962 79.3167C38.0616 78.9606 38.4208 78.6489 38.7972 78.4073C39.3452 78.0561 39.7995 78.1818 40.1463 78.729C40.3104 78.9877 40.4474 79.281 40.5215 79.5768C40.6548 80.1091 40.7708 80.6513 40.8264 81.1959C41.1251 84.0794 41.5558 86.937 42.3198 89.7392C42.7469 91.3079 43.09 92.8999 43.5627 94.4538C43.7738 95.15 44.1404 95.8266 44.5588 96.4254C45.2599 97.4285 46.2757 97.7415 47.4742 97.4667C48.4011 97.2535 49.2404 96.837 49.9945 96.2825C50.9968 95.5456 51.9632 94.7582 52.9309 93.9757C53.8702 93.2166 54.8674 92.5574 56.0252 92.1914C57.0064 91.8809 57.6729 91.2463 58.1086 90.343C58.3061 89.9339 58.5184 89.5285 58.6801 89.1058C59.1751 87.8095 59.6712 86.5131 60.1242 85.202C60.9117 82.9199 62.0015 80.8176 63.5222 78.9212C64.5836 77.5965 65.4933 76.1523 66.4955 74.7796C67.7434 73.0692 68.5061 71.1469 69.0616 69.1247C69.4282 67.7877 69.7824 66.4458 70.1959 65.1211H70.1996Z"
							fill="#181C1C"
						/>
						<path
							d="M121.842 76.6186C121.764 75.7671 121.296 74.8602 120.307 74.403C119.153 73.8054 116.201 72.6014 115.596 71.6723C113.263 68.7285 111.347 67.5825 110.907 67.2263C109.863 66.3822 109.283 64.6756 110.868 63.516C111.64 62.9516 113.499 62.6041 114.425 62.1112C115.066 61.8611 116.724 60.651 117.706 59.5913C118.301 58.9271 118.999 58.5746 119.622 58.0398C120.195 57.5494 120.458 56.8655 120.435 56.1138C120.412 55.4213 120.351 54.7275 120.249 54.0424C120.121 53.1773 119.671 52.4836 118.976 51.9463C118.66 51.7011 118.313 51.5964 117.908 51.5988C117.022 51.6025 116.324 51.987 115.8 52.6586C115.143 53.5002 113.646 55.0134 113.007 55.5347C111.951 56.4219 111.529 57.001 110.453 57.4718C109.392 57.9363 108.313 57.9684 107.219 57.664C106.055 57.3387 105.504 55.1588 105.449 53.7787C105.364 51.6222 104.535 50.1743 104.236 49.6962C103.583 48.6513 103.175 48.1362 102.182 47.3968C100.878 46.4246 99.6063 47.1849 99.5569 46.3309C99.4705 44.8128 103.777 42.8547 104.915 41.8282C106.639 40.2719 107.451 39.0778 109.146 37.4907C111.864 34.9461 112.586 32.4273 114.631 29.306C115.075 28.6283 115.894 27.3085 116.192 26.5605C116.903 24.7824 116.27 23.5748 114.434 23.0486C114.342 23.0227 114.248 22.9907 114.155 22.9833C113.202 22.9069 112.243 22.727 111.296 22.7787C106.669 23.0277 102.947 23.5403 98.7435 25.4466C97.6277 25.9518 96.6206 25.99 95.6973 26.8119C95.0481 27.3911 94.3038 27.8372 93.4756 28.1083C92.5252 28.42 91.3033 29.9382 90.9232 30.8377C90.3739 32.1353 89.8518 33.4476 89.3816 34.776C89.0446 35.7298 89.2112 36.6823 89.7296 37.5375C90.0752 38.108 90.5023 38.6293 90.9084 39.1604C91.3305 39.7112 91.6353 40.6403 92.0303 41.2084C92.8647 42.4086 93.1893 43.0704 92.4512 44.3174C92.113 44.8904 91.718 45.4498 91.2552 45.9255C89.1853 48.0536 87.677 50.8471 85.5615 52.9309C84.1803 54.2925 81.8451 55.5002 80.4553 56.8532C75.9218 61.2671 72.4881 66.3921 70.4367 72.4031C70.3516 72.6507 70.2429 72.8923 70.1269 73.1276C67.7003 78.0148 68.7717 83.7657 72.7349 87.5685C73.2533 88.0651 73.8421 88.3879 74.5444 88.5333C76.0465 88.8439 77.5548 88.7465 79.0544 88.5666C80.7194 88.367 82.3734 88.0848 84.0347 87.8605C85.4121 87.6744 86.7945 87.529 88.172 87.3504C90.3418 86.7934 92.1858 85.6498 93.7817 84.0787C94.2359 83.4626 94.6976 82.8415 95.058 82.1699C95.8603 80.674 96.623 79.1546 97.3587 77.6241C98.0091 76.2699 99.2002 73.4764 100.302 72.4511C101.028 71.7758 101.835 71.2213 102.773 70.8812C104.396 70.2934 105.532 72.1073 106.853 73.209C107.362 73.6341 107.825 74.1381 108.218 74.6741C109.98 77.0832 112.212 78.8367 115.064 79.7966C115.869 80.0677 116.648 80.0997 117.466 79.9593C118.726 79.7424 119.78 79.4171 120.858 78.7911C121.575 78.3746 121.912 77.4233 121.838 76.6112L121.842 76.6186ZM97.4883 37.9097C98.7583 35.7581 99.431 34.1007 99.4446 32.3706C99.4483 31.8716 99.5162 31.3701 99.5779 30.8735C99.668 30.1427 100.044 29.5808 100.647 29.1655C100.804 29.0571 100.965 28.9487 101.138 28.8698C102.862 28.0762 104.656 27.502 106.529 27.1841C106.693 27.1557 106.864 27.1656 106.95 27.1607C107.961 27.2001 108.3 27.6301 108.022 28.5161C107.65 29.6917 106.992 30.7022 106.174 31.6301C105.544 32.3423 104.965 33.1063 104.426 33.89C103.911 34.6368 103.5 35.4525 103.002 36.2104C102.346 37.2048 100.275 38.8856 99.1854 39.6336C98.5152 40.0932 97.8314 40.1696 97.3735 40.1031C96.9847 40.0464 96.6107 39.7593 96.6613 39.4142C96.6983 39.1579 97.355 38.1413 97.4907 37.9121L97.4883 37.9097ZM97.1019 68.4524C94.2989 71.002 91.9994 72.514 89.6358 74.1529C88.1954 75.1806 85.8194 76.5052 83.9063 76.5656C81.7278 76.5693 81.2144 74.5792 81.4452 72.8516C82.3487 68.3637 81.634 61.4076 86.8846 59.59C88.7434 59.0774 90.1554 58.0633 91.428 56.8039C92.9659 55.0307 95.9417 48.6685 98.4917 52.5834C99.3792 53.9463 98.2597 55.6912 99.2347 58.6141C100.211 61.537 101.413 64.5289 97.1019 68.45V68.4524Z"
							fill="#181C1C"
						/>
					</svg>
				</div>
				<p class="about__text">Nos producteurs</p>
			</div>
			<div class="about__col">
				<p class="about__title">
					Petite phrase cute pour introduire la team ci-bas. And hint at your great work culture too!
				</p>
				<p class="about__text">
					Lorem ipsum dolor sit amet consectetur. Leo justo enim et in. Aliquam at feugiat tortor purus quis eu ultrices
					quis tincidunt.
				</p>
			</div>
		</div>
		<div class="about__images">
			<div class="about__image">
				<img src="/images/associes-img-01.jpg" alt="" />
				<p class="about__caption">
					<b>Bianca & Daniel Schmitt</b> <br /> Country
				</p>
			</div>
			<div class="about__image">
				<img src="/images/associes-img-02.jpg" alt="" />
				<p class="about__caption">
					<b>Bianca & Daniel Schmitt</b> <br /> Country
				</p>
			</div>
			<div class="about__image">
				<img src="/images/associes-img-03.jpg" alt="" />
				<p class="about__caption">
					<b>Christian</b> <br /> Autriche
				</p>
			</div>
			<div class="about__image">
				<img src="/images/associes-img-04.jpg" alt="" />
				<p class="about__caption">
					<b>Naboso</b> <br /> Bratislava
				</p>
			</div>
		</div>
		<div class="about-table__wrapper">
			<table class="about-table">
				<thead class="about-table__header">
					<tr>
						<th class="about-table__title"
							>Vignerons
							<button>
								<svg width="16" height="17" viewBox="0 0 16 17" fill="none" xmlns="http://www.w3.org/2000/svg">
									<path
										d="M12.0465 9.70268L7.99979 13.7493L3.95312 9.70268M7.99979 2.41602V13.636"
										stroke="#F6F1F2"
										stroke-miterlimit="10"
										stroke-linecap="round"
										stroke-linejoin="round"
									/>
								</svg>
							</button>
						</th>
						<th class="about-table__title"
							>Pays
							<button>
								<svg width="16" height="17" viewBox="0 0 16 17" fill="none" xmlns="http://www.w3.org/2000/svg">
									<path
										d="M12.0465 9.70268L7.99979 13.7493L3.95312 9.70268M7.99979 2.41602V13.636"
										stroke="#F6F1F2"
										stroke-miterlimit="10"
										stroke-linecap="round"
										stroke-linejoin="round"
									/>
								</svg>
							</button>
						</th>
						<th class="about-table__title"
							>Région
							<button>
								<svg width="16" height="17" viewBox="0 0 16 17" fill="none" xmlns="http://www.w3.org/2000/svg">
									<path
										d="M12.0465 9.70268L7.99979 13.7493L3.95312 9.70268M7.99979 2.41602V13.636"
										stroke="#F6F1F2"
										stroke-miterlimit="10"
										stroke-linecap="round"
										stroke-linejoin="round"
									/>
								</svg>
							</button>
						</th>
					</tr>
				</thead>
				<tbody class="about-table__body">
					{#each associes as associe}
						<tr>
							<td class="about-table__data">{associe.winemaker}</td>
							<td class="about-table__data">
								<span>{associe.country}</span>
								<img src={associe.flag} alt="" />
							</td>
							<td class="about-table__data">{associe.region}</td>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>
	</div>
</div>

<div class="agency">
	<div class="container">
		<div class="agency__row">
			<p class="agency__title">L’agence</p>
			<p class="agency__text">
				Lorem ipsum dolor sit amet consectetur. Leo justo enim et in. Aliquam at feugiat tortor purus quis eu ultrices
				quis tincidunt.
			</p>
		</div>
		<div class="agency__images">
			<div class="agency__image">
				<img src="/images/associes-img-05.jpg" alt="" />
				<p class="agency__caption">
					<b>Nom, role</b> <br /> <a href="#">@lienversIG</a>
				</p>
			</div>
			<div class="agency__image">
				<img src="/images/associes-img-06.jpg" alt="" />
				<p class="agency__caption">
					<b>Nom, role & Nom, role</b> <br /> <a href="#">@lienversIG</a> <a href="#">@lienversIG</a>
				</p>
			</div>
			<div class="agency__image">
				<img src="/images/associes-img-07.jpg" alt="" />
				<p class="agency__caption">
					<b>Nom, role & Nom, role</b> <br /> <a href="#">@lienversIG</a> <a href="#">@lienversIG</a>
				</p>
			</div>
			<div class="agency__image">
				<img src="/images/associes-img-08.jpg" alt="" />
				<p class="agency__caption">
					<b>Nom, role & Nom, role</b> <br /> <a href="#">@lienversIG</a> <a href="#">@lienversIG</a>
				</p>
			</div>
		</div>
	</div>
</div>

<div class="command">
	<div class="container">
		<div class="command__row">
			<p class="command__title">@wardetassocies</p>
			<p class="command__text">
				Suivez l’équipe — de l’agence, aux vignobles. On vous promets de belles histoires pour vous donner soif.
			</p>
		</div>
		<div class="command__images command__images--pc">
			<div class="command__image">
				<img src="/images/associes-img-09.jpg" alt="" />
			</div>
			<div class="command__image">
				<img src="/images/associes-img-10.jpg" alt="" />
			</div>
			<div class="command__image">
				<img src="/images/associes-img-11.jpg" alt="" />
			</div>
			<div class="command__image">
				<img src="/images/associes-img-12.jpg" alt="" />
			</div>
		</div>
		<div class="command_carousel command__images--mobile">
			<Carousel2
				slides={[
					{
						src: '/images/associes-img-09.jpg'
					},
					{
						src: '/images/associes-img-10.jpg'
					},
					{
						src: '/images/associes-img-11.jpg'
					},
					{
						src: '/images/associes-img-12.jpg'
					}
				]}
				let:item
			>
				<div class="command__image">
					<img src={item.src} alt="" />
				</div>
			</Carousel2>
		</div>
	</div>
</div>

<div class="bars">
	<div class="container">
		<div class="bars__row">
			<p class="bars__title">Bars à Vins</p>
			<div class="bars__controlls">
				<button class="bars__button bars__button--prev" on:click={() => carouselIndex2--}>
					<svg width="15" height="16" viewBox="0 0 15 16" fill="none" xmlns="http://www.w3.org/2000/svg">
						<path
							d="M14.55 15.862L0 9.44203V7.34203L14.55 0.0820312V3.59203L4.53 8.24203L14.55 12.352V15.862Z"
							fill="#DA5899"
						/>
					</svg>
				</button>
				<button class="bars__button bars__button--next" on:click={() => carouselIndex2++}>
					<svg width="15" height="16" viewBox="0 0 15 16" fill="none" xmlns="http://www.w3.org/2000/svg">
						<path
							d="M0 12.352L10.02 8.24203L0 3.59203V0.0820312L14.55 7.34203V9.44203L0 15.862V12.352Z"
							fill="#3777BC"
						/>
					</svg>
				</button>
			</div>
		</div>
		<Carousel2
			slides={[
				{
					src: '/images/associes-img-13.jpg',
					name: 'Vinvinvin',
					url: '@lienversIG'
				},
				{
					src: '/images/associes-img-14.jpg',
					name: 'Vinvinvin',
					url: '@lienversIG'
				},
				{
					src: '/images/associes-img-15.jpg',
					name: 'Vinvinvin',
					url: '@lienversIG'
				},
				{
					src: '/images/associes-img-13.jpg',
					name: 'Vinvinvin',
					url: '@lienversIG'
				},
				{
					src: '/images/associes-img-14.jpg',
					name: 'Vinvinvin',
					url: '@lienversIG'
				}
			]}
			bind:current={carouselIndex2}
			let:item
		>
			<div class="bars__image">
				<img src={item.src} alt="" />
				<p class="bars__caption">
					<b>{item.name}</b>
					<br />
					<a href={item.url}>{item.url}</a>
				</p>
			</div>
		</Carousel2>
		<div class="bars__footer">
			<p class="bars__small-title">Experience our wines around the city.</p>
			<p class="bars__text">
				Who would we be without our effervescent wine bars and mind blowing restaurants? Lorem ipsum dolor sit amet
				consectetur. Leo justo enim et in. Aliquam at feugiat tortor purus quis eu ultrices quis tincidunt. Tellus
				integer egestas lectus.Lorem ipsum dolor sit amet consectetur.
			</p>
		</div>
	</div>
</div>

<style lang="scss">
	.bars {
		margin-top: 110px;
		padding-bottom: 90px;
		&__row {
			display: flex;
			align-items: center;
			justify-content: space-between;
			margin-bottom: 24px;
		}
		&__footer {
			margin-top: 60px;
			display: flex;
			gap: 112px;
		}
		&__text {
			color: #000;
			max-width: 844px;
			font-size: 30px;
			font-style: normal;
			font-weight: 400;
			line-height: 40px; /* 133.333% */
		}
		&__small-title {
			color: #000;
			font-family: Riposte;
			font-size: 16px;
			font-style: normal;
			font-weight: 400;
			line-height: 120%; /* 19.2px */
		}
		&__image {
			display: flex;
			flex-direction: column;
			gap: 8px;
			padding-right: 16px;
			img {
				display: block;
				width: 100%;
				height: 100%;
				object-fit: cover;
			}
		}
		&__caption {
			color: #181c1c;
			font-size: 14px;
			font-style: normal;
			line-height: 150%; /* 21px */
			text-transform: capitalize;
			a {
				color: #3777bc;
			}
		}
	}
	.command {
		position: relative;
		overflow: hidden;
		z-index: 1;
		margin-top: 100px;
		padding-top: 100px;
		&::before {
			content: '';
			position: absolute;
			width: calc(100vw + 630px);
			right: 50%;
			height: calc(100% - 32px);
			top: 0;
			background: #da5899;
			transform: translateX(630px);
			z-index: -1;
		}
		&__row {
			display: flex;
			gap: 112px;
			align-items: flex-start;
		}
		&__title {
			color: #000;
			border-radius: 30px;
			padding: 0px 16px;
			background: #fff;
			text-align: center;
			font-size: 16px;
			font-style: normal;
			font-weight: 500;
			line-height: 30px;
			letter-spacing: -0.176px;
			margin-top: 21px;
		}
		&__text {
			color: #f6f1f2;
			font-size: 50px;
			font-style: normal;
			font-weight: 400;
			line-height: normal;
			max-width: 846px;
		}
		&__images {
			display: flex;
			gap: 16px;
			padding: 32px;
			background: #f15a38;
			position: relative;
			margin-top: 32px;
			width: 100vw;
			&--mobile {
				display: none;
			}
		}
		&_carousel {
			background: #f15a38;
			position: relative;
			margin-top: 32px;
		}
	}
	.agency {
		margin-top: 100px;
		&__row {
			display: flex;
			gap: 168px;
		}
		&__title {
			color: var(--WARD-BLACK, #181c1c);
			font-size: 30px;
			font-style: normal;
			font-weight: 400;
			line-height: 125%; /* 37.5px */
		}
		&__text {
			max-width: 852px;
			color: #191c1c;
			font-size: 30px;
			font-style: normal;
			font-weight: 400;
			line-height: 120%; /* 36px */
		}
		&__images {
			display: flex;
			gap: 16px;
			margin-top: 70px;
		}
		&__image {
			display: flex;
			flex-direction: column;
			img {
				display: block;
				width: 100%;
				height: 100%;
				object-fit: cover;
				object-position: center;
			}
			&:nth-child(1) img {
				max-width: 272px;
				max-height: 363px;
			}
			&:nth-child(2) img {
				max-width: 176px;
				max-height: 235px;
			}
			&:nth-child(3) img {
				max-width: 368px;
				max-height: 491px;
			}
			&:nth-child(4) img {
				max-width: 272px;
				max-height: 363px;
			}
		}
		&__caption {
			margin-top: 10px;
			color: #181c1c;
			font-size: 14px;
			font-style: normal;
			line-height: 150%; /* 21px */
			text-transform: capitalize;
			a {
				color: #3777bc;
			}
		}
	}
	.about {
		padding: 138px 0px 56px;
		background: #f15a38;
		&__logo {
			svg {
				width: 100%;
				height: 100%;
			}
		}
		&__title {
			color: #181c1c;
			font-family: Riposte;
			font-size: 50px;
			font-style: normal;
			font-weight: 400;
			line-height: 120%; /* 120% */
		}
		&__text {
			color: #191c1c;
			font-family: Riposte;
			font-size: 30px;
			font-style: normal;
			font-weight: 400;
			line-height: 120%; /* 36px */
		}
		&__row {
			display: flex;
			gap: 60px;
		}
		&__col {
			display: flex;
			flex-direction: column;
			&:first-child {
				gap: 101px;
			}
			&:last-child {
				max-width: 845px;
				gap: 51px;
				.about__text {
					max-width: 560px;
				}
			}
		}
		&__images {
			display: flex;
			gap: 16px;
			margin-top: 70px;
		}
		&__image {
			display: flex;
			flex-direction: column;
			img {
				display: block;
				width: 100%;
				height: 100%;
				object-fit: cover;
				object-position: center;
			}
			&:nth-child(1) img {
				max-width: 272px;
				max-height: 363px;
			}
			&:nth-child(2) img {
				max-width: 176px;
				max-height: 235px;
			}
			&:nth-child(3) img {
				max-width: 368px;
				max-height: 491px;
			}
			&:nth-child(4) img {
				max-width: 272px;
				max-height: 363px;
			}
		}
		&__caption {
			margin-top: 10px;
			color: #181c1c;
			font-size: 14px;
			font-style: normal;
			line-height: 150%; /* 21px */
			text-transform: capitalize;
		}
	}
	.about-table {
		width: 100%;
		tr {
			box-sizing: border-box;
			border-bottom: 1px solid #fff;
			transition: all 0.3s ease;
			* {
				transition: all 0.3s ease;
			}
			&:hover {
				background: #da5899;
				* {
					color: #fff;
				}
			}
		}
		&__wrapper {
			overflow-x: auto;
			margin-top: 64px;
			width: 100%;
			max-height: calc(49px * 14 + 58px);
			padding-right: 10px;
			&::-webkit-scrollbar {
				background: none;
				width: 4px;
			}
			&::-webkit-scrollbar-thumb {
				background: #fff;
				border-radius: 10px;
			}
		}
		&__header {
			position: sticky;
			top: 0;
			background: #f15a38;
			border-bottom: 1px solid #fff;
			box-sizing: border-box;
		}
		th {
			color: #fff;
		}
		td,
		th {
			text-align: left;
			padding: 16px 5px;
			svg {
				margin-left: 8px;
			}
		}
		&__data {
			color: #181c1c;
			font-size: 16px;
			font-weight: 400;
			line-height: 100%; /* 16px */
			img {
				display: none;
			}
		}
	}
	.container {
		margin: 0 auto;
		max-width: 1200px;
		width: 100%;
		padding: 0px 32px;
	}
	@media (max-width: 1119px) {
		.container {
			max-width: 824px;
		}
		.about {
			padding-top: 80px;
			padding-bottom: 40px;
			&__col {
				&:first-child {
					gap: 66px;
				}
				&:last-child {
					gap: 40px;
				}
			}
			&__logo {
				width: 100px;
				height: 100px;
			}
			&__row {
				gap: 12px;
			}
			&__title {
				font-size: 35px;
			}
			&__text {
				font-size: 20px;
			}
			&__images {
				margin-top: 80px;
				gap: 12px;
			}
			&__image {
				&:nth-child(1) img {
					max-width: 181px;
					max-height: 241px;
				}
				&:nth-child(2) img {
					max-width: 118px;
					max-height: 156px;
				}
				&:nth-child(3) img {
					max-width: 245px;
					max-height: 328px;
				}
				&:nth-child(4) img {
					max-width: 181px;
					max-height: 241px;
				}
			}
			&__caption {
				font-size: 11px;
			}
		}
		.about-table {
			&__wrapper {
				margin-top: 80px;
			}
			td,
			th {
				font-size: 14px;
			}
		}
		.agency {
			margin-top: 80px;
			&__title {
				font-size: 20px;
				max-width: 180px;
				width: 100%;
			}
			&__text {
				font-size: 20px;
			}
			&__row {
				gap: 12px;
			}
			&__images {
				margin-top: 100px;
				gap: 12px;
			}
			&__image {
				&:nth-child(1) img {
					max-width: 181px;
					max-height: 241px;
				}
				&:nth-child(2) img {
					max-width: 118px;
					max-height: 156px;
				}
				&:nth-child(3) img {
					max-width: 245px;
					max-height: 328px;
				}
				&:nth-child(4) img {
					max-width: 181px;
					max-height: 241px;
				}
			}
			&__caption {
				font-size: 11px;
			}
		}
		.command {
			margin-top: 80px;
			padding-top: 40px;
			&::before {
				transform: translateX(420px);
			}
			&__row {
				gap: 80px;
			}
			&__title {
				font-size: 12px;
			}
			&__text {
				font-size: 35px;
			}
		}
		.bars {
			margin-top: 80px;
			padding-bottom: 40px;
			&__title {
				font-size: 20px;
			}
			&__footer {
				margin-top: 40px;
				gap: 52px;
			}
			&__small-title {
				font-size: 14px;
			}
			&__text {
				font-size: 20px;
				line-height: 120%;
			}
		}
	}
	@media (max-width: 679px) {
		.container {
			max-width: 364px;
		}
		.about {
			&__col {
				&:first-child {
					gap: 134px;
				}
				&:last-child {
					gap: 40px;
				}
			}
			&__logo {
				width: 80px;
				height: 80px;
			}
			&__row {
				gap: 0px;
			}
			&__title {
				font-size: 24px;
			}
			&__text {
				font-size: 18px;
			}
			&__images {
				margin-top: 80px;
				gap: 20px 10px;
				flex-wrap: wrap;
			}
			&__image {
				&:nth-child(1) {
					max-width: 145px;
					img {
						max-width: 145px;
						max-height: 193px;
					}
				}
				&:nth-child(2) {
					max-width: 145px;
					img {
						max-width: 145px;
						max-height: 193px;
					}
				}
				&:nth-child(3) {
					max-width: 196px;
					img {
						max-width: 196px;
						max-height: 262px;
					}
				}
				&:nth-child(4) {
					max-width: 94px;
					img {
						max-width: 94px;
						max-height: 125px;
					}
				}
			}
			&__caption {
				font-size: 11px;
			}
		}
		.about-table {
			&__wrapper {
				margin-top: 40px;
			}
			td,
			th {
				font-size: 12px;
			}
			&__data {
				img {
					display: block;
				}
				span {
					display: none;
				}
			}
		}
		.agency {
			margin-top: 80px;
			&__title {
				font-size: 14px;
				max-width: 104px;
				width: 100%;
			}
			&__text {
				font-size: 18px;
			}
			&__row {
				gap: 0;
			}
			&__images {
				margin-top: 80px;
				gap: 20px 10px;
				flex-wrap: wrap;
			}
			&__image {
				&:nth-child(1) {
					max-width: 145px;
					order: 3;
					img {
						max-width: 145px;
						max-height: 193px;
					}
				}
				&:nth-child(2) {
					max-width: 94px;
					order: 1;
					img {
						max-width: 94px;
						max-height: 125px;
					}
				}
				&:nth-child(3) {
					max-width: 196px;
					order: 2;
					img {
						max-width: 196px;
						max-height: 262px;
					}
				}
				&:nth-child(4) {
					max-width: 145px;
					order: 4;
					img {
						max-width: 145px;
						max-height: 193px;
					}
				}
			}
			&__caption {
				font-size: 11px;
			}
		}
		.command {
			margin-top: 80px;
			padding-top: 40px;
			&::before {
				transform: translateX(170px);
			}
			&__row {
				flex-direction: column;
				gap: 30px;
			}
			&__title {
				font-size: 14px;
			}
			&__text {
				font-size: 24px;
			}
			&__images {
				margin-top: 40px;
				padding: 11px 18px 20px;
				flex-direction: column;
				gap: 10px;
				&--pc {
					display: none;
				}
				&--mobile {
					display: flex;
				}
			}
			&__controlls {
				display: flex;
				align-items: center;
				gap: 18px;
				margin-left: 250px;
			}
			&__image {
				max-width: 196px !important;
				min-width: 196px !important;
				height: 262px;
				img {
					width: 100%;
					height: 100%;
					object-fit: cover;
				}
			}
		}
		.bars {
			margin-top: 80px;
			padding-bottom: 40px;
			&__title {
				font-size: 14px;
			}
			&__footer {
				margin-top: 80px;
				gap: 15px;
			}
			&__small-title {
				font-size: 14px;
			}
			&__text {
				font-size: 18px;
				line-height: 120%;
			}
		}
	}
</style>
