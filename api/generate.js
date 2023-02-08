import { OpenAIStream } from "../utils/OpenAIStream";

function getLastNElements(array, n) {
  return array.slice(-n);
}

async function getRestaurantReviews(place) {
  const url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${place.place_id}&key=${process.env.GOOGLE_MAPS_API_KEY}`;

  const response = await fetch(url, {
    method: "GET",
  });

  const data = await response.json();

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
    getLastNElements(places, 5).map(
      async (place) => await getRestaurantReviews(place)
    )
  );

  const prompt =
    `Generate a recommendation, base it on this context: ${context} and the following reviews:\n\n` +
    values.join("\n\n");

  const payload = {
    model: "text-davinci-003",
    prompt,
    temperature: 0.7,
    top_p: 1,
    frequency_penalty: 0,
    presence_penalty: 0,
    max_tokens: 200,
    stream: true,
    n: 1,
  };

  const stream = await OpenAIStream(payload);

  return new Response(stream);
};

export default handler;
