export namespace ApiTypes {
    export type ResMap = {
        '/auth/login': {
            body: {
                username: string;
                password: string;
            };
            res: {
                accessToken: string;
                portausContextToken: string;
                redirect: string;
                status: boolean;
                portausCompany: PortausCompany;
                refreshToken: string;
                user: User;
                rules: Rule[];
            };
        };
        '/API/latest/admin/inventories/1/products': {
            body: Partial<{
                limit: `${number}`;
                page: `${number}`;
                /** is published */
                webPublished: `${boolean}`;
                active: `${boolean}`;
                available: `${boolean}`;
                in_supply: `${boolean}`;
                direction: 'ASC' | 'DESC';
                orderBy: string;
                searchTerms: string;
                inventoryId: string;
            }>;
            res: {
                list: List[];
                count: number;
                pages: number;
                page: number;
            };
        };
        // New endpoint for payment intents
        '/api/v1/payments/intents': {
            body: PaymentIntentPayload;
            res: PaymentIntentResponse;
        };
    };

    export type PortausCompany = {
        id: number;
        system_id: string;
        name: string;
        contact_name: string;
        contact_email: string;
        address: Address;
        fiscal_end_day: number;
        fiscal_end_month: number;
        saq_process_module_ind: boolean;
        invoicing_module_active: boolean;
        external_account_api_active: boolean;
        personnalized_invoice: boolean;
        invoice_payment_instruction: null;
        report_customization: string;
        automatic_delay_reservation: boolean;
        fk_currency_id: number;
        portaus_company_users_role: PortausCompanyUsersRole;
    };
    export type Address = {
        city: string;
        state: string;
        street: string;
        country: string;
        postalCode: string;
    };
    export type PortausCompanyUsersRole = {
        active: boolean;
        createdAt: Date;
        updatedAt: Date;
        fk_user_id: number;
        fk_portaus_company_?: number;
        fk_portaus_company_id?: number;
    };
    export type Rule = {
        actions: string;
        subject: string[];
    };
    export type User = {
        id: number;
        first_name: string;
        last_name: string;
        email: string;
        phone: null;
        phone_ext: null;
        sex: null;
        birth_date: null;
        password: string;
        active: boolean;
        system_ref: null;
        import_id: null;
        is_admin: boolean;
        archived: boolean;
        generated_token: null;
        web_access: boolean;
        system_id: string;
        fk_portaus_company_id: number;
        createdAt: Date;
        updatedAt: Date;
        fk_denomination_id: null;
        fk_language_id: number;
        roles: Role[];
        portausCompanies: PortausCompany[];
        language: Language;
    };
    export type Language = {
        id: number;
        name: string;
        code: string;
        long_code: string;
        cms_language: boolean;
    };
    export type Role = {
        id: number;
        role_name: string;
        weight: number;
        is_admin: boolean;
        createdAt: Date;
        updatedAt: Date;
        portaus_company_users_role: PortausCompanyUsersRole;
    };
    //
    export type List = {
        rank: string;
        puid: string;
        puidPublished: boolean;
        id: number;
        inventory: Inventory;
        quantity: { [key: string]: number };
        externalId: null;
        sku: string;
        name: string;
        type: number;
        shortDescription: null | string;
        description: null | string;
        returnable: boolean;
        unit: number;
        uvc: number;
        length: null;
        width: null;
        height: null;
        weight: null;
        webLink: null | string;
        reorderLevel: null;
        upc: null | string;
        ean: null | string;
        mpn: null;
        isbn: null | string;
        volume: number;
        format: number;
        webSite: null | string;
        lblFormat: string;
        cmsName: string;
        published: boolean;
        publishedDate: null;
        agencyNumber: null;
        slug: string;
        purchaseUnitPrice: number;
        marginRate: number;
        active: boolean;
        taxable: boolean;
        agencyRate: number | null;
        sellingUnitPrice: number;
        agencyRateByClasses: null;
        content: null | string;
        provider?: Provider;
        tags: Status[];
        category?: Category;
        specificCategory?: Category;
        relatedProducts: any[];
        taxes: Tax[];
        saleAccount?: Account;
        commissionAccount?: Account;
        attributes: any[];
        origins: Origin[];
        items: Item[];
        item?: Item;
        pricing: Price;
        extendedName: string;
        currentVintage: string;
        purchaseAccount?: Account;
        itemToCome?: ItemToCome;
        originCountry?: string;
        originRegion?: string;
        cmsProvider?: CMSProvider;
        originCity?: string;
        currentTechnicalSpec?: CurrentTechnicalSpec;
    };
    export type Category = {
        id: number;
        code: string;
        name: string;
    };
    export type CMSProvider = {
        id: number;
        name: string;
        aliasName: null | string;
        origins: Origin[];
    };
    export type Origin = {
        id: number;
        country: Category;
        region: City;
        city?: City;
    };
    export type City = {
        id: number;
        name: string;
    };
    export type Account = {
        id: number;
        code: string;
        number: string;
        system: boolean;
        name: string;
        description: null;
    };
    export type CurrentTechnicalSpec = {
        id: number;
    };
    export type Inventory = {
        id: number;
        name: string;
        description: null;
        indReservation: boolean;
        indAgency: boolean;
        default: boolean;
        agencyFeeProductId: number;
        code: string;
        variableItemPriceInd: boolean;
        itemMergedInd: boolean;
        productDelayLimit: number;
        productDelay: number;
        portausCompanyId: number;
        chargeFullPrices: boolean;
    };
    export type Item = {
        id: number;
        qty: number;
        price: number;
        priceTaxIn: number;
        purchaseUnitPrice: string;
        reference: null | string;
        description: null | string;
        availabilityDate: Date;
        createdAt: Date;
        updatedAt: Date;
        active: boolean;
        extraInfo: ItemExtraInfo | null;
        sellBefore: Date | null;
        lockVersion: number;
        productId: number;
        indCmsOnline: boolean;
        indExternalOnline: boolean;
        puid: string;
        prices: Price;
        nbDays: number;
        quantity: Quantity;
        vintage?: null | string;
        productItem?: CurrentTechnicalSpec;
        technicalSpec?: CurrentTechnicalSpec;
    };
    export type ItemExtraInfo = {
        color?: number | null;
        family?: number | null;
        nature?: number | null;
        alcohol?: null | string;
        vintage: null | string;
    };
    export type Price = {
        price: number;
        agencyFee: number;
        priceTaxIn: number;
        agencyFeeWTaxes: number;
        sellingUnitPrice: number;
        agencyFeeTaxes?: number;
        agencyFeeBasedOnTaxIn?: number;
        agencyFeeBasedOnTaxInWTaxes?: number;
    };
    export type Quantity = {
        total: number;
        packaged: number;
        onHand: number;
    };
    export type ItemToCome = {
        id: number;
        poNumber: string;
        puid: string;
        receptionPlanningDate: Date;
        reference: string;
        reference2: null | string;
        price: number;
        priceTaxIn: number;
        pendingQty: number;
        extraInfo: ExtraInfoElement[];
        inventory: CurrentTechnicalSpec;
        status: Status;
    };
    export type ExtraInfoElement = {
        id: number;
        code: string;
        value: number | null | string;
    };
    export type Status = {
        id: number;
        code: string;
    };
    export type Provider = {
        id: number;
        name: string;
        usualName: string;
        displayName: string;
    };
    export type Tax = {
        id: number;
        name: string;
        rate: number;
        number: string;
    };

