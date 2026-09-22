// POST /api/portaus/clients/create
//
// perso body:
//   { type: 'perso', saq_number?, saq_branch_id?,
//     billing_contact: { first_name, last_name, email, phone? },
//     billing_address: { street, city, postal_code },
//     shipping_address?: { street, city, postal_code } }
//
// resto body:
//   { type: 'resto', saq_number, company: { name, usual_name?, email?, phone? },
//     resto_delivery_type?: 0 | 3   (0 = delivery to the establishment, 3 = SAQ branch pickup)
//     saq_branch_id?,
//     billing_contact: {...}, shipping_contact?: {...},
//     billing_address: {...}, shipping_address?: {...} }
//
// Refuses to create a duplicate: a resto whose SAQ number already exists, or a perso whose
// email or SAQ number already belongs to a customer. Answers with the existing customer instead.

import { json, type RequestHandler } from '@sveltejs/kit';
import {
    DELIVERY_TYPE,
    PortausError,
    createPersoCustomer,
    createRestoCustomer,
    findPersoByEmail,
    findPersoBySaqNumber,
    findRestoBySaqNumber,
    getCustomer,
    summarizeCustomer,
    type AddressInput,
    type ContactInput
} from '$lib/server/portausAdmin';

type WireContact = { first_name?: string; last_name?: string; email?: string; phone?: string | null };
type WireAddress = { street?: string; city?: string; postal_code?: string };

function contact(c: WireContact | null | undefined, label: string): ContactInput {
    if (!c?.first_name?.trim() || !c?.last_name?.trim() || !c?.email?.trim()) {
        throw new Error(`${label} needs first_name, last_name and email`);
    }
    return { firstName: c.first_name, lastName: c.last_name, email: c.email, phone: c.phone ?? null };
}

function address(a: WireAddress | null | undefined, label: string): AddressInput {
    if (!a?.street?.trim() || !a?.city?.trim() || !a?.postal_code?.trim()) {
        throw new Error(`${label} needs street, city and postal_code`);
    }
    return { street: a.street, city: a.city, postalCode: a.postal_code };
}

/** The cart's "Pour la cueillette" select: 0 = establishment delivery, 3 = SAQ branch. */
function restoDeliveryType(v: unknown, hasBranch: boolean): number {
    const n = Number(v);
    if (n === 3) return DELIVERY_TYPE.SAQ_BRANCH;
    if (n === 0) return DELIVERY_TYPE.RESTO_BEFORE_16H;
    if (Number.isInteger(n) && n > 0) return n; // already a Portaus delivery type id
    return hasBranch ? DELIVERY_TYPE.SAQ_BRANCH : DELIVERY_TYPE.RESTO_BEFORE_16H;
}

export const POST: RequestHandler = async ({ request }) => {
    let body: any;
    try {
        body = await request.json();
    } catch {
        return json({ error: 'InvalidJson', message: 'Body is not valid JSON' }, { status: 400 });
    }

    const type = body?.type;
    if (type !== 'resto' && type !== 'perso') {
        return json({ error: 'InvalidType', message: "type must be 'resto' or 'perso'" }, { status: 400 });
    }

    try {
        const saqNumber: string | null = body.saq_number?.toString().trim() || null;
        const saqBranchId = body.saq_branch_id ? Number(body.saq_branch_id) : null;

        if (type === 'resto') {
            if (!saqNumber)
                return json({ error: 'MissingSaqNumber', message: 'A resto needs a SAQ number' }, { status: 400 });

            const existing = await findRestoBySaqNumber(saqNumber);
            if (existing) {
                return json(
                    {
                        error: 'AlreadyExists',
                        message: 'A resto with this SAQ number already exists',
                        customer: summarizeCustomer(existing)
                    },
                    { status: 409 }
                );
            }
            if (!body.company?.name?.trim()) {
                return json({ error: 'MissingCompany', message: 'company.name is required' }, { status: 400 });
            }

            const id = await createRestoCustomer({
                company: {
                    name: body.company.name,
                    usualName: body.company.usual_name ?? null,
                    email: body.company.email ?? null,
                    phone: body.company.phone ?? null
                },
                saqNumber,
                billingContact: contact(body.billing_contact, 'billing_contact'),
                shippingContact: body.shipping_contact ? contact(body.shipping_contact, 'shipping_contact') : null,
                billingAddress: address(body.billing_address, 'billing_address'),
                shippingAddress: body.shipping_address ? address(body.shipping_address, 'shipping_address') : null,
                deliveryTypeId: restoDeliveryType(body.resto_delivery_type, !!saqBranchId),
                saqLocationId: saqBranchId
            });
            return json({ created: true, customer: summarizeCustomer(await getCustomer(id)) }, { status: 201 });
        }

        const billingContact = contact(body.billing_contact, 'billing_contact');
        const existing =
            (saqNumber ? await findPersoBySaqNumber(saqNumber) : null) ??
            (await findPersoByEmail(billingContact.email));
        if (existing) {
            return json(
                {
                    error: 'AlreadyExists',
                    message: 'A perso with this SAQ number or email already exists',
                    customer: summarizeCustomer(existing)
                },
                { status: 409 }
            );
        }

        const id = await createPersoCustomer({
            contact: billingContact,
            billingAddress: address(body.billing_address, 'billing_address'),
            shippingAddress: body.shipping_address ? address(body.shipping_address, 'shipping_address') : null,
            saqNumber,
            saqLocationId: saqBranchId
        });
        return json({ created: true, customer: summarizeCustomer(await getCustomer(id)) }, { status: 201 });
    } catch (e) {
        if (e instanceof PortausError) {
            console.error('clients/create: Portaus error', e.status, e.path, e.body);
            return json(
                { error: 'PortausError', message: e.detail, status: e.status, detail: e.body },
                { status: 502 }
            );
        }
        console.error('clients/create failed', e);
        return json({ error: 'CreateFailed', message: (e as Error).message }, { status: 400 });
    }
};
