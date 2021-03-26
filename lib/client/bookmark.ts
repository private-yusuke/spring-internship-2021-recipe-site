import {
  BOOKMARK_DB_NAME,
  BOOKMARK_DB_VERSION,
  BOOKMARK_DB_RECIPE_LIST_NAME,
  BOOKMARK_RECIPE_AMOUNT_PER_PAGE,
} from "../constants";
import { Recipe } from "../recipe";

// データベースはページ読み込みごとに一度だけ初期化され、ここに保持される
let bookmarkDB: IDBDatabase;

// 反復処理可能なunion型
// https://www.kabuku.co.jp/developers/good-bye-typescript-enum
export const sortingOrders = [
  "PublishedDateChronologicalOrder",
  "PublishedDateReverseChronologicalOrder",
  "BookmarkedDateChronologicalOrder",
  "BookmarkedDateReverseChronologicalOrder",
] as const;
export type SortingOrder = typeof sortingOrders[number];

/**
 * 与えられた整列順序に対応する画面表示用の文字列を返します。
 */
export function sortingOrderToString(sortingOrder: SortingOrder): string {
  switch (sortingOrder) {
    case "PublishedDateChronologicalOrder":
      return "過去に公開された順";
    case "PublishedDateReverseChronologicalOrder":
      return "新しく公開された順";
    case "BookmarkedDateChronologicalOrder":
      return "過去にブックマークした順";
    case "BookmarkedDateReverseChronologicalOrder":
      return "最近ブックマークした順";
    default:
      return null;
  }
}

/**
 * ブックマーク用データベースを初期化します。
 * @returns 初期化に成功した場合は true、すでに初期化されていた場合は false
 */
export async function initializeBookmark(): Promise<boolean> {
  return new Promise<boolean>((resolve, reject) => {
    if (bookmarkDB) resolve(false);
    const req = indexedDB.open(BOOKMARK_DB_NAME, BOOKMARK_DB_VERSION);

    // バージョンが変更された or 初めて利用したときはデータベースを作成しなおす
    req.onupgradeneeded = (e: IDBVersionChangeEvent) => {
      bookmarkDB = (e.target as IDBOpenDBRequest).result;

      // 現在のバージョン（bookmarkDB.version）を見て更新処理みたいなのを書くことができる（が、今回はあったデータは全て削除する）
      if (bookmarkDB.objectStoreNames.contains(BOOKMARK_DB_RECIPE_LIST_NAME))
        bookmarkDB.deleteObjectStore(BOOKMARK_DB_RECIPE_LIST_NAME);

      // ブックマーク追加順でソートをかけられるように autoIncrement を有効に
      const objStore = bookmarkDB.createObjectStore(
        BOOKMARK_DB_RECIPE_LIST_NAME,
        {
          autoIncrement: true,
        } as IDBObjectStoreParameters
      );

      // レシピ ID でブックマークのレシピ登録を削除できるようにインデックスを作成
      objStore.createIndex("id", "id", { unique: true });
      // 公開順でソートをかけたいのでインデックスを作成
      objStore.createIndex("published_at", "published_at", { unique: false });
    };

    // （onupgradeneeded が呼ばれたなら、それが終了した後）データベースを開くことに成功したら resolve
    req.onsuccess = (e: Event) => {
      bookmarkDB = (e.target as IDBOpenDBRequest).result;
      resolve(true);
    };
    req.onerror = (_) => reject(req.error);
  });
}

/**
 * ブックマークに指定したレシピを追加します。
 * @param recipe ブックマークに追加するレシピ
 */
export async function addBookmark(recipe: Recipe): Promise<void> {
  return new Promise<void>((resolve, reject) => {
    if (!bookmarkDB) reject("DB not initialized yet");
    const objStore = bookmarkDB
      .transaction(BOOKMARK_DB_RECIPE_LIST_NAME, "readwrite")
      .objectStore(BOOKMARK_DB_RECIPE_LIST_NAME);

    const req = objStore.add(recipe);

    req.onsuccess = (_) => {
      resolve();
    };
    req.onerror = (_) => reject(req.error);
  });
}

/**
 * 与えられたレシピの情報をブックマークのデータベースに保持しているものを対象に更新します。
 * @param recipe ブックマークに追加するレシピ
 */
export async function updateBookmark(recipe: Recipe): Promise<void> {
  return new Promise<void>((resolve, reject) => {
    if (!bookmarkDB) reject("DB not initialized yet");
    const objStore = bookmarkDB
      .transaction(BOOKMARK_DB_RECIPE_LIST_NAME, "readwrite")
      .objectStore(BOOKMARK_DB_RECIPE_LIST_NAME);

    const req = objStore.index("id").openCursor(IDBKeyRange.only(recipe.id));

    req.onsuccess = (_) => {
      let cursor = req.result;
      cursor.update(recipe);
      resolve();
    };
    req.onerror = (_) => reject(req.error);
  });
}

/**
 * ブックマークから指定された ID に対応するレシピを削除します。
 * @param id 削除するレシピの ID
 * @returns レシピが削除された場合は true, レシピが存在しなかった場合は false
 */
export async function removeBookmark(id: number): Promise<boolean> {
  return new Promise<boolean>((resolve, reject) => {
    if (!bookmarkDB) reject("DB not initialized yet");
    const objStore = bookmarkDB
      .transaction(BOOKMARK_DB_RECIPE_LIST_NAME, "readwrite")
      .objectStore(BOOKMARK_DB_RECIPE_LIST_NAME);

    const req = objStore.index("id").openCursor(id);

    req.onsuccess = (_) => {
      let cursor = req.result;
      if (cursor) {
        cursor.delete();
        resolve(true);
      } else resolve(false);
    };
    req.onerror = (_) => reject(req.error);
  });
}

