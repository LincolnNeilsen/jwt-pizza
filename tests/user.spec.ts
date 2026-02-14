import {test, expect} from 'playwright-test-coverage';

test('updateUser', async ({page}) => {
    const email = `user${Math.floor(Math.random() * 10000)}@jwt.com`;

    const currentUser = {
        id: 1,
        name: 'zog',
        email,
        roles: [{role: 'diner'}],
    };
    const token = 'fake.jwt.token';

    // Auth endpoint is used for register/login/logout in this app
    await page.route('**/api/auth', async route => {
        await route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify({
                user: currentUser, // always return latest "persisted" user
                token,
            }),
        });
    });

    // Some flows may call "who am I" to rehydrate the user from token
    await page.route('**/api/user/me', async route => {
        await route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify(currentUser),
        });
    });

    // This is what updateUser() ultimately calls: PUT /api/user/:id
    await page.route('**/api/user/*', async route => {
        if (route.request().method() !== 'PUT') {
            return route.fallback();
        }

        const body = route.request().postDataJSON() as Partial<typeof currentUser>;

        // "Persist" changes into our in-memory user
        if (typeof body.name === 'string') currentUser.name = body.name;
        if (typeof body.email === 'string') currentUser.email = body.email;

        await route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify({
                user: currentUser,
                token, // service stores this again after update
            }),
        });
    });

    //log in
    await page.goto('/');
    await page.getByRole('link', {name: 'Register'}).click();
    await page.getByRole('textbox', {name: 'Full name'}).fill('zog');
    await page.getByRole('textbox', {name: 'Email address'}).fill(email);
    await page.getByRole('textbox', {name: 'Password'}).fill('diner');
    await page.getByRole('button', {name: 'Register'}).click();

    await page.getByRole('link', {name: 'z'}).click();

    await expect(page.getByRole('main')).toContainText('diner');

    //edit user
    await page.getByRole('button', {name: 'Edit'}).click();
    await expect(page.locator('h3')).toContainText('Edit user');
    await page.getByRole('button', {name: 'Update'}).click();

    await page.waitForSelector('[role="dialog"].hidden', {state: 'attached'});

    await page.getByRole('button', {name: 'Edit Profile'}).click();
    await page.getByRole('textbox').first().click();
    await page.getByRole('textbox').first().fill('xed');
    await page.locator('input[type="email"]').click();
    await page.locator('input[type="email"]').fill('changed@email.com');
    await page.locator('#password').click();
    await page.locator('#password').fill('newPassword');
    await page.getByRole('button', {name: 'Update'}).click();

    await expect(page.getByText('changed@email.com')).toBeVisible();
    await expect(page.getByText('xed')).toBeVisible();

    await expect(page.getByRole('main')).toContainText('diner');

    //logout and check if update was persisted
    await page.getByRole('link', {name: 'Logout'}).click();
    await page.getByRole('link', {name: 'Login'}).click();

    await page.getByRole('textbox', {name: 'Email address'}).fill("changed@email");
    await page.getByRole('textbox', {name: 'Password'}).fill('newPassword');
    await page.getByRole('button', {name: 'Login'}).click();

    await page.getByRole('link', {name: 'x'}).click();

    await expect(page.getByRole('main')).toContainText('xed');
});