import {test, expect} from 'playwright-test-coverage';
import {Page} from "playwright";
import {Role, User} from "../src/service/pizzaService";


async function adminLogin(page: Page) {
    let loggedInUser: User | undefined;
    const validUsers: Record<string, User> = {
        'admin@jwt.com': {
            id: '3',
            name: 'zog',
            email: 'admin@jwt.com',
            password: 'admin',
            roles: [{role: Role.Admin}]
        }
    };

    const franchises = [
        {
            id: '2',
            name: 'LotaPizza',
            admins: [{id: '1', name: 'kai', email: 'kai@jwt.com'}],
            stores: [
                {id: '4', name: 'Lehi', totalRevenue: 1000},
                {id: '5', name: 'Springville', totalRevenue: 2000},
                {id: '6', name: 'American Fork', totalRevenue: 3000},
            ],
        },
        {id: '3', name: 'PizzaCorp', admins: [{id: '2', name: 'fido', email: 'fido@jwt.com'}], stores: [{id: '7', name: 'Spanish Fork', totalRevenue: 500}]},
        {id: '4', name: 'topSpot', admins: [], stores: []},
    ];

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

    // Standard franchises and stores
    await page.route(/\/api\/franchise(\?.*)?$/, async (route) => {
        if (route.request().method() === 'GET') {
            const franchiseRes = {
                franchises: franchises,
                more: false,
            };
            await route.fulfill({json: franchiseRes});
        } else if (route.request().method() === 'POST') {
            const franchiseReq = route.request().postDataJSON();
            const newFranchise = {
                id: (franchises.length + 2).toString(),
                name: franchiseReq.name,
                admins: franchiseReq.admins.map((a: any, i: number) => ({id: (i + 10).toString(), name: 'new admin', email: a.email})),
                stores: [],
            };
            franchises.push(newFranchise);
            await route.fulfill({json: newFranchise});
        }
    });

    await page.route(/\/api\/franchise\/(\d+)$/, async (route) => {
        if (route.request().method() === 'DELETE') {
            const url = route.request().url();
            const id = url.split('/').pop();
            const index = franchises.findIndex(f => f.id === id);
            if (index !== -1) {
                franchises.splice(index, 1);
            }
            await route.fulfill({json: {message: 'franchise closed'}});
        }
    });

    await page.goto('/');

    // Login
    await page.getByRole('link', {name: 'Login'}).click();
    await page.getByPlaceholder('Email address').fill('admin@jwt.com');
    await page.getByPlaceholder('Password').fill('admin');
    await page.getByRole('button', {name: 'Login'}).click();

    //check if Admin
    await page.getByRole('link', {name: 'z'}).click();
    await expect(page.getByRole('main')).toContainText('admin');
}

test('adminDashboardTest', async ({page}) => {
    await adminLogin(page);

    // Go to admin dashboard
    await page.getByRole('link', {name: 'Admin'}).click();
    await expect(page.getByRole('heading', { name: 'Franchises' })).toBeVisible();

    // Create franchise
    await page.getByRole('button', { name: 'Add Franchise' }).click();
    await page.getByPlaceholder('franchise name').fill('New Franchise');
    await page.getByPlaceholder('franchisee admin email').fill('new@jwt.com');
    await page.getByRole('button', { name: 'Create' }).click();

    // Verify created
    await expect(page.getByRole('main')).toContainText('New Franchise');

    // Delete franchise
    await page.getByRole('row', { name: 'New Franchise' }).getByRole('button', { name: 'Close' }).click();
    await expect(page.getByRole('main')).toContainText('Are you sure you want to close the New Franchise franchise?');
    await page.getByRole('button', { name: 'Close' }).click();

    // Verify deleted
    await expect(page.getByRole('main')).not.toContainText('New Franchise');
});