<script lang="ts">
    import { IconSearch, IconDownload, IconList, IconGrid, IconDollar } from '$lib/icons';
    import Filter from './Filter.svelte';

    export let isGrid = true;

    const filters = [
        {
            name: 'Producteur',
            list: [
                'Nom Nomnom',
                'Nom Von der Nommz',
                'Nom Du Nomnom',
                'Nomm Di Nomomo',
                'Nom Nomnom',
                'Nom Von der Nommz',
                'Nom Du Nomnom'
            ]
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
            name: 'Associés',
            list: ['1', '2', '3', '4', '5']
        },
        {
            name: 'Trier',
            list: ['1', '2', '3', '4', '5']
        }
    ];
    let price = '';
</script>

<div class="mt-15 flex flex-col gap-3">
    <div class="flex justify-between">
        <div class="flex gap-1 items-center w-full">
            <button class="all-button text-">Voir tout</button>
            <label class="search md:hidden">
                <div class="search__button">
                    <IconSearch></IconSearch>
                </div>
                <input type="text" class="search__input" />
            </label>
        </div>
        <div class="flex gap-1 items-center">
            <label class="checkbox">
                <input type="checkbox" class="checkbox__input" />
                <span class="checkbox__text">Prix Resto</span>
                <span class="checkbox__box"></span>
            </label>
            <div class="flex gap-1">
                <button
                    class="rounded-full w-6 h-6 bg-[#fff] price-button"
                    class:active={price === 'low'}
                    on:click={() => (price = 'low')}
                >
                    $
                </button>
                <button
                    class="rounded-full w-6 h-6 bg-[#fff] price-button"
                    class:active={price === 'mid'}
                    on:click={() => (price = 'mid')}
                >
                    $$
                </button>
                <button
                    class="rounded-full w-6 h-6 bg-[#fff] price-button"
                    class:active={price === 'high'}
                    on:click={() => (price = 'high')}
                >
                    $$$
                </button>
            </div>
        </div>
    </div>
    <div class="md:hidden flex gap-[6px]">
        <label class="search">
            <button class="search__button">
                <IconSearch></IconSearch>
            </button>
            <input type="text" class="search__input" />
        </label>
        <a href="#" class="md:rounded-none rounded-full button-view button-view--link">
            <IconDownload></IconDownload>
        </a>
    </div>
    <div class="filters">
        <Filter info={filters[0]} />
        <Filter info={filters[1]} />
        <Filter info={filters[2]} />
        <Filter info={filters[3]} />
        <Filter info={filters[4]} />
        <Filter info={filters[5]} />
        <Filter info={filters[6]} />
    </div>
    <div class="hidden justify-end gap-2 md:flex">
        <button class="button-view" class:active={isGrid} on:click={() => (isGrid = true)}>
            <IconGrid></IconGrid>
        </button>
        <button class="button-view" class:active={!isGrid} on:click={() => (isGrid = false)}>
            <IconList></IconList>
        </button>
        <a href="#" class="button-view button-view--link">
            <IconDownload></IconDownload>
        </a>
    </div>
</div>

<style lang="scss">
    .icon {
        width: 24px; /* Set desired width */
        height: 24px; /* Set desired height */
    }
    .filters {
        display: flex;
        justify-content: space-between;
        align-items: center;
        flex-wrap: wrap;
        gap: 16px;

        :global {
            .filter {
                &:last-of-type {
                    margin-left: auto;
                }
            }
        }
    }
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
        padding: 8px;
        background: white;
        transition: 0.3s ease;
        color: #3777bc;

        &:hover {
            background: hsla(211, 55%, 96%, 1);
        }

        &.active {
            background: #3777bc;

            :global {
                .icon {
                    color: white;
                }
            }
        }

        :global {
            .icon {
                width: 100%;
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
            color: #f15a38;
        }
        &__box {
            position: relative;
            background: white;
            transition: 0.3s ease;
            border-radius: 64px;
            width: 21px;
            height: 12px;
            box-sizing: border-box;
            background: #f15a38;
            &::before {
                content: '';
                width: 10px;
                height: 10px;
                background: white;
                border-radius: 50%;
                position: absolute;
                top: 1px;
                left: 1px;
                transition: 0.3s ease;
            }
        }
        &__input:checked ~ &__text {
            text-decoration: none;
            color: #3777bc;
        }
        &__input:checked ~ &__box {
            background: #3777bc;
            &::before {
                left: 10px;
            }
        }
    }
    .all-button {
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
        color: #2d63b0;
        text-align: center;
        font-size: 10px;
        font-style: normal;
        transition: 0.3s ease;
        display: flex;
        flex-wrap: nowrap;
        flex-direction: row;
        align-items: center;
        justify-content: center;
        &:hover {
            background: hsla(211, 55%, 96%, 1);
        }
        &.active {
            background: #2d63b0;
            color: white;
        }
        :global {
            .icon {
                height: 1rem;
                width: auto;
            }
        }
    }
</style>
