import { PortausApi } from '$lib/server/portaus';
import PocketBase from 'pocketbase';
import { PUBLIC_DB_URL } from '$env/static/public';
import { POCKETBASE_ADMIN_PASSWORD, POCKETBASE_ADMIN_USER } from '$env/static/private';
import { upsertBatch } from '$lib/server/pocketbase';

export async function GET({ locals }) {
    const tokens = await PortausApi.getTokens();
    const payload = {
        customer: {
            firstName: 'John',
            lastName: 'Doe',
            email: 'john.doe@example.com',
            phone: '+1234567890',
            billingAddress: {
                id: 178,
                street: '675 rue Sherbrooke',
                city: 'Montréal',
                country: {
                    id: 1,
                    name: 'Canada',
                    isoCode: 'CA'
                },
                state: {
                    id: 1,
                    isoCode: 'QC'
                },
                otherState: 'Quebec',
                postalCode: 'H1M 3R5'
            },
            shippingAddress: {
                id: 178,
                street: '675 rue Sherbrooke',
                city: 'Montréal',
                country: {
                    id: 1,
                    name: 'Canada',
                    isoCode: 'CA'
                },
                state: {
                    id: 1,
                    isoCode: 'QC'
                },
                otherState: 'Quebec',
                postalCode: 'H1M 3R5'
            }
        },
        portausCompanyId: 0,
        lines: [
            {
                puid: 'PROD12345',
                prices: [
                    {
                        label: 'Regular Price',
                        price: 100,
                        taxable: true,
                        productId: 987
                    }
                ],
                qty: 2
            }
        ],
        signature: 'abcdef1234567890',
        subTotal: 200,
        subTotalBillable: 200,
        taxes: [
            {
                label: 'GST',
                taxableAmount: 200,
                taxNumber: 'GST001',
                total: 26,
                rate: 13,
                billableTaxableAmount: 200,
                billable: 26
            }
        ],
        total: 226,
        totalBillable: 226,
        totalUnbillable: 0,
        branch: {
            city: 'Montréal',
            phone: '514-123-4567',
            number: '001',
            address: '123 Main Street'
        }
    };
    let res = await PortausApi.createPaymentIntent(payload, tokens);
    console.log(res);
}
