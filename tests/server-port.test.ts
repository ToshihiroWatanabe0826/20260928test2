import { describe, expect, it } from "vitest";
import { parseServerPort } from "../src/server-port.js";

describe("server port validation", () => {
  it.each([
    [undefined, 4174],
    ["0", 0],
    ["4174", 4174],
    ["65535", 65535]
  ])("accepts %s", (value, expected) => {
    expect(parseServerPort(value)).toBe(expected);
  });

  it.each(["-1", "port", "1.5", "65536", " 4174"])(
    "rejects %s",
    (value) => {
      expect(() => parseServerPort(value))
        .toThrow("PORT must be an integer between 0 and 65535.");
    }
  );
});
