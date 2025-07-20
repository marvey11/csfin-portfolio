import { crc32 } from "crc";

type ChecksumInput = string | number | boolean | Date | null | undefined;

const calculateGenericChecksum = (...data: ChecksumInput[]): string => {
  const stringToHash = data
    .map((item) => {
      if (item instanceof Date) {
        return item.toISOString();
      }
      return String(item);
    })
    .join(":");

  return crc32(stringToHash).toString(16).padStart(16, "0");
};

export { calculateGenericChecksum };