/**
 * ブックマークに指定したレシピの ID が存在するか判定します。
 * @param id ブックマーク内に存在するか確認するレシピの ID
 */
export async function isInBookmark(id: number): Promise<boolean> {
  return new Promise<boolean>((resolve, reject) => {
    if (!bookmarkDB) reject("DB not initialized yet");
    const objStore = bookmarkDB
      .transaction(BOOKMARK_DB_RECIPE_LIST_NAME, "readonly")
      .objectStore(BOOKMARK_DB_RECIPE_LIST_NAME);

    const req = objStore.index("id").count(id);

    req.onsuccess = (_) => {
      resolve(req.result >= 1);
    };
    req.onerror = (_) => reject(req.error);
  });
}

/**
 * ブックマークに追加されているレシピの配列を返します。
 * @param page ページネーション可能な場合に指定できるページ番号
 * @param sortingOrder 返すレシピの配列の整列順序
 * @returns ページに対応するブックマークに追加されたレシピ ID の配列
 */
export async function fetchBookmark(
  page: number = 1,
  sortingOrder: SortingOrder = "BookmarkedDateReverseChronologicalOrder"
): Promise<Recipe[]> {
  return new Promise<Recipe[]>((resolve, reject) => {
    if (!bookmarkDB) reject("DB not initialized yet");
    const objStore = bookmarkDB
      .transaction(BOOKMARK_DB_RECIPE_LIST_NAME, "readonly")
      .objectStore(BOOKMARK_DB_RECIPE_LIST_NAME);

    let req: IDBRequest<IDBCursorWithValue>;

    // 整列順序に基づいてカーソルを準備
    if (sortingOrder.startsWith("Bookmarked")) {
      req = objStore.openCursor(
        null,
        sortingOrder === "BookmarkedDateReverseChronologicalOrder"
          ? "prev"
          : "next"
      );
    } else {
      req = objStore
        .index("published_at")
        .openCursor(
          null,
          sortingOrder === "PublishedDateReverseChronologicalOrder"
            ? "prev"
            : "next"
        );
    }

    const recipes: Recipe[] = [];

    // 1ページ目より後の場合は幾つかのカラムをスキップする必要がある
    let requireAdvance = page > 1;
    req.onsuccess = (e) => {
      const cursor = (e.target as IDBRequest).result as IDBCursorWithValue;

      if (requireAdvance) {
        // そのページ以前のレシピの分だけカーソルを進めておく
        cursor.advance((page - 1) * BOOKMARK_RECIPE_AMOUNT_PER_PAGE);
        requireAdvance = false;
        return;
      }
      // 最後の要素まで読み取ったか1ページ内に含まれるブックマークを読み切ったら resolve で取得済レシピを返す
      if (cursor && recipes.length < BOOKMARK_RECIPE_AMOUNT_PER_PAGE) {
        recipes.push(cursor.value);
        cursor.continue();
      } else resolve(recipes);
    };
    req.onerror = (_) => reject(req.error);
  });
}

/**
 * ブックマークに登録されているレシピの数を返します。
 * @returns ブックマークに登録されているレシピの数
 */
export async function countBookmark(): Promise<number> {
  return new Promise<number>((resolve, reject) => {
    if (!bookmarkDB) reject("DB not initialized yet");
    const objStore = bookmarkDB
      .transaction(BOOKMARK_DB_RECIPE_LIST_NAME, "readonly")
      .objectStore(BOOKMARK_DB_RECIPE_LIST_NAME);

    const req = objStore.count();

    req.onsuccess = (_) => {
      resolve(req.result);
    };
    req.onerror = (_) => reject(req.error);
  });
}

/**
 * ブックマークを全て削除します。
 */
export async function clearBookmark(): Promise<void> {
  return new Promise<void>((resolve, reject) => {
    if (!bookmarkDB) reject("DB not initialized yet");
    const objStore = bookmarkDB
      .transaction(BOOKMARK_DB_RECIPE_LIST_NAME, "readwrite")
      .objectStore(BOOKMARK_DB_RECIPE_LIST_NAME);

    const req = objStore.clear();

    req.onsuccess = (_) => resolve();
    req.onerror = (_) => reject(req.error);
  });
}

/**
 * 指定した ID のブックマーク内の存在を反転させます。
 * @param recipe ブックマーク内にいる場合は削除し、そうでない場合は追加するレシピ
 * @returns 新たにブックマークに追加された場合は true を、削除された場合は false
 */
export async function toggleBookmark(recipe: Recipe): Promise<boolean> {
  return new Promise<boolean>(async (resolve, reject) => {
    if (!bookmarkDB) reject("DB not initialized yet");
    if (await isInBookmark(recipe.id)) {
      removeBookmark(recipe.id);
      resolve(false);
    } else {
      addBookmark(recipe);
      resolve(true);
    }
  });
}

/**
 * 与えられたページの前後に別のページが存在するか判定します。
 * @param page 前後のページがあるか調べたいページの番号
 * @returns [前ページの存在, 後ページの存在]
 */
export async function prevOrNextPageExists(page: number): Promise<boolean[]> {
  const bookmarkCount = await countBookmark();
  // ブックマーク全体のページ数
  const pageNum = Math.ceil(bookmarkCount / BOOKMARK_RECIPE_AMOUNT_PER_PAGE);

  let prev = page > 1;
  let next = page < pageNum;
  return [prev, next];
}
