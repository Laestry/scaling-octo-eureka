<script lang="ts">
	import Filter from './Filter.svelte';
	import { createEventDispatcher } from 'svelte';

  export let isGrid = true;
	const dispatch = createEventDispatcher();
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
  let price = ''
</script>

<div class="mt-15 flex flex-col gap-4">
	<div class="flex justify-between">
    <div class="flex gap-1 items-center w-full">
      <button class="all-button">Voir tout</button>
      <label class="search md:visible !hidden">
        <button class="search__button">
          <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg">
            <line x1="10.2415" y1="9.89222" x2="14.3413" y2="13.7173" stroke="#181C1C"/>
            <circle cx="6" cy="6.08203" r="5.5" stroke="#181C1C"/>
          </svg>
        </button>
        <input type="text" class="search__input"/>
      </label>
    </div>
    <div class="flex gap-1 items-center">
      <label class="checkbox">
        <input type="checkbox" class="checkbox__input">
        <p class="checkbox__text">Prix Resto</p>
        <div class="checkbox__box"></div>
      </label>
      <div class="flex gap-1">
        <button class="rounded-full w-6 h-6 bg-[#fff] price-button" class:active={price === 'low'} on:click={() => price = 'low'}>$</button>
        <button class="rounded-full w-6 h-6 bg-[#fff] price-button" class:active={price === 'mid'} on:click={() => price = 'mid'}>$$</button>
        <button class="rounded-full w-6 h-6 bg-[#fff] price-button" class:active={price === 'high'} on:click={() => price = 'high'}>$$$</button>
      </div>
    </div>
	</div>
  <div class="md:hidden flex gap-[6px]">
    <label class="search">
      <button class="search__button">
        <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg">
          <line x1="10.2415" y1="9.89222" x2="14.3413" y2="13.7173" stroke="#181C1C"/>
          <circle cx="6" cy="6.08203" r="5.5" stroke="#181C1C"/>
        </svg>
      </button>
      <input type="text" class="search__input"/>
    </label>
    <a href="#" class="button-view button-view--link">
			<svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M0.5 15.082V12.082M0 14.582H15.5M15.5 14.582H16M15.5 14.582V15.082M15.5 14.582V12.082M3.5 7.08203L8 12.082M8 12.082L12.5 7.08203M8 12.082V0.0820312" stroke="#3777BC"/>
      </svg>
		</a>
  </div>
	<div class="flex md:gap-4 gap-[6px] flex-wrap">
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
	<div class="hidden justify-end gap-2 md:flex">
		<button class="button-view" class:active={!isGrid} on:click={() => dispatch('switchView', false)}>
			<svg width="15" height="9" viewBox="0 0 15 9" fill="none" xmlns="http://www.w3.org/2000/svg">
				<line y1="0.5" x2="15" y2="0.5" stroke="#3777BC"/>
				<line y1="2.5" x2="15" y2="2.5" stroke="#3777BC"/>
				<line y1="4.5" x2="15" y2="4.5" stroke="#3777BC"/>
				<line y1="6.5" x2="15" y2="6.5" stroke="#3777BC"/>
				<line y1="8.5" x2="15" y2="8.5" stroke="#3777BC"/>
			</svg>
		</button>
		<button class="button-view" class:active={isGrid} on:click={() => dispatch('switchView', true)}>
			<svg width="15" height="9" viewBox="0 0 15 9" fill="none" xmlns="http://www.w3.org/2000/svg">
				<rect width="3" height="4" fill="#3777BC"/>
				<rect x="4" width="3" height="4" fill="#3777BC"/>
				<rect x="8" width="3" height="4" fill="#3777BC"/>
				<rect x="12" width="3" height="4" fill="#3777BC"/>
				<rect y="5" width="3" height="4" fill="#3777BC"/>
				<rect x="4" y="5" width="3" height="4" fill="#3777BC"/>
				<rect x="8" y="5" width="3" height="4" fill="#3777BC"/>
				<rect x="12" y="5" width="3" height="4" fill="#3777BC"/>
			</svg>
		</button>
		<a href="#" class="button-view">
			<svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M0.5 15.082V12.082M0 14.582H15.5M15.5 14.582H16M15.5 14.582V15.082M15.5 14.582V12.082M3.5 7.08203L8 12.082M8 12.082L12.5 7.08203M8 12.082V0.0820312" stroke="#3777BC"/>
      </svg>
		</a>
	</div>
</div>

<style lang="scss">
.search {
  display: flex;
  align-items: center;
  padding: 5px 10px;
  border-radius: 100px;
  background: white;
  width: 100%;
  max-width: 478px;
  gap: 8px;
  &__input {
    outline: none;
    border: none;
    background: none;
    width: 100%;
    font-size: 12px;
    &::placeholder {
      color: #000;
    }
  }
}
.button-view {
  padding: 8px 10px;
  background: white;
  transition: .3s ease;
  svg {
    * {
      transition: .3s ease;
    }
  }
  &:hover {
    background: hsla(211, 55%, 96%, 1);
  }
  &.active {
    background: #3777BC;
    svg {
      *[fill="#3777BC"] {
        fill: white;
      }
      *[stroke="#3777BC"] {
        stroke: white;
      }
    }
  }
  &--link {
    border-radius: 50%;
    width: 28px;
    height: 28px;
    min-height: 28px;
    min-width: 28px;
    padding: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    svg {
      width: 12px;
      height: 12px;
    }
  }
}
.checkbox {
  display: flex;
  align-items: center;
  gap: 4px;
  background: white;
  padding: 6px 8px;
  border-radius: 64px;
  position: relative;
  cursor: pointer;
  user-select: none;
  &__input {
    position: absolute;
    top: 0;
    left: 0;
    opacity: 0;
  }
  &__text {
    font-size: 12px;
    white-space: nowrap;
    color: #F15A38;
    letter-spacing: -1.1%;
    text-decoration: line-through;
  }
  &__box {
    position: relative;
    background: white;
    transition: .3s ease;
    border-radius: 64px;
    width: 21px;
    height: 12px;
    box-sizing: border-box;
    background: #F15A38;
    &::before {
      content: '';
      width: 10px;
      height: 10px;
      background: white;
      border-radius: 50%;
      position: absolute;
      top: 1px;
      left: 1px;
      transition: .3s ease;
    }
  }
  &__input:checked ~ &__text {
    text-decoration: none;
    color: #3777BC;
  }
  &__input:checked ~ &__box {
    background: #3777BC;
    &::before {
      left: 10px;
    }
  }
}
.all-button {
	color: rgba(0, 0, 0, 0.50);
  white-space: nowrap;
	text-align: center;
	font-size: 12px;
	font-style: normal;
	font-weight: 400;
  background: white;
	line-height: 150%; /* 18px */
	letter-spacing: -0.132px;
  padding: 4px 16px 6px;
  border-radius: 24px;
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
  transition: .3s ease;
  &:hover {
    background: hsla(211, 55%, 96%, 1);
  }
  &.active {
    background: #2D63B0;
    color: white;
  }
}
</style>
