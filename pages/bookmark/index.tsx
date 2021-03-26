import { NextPage } from 'next';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/dist/client/router';
import Link from 'next/link';
import Head from '../../components/head';
import Header from '../../components/header';
import RecipeList from '../../components/recipe-list';
import { Recipe } from '../../lib/recipe';
import {
  fetchBookmark,
  initializeBookmark,
  prevOrNextPageExists,
  SortingOrder,
  sortingOrderToString,
  sortingOrders,
} from '../../lib/client/bookmark';

import CurrentPageStateMessage from '../../components/current-page-state-message';
import getCurrentFullUrl from '../../lib/current-full-url';
import { WEBSITE_NAME } from '../../lib/constants';

/** ブックマークとして表示するレシピの取得状態 */
type BookmarkLoadingState = 'Loading' | 'Error' | 'Loaded' | 'Reset';

/** ブックマークページ */
const BookmarkPage: NextPage = () => {
  const router = useRouter();

  // ブックマークとして表示するレシピの取得状況
  const [
    bookmarkLoadingState,
    setBookmarkLoadingState,
  ] = useState<BookmarkLoadingState>('Loading');

  // ブックマークとして表示するレシピの配列
  const [bookmarkedRecipes, setBookmarkedRecipes] = useState<Recipe[]>([]);

  // 整列順序
  const [sortingOrder, setSortingOrder] = useState<SortingOrder>(
    'BookmarkedDateReverseChronologicalOrder'
  );

  // 次のページへのリンクに付与されるクエリパラメーターの文字列
  const [nextRecipeAPIParamsString, setNextRecipeAPIParamsString] = useState<
    string | null
  >(null);

  // 前のページへのリンクに付与されるクエリパラメーターの文字列
  const [prevRecipeAPIParamsString, setPrevRecipeAPIParamsString] = useState<
    string | null
  >(null);

  // パスが変わる（つまりページ遷移や整列順序の変更が発生した）ときに実行される
  useEffect(() => {
    (async () => {
      /*
       * router.query はリロード時に最初は空のオブジェクトとなって直後に中身が入るようになっているので、
       * それによって更新処理が2回走るようになってしまい挙動がおかしくなるのを防ぐために
       * router.asPath を useEffect での監視対象として、router.asPath 自体に含まれる
       * クエリパラメーターをここで取得するような実装になっている。
       */
      const params = new URL(getCurrentFullUrl(router.asPath)).searchParams;
      // 読み込み中の表示に切り替え
      setBookmarkLoadingState('Loading');

      // ブックマークのデータベースを初期化
      try {
        await initializeBookmark();
      } catch (e) {
        setBookmarkLoadingState('Error');
        console.error(e);
        return;
      }

      let state: BookmarkLoadingState;
      const page = params.get('page') ? Number(params.get('page')) : 1;
      const sortingOrder: SortingOrder =
        (params.get('sortingOrder') as SortingOrder) ||
        'BookmarkedDateReverseChronologicalOrder';

      setSortingOrder(sortingOrder);

      /*
       * 前後ページの存在を確認し、ある場合はリンク用クエリパラメーター部分の文字列を生成し、
       * ない場合はリンクを生成しないように（= null を代入）する
       */
      const [prevPageExists, nextPageExists] = await prevOrNextPageExists(page);

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

      // ブックマーク内のレシピを取得し設定する
      try {
        const recipes = await fetchBookmark(page, sortingOrder);
        setBookmarkedRecipes(recipes);
        state = 'Loaded';
      } catch (e) {
        console.error(e);
        state = 'Error';
      }
      setBookmarkLoadingState(state);
    })();
  }, [router.asPath]);

  // 整列順序が変更されたときは1ページ目からその順に表示させる
  const onSortingOrderSelectionChanged = (e) => {
    const newSortingOrder = e.target.value as SortingOrder;
    router.push(
      `/bookmark?${new URLSearchParams({
        page: '1',
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
      <Head title={`${WEBSITE_NAME} ─ ブックマーク`} />
      <Header />
      <div className="p-4 border-b-2">
        <select
          name="sorting-order-selector"
          id="sorting-order-selector"
          className="w-full"
          onChange={onSortingOrderSelectionChanged}
          value={sortingOrder}
        >
          {sortingOrders.map((so) => (
            <option value={so} key={so}>
              {sortingOrderToString(so)}
            </option>
          ))}
        </select>
      </div>
      {bookmarkLoadingState === 'Loading' ? (
        <div>Loading...</div>
      ) : bookmarkLoadingState === 'Error' ? (
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
export default BookmarkPage;
