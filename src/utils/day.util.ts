import dayjs from "dayjs";

export const getDate = () => dayjs().add(7, 'hour').toDate();

export const parseDate = (input: string | number | Date) => {
  return dayjs().add(7, 'hour').toDate();
}