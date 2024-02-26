import OpenAI from 'openai';
import { Configuration, OpenAIApi } from "openai-edge"
import { OpenAIStream, StreamingTextResponse } from "ai"

const apiConfig = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
})

const openai = new OpenAIApi(apiConfig)

function getLastNElements(array, n) {
  return array.slice(-n);
}

async function getRestaurantReviews(place) {
  const url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${place.place_id}&key=${process.env.VITE_GOOGLE_PLACES_API_KEY}`;

  const response = await fetch(url, {
    method: "GET",
  });

  const data = await response.json();

  return (
    `Restaurant: ${place.name}\n\n` +
    data.result?.reviews
      .map((review, index) => {
        const text = review.text.trim();
        return `Review ${index + 1}: ${text}`;
      })
      .join("\n")
  );
}

export const config = {
  runtime: "edge",
};

const handler = async (req) => {
  const { context, places } = await req.json();

  const values = await Promise.all(
    getLastNElements(places, 5).map(
      async (place) => await getRestaurantReviews(place)
    )
  );

  const prompt =
    `Generate a recommendation, base it on this context: ${context} and the following reviews:\n\n` +
    values.join("\n\n");

  const completion = await openai.createCompletion({
    prompt,
    model: "gpt-3.5-turbo-instruct",
    max_tokens: 300,
    temperature: 0.0,
    frequency_penalty: 1,
    presence_penalty: 1,
  })

  const data = (await completion.json())

  return new Response(JSON.stringify(data.choices), {
    status: 200,
    headers: {
      "content-type": "application/json",
    },
  })
};

export default handler;
