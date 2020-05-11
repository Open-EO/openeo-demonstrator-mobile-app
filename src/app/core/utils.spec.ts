import {
    degToRad,
    distanceLatitude,
    distanceLongitude,
    rotatingClamp
} from './utils';

describe('rotatingClamp', () => {
    it('returns max for lower than allowed value', () => {
        expect(rotatingClamp(0, 1, 10)).toBe(10);
    });
    it('returns min for higher than allowed value', () => {
        expect(rotatingClamp(11, 1, 10)).toBe(1);
    });
    it('returns the same number for a value within the range', () => {
        expect(rotatingClamp(5, 1, 10)).toBe(5);
    });
});

describe('degToRad', () => {
    it('returns 0 for 0', () => {
        expect(degToRad(0)).toBe(0);
    });
    it('returns PI/2 for 90deg', () => {
        expect(degToRad(90)).toBe(Math.PI / 2);
    });
    it('returns PI for 180deg', () => {
        expect(degToRad(180)).toBe(Math.PI);
    });
    it('returns 2PI for 360deg', () => {
        expect(degToRad(360)).toBe(2 * Math.PI);
    });
    it('returns 3PI for 540deg', () => {
        expect(degToRad(540)).toBe(3 * Math.PI);
    });
});

describe('distanceLongitude', () => {
    it('calculates the correct distance for N/E', () => {
        expect(Math.round(distanceLongitude(7.2, 7.3, 47.8))).toBe(7477);
    });
    it('calculates the correct distance for S/E', () => {
        expect(Math.round(distanceLongitude(7.2, 7.3, -47.8))).toBe(7477);
    });
    it('calculates the correct distance for N/W', () => {
        expect(Math.round(distanceLongitude(-7.2, -7.3, 47.8))).toBe(7477);
    });
    it('calculates the correct distance for S/W', () => {
        expect(Math.round(distanceLongitude(-7.2, -7.3, -47.8))).toBe(7477);
    });
    it('calculates the correct distance for N', () => {
        expect(Math.round(distanceLongitude(-7.2, 4.2, -47.8))).toBe(851651);
    });
});

describe('distanceLatitude', () => {
    it('calculates the correct distance for S to N', () => {
        expect(Math.round(distanceLatitude(-7.2, 7.3))).toBe(1614098);
    });
    it('calculates the correct distance on northern hemisphere', () => {
        expect(Math.round(distanceLatitude(7.2, 7.3))).toBe(11132);
    });
    it('calculates the correct distance on southern hemisphere', () => {
        expect(Math.round(distanceLatitude(-7.2, -7.3))).toBe(11132);
    });
});
