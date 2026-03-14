import dayjs from "dayjs";

export const getDate = () => dayjs().add(7, 'hour').toDate();