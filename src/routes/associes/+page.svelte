<!--src/routes/associes/+page.svelte-->
<script lang="ts">
    import Carousel from '$lib/components/Carousel.svelte';
    import { IconLogo, IconArrow2 } from '$lib/icons';

    export let data;
    console.log('data', data);
    let associes = data.suppliers;
    let carouselIndex = 0;

    let suivezMobileSlideImages = [
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
    ];

    let show = false;
    let outerWidth: number;
</script>

<svelte:window bind:outerWidth />

<div class="about">
    <div class="container">
        <div class="">
            <div class="flex lg:gap-[156px] md:gap-[93px] gap-[24px]">
                <IconLogo
                    class="lg:w-[132px] md:w-[100px] w-[80px]
                flex-shrink-0"
                />
                <p
                    class="about__title
                    lg:w-[845px] md:w-[567px] w-[196px]"
                >
                    Voici les visages derrière les bouteilles. Notre équipe, c’est un collectif vivant : vigneron·ne·s,
                    partenaires et sommeliers qui collaborent avec nous chaque jour.
                </p>
            </div>
            <div
                class="flex
                lg:gap-[58px] md:gap-[12px] gap-0
                 lg:mt-[51px] mt-[40px]"
            >
                <p class="about__text lg:w-fit md:w-[181px] w-[104px]">Nos producteurs</p>
                <p class="about__text lg:w-[560px] md:w-[375px]">
                    Nos vigneron·ne·s sont le cœur battant de notre agence. On les choisit pour leur vision, leur
                    sincérité, et la profondeur de leurs vins.
                </p>
            </div>
        </div>
        <div class="about__images">
            <div class="about__image">
                <img src="/images/associes/nos-producteurs/associes-img-01.png" alt="" />
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
                        <th class="about-table__title"> Vignerons </th>
                        <th class="about-table__title"> Pays </th>
                        <th class="about-table__title"> Région </th>
                    </tr>
                </thead>
                <tbody class="about-table__body">
                    {#each associes as associe}
                        <tr>
                            <td class="about-table__data">{associe.usual_name}</td>
                            <td class="about-table__data">
                                <span>{associe.country_fr ?? ''}</span>
                                {associe.flag ?? ''}
                            </td>
                            <td class="about-table__data">{associe.region_name ?? ''}</td>
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
                Ward & Associés, c’est un écosystème à part : une équipe curieuse, engagée, qui carbure à la confiance
                (et à de très bonnes playlists).
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
                    <b>Nom, role & Nom, role</b> <br /> <a href="#">@lienversIG</a>
                </p>
            </div>
            <div class="agency__image">
                <img src="/images/associes-img-07.jpg" alt="" />
                <p class="agency__caption">
                    <b>Nom, role & Nom, role</b> <br /> <a href="#">@lienversIG</a>
                </p>
            </div>
            <div class="agency__image">
                <img src="/images/associes-img-08.jpg" alt="" />
                <p class="agency__caption">
                    <b>Nom, role & Nom, role</b> <br /> <a href="#">@lienversIG</a>
                </p>
            </div>
        </div>
    </div>
</div>

<div class="command">
    <div class="container">
        <div class="command__row">
            <p class="command__title">@wardetassocies</p>
            <p class="command__text relative z-50">
                Suivez l’équipe — de l’agence aux vignobles, ici et partout dans le monde. Des histoires passionnantes,
                des moments forts, et toujours une bonne raison d’avoir soif.
            </p>
        </div>
        <div class="command__images relative alg:translate-y-[-174px]">
            <div>
                <div class=" command__images--pc flex lg:gap-4 md:gap-3">
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

                {#if outerWidth <= 679}
                    <div class="command_carousel">
                        <Carousel
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
                                <img  src={item.src} alt="" />
                            </div>
                        </Carousel>
                    </div>
                {/if}
            </div>
        </div>
    </div>
</div>

<div class="bars">
    <div class="container">
        <div class="bars__row">
            <div>
                <p class="bars__title">Bars à Vins</p>
            </div>

            <div class="bars__controlls">
                <button class="bars__button bars__button--prev" on:click={() => carouselIndex--}>
                    <IconArrow2 />
                </button>
                <button class="bars__button bars__button--next" on:click={() => carouselIndex++}>
                    <IconArrow2 />
                </button>
            </div>
        </div>
        <Carousel
            slides={[
                {
                    src: '/images/associes/bars-a-vins/associes-img-13.jpg',
                    name: ''
                },
                {
                    src: '/images/associes/bars-a-vins/associes-img-14.jpg',
                    name: ``
                },
                {
                    src: '/images/associes/bars-a-vins/associes-img-15.jpg',
                    name: ''
                },
                {
                    src: '/images/associes/bars-a-vins/associes-img-13.jpg',
                    name: ''
                },
                {
                    src: '/images/associes/bars-a-vins/associes-img-14.jpg',
                    name: ``
                },
                {
                    src: '/images/associes/bars-a-vins/associes-img-15.jpg',
                    name: ''
                }
            ]}
            bind:current={carouselIndex}
            let:item
        >
            <div class="bars__image">
                <img src={item.src} alt="" />
                <p class="bars__caption">
                    <b>{@html item.name}</b>
                </p>
            </div>
        </Carousel>
        <div class="bars__footer">
            <p class="bars__small-title">
                Vinvinvin <a target="_blank" href="https://www.instagram.com/barvinvinvin" class="text-wblue">
                    @barvinvinvin
                </a>
            </p>
            <p class="bars__text alg:-mt-[16px] amd:-mt-[3px] -mt-[3px]">
                Que serions-nous sans les bars à vins électrisants et les restos renversants de notre ville ? Ces lieux
                donnent vie à nos bouteilles — un verre à la fois.
            </p>
        </div>
    </div>
</div>

<style lang="scss">
    img,
    picture,
    video,
    svg {
        margin: 1px;
        display: block;
        max-width: 100%;
        object-fit: cover;
    }
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
            align-items: start;
            gap: 8px;
            //padding-right: 16px;
            img {
                display: block;
                width: 369px;
                height: 504px;
                object-fit: cover;
            }
        }
        &__caption {
            width: 369px;
            color: #181c1c;
            font-size: 14px;
            font-style: normal;
            line-height: 150%; /* 21px */
            a {
                color: #3777bc;
            }
        }
        &__button {
            &--prev {
                color: #da5899;
            }
            &--next {
                color: #3777bc;
                transform: scaleX(-1);
            }
        }
        &__title {
            font-size: 30px;
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
            margin-top: 18px;
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
            padding: 154px 30px 33px 33px;
            background: #f15a38;
            position: relative;
            margin-top: 32px;
            width: 100vw;
            &--mobile {
                display: none;
            }
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
            :global {
                .icon {
                    width: 100%;
                    height: 100%;
                }
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
            :global {
                .icon {
                    margin-left: 8px;
                }
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
    @media (max-width: 1136px) {
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
            &__images {
                padding: 20px 0 30px 20px;
                .command__image:nth-child(1) img {
                    width: 181px;
                    background-repeat: no-repeat;
                }
                .command__image:nth-child(2) img {
                    background-repeat: no-repeat;
                    width: 118px;
                }
                .command__image:nth-child(3) img {
                    width: 245px;
                }
                .command__image:nth-child(4) img {
                    width: 180px;
                }
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
            &__image {
                img {
                    width: 245px;
                    height: 328px;
                }
            }
            &__caption {
                width: 245px;
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
                flex-direction: row;
                gap: 10px;
                &--pc {
                    display: none;
                }
                &--mobile {
                    display: flex;
                }
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
            &__image {
                img {
                    width: 145px;
                    height: 193px;
                }
            }
            &__caption {
                width: 145px;
            }
        }
    }
</style>
