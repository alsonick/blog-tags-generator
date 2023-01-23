import type { NextApiRequest, NextApiResponse } from "next";
import { Configuration, OpenAIApi } from "openai";

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "GET") {
    return;
  }

  const openai = new OpenAIApi(configuration);

  const { title, size } = req.query as { title: string; size: string };

  if (!title || !size) {
    return res.status(400).json({
      success: false,
      error: "Please provide the relevant query parameters.",
    });
  }

  const prompt = `Generate ${parseInt(
    size
  )} tags for my blog post with the title "${title}". In one line with commas.`;

  const response = await openai.createCompletion({
    model: "text-davinci-003",
    prompt,
  });

  const tags = response.data.choices[0].text
    ?.replaceAll("#", " ")
    .split(" ")
    .join("")
    .trim();

  if (response.status === 200) {
    return res.status(200).json({ success: true, tags });
  }
}
