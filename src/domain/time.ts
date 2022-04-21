export const dateToUnixTime = (date: Date) => Math.floor(date.getTime() / 1000);

export const unixTimeToDate = (unixTime: number) => new Date(unixTime * 1000);
