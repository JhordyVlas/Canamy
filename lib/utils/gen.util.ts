import crypto from "node:crypto";

const Str = (min: number, max: number) => {
  const length = Math.floor(Math.random() * (max - min + 1)) + min;
  return crypto
    .randomBytes(Math.ceil(length / 2))
    .toString("hex")
    .slice(0, length);
};

const Num = (min: number, max: number) => {
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

const Generate = {
  Str,
  Num,
};

export default Generate;
