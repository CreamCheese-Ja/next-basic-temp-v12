import dayjs from "dayjs";
import "dayjs/locale/ja";
import customParseFormat from "dayjs/plugin/customParseFormat";
import timezone from "dayjs/plugin/timezone";
import utc from "dayjs/plugin/utc";
dayjs.locale("ja");
dayjs.extend(customParseFormat);
dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.tz.setDefault("Asia/Tokyo");

/**
 * 日付をフォーマットするクラス
 */
class DateTime {
  #date: Date;
  constructor(date?: Date | string | null) {
    if (date instanceof Date) {
      this.#date = date;
    } else if (typeof date === "string") {
      const safariSupportDate = DateTime.formatSafariSupport(date);
      if (DateTime.isDate(safariSupportDate)) {
        this.#date = new Date(safariSupportDate);
      } else {
        // NOTE: 無効なフォーマットであっても、日付を設定する。
        this.#date = new Date();
      }
    } else {
      // NOTE: 無効なフォーマットであっても、日付を設定する。
      this.#date = new Date();
    }
  }

  get date() {
    return this.#date;
  }

  /**
   * Date型のフォーマットをSafariがサポートする形式に変換する関数
   * DOC: https://qiita.com/pearmaster8293/items/b5b0df28147eb049f1ea
   *
   * @returns yyyy/mm/dd
   */
  static formatSafariSupport = (v: string) => {
    return v.toString().replace(/-/g, "/");
  };

  static isDate = (v: string | number) => !isNaN(new Date(v).getTime());

  /**
   * @returns yyyy年mm月dd日
   */
  toJpString = () => {
    return `${this.#date.getFullYear()}年${
      this.#date.getMonth() + 1
    }月${this.#date.getDate()}日`;
  };

  /**
   * @returns yyyy年mm月dd日（曜日）
   */
  toJpStringWithWeek = () => {
    const week = ["日", "月", "火", "水", "木", "金", "土"];
    const dayOfWeek = week[this.#date.getDay()];
    if (this.#date === undefined || dayOfWeek === undefined) return "ー";
    return `${this.toJpString()}（${dayOfWeek}）`;
  };

  /**
   * 時間のみ所得する
   * @returns hh:mm
   */
  toOnlyTime = () => {
    const localeString = this.#date.toLocaleString("ja-JP").split(" ");
    // hh:mm:ssの場合はssを取り除く
    if (localeString[1].match(/^[0-9]{1,2}:[0-9]{2}:[0-9]{2}$/)) {
      const [hh, mm, _ss] = localeString[1].split(":");
      return hh.length === 1 ? `0${hh}:${mm}` : `${hh}:${mm}`;
    }

    return localeString[1];
  };

  /**
   * @returns YYYY-MM-DD
   */
  toDateString = () => {
    return dayjs(this.#date).tz().format("YYYY-MM-DD");
  };

  /**
   * @returns YYYY年MM月DD日
   */
  toDateJpString = () => {
    return dayjs(this.#date).tz().format("YYYY年MM月DD日");
  };

  /**
   * @returns YYYY-MM-DD HH:mm
   */
  toDateStringWithTime = () => {
    return dayjs(this.#date).tz().format("YYYY-MM-DD HH:mm");
  };

  /**
   * @returns YYYY-MM-DD HH:mm:ss
   */
  toDateTimeString = () => {
    return dayjs(this.#date).tz().format("YYYY-MM-DD HH:mm:ss");
  };

  /**
   * 指定した日数を加算した日を返す
   * @returns YYYY-MM-DD
   */
  afterDay = (day: number) => {
    return dayjs(this.#date).tz().add(day, "d").format("YYYY-MM-DD");
  };

  /**
   * 指定した日数を加算した日(DateTime型)を返す
   * @returns DateTime
   */
  addDate = (day: number) => {
    return new DateTime(dayjs(this.#date).tz().add(day, "d").toDate());
  };

  /**
   * 指定した日数を減算した日(DateTime型)を返す
   * @returns DateTime
   */
  subtractDate = (day: number) => {
    return new DateTime(dayjs(this.#date).tz().subtract(day, "d").toDate());
  };

  /**
   * 指定した年数後の1月1日を返す
   * @returns YYYY-MM-DD
   */
  yearsLaterNewYearsDate = (year: number) => {
    return dayjs().add(year, "y").startOf("year").format("YYYY-MM-DD");
  };

  /**
   * @returns yyyymmdd_hhmmss
   */
  toDateName = () => {
    return dayjs(this.#date).tz().format("YYYYMMDD_HHmmss");
  };

  /**
   * @boolean 指定した日付がdateTimeの後に存在するかの真偽値
   */
  isBefore = (date: string) => {
    return dayjs(this.#date).isBefore(date);
  };

  /**
   * @number 指定した日付とdateTimeの日数差を算出
   */
  DaysDiff = (date: string) => {
    return dayjs(this.#date).diff(date, "day");
  };

  /**
   * @boolean 指定した日付と判定したい日が同日か
   */
  isSameDate = (date: string | Date) => {
    return dayjs(this.#date).isSame(new DateTime(date).#date);
  };

  /**
   * @return {string[]} 美容室入場時間を取得する (30分おきの時間)
   */
  美容室入場時間 = (date: string) => {
    const 年月日時分秒 = "YYYY-MM-DD HH:mm:ss";
    const timesArray: string[] = [];
    for (let i = 8; i < 20; i++) {
      const hour = dayjs(new DateTime(date).#date).hour(i).minute(0).second(0);
      timesArray.push(hour.format(年月日時分秒));
      const time = hour.add(30, "m");
      timesArray.push(time.format(年月日時分秒));
    }

    return timesArray;
  };
}

export default DateTime;
