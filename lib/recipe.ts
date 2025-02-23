/* eslint-disable camelcase */
// [こちら](https://gist.github.com/hokaccha/0db2c6c26ec0f7dfc680cf5010e61180#api%E4%BB%95%E6%A7%98%E3%81%AB%E3%81%8A%E3%81%91%E3%82%8B%E5%9E%8B)を流用

import {
  ORIGIN_API_ENDPOINT_RECIPES,
  ORIGIN_API_ENDPOINT_SEARCH,
} from './constants';
import api from './server/api-client';

/**
 * レシピ
 */
export type Recipe = {
  /** レシピID */
  id: number;

  /** レシピ名 */
  title: string;

  /** レシピ概要 */
  description: string;

  /** レシピ画像。画像がない場合は null。 */
  image_url: string | null;

  /** レシピ作者 */
  author: {
    user_name: string;
  };

  /** レシピを公開した日時。ISO 8601 */
  published_at: string;

  /** レシピの手順 */
  steps: string[];

  /** レシピの材料 */
  ingredients: {
    /** 材料名 */
    name: string;
    /** 分量（100g など） */
    quantity: string;
  }[];

  /**
   * 関連するレシピのIDが最大5つ入っている。Poster View などを実装するのに使う。
   * なお、関連レシピの算出アルゴリズムのできが悪いため関連性が低い可能性がある点に注意。
   */
  related_recipes: number[];
};

/**
 * レシピ取得 API のクエリパラメーター
 */
export type GetRecipesQueryParameter = {
  /** ページネーションする場合に指定するページ番号。 */
  page?: number;

  /**
   * レシピIDをカンマで区切って複数指定できる。指定できるIDの数の上限は10。
   * idを指定した場合はページネーションはできないのでidとpageは同時に指定できない。
   */
  id?: string;
};

/**
 * レシピ取得 API のレスポンス
 */
export type GetRecipesResponse = {
  /** レシピ一覧 */
  recipes: Recipe[];

  /** ページネーション可能な場合の次、前のページのリンク */
  links: {
    next?: string;
    prev?: string;
  };
};

/**
 * 値が null や undefined であるような値を持つエントリーを削除したものを返します。
 */
function removeEmpty(obj): { [keys: string]: any } {
  // eslint-disable-next-line no-unused-vars
  return Object.fromEntries(Object.entries(obj).filter(([_, v]) => v != null));
}

/**
 * レシピ取得 API を叩き、結果を返します
 * @param query ページ指定やレシピ ID（またはその列）が入っているクエリパラメーター
 * @returns レシピ取得 API が返す結果
 */
export async function getRecipes(
  query?: GetRecipesQueryParameter
): Promise<GetRecipesResponse> {
  const params: { page: string; id: string } = { page: null, id: null };
  if (query) {
    if (query.page) params.page = query.page.toString();
    if (query.id) params.id = query.id;
  }

  const req = await api(
    `${ORIGIN_API_ENDPOINT_RECIPES}?${new URLSearchParams(removeEmpty(params))}`
  );
  return (await req.json()) as GetRecipesResponse;
}

/**
 * レシピ検索 API のクエリパラメーター
 */
export type SearchRecipesQueryParameter = {
  /** 検索キーワード。マルチバイト文字列の場合は URL Encode が必用。 */
  keyword: string;

  /** ページネーションする場合に指定するページ番号 */
  page?: number;
};

/**
 * レシピ検索 API のレスポンス
 */
export type SearchRecipesResponse = {
  /** 検索にヒットしたレシピ一覧 */
  recipes: Recipe[];

  /** ページネーション可能な場合の次、前のページのリンク */
  links: {
    next?: string;
    prev?: string;
  };
};

/**
 * レシピ検索 API を叩き、結果を返します。
 * @param query キーワードやページ指定が入っているクエリパラメーター
 * @returns レシピ検索 API が返す結果
 */
export async function searchRecipes(
  query?: SearchRecipesQueryParameter
): Promise<SearchRecipesResponse> {
  const params = { keyword: query.keyword, page: null };
  if (query.page) params.page = query.page.toString();

  const url = `${ORIGIN_API_ENDPOINT_SEARCH}?${new URLSearchParams(
    removeEmpty(params)
  )}`;
  const req = await api(url);
  const json = await req.json();
  if (!req.ok) throw new Error(json.message);
  return json as SearchRecipesResponse;
}

/**
 * 単一レシピ取得 API
 * @param id 取得するレシピの ID
 * @returns レシピの詳細
 */
export async function getRecipe(id: number): Promise<Recipe | null> {
  const req = await api(`${ORIGIN_API_ENDPOINT_RECIPES}/${id}`);
  const json = await req.json();
  if (json.message as any) throw new Error(json.message);
  return json as Recipe;
}
