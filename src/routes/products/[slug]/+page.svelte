<script lang="ts">
	import type { ProductNode } from '$lib/models/shopifyTypes';
	import Accordion from '$lib/components/Accordion.svelte';
	import ProductTags from './ProductTags.svelte';
	import { onMount } from 'svelte';
	import MiniProductCard from '$lib/components/MiniProductCard.svelte';
	import FavoriteButton from '$lib/components/FavoriteButton.svelte';
	import { cartStore } from '$lib/store';
	import { addToCart } from '$lib/cart';
	import ProductCard from '../ProductCard.svelte';
	import ProductGrid from '../ProductGrid.svelte';
	import type { PageData } from './$types';

	export let data: PageData;
	let product: ProductNode;
	$: product = data.product;
	$: activeSlide = 0;
	$: allText = false;
	$: count = 0;
	let recommendedProducts;

	onMount(async () => {
		console.log(product);
		const productId = product.id;
		const response = await fetch('/api/getRecommendedProducts', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({ productId })
		});

		recommendedProducts = await response.json();
		if (recommendedProducts.length === undefined) {
			recommendedProducts = null;
			console.log(recommendedProducts);
		}
	});

	let searchResults = {
		url: '/products',
		edges: [
			{
				node: {
					id: 'gid://shopify/Product/8331574313264',
					variants: {
						edges: [
							{
								node: {
									id: 'gid://shopify/ProductVariant/45102004109616',
									title: 'Default Title',
									priceV2: {
										amount: '885.95',
										currencyCode: 'CAD'
									}
								}
							}
						]
					},
					title: 'ENDERLE MOLL',
					color: {
						value: 'White'
					},
					ml: {
						value: '750'
					},
					producer: {
						value: 'Müller-Thurgau'
					},
					images: {
						edges: [
							{
								node: {
									originalSrc:
										'https://cdn.shopify.com/s/files/1/0762/7689/1952/files/product-image_c11c0b38-26c7-47ab-97ca-fbdc2d0dc6b5.png?v=1699825330'
								}
							}
						]
					}
				}
			},
			{
				node: {
					id: 'gid://shopify/Product/8926646960432',
					variants: {
						edges: [
							{
								node: {
									id: 'gid://shopify/ProductVariant/47495439548720',
									title: 'Default Title',
									priceV2: {
										amount: '885.95',
										currencyCode: 'CAD'
									}
								}
							}
						]
					},
					title: 'ENDERLE MOLL 2',
					color: {
						value: 'White'
					},
					ml: {
						value: '750'
					},
					producer: {
						value: 'Müller-Thurgau'
					},
					images: {
						edges: [
							{
								node: {
									originalSrc:
										'https://cdn.shopify.com/s/files/1/0762/7689/1952/files/product-image_fb33729a-7f07-4f84-8954-12270343265a.png?v=1706118849'
								}
							}
						]
					}
				}
			},
			{
				node: {
					id: 'gid://shopify/Product/8926647255344',
					variants: {
						edges: [
							{
								node: {
									id: 'gid://shopify/ProductVariant/47495440859440',
									title: 'Default Title',
									priceV2: {
										amount: '885.95',
										currencyCode: 'CAD'
									}
								}
							}
						]
					},
					title: 'ENDERLE MOLL 3',
					color: {
						value: 'White'
					},
					ml: {
						value: '750'
					},
					producer: {
						value: 'Müller-Thurgau'
					},
					images: {
						edges: [
							{
								node: {
									originalSrc:
										'https://cdn.shopify.com/s/files/1/0762/7689/1952/files/product-image_aa68fb16-377b-4efd-b5d0-8062e7d78ea9.png?v=1706118869'
								}
							}
						]
					}
				}
			},
			{
				node: {
					id: 'gid://shopify/Product/8926647386416',
					variants: {
						edges: [
							{
								node: {
									id: 'gid://shopify/ProductVariant/47495441318192',
									title: 'Default Title',
									priceV2: {
										amount: '885.95',
										currencyCode: 'CAD'
									}
								}
							}
						]
					},
					title: 'ENDERLE MOLL 4',
					color: {
						value: 'White'
					},
					ml: {
						value: '750'
					},
					producer: {
						value: 'Müller-Thurgau'
					},
					images: {
						edges: [
							{
								node: {
									originalSrc:
										'https://cdn.shopify.com/s/files/1/0762/7689/1952/files/product-image_82c9deb9-b92a-49c4-be90-06440a701858.png?v=1706118877'
								}
							}
						]
					}
				}
			},
			{
				node: {
					id: 'gid://shopify/Product/8926647681328',
					variants: {
						edges: [
							{
								node: {
									id: 'gid://shopify/ProductVariant/47495442006320',
									title: 'Default Title',
									priceV2: {
										amount: '885.95',
										currencyCode: 'CAD'
									}
								}
							}
						]
					},
					title: 'ENDERLE MOLL 5',
					color: {
						value: 'White'
					},
					ml: {
						value: '750'
					},
					producer: {
						value: 'Müller-Thurgau'
					},
					images: {
						edges: [
							{
								node: {
									originalSrc:
										'https://cdn.shopify.com/s/files/1/0762/7689/1952/files/product-image_20c155bf-60d4-4608-8cb6-509a6724ab6a.png?v=1706118893'
								}
							}
						]
					}
				}
			},
			{
				node: {
					id: 'gid://shopify/Product/8926647943472',
					variants: {
						edges: [
							{
								node: {
									id: 'gid://shopify/ProductVariant/47495443022128',
									title: 'Default Title',
									priceV2: {
										amount: '885.95',
										currencyCode: 'CAD'
									}
								}
							}
						]
					},
					title: 'ENDERLE MOLL 6',
					color: {
						value: 'White'
					},
					ml: {
						value: '750'
					},
					producer: {
						value: 'Müller-Thurgau'
					},
					images: {
						edges: [
							{
								node: {
									originalSrc:
										'https://cdn.shopify.com/s/files/1/0762/7689/1952/files/product-image_518b2069-39ef-43b7-a1c9-bf0e40c73e9d.png?v=1706118905'
								}
							}
						]
					}
				}
			},
			{
				node: {
					id: 'gid://shopify/Product/8926648238384',
					variants: {
						edges: [
							{
								node: {
									id: 'gid://shopify/ProductVariant/47495443939632',
									title: 'Default Title',
									priceV2: {
										amount: '885.95',
										currencyCode: 'CAD'
									}
								}
							}
						]
					},
					title: 'ENDERLE MOLL 7',
					color: {
						value: 'White'
					},
					ml: {
						value: '750'
					},
					producer: {
						value: 'Müller-Thurgau'
					},
					images: {
						edges: [
							{
								node: {
									originalSrc:
										'https://cdn.shopify.com/s/files/1/0762/7689/1952/files/product-image_e3106524-10bd-461b-8886-7397179f282c.png?v=1706118917'
								}
							}
						]
					}
				}
			},
			{
				node: {
					id: 'gid://shopify/Product/8926648434992',
					variants: {
						edges: [
							{
								node: {
									id: 'gid://shopify/ProductVariant/47495444758832',
									title: 'Default Title',
									priceV2: {
										amount: '885.95',
										currencyCode: 'CAD'
									}
								}
							}
						]
					},
					title: 'ENDERLE MOLL 8',
					color: {
						value: 'White'
					},
					ml: {
						value: '750'
					},
					producer: {
						value: 'Müller-Thurgau'
					},
					images: {
						edges: [
							{
								node: {
									originalSrc:
										'https://cdn.shopify.com/s/files/1/0762/7689/1952/files/product-image_6ef8da19-aff8-4fdf-b843-8196bedf77d2.png?v=1706118926'
								}
							}
						]
					}
				}
			},
			{
				node: {
					id: 'gid://shopify/Product/8926648729904',
					variants: {
						edges: [
							{
								node: {
									id: 'gid://shopify/ProductVariant/47495445676336',
									title: 'Default Title',
									priceV2: {
										amount: '885.95',
										currencyCode: 'CAD'
									}
								}
							}
						]
					},
					title: 'ENDERLE MOLL 9',
					color: {
						value: 'White'
					},
					ml: {
						value: '750'
					},
					producer: {
						value: 'Müller-Thurgau'
					},
					images: {
						edges: [
							{
								node: {
									originalSrc:
										'https://cdn.shopify.com/s/files/1/0762/7689/1952/files/product-image_cd175663-62b0-4688-b118-c28b96128f5c.png?v=1706118935'
								}
							}
						]
					}
				}
			},
			{
				node: {
					id: 'gid://shopify/Product/8926649024816',
					variants: {
						edges: [
							{
								node: {
									id: 'gid://shopify/ProductVariant/47495446626608',
									title: 'Default Title',
									priceV2: {
										amount: '885.95',
										currencyCode: 'CAD'
									}
								}
							}
						]
					},
					title: 'ENDERLE MOLL 10',
					color: {
						value: 'White'
					},
					ml: {
						value: '750'
					},
					producer: {
						value: 'Müller-Thurgau'
					},
					images: {
						edges: [
							{
								node: {
									originalSrc:
										'https://cdn.shopify.com/s/files/1/0762/7689/1952/files/product-image_5feb61cf-562c-4aaf-a781-3cc1d5458ff0.png?v=1706118949'
								}
							}
						]
					}
				}
			}
		]
	};
	console.log(product);
