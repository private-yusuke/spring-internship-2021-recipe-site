import getCurrentFullUrl from "./current-full-url";

export const ORIGIN_API_SERVER_ROOT = "https://internship-recipe-api.ckpd.co";
export const ORIGIN_API_ENDPOINT_RECIPES = `${ORIGIN_API_SERVER_ROOT}/recipes`;
export const ORIGIN_API_ENDPOINT_SEARCH = `${ORIGIN_API_SERVER_ROOT}/search`;
export const ORIGIN_API_ENDPOINT_IMAGE_URLS = `${ORIGIN_API_SERVER_ROOT}/image_urls`;
export const ORIGIN_API_HEADER_X_API_KEY = "X-Api-Key";

export const BOOKMARK_DB_NAME = "bookmarkDB";
export const BOOKMARK_DB_VERSION = 1;
export const BOOKMARK_DB_RECIPE_LIST_NAME = "recipeIDs";
export const BOOKMARK_RECIPE_AMOUNT_PER_PAGE = 10;
