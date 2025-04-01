import { createPaymentIntent } from '$lib/server/portausApi';

export async function GET({ locals }) {
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
                puid: '61c01838-ea00-461a-9a76-c414a6c80c23',
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
    let res = await createPaymentIntent(payload);
    console.log(res);
}
