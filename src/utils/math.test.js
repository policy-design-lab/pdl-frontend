import { sum } from './math';

describe('sum function should', () => {
    test('return sum of an array of numbers', () => {
        // eslint-disable-next-line no-undef
        expect(sum([1, 2])).toBe(3);
    });
});
