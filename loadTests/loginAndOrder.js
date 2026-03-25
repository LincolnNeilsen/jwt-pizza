import { sleep, group, check } from 'k6'
import http from 'k6/http'
import jsonpath from 'https://jslib.k6.io/jsonpath/1.0.2/index.js'

export const options = {
    cloud: {
        distribution: { 'amazon:us:ashburn': { loadZone: 'amazon:us:ashburn', percent: 100 } },
        apm: [],
    },
    thresholds: {},
    scenarios: {
        login_and_purchase: {
            executor: 'ramping-vus',
            gracefulStop: '30s',
            stages: [
                { target: 20, duration: '10s' },
                { target: 40, duration: '30s' },
                { target: 25, duration: '20s' },
                { target: 0, duration: '10s' },
            ],
            gracefulRampDown: '30s',
            exec: 'login_and_purchase',
        },
    },
}

export function login_and_purchase() {
    let response

    const vars = {}

    group('home - https://pizza.lincstores.click/', function () {
        // login
        response = http.put(
            'https://pizza-service.lincstores.click/api/auth',
            '{"email":"d@jwt.com","password":"diner"}',
            {
                headers: {
                    accept: '*/*',
                    'accept-encoding': 'gzip, deflate, br, zstd',
                    'accept-language': 'en-US,en;q=0.5',
                    'cache-control': 'no-cache',
                    'content-type': 'application/json',
                    origin: 'https://pizza.lincstores.click',
                    priority: 'u=1, i',
                    'sec-ch-ua': '"Chromium";v="146", "Not-A.Brand";v="24", "Brave";v="146"',
                    'sec-ch-ua-mobile': '?0',
                    'sec-ch-ua-platform': '"Windows"',
                    'sec-fetch-dest': 'empty',
                    'sec-fetch-mode': 'cors',
                    'sec-fetch-site': 'same-site',
                    'sec-gpc': '1',
                },
            }
        )
        check(response, { 'status equals 200': response => response.status.toString() === '200' })

        vars['token'] = jsonpath.query(response.json(), '$.token')[0]

        sleep(3)

        // get menu
        response = http.get('https://pizza-service.lincstores.click/api/order/menu', {
            headers: {
                accept: '*/*',
                'accept-encoding': 'gzip, deflate, br, zstd',
                'accept-language': 'en-US,en;q=0.5',
                authorization: `Bearer ${vars['token']}`,
                'cache-control': 'no-cache',
                'content-type': 'application/json',
                origin: 'https://pizza.lincstores.click',
                priority: 'u=1, i',
                'sec-ch-ua': '"Chromium";v="146", "Not-A.Brand";v="24", "Brave";v="146"',
                'sec-ch-ua-mobile': '?0',
                'sec-ch-ua-platform': '"Windows"',
                'sec-fetch-dest': 'empty',
                'sec-fetch-mode': 'cors',
                'sec-fetch-site': 'same-site',
                'sec-gpc': '1',
            },
        })

        response = http.get(
            'https://pizza-service.lincstores.click/api/franchise?page=0&limit=20&name=*',
            {
                headers: {
                    accept: '*/*',
                    'accept-encoding': 'gzip, deflate, br, zstd',
                    'accept-language': 'en-US,en;q=0.5',
                    authorization: `Bearer ${vars['token']}`,
                    'cache-control': 'no-cache',
                    'content-type': 'application/json',
                    origin: 'https://pizza.lincstores.click',
                    priority: 'u=1, i',
                    'sec-ch-ua': '"Chromium";v="146", "Not-A.Brand";v="24", "Brave";v="146"',
                    'sec-ch-ua-mobile': '?0',
                    'sec-ch-ua-platform': '"Windows"',
                    'sec-fetch-dest': 'empty',
                    'sec-fetch-mode': 'cors',
                    'sec-fetch-site': 'same-site',
                    'sec-gpc': '1',
                },
            }
        )
        sleep(2)

        response = http.get('https://pizza-service.lincstores.click/api/user/me', {
            headers: {
                accept: '*/*',
                'accept-encoding': 'gzip, deflate, br, zstd',
                'accept-language': 'en-US,en;q=0.5',
                authorization: `Bearer ${vars['token']}`,
                'cache-control': 'no-cache',
                'content-type': 'application/json',
                origin: 'https://pizza.lincstores.click',
                priority: 'u=1, i',
                'sec-ch-ua': '"Chromium";v="146", "Not-A.Brand";v="24", "Brave";v="146"',
                'sec-ch-ua-mobile': '?0',
                'sec-ch-ua-platform': '"Windows"',
                'sec-fetch-dest': 'empty',
                'sec-fetch-mode': 'cors',
                'sec-fetch-site': 'same-site',
                'sec-gpc': '1',
            },
        })
        sleep(3)

        //order
        response = http.post(
            'https://pizza-service.lincstores.click/api/order',
            '{"items":[{"menuId":4,"description":"Crusty","price":0.0028}],"storeId":"1","franchiseId":1}',
            {
                headers: {
                    accept: '*/*',
                    'accept-encoding': 'gzip, deflate, br, zstd',
                    'accept-language': 'en-US,en;q=0.5',
                    authorization: `Bearer ${vars['token']}`,
                    'cache-control': 'no-cache',
                    'content-type': 'application/json',
                    origin: 'https://pizza.lincstores.click',
                    priority: 'u=1, i',
                    'sec-ch-ua': '"Chromium";v="146", "Not-A.Brand";v="24", "Brave";v="146"',
                    'sec-ch-ua-mobile': '?0',
                    'sec-ch-ua-platform': '"Windows"',
                    'sec-fetch-dest': 'empty',
                    'sec-fetch-mode': 'cors',
                    'sec-fetch-site': 'same-site',
                    'sec-gpc': '1',
                },
            }
        )

        vars['jwt'] = jsonpath.query(response.json(), '$.token')[0]

        const verifyBody = JSON.stringify({
            jwt: vars['jwt'],
        })

        sleep(2)

        //verify
        response = http.post(
            'https://pizza-factory.cs329.click/api/order/verify', verifyBody,
            {
                headers: {
                    accept: '*/*',
                    'accept-encoding': 'gzip, deflate, br, zstd',
                    'accept-language': 'en-US,en;q=0.5',
                    authorization: `Bearer ${vars['token']}`,
                    'cache-control': 'no-cache',
                    'content-type': 'application/json',
                    origin: 'https://pizza.lincstores.click',
                    priority: 'u=1, i',
                    'sec-ch-ua': '"Chromium";v="146", "Not-A.Brand";v="24", "Brave";v="146"',
                    'sec-ch-ua-mobile': '?0',
                    'sec-ch-ua-platform': '"Windows"',
                    'sec-fetch-dest': 'empty',
                    'sec-fetch-mode': 'cors',
                    'sec-fetch-site': 'cross-site',
                    'sec-fetch-storage-access': 'none',
                    'sec-gpc': '1',
                },
            }
        )
        check(response, { 'status equals 200': response => response.status.toString() === '200' })
        sleep(3)
    })
}