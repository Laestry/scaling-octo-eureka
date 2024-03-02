<script lang="ts">
	import Filter from './Filter.svelte';

	const filters = [
	{
		name: 'Producteur',
		list: ["Nom Nomnom","Nom Von der Nommz","Nom Du Nomnom","Nomm Di Nomomo","Nom Nomnom","Nom Von der Nommz","Nom Du Nomnom",]
	},
	{
		name: 'Region',
		list: ['1', '2', '3', '4', '5']
	},
	{
		name: 'Type',
		list: ['1', '2', '3', '4', '5']
	},
	{
		name: 'Couleur',
		list: ['1', '2', '3', '4', '5']
	},
	{
		name: 'Format',
		list: ['1', '2', '3', '4', '5']
	},
	{
		name: 'Associes',
		list: ['1', '2', '3', '4', '5']
	},
	{
		name: 'Trier',
		list: ['1', '2', '3', '4', '5']
	},
	]
</script>

<div class="mt-15 flex flex-col gap-4">
	<div class="flex justify-between">
		<button class="py-[2px] px-[8px] bg-[#fff] all-button">Voir tout</button>
		<div class="flex gap-1">
			<button class="rounded-full w-6 h-6 bg-[#fff] price-button">$</button>
			<button class="rounded-full w-6 h-6 bg-[#fff] price-button">$$</button>
			<button class="rounded-full w-6 h-6 bg-[#fff] price-button">$$$</button>
		</div>
	</div>
	<div class="flex gap-4">
		<Filter info={filters[0]}/>
		<Filter info={filters[1]}/>
		<Filter info={filters[2]}/>
		<Filter info={filters[3]}/>
		<Filter info={filters[4]}/>
		<Filter info={filters[5]}/>
	</div>
	<div class="flex justify-end">
		<Filter info={filters[6]}/>
	</div>
	<div class="flex justify-end gap-2">
		<button class="py-[8px] px-[10px] bg-[#fff]">
			<svg width="15" height="9" viewBox="0 0 15 9" fill="none" xmlns="http://www.w3.org/2000/svg">
				<line y1="0.5" x2="15" y2="0.5" stroke="black"/>
				<line y1="2.5" x2="15" y2="2.5" stroke="black"/>
				<line y1="4.5" x2="15" y2="4.5" stroke="black"/>
				<line y1="6.5" x2="15" y2="6.5" stroke="black"/>
				<line y1="8.5" x2="15" y2="8.5" stroke="black"/>
			</svg>
		</button>
		<button class="py-[8px] px-[10px] bg-[#fff]">
			<svg width="15" height="9" viewBox="0 0 15 9" fill="none" xmlns="http://www.w3.org/2000/svg">
				<rect width="3" height="4" fill="#DE6643"/>
				<rect x="4" width="3" height="4" fill="#DE6643"/>
				<rect x="8" width="3" height="4" fill="#DE6643"/>
				<rect x="12" width="3" height="4" fill="#DE6643"/>
				<rect y="5" width="3" height="4" fill="#DE6643"/>
				<rect x="4" y="5" width="3" height="4" fill="#DE6643"/>
				<rect x="8" y="5" width="3" height="4" fill="#DE6643"/>
				<rect x="12" y="5" width="3" height="4" fill="#DE6643"/>
			</svg>
		</button>
	</div>
</div>

<style>
.all-button {
	color: rgba(0, 0, 0, 0.50);
	text-align: center;
	font-size: 12px;
	font-style: normal;
	font-weight: 400;
	line-height: 150%; /* 18px */
	letter-spacing: -0.132px;
}
.price-button {
	color: #2D63B0;
	text-align: center;
	font-size: 10px;
	font-style: normal;
	font-weight: 400;
	line-height: 150%; /* 15px */
	letter-spacing: -0.11px;
	text-transform: uppercase;
}
</style>