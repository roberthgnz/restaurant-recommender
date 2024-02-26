import { Configuration, OpenAIApi } from "openai-edge"

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

  if (data.result?.reviews) return null

  return (
    `Restaurant: ${place.name}\n\n` +
    data.result.reviews
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
    getLastNElements(places, 5).map(getRestaurantReviews)
  );

  if(!values) return new Response("No reviews found", { status: 404 })

  const prompt =
    `Generate a recommendation, base it on this context: ${context} and the following reviews, Your task is to analyze the reviews of these restaurants to provide personalized recommendations. Consider factors such as overall sentiment, specific mentions of food quality, service, ambiance, and price, as well as any unique preferences or dietary restrictions expressed by the user. Tailor your recommendations to suit the user's tastes while highlighting the strengths and weaknesses of each restaurant based on the review analysis:\n\n` +
    values.join("\n\n");

  const completion = await openai.createCompletion({
    prompt,
    model: "gpt-3.5-turbo-instruct",
    max_tokens: 300,
    temperature: 0.7,
    top_p: 1,
    frequency_penalty: 0,
    presence_penalty: 0,
    max_tokens: 200,
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
