import { NextApiRequest, NextApiResponse } from "next";
import { ORIGIN_API_ENDPOINT_SEARCH } from "../../lib/constants";
import api from "../../lib/api-client";

export default async function (req: NextApiRequest, res: NextApiResponse) {
  const requestURL = `${ORIGIN_API_ENDPOINT_SEARCH}?${new URLSearchParams(
    req.query as { [key: string]: string }
  )}`;
  console.log(requestURL);
  const json = await (await api(requestURL)).json();
  res.json(json);
}
