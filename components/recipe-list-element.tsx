import Link from "next/link";
import { FC, useEffect, useState } from "react";
import { Recipe } from "../lib/recipe";
import Image from "next/image";
import {
  initializeBookmark,
  isInBookmark,
  toggleBookmark,
} from "../lib/client/bookmark";

type BookmarkState =
  | "Loading"
  | "NewNotBookmarked"
  | "NotBookmarked"
  | "Bookmarked"
  | "NewBookmarked"
  | "Error";

/**
 * レシピ一覧での各レシピの表示に利用するコンポーネント
 */
const RecipeListElement: FC<{ recipe: Recipe }> = ({ children, recipe }) => {
  const [bookmarkState, setBookmarkState] = useState<BookmarkState>("Loading");

  // useEffect 内の非同期処理で local state を変更するときの注意点
  // https://hbsnow.dev/blog/react-async-useeffect-localstate/
  useEffect(() => {
    let isMounted = true;
    (async () => {
      let newBookmarkState: BookmarkState;
      try {
        await initializeBookmark();
        const isBookmarked = await isInBookmark(recipe.id);
        newBookmarkState = isBookmarked ? "Bookmarked" : "NotBookmarked";
      } catch (e) {
        newBookmarkState = "Error";
        return;
      }
      if (isMounted) setBookmarkState(newBookmarkState);
    })();
    return () => {
      isMounted = false;
    };
  }, []);

  const onBookmarkButtonClicked = async (_) => {
    let bookmarked: boolean;
    try {
      bookmarked = await toggleBookmark(recipe);
    } catch (e) {
      console.error(e);
      setBookmarkState("Error");
      return;
    }
    setBookmarkState(bookmarked ? "NewBookmarked" : "NewNotBookmarked");
  };

  return (
    <div
      className="recipe-element-container flex items-center m-4"
      key={recipe.id}
    >
      <Link href={`recipes/${recipe.id}`}>
        <div className="recipe-image-container mr-4 mt-4 flex-1 text-center">
          {recipe.image_url ? (
            <Image
              src={recipe.image_url}
              alt="レシピ画像"
              width={200}
              height={120}
              objectFit="cover"
            />
          ) : (
            // レシピ画像がないときは絵文字を表示する
            <p className="text-8xl text-center">🍽️</p>
          )}
        </div>
      </Link>
      <div className="recipe-summary flex-1 mt-4">
        <Link href={`recipes/${recipe.id}`}>
          <div>
            <h2 className="recipe-title text-l mb-2">{recipe.title}</h2>
            <p className="recipe-description text-sm">{recipe.description}</p>
          </div>
        </Link>
        <div className="flex mt-2">
          <button onClick={onBookmarkButtonClicked}>
            {bookmarkState === "Bookmarked" || bookmarkState === "NewBookmarked"
              ? "✔"
              : bookmarkState === "Loading"
              ? "⌛"
              : bookmarkState === "NotBookmarked" ||
                bookmarkState == "NewNotBookmarked"
              ? "📌"
              : bookmarkState === "Error"
              ? "❌ "
              : "Unexpected behaviour"}
          </button>
          <p className="ml-2 mt-1 text-sm">
            {bookmarkState === "NewBookmarked"
              ? "ブックマーク追加済"
              : bookmarkState === "NewNotBookmarked"
              ? "ブックマーク削除済"
              : null}
          </p>
        </div>
      </div>
    </div>
  );
};

export default RecipeListElement;
