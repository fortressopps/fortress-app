import { getPaginationParams, getPaginationMetaWithOptions, toSkipTake } from "../src/utils/pagination";

describe('pagination utils', () => {
  test('getPaginationParams defaults', () => {
    const params = getPaginationParams();
    expect(params.page).toBe(1);
    expect(params.pageSize).toBe(20);
  });

  test('getPaginationParams parses integers and clamps', () => {
    const url = new URLSearchParams();
    url.set('page', '3');
    url.set('pageSize', '50');
    const p = getPaginationParams(url);
    expect(p.page).toBe(3);
    expect(p.pageSize).toBe(50);
  });

  test('getPaginationParams ignores decimals and invalid', () => {
    const url = new URLSearchParams();
    url.set('page', '2.5');
    url.set('pageSize', 'abc');
    const p = getPaginationParams(url);
    expect(p.page).toBe(1); // decimals rejected
    expect(p.pageSize).toBe(20); // invalid rejected
  });

  test('getPaginationMetaWithOptions clamp off', () => {
    const meta = getPaginationMetaWithOptions(95, 10, 10, { clampPage: false });
    expect(meta.totalPages).toBe(10);
    expect(meta.page).toBe(10);
  });

  test('toSkipTake computes correctly', () => {
    const { skip, take } = toSkipTake(2, 25);
    expect(skip).toBe(25);
    expect(take).toBe(25);
  });
});
