import { expect, test } from '@playwright/test';

test('explorer, search, profiles, comparison, missions, and events are navigable', async ({ page }) => {
  const consoleErrors: string[] = [];
  page.on('console', (message) => {
    if (message.type() === 'error') consoleErrors.push(message.text());
  });
  page.on('pageerror', (error) => consoleErrors.push(error.message));

  await page.goto('/');
  await expect(page.getByRole('heading', { name: /Explore the universe/i })).toBeVisible();
  await page.getByRole('link', { name: /Enter the observatory/i }).click();
  await expect(page).toHaveURL(/\/explore$/);

  const sunSceneLabel = page.getByRole('button', { name: 'Select Sun' });
  await expect(sunSceneLabel).toBeVisible();
  await sunSceneLabel.click();
  await page.getByRole('button', { name: /Accessible data mode/i }).click();
  await page.getByRole('button', { name: /Sun/i }).first().click();
  await expect(page.getByRole('heading', { name: 'Sun' })).toBeVisible();
  await page.getByRole('link', { name: /Open full profile/i }).click();
  await expect(page).toHaveURL(/\/objects\/sun$/);
  await expect(page.getByRole('heading', { name: 'Sun.' })).toBeVisible();

  const search = page.getByRole('searchbox', { name: /Search astronomical objects/i });
  await search.fill('Mars');
  await page.getByRole('option', { name: /^Mars\b/ }).click();
  await expect(page).toHaveURL(/\/objects\/mars$/);
  await expect(page.getByRole('heading', { name: 'Mars.' })).toBeVisible();

  await page.getByRole('button', { name: /Compare/i }).click();
  await expect(page).toHaveURL(/\/compare/);
  await expect(page.getByRole('heading', { name: /Worlds, in perspective/i })).toBeVisible();

  await page.goto('/missions');
  await expect(page.getByRole('heading', { name: /Machines that made us look/i })).toBeVisible();
  await page.getByRole('link', { name: /Voyager 1/i }).click();
  await expect(page).toHaveURL(/\/missions\/voyager-1$/);
  await expect(page.getByRole('heading', { name: /Voyager 1/i })).toBeVisible();

  await page.goto('/events');
  await expect(page.getByRole('heading', { name: /Look up/i })).toBeVisible();
  await expect(page.getByText(/No verified event dates/i)).toBeVisible();
  expect(consoleErrors).toEqual([]);
});

test('mobile explorer offers touch-friendly navigation and data mode', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/solar-system');
  await expect(page.getByRole('navigation', { name: 'Explorer quick links' })).toBeVisible();
  await expect(page.getByRole('button', { name: /Accessible data mode/i })).toBeVisible();
  await page.getByRole('button', { name: /Accessible data mode/i }).click();
  await expect(page.getByRole('button', { name: /Switch to 3D view/i })).toBeVisible();
  await page.getByRole('link', { name: /Planets/i }).last().click();
  await expect(page).toHaveURL(/\/planets$/);
  await expect(page.getByRole('heading', { name: 'Planets.' })).toBeVisible();
});
