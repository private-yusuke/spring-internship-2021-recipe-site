import { NextPage } from "next";
import Head from "../../components/head";
import Header from "../../components/header";
import RecipeList from "../../components/recipe-list";
import { Recipe } from "../../lib/recipe";
import {
  fetchBookmark,
  initializeBookmark,
  prevOrNextPageExists,
} from "../../lib/client/bookmark";
import { useEffect, useState } from "react";
import { useRouter } from "next/dist/client/router";
import {
  SortingOrder,
  sortingOrderToString,
  sortingOrders,
} from "../../lib/client/bookmark";
import CurrentPageStateMessage from "../../components/current-page-state-message";
import Link from "next/link";
import getCurrentFullUrl from "../../lib/current-full-url";

type Props = {
  // このページで表示するレシピのリスト
  recipes: Recipe[];

  // ページネーション可能なとき、次のページに遷移するときに利用するパラメータを格納
  nextRecipeAPIParamsString?: string;

  // ページネーション可能なとき、前のページに遷移するときに利用するパラメータを格納
  prevRecipeAPIParamsString?: string;
};

type BookmarkLoadingState = "Loading" | "Error" | "Loaded" | "Reset";

// 反復処理可能なunion型
// https://www.kabuku.co.jp/developers/good-bye-typescript-enum

const TopPage: NextPage = () => {
  const router = useRouter();

  // ブックマークとして表示するレシピの取得状況
  const [
    bookmarkLoadingState,
    setBookmarkLoadingState,
  ] = useState<BookmarkLoadingState>("Loading");

  // ブックマークとして表示するレシピの配列
  const [bookmarkedRecipes, setBookmarkedRecipes] = useState<Recipe[]>([]);

  // 整列順序
  const [sortingOrder, setSortingOrder] = useState<SortingOrder>(
    "BookmarkedDateReverseChronologicalOrder"
  );

  // 次のページへのリンクに付与されるクエリパラメーターの文字列
  const [nextRecipeAPIParamsString, setNextRecipeAPIParamsString] = useState<
    string | null
  >(null);

  // 前のページへのリンクに付与されるクエリパラメーターの文字列
  const [prevRecipeAPIParamsString, setPrevRecipeAPIParamsString] = useState<
    string | null
  >(null);

  useEffect(() => {
    (async () => {
      let params = new URL(getCurrentFullUrl(router.asPath)).searchParams;
      // 読み込み中の表示に切り替え
      setBookmarkLoadingState("Loading");

      // ブックマークのデータベースを初期化
      try {
        await initializeBookmark();
      } catch (e) {
        setBookmarkLoadingState("Error");
        return;
      }

      let state: BookmarkLoadingState;
      let page = params.get("page") ? Number(params.get("page")) : 1;
      let sortingOrder: SortingOrder =
        (params.get("sortingOrder") as SortingOrder) ||
        "BookmarkedDateReverseChronologicalOrder";

      setSortingOrder(sortingOrder);

      let [prevPageExists, nextPageExists] = await prevOrNextPageExists(page);

      if (prevPageExists)
        setPrevRecipeAPIParamsString(
          new URLSearchParams({
            page: (page - 1).toString(),
            sortingOrder,
          }).toString()
        );
      else setPrevRecipeAPIParamsString(null);
      if (nextPageExists) {
        setNextRecipeAPIParamsString(
          new URLSearchParams({
            page: (page + 1).toString(),
            sortingOrder,
          }).toString()
        );
      } else setNextRecipeAPIParamsString(null);

      try {
        const recipes = await fetchBookmark(page, sortingOrder);
        setBookmarkedRecipes(recipes);
        state = "Loaded";
      } catch (e) {
        console.error(e);
        state = "Error";
      }
      setBookmarkLoadingState(state);
    })();
  }, [router.asPath]);

  // 整列順序が変更されたときは1ページ目からその順に表示させる
  const onSortingOrderSelectionChanged = (e) => {
    const newSortingOrder = e.target.value as SortingOrder;
    router.push(
      `/bookmark?${new URLSearchParams({
        page: "1",
        sortingOrder: newSortingOrder,
      })}`
    );
  };

  const recipeListProps = {
    recipes: bookmarkedRecipes,
    nextRecipeAPIParamsString,
    prevRecipeAPIParamsString,
  };

  return (
    <div>
      <Head title="料理板 ─ ブックマーク" />
      <Header />
      <div className="p-4 border-b-2">
        <select
          name="sorting-order-selector"
          id="sorting-order-selector"
          className="w-full"
          onChange={onSortingOrderSelectionChanged}
          value={sortingOrder}
        >
          {sortingOrders.map((so) => {
            return (
              <option value={so} key={so}>
                {sortingOrderToString(so)}
              </option>
            );
          })}
        </select>
      </div>
      {bookmarkLoadingState === "Loading" ? (
        <div>Loading...</div>
      ) : bookmarkLoadingState === "Error" ? (
        <div>Error</div>
      ) : bookmarkedRecipes.length > 0 ? (
        <div>
          <RecipeList {...recipeListProps} />
          <Link href="bookmark/reset">
            <div className="block text-center text-lg p-2 mx-5 my-2 mb-4 bg-yellow-200 hover:bg-yellow-300 font-bold rounded">
              ブックマークを全て削除する
            </div>
          </Link>
        </div>
      ) : (
        <CurrentPageStateMessage message="ブックマークされているレシピが見つかりませんでした。" />
      )}
    </div>
  );
};
export default TopPage;
