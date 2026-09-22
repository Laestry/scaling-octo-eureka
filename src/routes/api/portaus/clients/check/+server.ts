// POST /api/portaus/clients/check
//
// Body: { type: 'resto' | 'perso', saq_number?: string, email?: string }
//
// resto: always identified by SAQ number.
// perso: by SAQ number when they have one, otherwise by the contact email. `emailTaken` says
// whether Portaus already has a contact with that email even when no perso customer matched
// (for example a resto contact), which matters before trying to create one.

import { json, type RequestHandler } from '@sveltejs/kit';
import {
    PortausError,
    findPersoByEmail,
    findPersoBySaqNumber,
    findRestoBySaqNumber,
    isEmailTaken,
    summarizeCustomer
} from '$lib/server/portausAdmin';

export const POST: RequestHandler = async ({ request }) => {
    let body: { type?: string; saq_number?: string | null; email?: string | null };
    try {
        body = await request.json();
    } catch {
        return json({ error: 'InvalidJson', message: 'Body is not valid JSON' }, { status: 400 });
    }

    const type = body.type === 'resto' || body.type === 'perso' ? body.type : null;
    const saqNumber = body.saq_number?.trim() || null;
    const email = body.email?.trim() || null;

    if (!type) return json({ error: 'InvalidType', message: "type must be 'resto' or 'perso'" }, { status: 400 });
    if (type === 'resto' && !saqNumber) {
        return json({ error: 'MissingSaqNumber', message: 'A resto is identified by its SAQ number' }, { status: 400 });
    }
    if (type === 'perso' && !saqNumber && !email) {
        return json({ error: 'MissingIdentifier', message: 'A perso needs a SAQ number or an email' }, { status: 400 });
    }

    try {
        if (type === 'resto') {
            const customer = await findRestoBySaqNumber(saqNumber!);
            return json({
                exists: !!customer,
                matchedBy: customer ? 'saq_number' : null,
                customer: customer && summarizeCustomer(customer)
            });
        }

        let customer = saqNumber ? await findPersoBySaqNumber(saqNumber) : null;
        let matchedBy: 'saq_number' | 'email' | null = customer ? 'saq_number' : null;
        if (!customer && email) {
            customer = await findPersoByEmail(email);
            if (customer) matchedBy = 'email';
        }
        const emailTaken = email ? (customer ? true : await isEmailTaken(email)) : null;

        return json({ exists: !!customer, matchedBy, emailTaken, customer: customer && summarizeCustomer(customer) });
    } catch (e) {
        if (e instanceof PortausError) {
            console.error('clients/check: Portaus error', e.status, e.path, e.body);
            return json({ error: 'PortausError', message: e.detail, status: e.status }, { status: 502 });
        }
        console.error('clients/check failed', e);
        return json({ error: 'CheckFailed', message: (e as Error).message }, { status: 500 });
    }
};
