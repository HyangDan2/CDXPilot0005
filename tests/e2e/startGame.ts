import type { Page } from '@playwright/test';

export async function startGame(
  page: Page,
  stage: 'gate' | 'forge' | 'monastery' = 'gate',
  touch = false,
) {
  const activate = (selector: string) =>
    touch ? page.locator(selector).tap() : page.locator(selector).click();
  await activate('#start-button');
  if (stage !== 'gate') await activate(`#stage-${stage}`);
  await activate('#start-selected-stage');
}
