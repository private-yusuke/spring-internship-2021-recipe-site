import { GetServerSideProps, GetStaticProps, NextPage } from "next";
import CurrentPageStateMessage from "../components/current-page-state-message";
import Head from "../components/head";
import Header from "../components/header";
import RecipeList from "../components/recipe-list";
import { getRecipes, Recipe } from "../lib/recipe";

type Props = {
  // このページで表示するレシピのリスト
  recipes: Recipe[];

  // ページネーション可能なとき、次のページに遷移するときに利用するパラメータを格納
  nextRecipeAPIParamsString?: string;

  // ページネーション可能なとき、前のページに遷移するときに利用するパラメータを格納
  prevRecipeAPIParamsString?: string;
};

const TopPage: NextPage<Props> = (props) => {
  const {
    recipes,
    nextRecipeAPIParamsString,
    prevRecipeAPIParamsString,
  } = props;

  return (
    <div>
      <Head
        title="料理板"
        description="レシピ検索No.?／料理レシピ載せるなら 料理板"
        image="https://placehold.jp/1200x630.png"
      />
      <Header />
      {recipes === null ? (
        <CurrentPageStateMessage message="レシピが見つかりませんでした。" />
      ) : (
        <RecipeList
          recipes={recipes}
          nextRecipeAPIParamsString={nextRecipeAPIParamsString}
          prevRecipeAPIParamsString={prevRecipeAPIParamsString}
          linkBasePath="/search"
        />
      )}
    </div>
  );
};

export const getStaticProps: GetStaticProps = async () => {
  const response = await getRecipes({
    page: 1,
  });

  let nextRecipeAPIParamsString;
  let prevRecipeAPIParamsString;
  if (response.links) {
    nextRecipeAPIParamsString = response.links.next
      ? new URL(response.links.next).searchParams.toString()
      : null;
    prevRecipeAPIParamsString = response.links.prev
      ? new URL(response.links.prev).searchParams.toString()
      : null;
  }
  return {
    props: {
      recipes: response.recipes,
      nextRecipeAPIParamsString,
      prevRecipeAPIParamsString,
    } as Props,
    revalidate: 60,
  };
};

export default TopPage;
