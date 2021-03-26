import { useRouter } from "next/dist/client/router";
import Link from "next/link";
import { FC } from "react";
import { Recipe } from "../lib/recipe";
import RecipeListElement from "./recipe-list-element";

type Props = {
  // このページで表示するレシピのリスト
  recipes: Recipe[];

  /**
   * ページネーション可能なとき、次のページに遷移するときに利用するパラメータを格納
   * null や undefined の場合は「次のページ」が非表示になる
   */
  nextRecipeAPIParamsString?: string;

  /**
   * ページネーション可能なとき、前のページに遷移するときに利用するパラメータを格納
   * null や undefined の場合は「前のページ」が非表示になる
   */
  prevRecipeAPIParamsString?: string;

  /**
   * ページネーションするときに遷移する先のページへのリンク
   * 指定しない場合はこのコンポーネントを表示している現在のパスが利用される
   */
  linkBasePath?: string;
};

/**
 * 与えられたレシピの配列や前後ページへのリンクのクエリパラメータなどを用いて
 * レシピ一覧を表示するためのコンポーネント
 */
const RecipeList: FC<Props> = (props) => {
  const router = useRouter();

  const {
    recipes,
    nextRecipeAPIParamsString,
    prevRecipeAPIParamsString,
    linkBasePath,
  } = props;

  return (
    <div>
      <div className="divide-y-4">
        {recipes.map((recipe) => (
          <RecipeListElement key={recipe.id} recipe={recipe} />
        ))}
      </div>

      <footer className="flex justify-between m-4">
        <div>
          {prevRecipeAPIParamsString != null && (
            <Link
              href={`${
                linkBasePath || router.basePath
              }?${prevRecipeAPIParamsString}`}
            >
              前のページ
            </Link>
          )}
        </div>
        <div>
          {nextRecipeAPIParamsString != null && (
            <Link
              href={`${
                linkBasePath || router.basePath
              }?${nextRecipeAPIParamsString.toString()}`}
            >
              次のページ
            </Link>
          )}
        </div>
      </footer>
    </div>
  );
};

export default RecipeList;
