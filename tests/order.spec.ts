import {test, expect} from '@playwright/test';

//mock out all calls to the backend
//to check things are being mocked out correctly change env.dev variable to bogus url

test('home page', async ({page}) => {
    await page.goto('/');

    expect(await page.title()).toBe('JWT Pizza');
});
