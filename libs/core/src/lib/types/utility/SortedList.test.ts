import { formatNormalizedDate } from "../../utils/formatters.js";
import { CompareFunction, SortedList } from "./SortedList.js";

describe("Test Suite for the SortedList class", () => {
  describe("Using numbers as list elements", () => {
    const compareNumbers: CompareFunction<number> = (a, b) => a - b;
    let numberList: SortedList<number>;

    beforeEach(() => {
      numberList = new SortedList<number>(compareNumbers);
      numberList.add(5);
      numberList.add(2);
      numberList.add(8);
      numberList.add(1);
      numberList.add(5); // Adding a duplicate
      numberList.add(3);
    });

    it("should pass basic tests", () => {
      expect(numberList.toArray()).toEqual([1, 2, 3, 5, 5, 8]);
      expect(numberList.size).toStrictEqual(6);
      expect(numberList.get(2)).toStrictEqual(3);
      expect(numberList.indexOf(5)).toStrictEqual(3);
      expect(numberList.indexOf(10)).toStrictEqual(-1);
      expect(numberList.get(10)).toBeUndefined();
    });

    it("should behave correctly when removing elements", () => {
      numberList.remove(5);
      expect(numberList.toArray()).toEqual([1, 2, 3, 5, 8]);

      numberList.removeAt(0);
      expect(numberList.toArray()).toEqual([2, 3, 5, 8]);

      expect(numberList.remove(10)).toBeFalsy();

      numberList.clear();
      expect(numberList.toArray()).toEqual([]);

      expect(numberList.removeAt(0)).toBeUndefined();
    });

    it("should behave correctly with lists created from arrays", () => {
      const listFromArray = SortedList.fromArray(
        [9, 3, 7, 2, 6],
        compareNumbers
      );
      expect(listFromArray.toArray()).toEqual([2, 3, 6, 7, 9]);
      listFromArray.add(4);
      expect(listFromArray.toArray()).toEqual([2, 3, 4, 6, 7, 9]);
    });

    it("should return the correct index when dealing with a list of many duplicates", () => {
      const newList = SortedList.fromArray(
        [5, 5, 10, 9, 5, 5, 2, 1, 5, 5],
        compareNumbers
      );

      expect(newList.toArray()).toEqual([1, 2, 5, 5, 5, 5, 5, 5, 9, 10]);

      expect(newList.size).toStrictEqual(10);
      expect(newList.indexOf(5)).toStrictEqual(2);
      newList.remove(5);
      expect(newList.indexOf(5)).toStrictEqual(2);
    });

    it("should throw an exception when given an invalid comparison function", () => {
      const errorMessage =
        "A comparison function must be provided to SortedList.";

      expect(
        // deliberately overwrite the constructor argument
        () => new SortedList(undefined as unknown as CompareFunction<number>)
      ).toThrow(errorMessage);

      expect(
        // deliberately overwrite the constructor argument
        () => new SortedList(null as unknown as CompareFunction<number>)
      ).toThrow(errorMessage);
    });
  });

  describe("Using objects as list elements", () => {
    interface Event {
      name: string;
      date: Date;
    }

    const compareEventsByDate: CompareFunction<Event> = (a, b) => {
      // Normalize dates to ensure only year-month-day are compared if time is irrelevant
      const normalizeDate = (d: Date) => {
        const n = new Date(d);
        n.setUTCHours(0, 0, 0, 0);
        return n.getTime();
      };

      const timeA = normalizeDate(a.date);
      const timeB = normalizeDate(b.date);

      return timeA - timeB;
    };

    let eventList: SortedList<Event>;

    beforeEach(() => {
      eventList = new SortedList<Event>(compareEventsByDate);
      eventList.add({ name: "Meeting", date: new Date("2023-10-26") });
      eventList.add({ name: "Project Deadline", date: new Date("2023-11-15") });
      eventList.add({ name: "Launch Party", date: new Date("2023-10-10") });
      eventList.add({ name: "Review", date: new Date("2023-11-15T10:00:00Z") }); // Same day as Deadline, should go after
    });

    it("should pass basic tests", () => {
      expect(eventList.size).toStrictEqual(4);
      expect(
        eventList
          .toArray()
          .map((e) => e.name)
          .join(", ")
      ).toStrictEqual("Launch Party, Meeting, Project Deadline, Review");
    });

    it("should correctly return the indices of object items", () => {
      expect(
        eventList.indexOf({
          name: "Launch Party",
          date: new Date("2023-10-10"),
        })
      ).toStrictEqual(0);
      expect(
        eventList.indexOf({ name: "Meeting", date: new Date("2023-10-26") })
      ).toStrictEqual(1);

      expect(
        eventList.indexOf({
          name: "Non-existent Event",
          date: new Date("2024-01-01"),
        })
      ).toStrictEqual(-1);
    });

    it("should correctly remove object items", () => {
      eventList.remove({
        name: "Launch Party",
        date: new Date("2023-10-10"),
      });
      expect(
        eventList
          .toArray()
          .map((e) => e.name)
          .join(", ")
      ).toStrictEqual("Meeting, Project Deadline, Review");

      eventList.removeAt(0);
      expect(
        eventList
          .toArray()
          .map((e) => e.name)
          .join(", ")
      ).toStrictEqual("Project Deadline, Review");
    });

    it("should correctly avoid duplicate objects", () => {
      const noDuplicates = new SortedList<Event>(compareEventsByDate, (item) =>
        formatNormalizedDate(item.date)
      );

      expect(noDuplicates.size).toStrictEqual(0);

      noDuplicates.add({ name: "Meeting", date: new Date("2023-10-26") });
      noDuplicates.add({
        name: "Another Meeting",
        date: new Date("2023-10-27"),
      });
      noDuplicates.add({
        name: "Meeting #3",
        date: new Date("2023-10-26"),
      });

      expect(noDuplicates.size).toStrictEqual(2);
    });
  });
});
