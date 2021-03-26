import { GetStaticProps, NextPage } from "next";
import Image from "next/image";
import { useEffect, useState } from "react";
import Head from "../../components/head";
import Header from "../../components/header";
import {
  initializeBookmark,
  isInBookmark,
  toggleBookmark,
  updateBookmark,
} from "../../lib/client/bookmark";
import { PAGE_NAME } from "../../lib/constants";
import {
  getRecipe,
  getRecipes,
  GetRecipesResponse,
  Recipe,
} from "../../lib/recipe";

type Props = {
  // ページで表示するレシピ
  recipe: Recipe;
};

/**
 * このレシピのブックマーク登録状況の読み込みなどを含めた状態
 */
type BookmarkState = "Loading" | "Error" | "Bookmarked" | "NotBookmarked";

/**
 * 各レシピページ
 */
const RecipePage: NextPage<Props> = (props) => {
  const { recipe } = props;
  const [bookmarkState, setBookmarkState] = useState<BookmarkState>("Loading");

  /*
   * ページを開いたときにクライアントサイドでレシピがブックマークされているか調べる。
   * 同時に、ブックマークで保存されているレシピ情報を新しく取得したものに更新する。
   */
  useEffect(() => {
    (async () => {
      let state: BookmarkState;
      try {
        await initializeBookmark();
        let bookmarked = await isInBookmark(recipe.id);
        state = bookmarked ? "Bookmarked" : "NotBookmarked";

        // ブックマークされていた場合はブックマークのデータベース内の当該レシピの情報更新を行う
        if (bookmarked) updateBookmark(recipe);
      } catch (e) {
        console.error(e);
        state = "Error";
      }
      setBookmarkState(state);
    })();
  }, []);

  /**
   * ブックマーク追加/削除ボタンを押したときのハンドラ
   * ブックマークの追加/削除の切り替えを行う
   */
  const onClickBookmarkButton = async (e) => {
    const bookmarked = await toggleBookmark(recipe);
    setBookmarkState(bookmarked ? "Bookmarked" : "NotBookmarked");
  };

  return (
    <div>
      <Head
        title={`${recipe.title} ─ ${PAGE_NAME}`}
        description={recipe.description}
        image={recipe.image_url}
      />
      <Header />
      {/* レシピがある場合にレシピ詳細情報を描画しているが、このチェックが無くてもレシピが無い場合は 404 のエラーページが描画されるはず */}
      {recipe && (
        <main>
          {recipe.image_url ? (
            <div className="flex justify-center">
              <Image
                src={recipe.image_url}
                alt="レシピ画像"
                width={400}
                height={250}
                objectFit="contain"
              />
            </div>
          ) : (
            // レシピ画像が無い場合は絵文字を表示
            <p className="text-9xl text-center">🍽️</p>
          )}

          <h2 className="text-xl mt-3 mb-2 mx-4">{recipe.title}</h2>

          <div className="flex justify-between">
            <span className="m-2 ml-4">{recipe.author.user_name}</span>
            <span className="m-2 mr-4">
              {new Date(recipe.published_at).toLocaleDateString()}
            </span>
          </div>

          <p className="m-3">{recipe.description}</p>

          <div className="flex justify-center">
            <button
              className="text-lg p-2 mx-5 my-2 mb-4 bg-yellow-200 hover:bg-yellow-300 font-bold rounded"
              onClick={onClickBookmarkButton}
              disabled={
                bookmarkState === "Loading" || bookmarkState === "Error"
              }
            >
              {bookmarkState === "Loading"
                ? "⌛ 読込中"
                : bookmarkState === "NotBookmarked"
                ? "📌 レシピを保存"
                : bookmarkState === "Bookmarked"
                ? "🗑️ ブックマーク解除"
                : bookmarkState === "Error"
                ? "❌ エラー"
                : "❓ Unexpected state"}
            </button>
          </div>

          <h3 className="px-2 py-1 bg-gray-300 mb-2">材料</h3>
          <div className="divide-y">
            {recipe.ingredients
              .filter((ing) => ing.name !== "")
              .map((ing, i) => (
                <div className="flex justify-between" key={i}>
                  <span className="font-semibold m-2 ml-4">{ing.name}</span>
                  <span className="m-2 mr-4">{ing.quantity}</span>
                </div>
              ))}
          </div>

          <h3 className="px-2 py-1 bg-gray-300 mb-2">手順</h3>
          <ol className="divide-y list-decimal list-inside">
            {recipe.steps.map((step, i) => (
              <li className="p-2" key={i}>
                {step}
              </li>
            ))}
          </ol>
        </main>
      )}
    </div>
  );
};

// /recipes を10ページ分叩いて得られる結果をキャッシュする
export const getStaticPaths = async () => {
  if (process.env.NODE_ENV == "development")
    return {
      paths: [],
      fallback: "blocking",
    };
  let response: GetRecipesResponse;
  let page = 1;
  const paths: string[] = [];
  do {
    response = await getRecipes({ page });
    response.recipes.forEach((recipe) => {
      paths.push(`/recipes/${recipe.id}`);
    });
    page++;
  } while (!(response as any).message && page < 10);
  return {
    paths,
    fallback: "blocking",
  };
};

export const getStaticProps: GetStaticProps = async ({ params }) => {
  const id = Number(params?.id);
  if (id === 0 || isNaN(id)) {
    return {
      notFound: true,
    };
  } else {
    let recipe: Recipe;

    // 該当 ID のレシピが存在しない場合は not found を返す。
    // それ以外のエラーに今は対応せず、とりあえず例外を投げる
    try {
      recipe = await getRecipe(id);
    } catch (e) {
      if (e.message == "Not Found") return { notFound: true };
      else throw e;
    }
    return {
      props: { recipe: recipe },
      revalidate: 60 * 5,
    };
  }
};

export default RecipePage;
