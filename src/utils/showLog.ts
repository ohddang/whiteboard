export const showLog = (msg: string) => {
  const date = new Date();

  const formatTimeUnit = (unit: number) => unit.toString().padStart(2, "0");

  const hours = formatTimeUnit(date.getHours());
  const minutes = formatTimeUnit(date.getMinutes());
  const seconds = formatTimeUnit(date.getSeconds());

  console.log(`[${hours}:${minutes}:${seconds}] ${msg}`);
};
