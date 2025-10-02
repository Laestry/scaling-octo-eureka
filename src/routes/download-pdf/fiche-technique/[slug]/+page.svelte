<!--src/routes/download-pdf/fiche-technique/[slug]/+page.svelte-->
<script>
    import { onMount } from 'svelte';
    import { IconLogoWithName } from '$lib/icons';

    onMount(async () => {});

    let product = {
        id: 381,
        created_at: '2025-05-19T20:34:36.380543+00:00',
        updated_at: '2025-08-06T23:59:49.537484+00:00',
        name: '5 L Gin Tonic',
        uuid: '03a2a1dc-150b-4def-a67b-6873187b7d94',
        is_archived: false,
        sku: '381',
        ean: '8594186262533',
        upc: null,
        isbn: null,
        mpn: null,
        weight: null,
        length: null,
        width: null,
        height: null,
        volume: 5000,
        extended_name: '5 L Gin Tonic 2018',
        short_description: 'Moravie,  5L Gin Tonic, Nestarec',
        internal_notes: '',
        extra_info: {
            color: 0,
            family: 2,
            nature: 8,
            alcohol: '12',
            vintage: '2018'
        },
        uvc: 1,
        category: 1,
        specific_category: 1,
        provider_id: 17,
        tags: ['BIG BOTTLES', 'BLANC'],
        format: 1,
        unit: 1,
        organization_id: 2,
        saq_id: '14859861',
        agency_fee_net: null,
        agency_fee_percentage: null,
        agency_fee_is_percentage: null,
        country_id: null,
        region_name: null,
        slug: '5-litres-gin-tonic',
        alcohol_batches: [
            {
                id: 788,
                price: 485.65,
                vintage: 2018,
                quantity: 1,
                alcohol_id: 381,
                created_at: '2021-11-17T16:49:05.479+00:00',
                updated_at: '2025-08-08T08:11:35.257616+00:00',
                description: '',
                is_archived: false,
                is_published: null,
                price_tax_in: 558.5,
                release_date: '2021-11-16T05:00:00+00:00',
                saq_raw_data: null,
                agency_fee_net: null,
                organization_id: 2,
                saq_raw_data_id: null,
                alcohol_order_id: 67,
                sell_before_date: '2022-06-14T05:00:00+00:00',
                transfer_quantity: 1,
                alcohol_percentage: 12,
                available_for_sale: true,
                calculated_quantity: 1,
                purchase_unit_price: 170,
                purchase_unit_margin: null,
                agency_fee_percentage: 16,
                saq_arrival_lot_number: '14859861',
                agency_fee_is_percentage: true,
                purchase_unit_is_percentage: null,
                purchase_unit_margin_percentage: null
            }
        ],
        alcohol_website: [
            {
                id: 381,
                name: '5 LITRES Gin Tonic',
                slug: '5-litres-gin-tonic',
                weblink: null,
                published: false,
                alcohol_id: 381,
                created_at: '2025-06-01T20:59:37.304149+00:00',
                updated_at: '2025-06-01T20:59:37.304149+00:00',
                is_archived: false,
                organization_id: 2,
                description_french: null,
                description_english: null
            }
        ],
        parties: {
            id: 17,
            uuid: '98d92f79-d51e-4657-a4f5-8d945f797abb',
            class: 3,
            currency: 3,
            language: 2,
            company_id: 17,
            created_at: '2020-09-08T11:01:36.214+00:00',
            saq_number: '12995353',
            updated_at: '2025-08-06T23:33:56.719658+00:00',
            is_archived: false,
            display_name: 'Milan Nestarec',
            individual_id: null,
            organization_id: 2,
            payment_options: [1, 2, 3],
            saq_demandeur_id: null,
            last_saq_store_id: null,
            representative_id: 8,
            last_delivery_type_id: null,
            last_billing_address_id: null,
            last_billing_contact_id: null,
            last_shipping_address_id: null,
            last_shipping_contact_id: null
        }
    };
</script>

<div>
    <div class="w-[352px] flex justify-center items-center">
        <IconLogoWithName />
    </div>

    <div class="flex gap-[40px] h-[534px] mt-[157px]">
        <img width="400px" height="534px" src="/images/example_wines/1.jpg" alt="" />
        <div class="w-[1192px] h-full flex flex-col justify-between">
            <div class="title">{product.alcohol_website[0].name}</div>

            <div class="body border-t border-wblue flex">
                <div class="w-[715px] border-r border-wpink">
                    <div class=" h-[94px] flex items-center">test</div>
                    <div class="h-[183px] border-t border-wred">test</div>
                </div>
                <div class="w-[477px]">test</div>
            </div>
        </div>
    </div>
</div>

<!--3.125 to scale down by-->
<style>
    .title {
        font-family: Riposte;
        font-weight: 400;
        font-style: Regular;
        font-size: 64px;
        leading-trim: NONE;
        line-height: 100%;
        letter-spacing: 0%;
    }

    .body {
        font-family: Riposte;
        font-weight: 400;
        font-style: Regular;
        font-size: 36px;
        leading-trim: NONE;
        line-height: 120%;
        letter-spacing: 0%;
    }
</style>
