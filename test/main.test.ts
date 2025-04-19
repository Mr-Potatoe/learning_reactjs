"use strict";

import { test, expect } from 'vitest';

function add(a: number, b: number): number {
  return a + b;
}

test('adds 1 + 2 = 3', () => {
  expect(add(1, 4)).toBe(5);
});

test('adds 1 + 2 = 3', () => {
  expect(add(1, 2)).toBe(3);
});

interface Product {
 i : number;
 y : number;
}

const values: Product = {
  i: 5 ,
  y: 10 ,
};

const product = values.i * values.y;
console.log('Product:', product);

