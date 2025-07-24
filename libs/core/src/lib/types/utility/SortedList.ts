type CompareFunction<T> = (a: T, b: T) => number;
type UniqueIdentifierFunction<T> = (item: T) => string;

class SortedList<T> {
  /**
   * Creates a SortedList from an existing array.
   * The array will be sorted according to the compareFn.
   *
   * @param itemArray The array to create the SortedList from.
   * @param compareFn The comparison function.
   * @returns A new SortedList instance.
   */
  static fromArray<T>(
    itemArray: T[],
    compareFn: CompareFunction<T>,
    uniqueIdentifierFn?: UniqueIdentifierFunction<T>
  ): SortedList<T> {
    const list = new SortedList<T>(compareFn, uniqueIdentifierFn);
    itemArray.forEach((item) => list.add(item));
    return list;
  }

  private items: T[];
  private compare: CompareFunction<T>;

  private uniqueIdentifierFn?: UniqueIdentifierFunction<T> | undefined;
  private currentIdentifiers: Set<string> | undefined;

  /**
   * Creates a new SortedList instance.
   *
   * @param compareFn A function that defines the sort order (like Array.prototype.sort).
   * @param uniqueIdentifierFn An optional function that extracts a unique string identifier from an item.
   * If provided, the list will prevent adding duplicate identifiers.
   */
  constructor(
    compareFn: CompareFunction<T>,
    uniqueIdentifierFn?: UniqueIdentifierFunction<T> | undefined
  ) {
    if (typeof compareFn !== "function") {
      throw new Error("A comparison function must be provided to SortedList.");
    }

    this.compare = compareFn;
    this.items = [];

    this.uniqueIdentifierFn = uniqueIdentifierFn;
    if (typeof uniqueIdentifierFn === "function") {
      this.currentIdentifiers = new Set<string>();
    }
  }

  /**
   * Adds an item to the list, maintaining the sorted order.
   *
   * Avoids adding duplicates if the unique identifier function has been provided.
   *
   * Uses binary search to find the correct insertion point.
   *
   * @param item The item to add.
   * @returns True if the item was added (not a duplicate), false otherwise.
   */
  add(item: T): boolean {
    if (
      typeof this.uniqueIdentifierFn === "function" &&
      this.currentIdentifiers
    ) {
      // The check for `typeof this.uniqueIdentifierFn === "function"` ensures it's not undefined.
      const identifier = this.uniqueIdentifierFn(item);
      if (this.currentIdentifiers.has(identifier)) {
        return false;
      }
      this.currentIdentifiers.add(identifier);
    }

    let low = 0;
    let high = this.items.length - 1;
    let insertIndex = this.items.length; // Default to end if item is the largest

    while (low <= high) {
      const mid = Math.floor((low + high) / 2);
      const comparison = this.compare(item, this.items[mid] as T); // Cast to T, as mid will always be a valid index

      if (comparison < 0) {
        // item comes before items[mid], so search in the left half
        insertIndex = mid; // Potential insertion point
        high = mid - 1;
      } else {
        // item comes after or is equal to items[mid], search in the right half
        low = mid + 1;
      }
    }

    this.items.splice(insertIndex, 0, item);

    return true;
  }

  /**
   * Gets the item at the specified index.
   *
   * @param index The index of the item.
   * @returns The item at the index, or undefined if index is out of bounds.
   */
  get(index: number): T | undefined {
    if (index < 0 || index >= this.items.length) {
      return undefined;
    }
    return this.items[index];
  }

  /**
   * Returns the index of the first occurrence of an item that compares as equal
   * to the search item, according to the list's comparison function.
   *
   * @param item The item to search for.
   * @returns The index of the item, or -1 if no such item is found.
   */
  indexOf(item: T): number {
    let low = 0;
    let high = this.items.length - 1;
    let resultIndex = -1; // Stores the potential index of the first match

    while (low <= high) {
      const mid = Math.floor((low + high) / 2);
      const comparison = this.compare(item, this.items[mid] as T);

      if (comparison === 0) {
        // Found an item that compares as equal.
        // This 'mid' is a candidate. We need the *first* such match,
        // so we continue searching in the left half (earlier indices).
        resultIndex = mid;
        high = mid - 1;
      } else if (comparison < 0) {
        // Search item is smaller, go left.
        high = mid - 1;
      } else {
        // Search item is larger, go right.
        low = mid + 1;
      }
    }

    // After the loop, resultIndex will hold the index of the *first* element
    // that compared as equal to `item` (if any).
    // We do not need a secondary strict equality check because the compareFn
    // itself defines what "equal" means for this list.
    return resultIndex;
  }

  /**
   * Removes the first occurrence of the specified item from the list.
   *
   * @param item The item to remove.
   * @returns True if the item was found and removed, false otherwise.
   */
  remove(item: T): boolean {
    const index = this.indexOf(item);
    if (index !== -1) {
      this.items.splice(index, 1);
      return true;
    }
    return false;
  }

  /**
   * Removes the item at the specified index.
   *
   * @param index The index of the item to remove.
   * @returns The removed item, or undefined if the index is out of bounds.
   */
  removeAt(index: number): T | undefined {
    if (index < 0 || index >= this.items.length) {
      return undefined;
    }
    return this.items.splice(index, 1)[0];
  }

  /**
   * Removes all items from the list.
   */
  clear(): void {
    this.items.length = 0;
  }

  /**
   * Returns the number of items in the list.
   */
  get size(): number {
    return this.items.length;
  }

  /**
   * Returns a shallow copy of the underlying sorted array.
   * This allows you to iterate over the items without mutating the internal state directly.
   */
  toArray(): T[] {
    return [...this.items];
  }
}

export { SortedList };
export type { CompareFunction };
