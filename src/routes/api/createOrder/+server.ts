// curl 'https://api-test-wardetassocies.portaus.net/API/latest/admin/sales-orders' \
//   -H 'accept: application/json, text/plain, */*' \
//   -H 'accept-language: fr-CA' \
//   -H 'authorization: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6OCwiZW1haWwiOiJhbGV4YW5kcmVAd2FyZGV0YXNzb2NpZXMuY29tIiwidXVpZCI6Ijc0ZDQ1OTAwLTBkOWYtMTFmMC1iMWRiLWEzYzFiZDQzNmNmNSIsImlhdCI6MTc0MzM2Mzg5NSwiZXhwIjoxNzQzNDA3MDk1fQ.TDzS3MVJo89u2oiUIzwIe9rO7LD8PjCW8T2Ba9ICWns' \
//   -H 'content-type: application/json' \
//   -H 'origin: https://test-wardetassocies.portaus.net' \
//   -H 'priority: u=1, i' \
//   -H 'referer: https://test-wardetassocies.portaus.net/' \
//   -H 'sec-ch-ua: "Chromium";v="134", "Not:A-Brand";v="24", "Google Chrome";v="134"' \
//   -H 'sec-ch-ua-mobile: ?0' \
//   -H 'sec-ch-ua-platform: "macOS"' \
//   -H 'sec-fetch-dest: empty' \
//   -H 'sec-fetch-mode: cors' \
//   -H 'sec-fetch-site: same-site' \
//   -H 'user-agent: Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/134.0.0.0 Safari/537.36' \
//   -H 'x-portaus-context: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJTWVNURU1fSUQiOiJXQVJEUFJPRCIsIlBPUlRBVVNfQ0lFX0lEIjoxLCJ1dWlkIjoiNzRkNDU5MDItMGQ5Zi0xMWYwLWIxZGItYTNjMWJkNDM2Y2Y1IiwiaWF0IjoxNzQzMzYzODk1fQ.0VUobRDfLQZ5NzixT4T8xv9nIHGss9NvqkPhAi4hRWY' \
//   --data-raw '{"id":null,"soNumber":null,"customer":{"id":2756},"date":"2025-03-31T02:45:00+07:00","reference":"","notes":"test","subTotal":337.56,"total":388.11,"discount":null,"taxes":[{"label":"TPS","taxableAmount":337.56,"taxNumber":"811808716","total":16.88,"rate":0.05,"billableTaxableAmount":52.56,"billable":2.63},{"label":"TVQ","taxableAmount":337.56,"taxNumber":"1217685610","total":33.67,"rate":0.09975,"billableTaxableAmount":52.56,"billable":5.24}],"billingAddress":{"id":2755},"shippingAddress":{"id":2755},"billingContact":{"id":3164},"shippingContact":{"id":3164},"extraInfo":{"location":{"id":160,"code":"SAQ","content":{"city":"Saint-Lin-des-Laurentides","phone":"450 439-1748","number":"23016","address":"997, rue Saint-Isidore"}}},"lines":[{"product":{"id":240,"puid":"61c01838-ea00-461a-9a76-c414a6c80c23"},"inventory":{"id":1,"name":"Importation privée","description":null,"indReservation":true,"indAgency":true,"default":true,"agencyFeeProductId":1,"code":"IP","variableItemPriceInd":false,"itemMergedInd":true,"productDelayLimit":210,"productDelay":150,"portausCompanyId":1,"chargeFullPrices":false},"prices":[{"label":"DEFAULT_PRODUCT_PRICE","price":23.75,"taxable":true,"editState":false,"productId":240},{"editState":false,"label":"PRODUCT_AGENCY_FEE","price":4.38,"productId":1,"taxable":true}],"qty":12,"discount":null,"subTotal":337.56,"subTotalBrut":337.56}],"tags":[],"rep":{"id":3163},"deliveryTypes":[{"id":3}],"status":{"id":13,"code":"TO_PROCESS","description":"À traiter","type":"SALES_ORDER","weight":10}}'
