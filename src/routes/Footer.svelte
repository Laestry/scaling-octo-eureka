<script lang="ts">
    let selected: string;
</script>

<div class="pt-[106px] pb-[48px] flex flex-col justify-center items-center bg-color1 w-full">
    <img class="h-[102px] w-auto" src="/images/Ward%20&%20Associes.svg" alt="Ward & Associes" />

    <div class="mt-[104px] max-w-[1154px] w-full flex flex-wrap items-start footer">
        <div class="w-[82px] h-[53px] flex justify-center items-center">
            <img width="70px" src="/logo.svg" alt="logo" />
        </div>

        <div class="flex flex-col ml-[15px] w-[368px]" style="letter-spacing: 5%">
            <p class=" leading-4 text-xs">Inscrivez-vous à notre Infolettre pour recevoir toutes les exclusivités!</p>
            <div class="flex flex-wrap mt-[26px] gap-1">
                <input class="footerInput w-[94px]" placeholder="Prénom" autocomplete="first-name" />
                <input class="footerInput w-[94px]" placeholder="Nom" autocomplete="family-name" />
                <select
                    bind:value={selected}
                    class="bg-wpink text-white w-[169px] border-t border-white text-xs tracking-[0.6px]"
                >
                    <option value={'Restaurateur'}>
                        {'Restaurateur'}
                    </option>
                    <option value={'Particulier'}>
                        {'Particulier'}
                    </option>
                    <option value={'Curieux SAQ'}>
                        {'Curieux SAQ'}
                    </option>
                </select>
                <input class="footerInput w-[272px]" placeholder="Ton courriel ici" autocomplete="email" />
                <button class=" text-center bg-white rounded-3xl w-[90px] text-xs letter tracking-[0.6px]"
                    >Cheeeers!</button
                >
            </div>
        </div>

        <div class="flex flex-col ml-auto w-[176px] gap-1">
            <a href="/associes" class=" leading-[28px]">L’agence</a>
            <a href="/Rendez-vous" class=" leading-[28px]">Rendez-vous</a>
            <a href="mailto:info@wardetassocies.com" class=" leading-[28px]">Questions</a>
            <a
                target="_blank"
                href="https://www.saq.com/fr/produits?nom_agent_promo=Ward+%26+Associ%C3%A9s%2C+Repr%C3%A9sentants+en+Vin"
                class=" leading-[28px]">W& à la SAQ</a
            >
        </div>
        <div class="flex flex-col mt-[2px] ml-4 w-[209px] gap-1 text-[13px]">
            <p class="leading-[16px]">1217 Saint-Zotique Est, Montréal, Qc. H2S 1N6</p>
            <p class="leading-[28px]">
                <a href="mailto:info@wardetassocies.com">info@wardetassocies.com</a>
            </p>
            <div class="mt-11">
                Crédits Site
                <br />
                Design par <a href="https://www.superbonjour.com/" class="underline text-white">Super Bonjour</a>
                <br />
                Développé par <a href="https://www.jackgaarkeuken.com/" class="underline text-white">Jack Gaarkeuken</a>
            </div>
        </div>
        <div class="flex flex-col gap-[10px] mt-[11px] ml-[73px] mr-[15px]">
            <a href="/static" class="">
                <img class="h-[16px]" src="/icons/socials/Instagram.svg" alt="Instagram" />
            </a>
            <a href="/static">
                <img class="h-[16px]" src="/icons/socials/Facebook.svg" alt="Facebook" />
            </a>
        </div>
    </div>
</div>

<style lang="scss">
    input {
        font-size: 12px;
        letter-spacing: 0.6px;
    }
    .footerInput {
        height: 24px;
        text-align: center;
        border-radius: 100px;
        border: 1px white solid;
        background: transparent;
        color: white;
    }

    .footerInput::placeholder {
        color: white;
    }

    input[data-autocompleted] {
        background-color: transparent !important;
    }

    input:-webkit-autofill,
    input:-webkit-autofill:focus {
        transition:
            background-color 0s 0s,
            color 0s 0s;
        transition-delay: calc(infinity * 1s);
    }

    .footer__link {
        @apply leading-[15px] h-[24px] flex items-center justify-center;
        color: #fff;
        border: 1px solid #fff;
        border-radius: 12px;
        font-weight: 400;
    }
    .footer {
        font-family: 'Riposte', sans-serif;
        font-size: 14px;
        font-style: normal;
        font-weight: 500;
        line-height: 150%;
    }
</style>
