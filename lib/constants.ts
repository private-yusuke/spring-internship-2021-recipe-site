/** このウェブサイトの名前 */
export const PAGE_NAME = "料理板";
/** 各ページで description を Head で指定しなかったときに利用される説明文 */
export const PAGE_HEAD_DEFAULT_DESCRIPTION = `レシピ検索No.?／料理レシピ載せるなら ${PAGE_NAME}`;
/** 各ページに対応する画像へのリンクを Head で指定しなかったときに利用されるプレースホルダー用画像へのリンク */
export const PAGE_HEAD_DEFAULT_IMAGE_URL = "https://placehold.jp/1200x630.png";

/** レシピ取得および投稿用 API サーバーのルートへのパス */
export const ORIGIN_API_SERVER_ROOT = "https://internship-recipe-api.ckpd.co";
/** キーワードを指定しないレシピ一覧取得用エンドポイントへのパス */
export const ORIGIN_API_ENDPOINT_RECIPES = `${ORIGIN_API_SERVER_ROOT}/recipes`;
/** キーワードを指定したレシピ一覧検索用エンドポイントへのパス */
export const ORIGIN_API_ENDPOINT_SEARCH = `${ORIGIN_API_SERVER_ROOT}/search`;
/** レシピ投稿時にレシピ画像をアップロードするためのエンドポイントへのパス */
export const ORIGIN_API_ENDPOINT_IMAGE_URLS = `${ORIGIN_API_SERVER_ROOT}/image_urls`;
/** レシピ取得および投稿用 API サーバーへのアクセス内のヘッダーで指定する API キーのエントリー名 */
export const ORIGIN_API_HEADER_X_API_KEY = "X-Api-Key";

/** レシピのブックマーク機能で利用する IndexedDB でのデータベース名 */
export const BOOKMARK_DB_NAME = "bookmarkDB";
/** ブックマーク機能で利用するデータベースのバージョン */
export const BOOKMARK_DB_VERSION = 1;
/** データベース内の objectStore のブックマーク用の名前 */
export const BOOKMARK_DB_RECIPE_LIST_NAME = "recipeIDs";
/** ブックマーク一覧ページにて表示するレシピの1ページ内の個数 */
export const BOOKMARK_RECIPE_AMOUNT_PER_PAGE = 10;
