import { GetServerSideProps, NextPage } from 'next';
import CurrentPageStateMessage from '../components/current-page-state-message';
import Head from '../components/head';
import Header from '../components/header';
import RecipeList from '../components/recipe-list';
import { WEBSITE_NAME } from '../lib/constants';
import {
  getRecipes,
  GetRecipesResponse,
  Recipe,
  searchRecipes,
  SearchRecipesResponse,
} from '../lib/recipe';

type Props = {
  // このページで表示するレシピのリスト
  recipes: Recipe[];

  // レシピが一件以上検索でヒットしたか
  recipeFound: boolean;

  // 検索欄に入力されたキーワード
  keyword?: string;

  // ページネーション可能なとき、次のページに遷移するときに利用するパラメータを格納
  nextRecipeAPIParamsString?: string;

  // ページネーション可能なとき、前のページに遷移するときに利用するパラメータを格納
  prevRecipeAPIParamsString?: string;
};

const SearchPage: NextPage<Props> = (props) => {
  const {
    recipes,
    recipeFound,
    keyword,
    nextRecipeAPIParamsString,
    prevRecipeAPIParamsString,
  } = props;

  return (
    <div>
      <Head
        title={
          keyword
            ? `${keyword} の検索結果 ─ ${WEBSITE_NAME}`
            : `レシピ一覧 ─ ${WEBSITE_NAME}`
        }
      />
      <Header searchQuery={keyword} />
      {recipeFound ? (
        <RecipeList
          recipes={recipes}
          nextRecipeAPIParamsString={nextRecipeAPIParamsString}
          prevRecipeAPIParamsString={prevRecipeAPIParamsString}
        />
      ) : (
        <CurrentPageStateMessage message="該当するレシピが見つかりませんでした。" />
      )}
    </div>
  );
};

export const getServerSideProps: GetServerSideProps = async ({ query }) => {
  if (!query.keyword && !query.page)
    return {
      redirect: {
        statusCode: 301,
        destination: '/',
      },
    };

  let response: SearchRecipesResponse | GetRecipesResponse;
  try {
    if (!query.keyword)
      response = await getRecipes({ page: Number(query.page as string) });
    else
      response = await searchRecipes({
        keyword: query.keyword as string,
        page: Number(query.page as string),
      });
    if (!response.recipes)
      return {
        props: {
          recipes: [],
          recipeFound: false,
          keyword: query.keyword,
        } as Props,
      };
  } catch (e) {
    if (e.message === 'Not Found') {
      return {
        props: {
          recipes: [],
          recipeFound: false,
          keyword: query.keyword || '',
        } as Props,
      };
    }
    throw e;
  }

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
      recipeFound: true,
      keyword: query.keyword || '',
      nextRecipeAPIParamsString,
      prevRecipeAPIParamsString,
    } as Props,
  };
};

export default SearchPage;