    // New type definitions for Payment Intents
    export type PaymentIntentPayload = {
        customer: {
            firstName: string;
            lastName: string;
            email: string;
            phone: string;
            billingAddress: {
                id: number;
                street: string;
                city: string;
                country: {
                    id: number;
                    name: string;
                    isoCode: string;
                };
                state: {
                    id: number;
                    isoCode: string;
                };
                otherState: string;
                postalCode: string;
            };
            shippingAddress: {
                id: number;
                street: string;
                city: string;
                country: {
                    id: number;
                    name: string;
                    isoCode: string;
                };
                state: {
                    id: number;
                    isoCode: string;
                };
                otherState: string;
                postalCode: string;
            };
        };
        portausCompanyId: number;
        lines: {
            puid: string;
            prices: {
                label: string;
                price: number;
                taxable: boolean;
                productId: number;
            }[];
            qty: number;
        }[];
        signature: string;
        subTotal: number;
        subTotalBillable: number;
        taxes: {
            label: string;
            taxableAmount: number;
            taxNumber: string;
            total: number;
            rate: number;
            billableTaxableAmount: number;
            billable: number;
        }[];
        total: number;
        totalBillable: number;
        totalUnbillable: number;
        branch: {
            city: string;
            phone: string;
            number: string;
            address: string;
        };
    };

    export type PaymentIntentResponse = {
        id: string;
        status: string;
        redirectUrl?: string;
        // Additional fields returned by the API can be added here.
    };
}