</script>

<div class="mt-[40px]">
	<div>
		<!-- <a href="/products">
			<button><img src="/icons/arrow.svg" alt="back" /></button>
		</a> -->
		<div class="md:hidden visible">
			<ProductTags {product} />
		</div>
		<div class="md:flex-row flex-col flex gap-[32px] mt-[16px] items-end">
			<div
				class="relative lg:min-w-[462px] lg:w-[462px] lg:h-[639px] md:min-w-[308px] md:w-[308px] md:h-[439px] min-w-[280px] w-[280px] h-[262px]"
			>
				<button
					class="absolute z-[1] left-0 bottom-0 lg:w-[271px] lg:h-[375px] md:w-[181px] md:h-[241px] w-[94px] h-[125px]"
					class:z-[4]={activeSlide === 0}
					on:click={() => (activeSlide = 0)}
				>
					<img class="object-cover w-full h-full" src={product?.images?.edges[0]?.node?.originalSrc} alt="Wine" />
				</button>
				<button
					class="absolute z-[2] md:left-[12px] left-[6px] bottom-0 lg:w-[450px] lg:h-[591px] md:w-[247px] md:h-[439px] w-[196px] h-[262px]"
					class:z-[4]={activeSlide === 2}
					on:click={() => (activeSlide = 2)}
				>
					<img class="object-cover w-full h-full" src={product?.images?.edges[0]?.node?.originalSrc} alt="Wine" />
				</button>
				<button
					class="absolute z-[3] md:left-[12px] left-[99px] bottom-0 lg:w-[374px] lg:h-[639px] md:w-[300px] md:h-[401px] w-[181px] h-[240px]"
					class:z-[4]={activeSlide === 1}
					on:click={() => (activeSlide = 1)}
				>
					<img class="object-cover w-full h-full" src={product?.images?.edges[0]?.node?.originalSrc} alt="Wine" />
				</button>
			</div>

			<div class="flex flex-col">
				<div class="md:visible hidden">
					<ProductTags {product} />
				</div>
				<h1 class="product-title mt-[12px]">{product.title}</h1>
				<div class="product-description mt-4 h-[125px] max-w-[366px] overflow-auto">
					{@html allText ? product?.descriptionHtml || '' : product?.descriptionHtml?.slice(0, 168) + '...' || ''}
					{#if !allText}
						<button on:click={() => (allText = true)}>+</button>
					{/if}
					<!-- {product?.descriptionHtml} -->
				</div>
				<!-- <div class="od my-[16px] h-[304px] w-[448px] overflow-hidden">
				</div> -->
				<!-- <div class="flex gap-[42px] items-center">
					<div class="tpr p-[8px] w-fit" style="border-bottom: 1px solid var(--border--02);">
						<div>
							<span class="tpb">R</span>
							{parseInt(product?.variants?.edges[0]?.node?.priceV2?.amount / 6) ?? 'N/A'}$/btl
						</div>
						<div class="text-contents">
							<span class="tpb">P</span>
							{parseInt(product?.variants?.edges[0]?.node?.priceV2?.amount) ?? 'N/A'}$/btl
						</div>
					</div>
					<button
						on:click={() => {
							addToCart(product, 1);
						}}
						class="button px-[9px] py-[12px] rounded-[4px] border"
					>
						add to cart
					</button>
					<FavoriteButton />
				</div> -->
				<div class="lg:w-[464px] md:w-[380px] w-[300px] w-full mt-4">
					<div class="flex product-table">
						<div
							class="flex flex-col md:min-w-[280px] md:w-[280px] min-w-[186px] w-[186px] border-r-[1px] border-r-[#E859EB]"
						>
							<p class="product-table__type">Type de vin</p>
							<p class="product-table__description">
								<b class="font-bold">{product.title ?? 'N/A'}</b>
								<br />
								{product?.varietal?.value ?? 'N/A'}
								<br />
								{product?.year?.value ?? 'N/A'}
								<br />
								{product?.count ?? 'N/A'} x {product?.ml?.value ?? 'N/A'}
							</p>
						</div>
						<div class="flex flex-col py-2 w-full">
							<p class="product-table__price">
								{parseInt(product?.variants?.edges[0]?.node?.priceV2?.amount / 6) ?? 'N/A'} $ / B
							</p>
							<p class="product-table__price">
								{parseInt(product?.variants?.edges[0]?.node?.priceV2?.amount) ?? 'N/A'} $ / C
							</p>
							<p class="product-table__type-region">
								{product?.region?.value ?? 'N/A'}
								<br />
								{product?.country?.value ?? 'N/A'}
							</p>
							<p />
						</div>
					</div>
					<div class="flex md:flex-row flex-col pt-4 pb-8 border-b-[1px] border-b-[#DE6643] relative justify-between">
						<div class="flex md:flex-col flex-row gap-2">
							<p class="product-table__count">Quantité /caisse de 6</p>
							<div class="product-table-counter">
								<p class="product-table-counter__value">{count}</p>
								<div class="md:flex flex-col contents">
									<button class="product-table-counter__button" on:click={() => count++}>+</button>
									<button
										class="product-table-counter__button order-[-1]"
										on:click={() => (count > 0 ? count-- : count)}>-</button
									>
								</div>
							</div>
						</div>
						<div class="flex flex-col gap-2 md:mt-0 mt-6">
							<button class="product-table__button product-table__button--favorite">Liste d’attente</button>
							<button class="product-table__button">Ajouter au panier</button>
						</div>
						<p class="absolute text-[16px] bg-[#F6F1F2] text-[#DE6643] bottom-[-12px] pr-1">*</p>
					</div>
					<p class="product-table__description">
						Le prix inclut les taxes et le frais d’agent de 16%.
						<br />
						<a href="#">C’est quoi le 16%?</a>
						<br />
						<a href="#">Je paie combien, à qui, quand?</a>
					</p>
				</div>
			</div>
		</div>
	</div>

	<div class="mt-[20px] flex flex-col gap-[13px]">
		{#if recommendedProducts}
			<div class="flex flex-col pt-[13px] px-[13px] border-t-[1px] border-t-[#000]">
				<p class="recommended__title">Si vous aimez ceci, vous aimerez aussi...</p>
				<div class="flex gap-4">
					{#each recommendedProducts?.slice(0, 4) as p}
						<ProductCard product={p} />
					{/each}
				</div>
			</div>
		{/if}
		<!-- <Accordion title="You might also like">
			{#if recommendedProducts}
				<div class="flex gap-[32px] mt-[16px]">
					{#each recommendedProducts.slice(0, 4) as p}
						<MiniProductCard title={p.handle} image={p.featured_image} id={p.id} />
					{/each}
				</div>
			{/if}
		</Accordion> -->
		<Accordion title="Vu récemment">
			<ProductGrid class="mt-[32px]" {searchResults} />
		</Accordion>
		<Accordion title="Si vous aimez ceci, vous aimerez aussi...">
			<ProductGrid class="mt-[32px]" {searchResults} />
		</Accordion>
		<Accordion title="Du même producteur">
			<div>body</div>
		</Accordion>
		<Accordion title="De la même région">
			<div>body</div>
		</Accordion>
	</div>
</div>

<style>
	.product-title {
		color: #191c1c;
		font-size: 32px;
		font-style: normal;
		font-weight: 400;
		line-height: 42px; /* 131.25% */
	}
	.product-description {
		color: #191c1c;
		font-size: 16px;
		font-style: normal;
		font-weight: 400;
		line-height: 120%; /* 19.2px */
	}
	.product-description button {
		color: #de6643;
	}
	.product-description :global(p) {
		display: inline;
	}
	.product-table {
		border-top: 1px solid #4975b8;
		border-bottom: 1px solid #000;
	}
	.product-table__price {
		color: #1e1e1e;
		text-align: right;
		font-size: 16px;
		font-style: normal;
		font-weight: 700;
		line-height: 120%; /* 19.2px */
		text-transform: capitalize;
	}
	.product-table__type {
		color: #1e1e1e;
		font-size: 16px;
		font-style: normal;
		font-weight: 400;
		line-height: 120%; /* 19.2px */
		padding: 8px 0px;
		border-bottom: 1px solid #de6643;
	}
	.product-table__type-region {
		color: #1e1e1e;
		font-size: 16px;
		font-style: normal;
		font-weight: 400;
		line-height: 120%; /* 19.2px */
		padding: 8px 0px;
		border-top: 1px solid #de6643;
		text-align: right;
		margin-top: 29px;
	}
	.product-table__description {
		color: #1e1e1e;
		padding: 8px 0px;
		font-size: 16px;
		font-style: normal;
		font-weight: 400;
		line-height: 120%;
	}
	.product-table__description a {
		color: #4975b8;
		font-family: 'Riposte';
		font-size: 16px;
		font-style: normal;
		font-weight: 400;
		line-height: 120%;
		text-decoration-line: underline;
	}
	.product-table__button {
		border-radius: 12px;
		background: rgba(45, 99, 176, 0.5);
		width: 176px;
		height: 24px;
		display: flex;
		align-items: center;
		justify-content: center;
		color: #f6f1f2;
		text-align: center;
		font-size: 16px;
		font-style: normal;
		font-weight: 400;
		line-height: 120%; /* 19.2px */
	}
	.product-table__button:last-child {
		background: #2d63b0;
	}
	.product-table__button--favorite {
		background: var(--WARD-RED, #f15a38);
	}
	.product-table__count {
		color: #1e1e1e;
		font-family: 'Riposte';
		font-size: 16px;
		font-style: normal;
		font-weight: 400;
		line-height: 120%; /* 19.2px */
	}
	.product-table__favorite {
		top: 20px;
		left: calc(100% + 70px);
		position: absolute;
	}
	.product-table-counter {
		margin-top: 14px;
		display: flex;
		gap: 5px;
		align-items: center;
	}
	@media (max-width: 767px) {
		.product-table-counter {
			margin-top: 0;
			margin-left: auto;
		}
		.product-table__button {
			width: 100%;
		}
	}
	.product-table-counter__value {
		color: #f6f1f2;
		text-align: center;
		display: flex;
		align-items: center;
		justify-content: center;
		font-family: 'Riposte';
		font-size: 16px;
		font-style: normal;
		font-weight: 400;
		line-height: 120%; /* 19.2px */
		border-radius: 12px;
		background: #2d63b0;
		width: 46px;
		height: 24px;
	}
	.product-table-counter__button {
		width: 17px;
		height: 15px;
		display: flex;
		align-items: center;
		justify-content: center;
		flex-shrink: 0;
		color: #1e1e1e;
		text-align: center;
		font-family: 'Riposte';
		font-size: 16px;
		font-style: normal;
		font-weight: 400;
		line-height: 120%; /* 19.2px */
	}
</style>
