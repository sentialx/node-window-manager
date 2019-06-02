import { join } from "path";
import { execFileSync } from "child_process";

const bin = join(__dirname, "../build/macos");

const parse = (stdout: any) => {
  try {
    const result = JSON.parse(stdout);
    if (result !== null) {
      return result;
    }
  } catch (error) {
    console.error(error);
    throw new Error("Error parsing window data");
  }
};

export const getActiveWindow = () => {
  return parseInt(
    execFileSync(bin, ["getActiveWindow"], { encoding: "utf8" }),
    10
  );
};

export const getWindowInfoById = (id: number) => {
  return parse(
    execFileSync(bin, ["getWindowInfoById", id.toString()], {
      encoding: "utf8"
    })
  );
};

export const setWindowBounds = (id: number, bounds: any) => {
  execFileSync(
    bin,
    [
      "setBounds",
      id.toString(),
      bounds.x,
      bounds.y,
      bounds.width,
      bounds.height
    ],
    { encoding: "utf8" }
  );
};
