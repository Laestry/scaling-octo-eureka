<script lang="ts">
</script>

<!-- <Header color="#fff" page="vision" class="lg:-mb-[176px]" /> -->

<!-- <div class="backdrop" /> -->

<div class="w-full flex flex-col mx-auto lg:max-w-[1136px] px-[38px] md:max-w-[836px] max-w-[376px] vision">
    <p class="vision__suptitle">Une vision centrée sur la vie</p>
    <p class="vision__title">
        Pour nous, le vin naturel n’est pas une mode. C’est une manière d’être, attentive à la nature, à l’humain, à ce
        qui se passe entre les deux. Nous travaillons avec des vigneron·ne·s qui cultivent avec respect et interviennent
        le moins possible à la cave, laissant le vin parler de lui-même.
    </p>
    <div class="flex md:flex-row flex-col">
        <img
            src="/images/vision-img-01.jpg"
            alt=""
            class="vision__img lg:mr-[400px] md:mr-[250px] mr-0 md:mb-0 mb-[40px]"
        />
        <img src="/images/vision-img-02.jpg" alt="" class="vision__img vision__img--big md:ml-0 ml-auto" />
    </div>
    <div class="vision-list">
        <p class="vision-list__title mb-[20px]">Éternel étudiants</p>
        <div class="flex md:flex-row flex-col md:gap-[20px] gap-[40px]">
            <p class="vision-list__text">
                On apprend tous les jours, au contact direct des vigneron·ne·s que l’on suit de près. Leurs choix, leurs
                gestes, leurs doutes — on les observe, on les questionne pour mieux les comprendre.<br />
                Cette proximité nourrit notre regard et affine notre manière de parler du vin. Être curieux·se, c’est aussi
                savoir reconnaître la complexité d’un savoir vivant.
            </p>
            <div class="vision-list__col">
                <div class="vision-list__item">
                    <p class="vision-list__item-title">— Zéro, zéro</p>
                    <p class="vision-list__item-text">
                        Un vin sans intrants ni manipulations: zéro sulfites ajoutés, zéro intervention. Le vin
                        s’exprime seul, avec tout ce que cela implique de vivant, vibrant… et parfois déstabilisant.
                    </p>
                </div>
                <div class="vision-list__item">
                    <p class="vision-list__item-title">— Fermentation spontanée</p>
                    <p class="vision-list__item-text">
                        Aucune levure industrielle. La fermentation démarre naturellement grâce aux levures indigènes
                        présentes sur les raisins et dans la cave. Cela donne des vins plus imprévisibles, mais souvent
                        plus profonds.
                    </p>
                </div>
                <div class="vision-list__item">
                    <p class="vision-list__item-title">— Sans filtration</p>
                    <p class="vision-list__item-text">
                        On ne filtre pas le vin avant la mise en bouteille. Cela peut laisser un léger trouble, mais
                        permet de préserver texture, matière, et expression aromatique maximale.
                    </p>
                </div>
                <div class="vision-list__item">
                    <p class="vision-list__item-title">— Agriculture biologique</p>
                    <p class="vision-list__item-text">
                        Pas de pesticides de synthèse. Une attention portée à la vie des sols, à la biodiversité, et à
                        l’équilibre de la vigne. La base d’un vin naturel.
                    </p>
                </div>
            </div>
        </div>
    </div>
    <p class="vision__title vision__title--right">
        On aime les choses complexes, dans le verre comme dans la vie. Les vins qu’on importe sont parfois
        imprévisibles, souvent poétiques, toujours vivants. Cela demande de rester curieux·se, souple, et prêt·e à être
        surpris·e.
    </p>
    <div class="flex w-full md:flex-row flex-col md:gap-0 gap-[40px]">
        <img src="/images/vision-img-03.jpg" alt="" class="vision__img" />

        <div class="w-full lg:ml-[210px] md:ml-[130px]">
            <div class="vision-list__item">
                <p class="vision-list__item-title">— Macération</p>
                <p class="vision-list__item-text">
                    Contact prolongé entre le jus et les peaux du raisin. Utilisé pour les rouges… et certains blancs,
                    qu’on appelle alors “vins orange”. Texture, couleur, caractère garantis.
                </p>
            </div>
            <div class="vision-list__item">
                <p class="vision-list__item-title">— SO₂ / Sulfites</p>
                <p class="vision-list__item-text">
                    Antioxydant et antiseptique utilisé dans la plupart des vins. Les vins naturels en utilisent très
                    peu, voire pas du tout — une question d’équilibre, pas d’idéologie.
                </p>
            </div>
            <div class="vision-list__item">
                <p class="vision-list__item-title">— Vin vivant</p>
                <p class="vision-list__item-text">
                    Un vin qui évolue, qui peut surprendre. Parfois un peu instable, mais toujours sincère. Il reflète
                    le millésime, le lieu, le geste… et l’esprit du ou de la vigneron·ne.
                </p>
            </div>
        </div>
    </div>
