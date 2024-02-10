export const showLog = (...msg: any) => {
  const date = new Date();

  const formatTimeUnit = (unit: number) => unit.toString().padStart(2, "0");

  const hours = formatTimeUnit(date.getHours());
  const minutes = formatTimeUnit(date.getMinutes());
  const seconds = formatTimeUnit(date.getSeconds());

  const allmsg = msg.map((m: any) => (typeof m === "string" ? m : JSON.stringify(m))).join(" ");

  console.log(`[${hours}:${minutes}:${seconds}] ${allmsg}`);
};
