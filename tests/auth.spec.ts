import {test, expect} from 'playwright-test-coverage';

//mock out all calls to the backend
//to check things are being mocked out correctly change env.dev variable to bogus url
const site = 'https://pizza.lincstores.click/';

test('home page', async ({page}) => {
    await page.goto('/');

    expect(await page.title()).toBe('JWT Pizza');
});

test('register', async ({page}) => {
    await page.route('**/api/auth', async route => {
        await route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify({
                user: {
                    id: 1,
                    name: 'James',
                    email: 'james@test.com',
                    roles: [{role: 'diner'}]
                },
                token: 'fake.jwt.token'
            })
        });
    });
    //User actions
    await page.goto(site);
    await page.getByRole('link', {name: 'Register'}).click();
    // Fill form
    await page.getByRole('textbox', {name: 'Full name'}).fill('James');
    await page.getByRole('textbox', {name: 'Email address'}).fill('james@test.com');
    await page.getByRole('textbox', {name: 'Password'}).fill('password');
    await page.getByRole('button', {name: 'Register'}).click();

    await expect(page.getByRole('link', {name: 'Logout'})).toBeVisible();
});

test('login', async ({page}) => {
    await page.route('**/api/auth', async route => {

        await route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify({
                user: {
                    email: 't@jwt.com',
                    name: 't',
                },
                token: 'fake-jwt-token',
            }),
        });
    })


//User action
    await page.goto(site);
    await page.getByRole('link', {name: 'Login'}).click();
    await page.getByRole('textbox', {name: 'Email address'}).click();
    await page.getByRole('textbox', {name: 'Email address'}).fill('t@jwt.com');
    await page.getByRole('textbox', {name: 'Password'}).click();
    await page.getByRole('textbox', {name: 'Password'}).fill('test');
    await page.getByRole('button', {name: 'Login'}).click();
    await page.pause();
    await page.getByRole('link', {name: 't', exact: true}).click();
    await expect(page.getByRole('main')).toContainText('t@jwt.com');
})

test('adminLogin', async ({page}) => {
    // Mock login API
    await page.route('**/api/auth', async route => {
        const request = route.request();
        const body = JSON.parse(request.postData() || '{}');

        // Optional but recommended: assert frontend payload
        expect(body).toMatchObject({
            email: 'admin@jwt.com',
            password: 'admin'
        });

        await route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify({
                user: {
                    id: 1,
                    name: 'Admin',
                    email: 'admin@jwt.com',
                    roles: [{role: 'admin'}]
                },
                token: 'fake.admin.jwt'
            })
        });
    });

    // User actions
    await page.goto(site);
    await page.getByRole('link', {name: 'Login'}).click();

    await page.getByRole('textbox', {name: 'Email address'}).fill('admin@jwt.com');
    await page.getByRole('textbox', {name: 'Password'}).fill('admin');
    await page.getByRole('button', {name: 'Login'}).click();

    // Assertions: admin UI appears
    await expect(page.getByRole('link', {name: /admin/i})).toBeVisible();
    await expect(page.getByRole('link', {name: /logout/i})).toBeVisible();
})
