import {test, expect} from 'playwright-test-coverage';
import {Page} from "playwright";
import {Role, User} from "../src/service/pizzaService";

async function loginAsFranchisee(page: Page) {
    let loggedInUser: User | undefined;
    const validUsers: Record<string, User> = {
        'franchise@jwt.com': {
            id: '1',
            name: 'quack',
            email: 'franchise@jwt.com',
            password: 'franchise',
            roles: [{objectId: '1', role: Role.Franchisee}]
        }
    };

    // Authorize login for the given user
    await page.route('*/**/api/auth', async (route) => {
        const loginReq = route.request().postDataJSON();
        const user = validUsers[loginReq.email];
        if (!user || user.password !== loginReq.password) {
            await route.fulfill({status: 401, json: {error: 'Unauthorized'}});
            return;
        }
        loggedInUser = user;
        const loginRes = {
            user: loggedInUser,
            token: 'abcdef',
        };
        await route.fulfill({json: loginRes});
    });

    // Return the currently logged in user
    await page.route('*/**/api/user/me', async (route) => {
        await route.fulfill({json: loggedInUser});
    });

    // Franchise dashboard
    const franchiseData = [{id: '1', name: 'PizzaHut', admins: [{email: 'franchise@jwt.com', id: '1', name: 'quack'}], stores: [{id: '3', name: 'New York City', totalRevenue: 100}]}];
    await page.route('*/**/api/franchise/1', async (route) => {
        if (route.request().method() === 'GET') {
            await route.fulfill({
                json: franchiseData,
            });
        }
    });

    // Create store
    await page.route('*/**/api/franchise/1/store', async (route) => {
        if (route.request().method() === 'POST') {
            const store = route.request().postDataJSON();
            store.id = '4';
            franchiseData[0].stores.push({id: store.id, name: store.name, totalRevenue: 0});
            await route.fulfill({json: store});
        }
    });

    // Close store
    await page.route('*/**/api/franchise/1/store/4', async (route) => {
        if (route.request().method() === 'DELETE') {
            franchiseData[0].stores = franchiseData[0].stores.filter(s => s.id !== '4');
            await route.fulfill({json: {message: 'store closed'}});
        }
    });

    // Go home & login
    await page.goto('/');

    await page.getByRole('link', {name: 'Login'}).click();
    await page.getByRole('textbox', {name: 'Email address'}).fill('franchise@jwt.com');
    await page.getByRole('textbox', {name: 'Password'}).fill('franchise');
    await page.getByRole('button', {name: 'Login'}).click();

    // Ensure login stuck
    await expect(page.getByRole('link', {name: 'Logout'})).toBeVisible();
}

test('franchiseDashboardTest', async ({page}) => {
    await loginAsFranchisee(page);
    await page.getByRole('link', {name: 'q'}).click();
    await expect(page.getByRole('main')).toContainText('Franchisee');

    await page.getByRole('link', {name: 'Franchise', exact: true}).first().click();
    await expect(page.getByRole('main')).toContainText('PizzaHut');
    await expect(page.getByRole('main')).toContainText('Everything you need to run an JWT Pizza franchise. Your gateway to success.');

    await page.getByRole('button', {name: 'Create store'}).click();
    await page.getByRole('textbox', {name: 'store name'}).fill('Lehi');
    await page.getByRole('button', {name: 'Create'}).click();

    await expect(page.getByRole('main')).toContainText('PizzaHut');
    await expect(page.getByRole('main')).toContainText('Lehi');

    await page.getByRole('row', { name: 'Lehi' }).getByRole('button', { name: 'Close' }).click();
    await expect(page.getByRole('main')).toContainText('Are you sure you want to close the PizzaHut store Lehi ?');
    await page.getByRole('button', { name: 'Close' }).click();

    await expect(page.getByRole('main')).not.toContainText('Lehi');
});
