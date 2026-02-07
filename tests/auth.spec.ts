import { test, expect } from 'playwright-test-coverage';

//mock out all calls to the backend
//to check things are being mocked out correctly change env.dev variable to bogus url

test('home page', async ({page}) => {
    await page.goto('/');

    expect(await page.title()).toBe('JWT Pizza');
});

test('register', async ({page}) => {
    await page.route('**/api/auth', async route => {
        const request = route.request();

        // assert frontend
        const body = JSON.parse(request.postData() || '{}');
        expect(body).toMatchObject({
            name: 'James',
            email: 'james@test.com',
            password: 'password'
        });

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
    await page.goto('https://pizza.lincstores.click/');
    await page.getByRole('link', {name: 'Register'}).click();
    // Fill form
    await page.getByRole('textbox', {name: 'Full name'}).fill('James');
    await page.getByRole('textbox', {name: 'Email address'}).fill('james@test.com');
    await page.getByRole('textbox', {name: 'Password'}).fill('password');
    await page.getByRole('button', {name: 'Register'}).click();

    await expect(page.getByRole('link', {name: 'Logout'})).toBeVisible();
});

