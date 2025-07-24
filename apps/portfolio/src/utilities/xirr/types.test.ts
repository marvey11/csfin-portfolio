describe("Test Suite for types", () => {
  it("should pass basic tests", () => {
    const obj = { cashDate: new Date("2025-07-13"), cashAmount: 100 };
    expect(obj.cashAmount).toStrictEqual(100);
  });
});