</div>

<style lang="scss">
    .vision {
        padding-top: 140px;
        padding-bottom: 100px;
        &__img {
            display: block;
            width: 272px;
            height: 363px;
            &--big {
                width: 368px;
                height: 491px;
            }
        }
        &__suptitle {
            color: var(--WARD-BLACK, #181c1c);
            font-family: 'Riposte';
            font-size: 30px;
            font-style: normal;
            font-weight: 400;
            line-height: 125%; /* 37.5px */
            & + * {
                margin-top: 16px;
            }
        }
        &__title {
            color: var(--WARD-RED, #f15a38);
            font-family: 'Riposte';
            font-size: 50px;
            font-style: normal;
            font-weight: 400;
            line-height: 120%; /* 120% */
            max-width: 848px;

            &--right {
                margin-left: auto;
                padding: 150px 0px 75px;
                & + * {
                    margin-top: 0 !important;
                }
            }

            & + * {
                margin-top: 80px;
            }
        }

        &__text {
            color: var(--WARD-BLACK, #181c1c);
            font-family: 'Riposte';
            font-size: 12px;
            font-style: normal;
            font-weight: 400;
            line-height: 150%; /* 18px */
            max-width: 80px;
            min-width: 80px;
        }
        &__img {
            display: block;
        }
    }
    .vision-list {
        &__title {
            color: #000;
            font-family: 'Riposte';
            font-size: 30px;
            font-style: normal;
            font-weight: 400;
            line-height: 120%; /* 36px */
        }

        &__text {
            color: #191c1c;
            font-family: 'Riposte';
            font-size: 30px;
            font-style: normal;
            font-weight: 400;
            line-height: 120%; /* 36px */
            max-width: 464px;
        }

        &__item {
            display: flex;
            gap: 16px;
            align-items: flex-start;
            &-title {
                max-width: 176px;
                width: 100%;
                color: #000;
                font-family: 'Riposte';
                font-size: 16px;
                font-style: normal;
                font-weight: 400;
                line-height: 120%; /* 19.2px */
            }
            &-text {
                width: 368px;
                color: #191c1c;
                font-family: 'Riposte';
                font-size: 16px;
                font-style: normal;
                font-weight: 400;
                line-height: 120%; /* 19.2px */
            }
            & + & {
                margin-top: 50px;
            }
        }
    }
    @media (max-width: 1162px) {
        .vision {
            padding-top: 80px;
            padding-bottom: 80px;
            &__suptitle {
                font-size: 20px;
            }
            &__title {
                max-width: 660px;
                font-size: 35px;
                &--right {
                    max-width: 550px;

                    padding-top: 80px;
                    padding-bottom: 80px;
                }
            }
            &__img {
                width: 200px;
                height: 267px;
                &--big {
                    width: 230px;
                    height: 307px;
                }
            }
        }
        .vision-list {
            &__title {
                font-size: 20px;
                margin-top: 40px;
            }
            &__text {
                font-size: 20px;
                width: 310px;
            }
            &__item-title {
                max-width: 120px;
            }
            &__item-text {
                width: 230px;
            }
        }
    }
    @media (max-width: 991px) {
        .vision-list {
            &__title {
                margin-top: 80px;
            }
            &__item {
                & + & {
                    margin-top: 20px;
                }
                &-text {
                    font-size: 14px;
                }
                &-title {
                    max-width: 120px;
                    font-size: 14px;
                }
            }
        }
        .vision {
            &__row {
                flex-direction: column;
                gap: 40px;
            }
            &__inner-row {
                gap: 34px;
                &:last-child {
                    flex-direction: row-reverse;
                }
            }
        }
    }
    @media (max-width: 767px) {
        .vision {
            &__suptitle {
                font-size: 18px;
            }
            &__title {
                font-size: 24px;
            }
            &__img {
                width: 145px;
                height: 193px;
                &--big {
                    width: 196px;
                    height: 262px;
                }
            }
        }
        .vision-list {
            &__title {
                font-size: 18px;
            }
            &__text {
                font-size: 18px;
            }
            &__col {
                display: flex;
                flex-direction: column;
                width: 100%;
            }
            &__item {
                gap: 0;
                justify-content: space-between;
                &-text {
                    font-size: 12px;
                    width: 180px;
                }
                &-title {
                    max-width: 120px;
                    font-size: 12px;
                }
            }
            &__row {
                flex-direction: column;
                gap: 40px;
            }
        }
    }
</style>
