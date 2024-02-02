import { gridGap } from "./dimensions";

export function round(dimension: number) {
  return Math.round(dimension / gridGap) * gridGap;
}
