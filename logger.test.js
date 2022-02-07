const logger = require("./logger");

test("expects logger level to be info", () => {
  expect(logger.level).toBe("info");
});
