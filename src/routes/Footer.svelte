<script lang="ts">
    import WardAssociesLogo from '$lib/icons/WardAssociesLogo.svelte';
    let selected: string;
</script>

<div
    class="flex flex-col justify-center items-center w-full bg-wred
           fmd:pt-[106px] fmd:pb-[48px] fmd:px-1 px-8"
>
    <div class="h-[107px] max-w-[1137px] w-full">
        <WardAssociesLogo fillColor="var(--WARD-BLACK, #181C1C)" shadowColor="rgba(0, 0, 0, 0.20)" />
    </div>

    <div class="fmd:mt-[104px] max-w-[1137px] w-full flex flex-wrap items-start footer">
        <img class="fmd:inline hidden" width="69px" height="53px" src="/logo.svg" alt="logo" />

        <div
            class="flex flex-col
                   fmd:ml-[21px] fmd:w-[368px] w-full
                   fmd:mb-0 mb-5"
        >
            <p class="leading-4 text-xs">Inscrivez-vous à notre Infolettre pour recevoir toutes les exclusivités!</p>
            <!--            form-->
            <div class="flex flex-wrap fmd:mt-[26px] mt-2 gap-1">
                <input
                    class="order-1 fmd:order-1 fmd:w-[94px] fmd:flex-0 flex-1"
                    placeholder="Prénom"
                    autocomplete="first-name"
                />
                <input
                    class="order-2 fmd:order-2 fmd:w-[94px] fmd:flex-0 flex-1"
                    placeholder="Nom"
                    autocomplete="family-name"
                />
                <input
                    class="order-3 fmd:order-4 fmd:w-[272px] w-full"
                    placeholder="Ton courriel ici"
                    autocomplete="email"
                />
                <select
                    bind:value={selected}
                    class="order-4 fmd:order-3
                    fmd:w-[169px] h-[24px]
                    fmd:flex-0 flex-1
                    bg-wpink text-white border-t border-white text-xs tracking-[0.6px]"
                >
                    <option value="Restaurateur">Restaurateur</option>
                    <option value="Particulier">Particulier</option>
                    <option value="Curieux SAQ">Curieux SAQ</option>
                </select>
                <button class="order-5 text-center bg-white rounded-3xl w-[90px] text-xs letter tracking-[0.6px]">
                    Cheeeers!
                </button>
            </div>
        </div>

        <div class="fmd:ml-auto fmd:block hidden"></div>

        <!--        region tablet+-->
        <!--        links-->
        <div
            class="links fmd:flex hidden flex-col gap-1 flex-1
                   fmd:ml-2
                   fmd:max-w-[176px] fmd:min-w-[84px]
                   fmd:items-start items-center
                   fmd:my-0 my-2"
        >
            <a href="/associes">L’agence</a>
            <a href="/Rendez-vous">Rendez-vous</a>
            <a href="mailto:info@wardetassocies.com">Questions</a>
            <a
                target="_blank"
                href="https://www.saq.com/fr/produits?nom_agent_promo=Ward+%26+Associés%2C+Représentants+en+Vin"
            >
                W& à la SAQ
            </a>
        </div>

        <!--        contacts-->
        <div class="fmd:flex hidden flex-col mt-[2px] ml-4 w-[209px] gap-1 text-[13px]">
            <p class="leading-[16px]">1217 Saint-Zotique Est, Montréal, Qc. H2S 1N6</p>
            <p class="leading-[28px]">
                <a href="mailto:info@wardetassocies.com">info@wardetassocies.com</a>
            </p>

            <!--            credits-->
            <div class="mt-11">
                Crédits Site
                <br />
                Design par <a href="https://www.superbonjour.com/" class="underline text-white">Super Bonjour</a>
                <br />
                Développé par <a href="https://www.jackgaarkeuken.com/" class="underline text-white">Jack Gaarkeuken</a>
            </div>
        </div>

        <!--        socials-->
        <div class="fmd:flex hidden flex-col gap-[10px] mt-[11px] lg:ml-[73px] mr-[15px]">
            <a href="https://www.instagram.com/wardetassocies/" class="">
                <img class="h-[16px]" src="/icons/socials/Instagram.svg" alt="Instagram" />
            </a>
            <a href="https://www.facebook.com/people/Ward-associ%C3%A9s/100063536502149/">
                <img class="h-[16px]" src="/icons/socials/Facebook.svg" alt="Facebook" />
            </a>
        </div>
        <!--        endregion-->

        <!--        region mobile-->
        <div class="w-full fmd:hidden flex flex-col">
            <div class="links flex flex-1 w-full justify-between">
                <div class="flex flex-col w-[140px]">
                    <a href="/associes">L’agence</a>
                    <a href="/Rendez-vous">Rendez-vous</a>
                </div>

                <div class="flex flex-col w-[140px]">
                    <a href="mailto:info@wardetassocies.com">Questions</a>
                    <a
                        target="_blank"
                        href="https://www.saq.com/fr/produits?nom_agent_promo=Ward+%26+Associés%2C+Représentants+en+Vin"
                    >
                        W& à la SAQ
                    </a>
                </div>
            </div>

            <div class="flex justify-between mt-[9px] items-center">
                <div class="flex gap-[29px]">
                    <a href="https://www.instagram.com/wardetassocies/" class="">
                        <img class="h-[16px]" src="/icons/socials/Instagram.svg" alt="Instagram" />
                    </a>
                    <a href="https://www.facebook.com/people/Ward-associ%C3%A9s/100063536502149/">
                        <img class="h-[16px]" src="/icons/socials/Facebook.svg" alt="Facebook" />
                    </a>
                </div>
                <a class="text-[10px] w-[140px]" href="mailto:info@wardetassocies.com">info@wardetassocies.com</a>
            </div>

            <div class="flex justify-between mt-[51px] text-[10px] leading-[12px] mb-[17px]">
                <div class="w-[140px]">
                    Crédits Site <br />
                    Design
                    <a href="https://www.superbonjour.com/" class="underline text-white">Super Bonjour</a>
                    <br />
                    Dév.
                    <a href="https://www.jackgaarkeuken.com/" class="underline text-white">Jack Gaarkeuken</a>
                </div>

                <div class="leading-[12px] w-[140px]">
                    1217 Saint-Zotique Est,<br /> Montréal, Qc. H2S 1N6<br /> Canada
                </div>
            </div>
        </div>
        <!--        endregion-->
    </div>
</div>

<style lang="scss">
    .links a {
        line-height: 28px;
    }

    input {
        font-size: 12px;
        letter-spacing: 0.6px;
        height: 24px;
        text-align: center;
        border-radius: 100px;
        border: 1px white solid;
        background: transparent;
        color: white;
    }

    input::placeholder {
        color: white;
    }

    input:-webkit-autofill,
    input:-webkit-autofill:focus {
        transition:
            background-color 0s 0s,
            color 0s 0s;
        transition-delay: calc(infinity * 1s);
    }
    .footer {
        font-family: 'Riposte', sans-serif;
        font-size: 14px;
        font-style: normal;
        font-weight: 500;
        line-height: 150%;
    }
</style>
