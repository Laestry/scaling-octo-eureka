<script lang="ts">
    import WardAssociesLogo from '$lib/icons/WardAssociesLogo.svelte';
    let selected: string;
</script>

<div
    class="flex flex-col justify-center items-center w-full bg-wred
           md:pt-[106px] md:pb-[48px] md:px-1 px-4"
>
    <div class="h-[107px] max-w-[1137px] w-full">
        <WardAssociesLogo fillColor="var(--WARD-BLACK, #181C1C)" shadowColor="rgba(0, 0, 0, 0.20)" />
    </div>

    <div class="md:mt-[104px] max-w-[1137px] w-full flex flex-wrap items-start footer">
        <img class="md:inline hidden" width="69px" height="53px" src="/logo.svg" alt="logo" />

        <div
            class="flex flex-col
                   md:ml-[21px] md:w-[368px]"
        >
            <p class="leading-4 text-xs">Inscrivez-vous à notre Infolettre pour recevoir toutes les exclusivités!</p>
            <!--            form-->
            <div class="flex flex-wrap md:mt-[26px] mt-2 gap-1">
                <input
                    class="order-1 md:order-1 md:w-[94px] md:flex-0 flex-1"
                    placeholder="Prénom"
                    autocomplete="first-name"
                />
                <input
                    class="order-2 md:order-2 md:w-[94px] md:flex-0 flex-1"
                    placeholder="Nom"
                    autocomplete="family-name"
                />
                <input
                    class="order-3 md:order-4 md:w-[272px] w-full"
                    placeholder="Ton courriel ici"
                    autocomplete="email"
                />
                <select
                    bind:value={selected}
                    class="order-4 md:order-3
                    md:w-[169px] h-[24px]
                    md:flex-0 flex-1
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

        <!--        links-->
        <div
            class="links flex flex-col gap-1
                   md:ml-auto
                   md:w-[176px] w-full
                   md:items-start items-center
                   md:my-0 my-2"
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
        <div class="flex flex-col mt-[2px] ml-4 w-[209px] gap-1 text-[13px]">
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
        <div class="flex flex-col gap-[10px] mt-[11px] ml-[73px] mr-[15px]">
            <a href="https://www.instagram.com/wardetassocies/" class="">
                <img class="h-[16px]" src="/icons/socials/Instagram.svg" alt="Instagram" />
            </a>
            <a href="https://www.facebook.com/people/Ward-associ%C3%A9s/100063536502149/">
                <img class="h-[16px]" src="/icons/socials/Facebook.svg" alt="Facebook" />
            </a>
        </div>
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
