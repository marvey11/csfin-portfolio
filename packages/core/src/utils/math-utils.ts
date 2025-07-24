import { FLOATING_POINT_TOLERANCE } from "@csfin-toolkit/shared";

const areEffectivelyEqual = (a: number, b: number): boolean => {
  return isEffectivelyZero(a - b);
};

const isEffectivelyZero = (num: number): boolean => {
  return Math.abs(num) < FLOATING_POINT_TOLERANCE;
};

export { areEffectivelyEqual, isEffectivelyZero };
