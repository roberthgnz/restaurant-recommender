import { OpenAIStream } from "../utils/OpenAIStream";

async function getRestaurantReviews() {
  const url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=ChIJOzLmMImipBIRqApr2CgqrBQ&key=${process.env.GOOGLE_MAPS_API_KEY}`;

  const response = await fetch(url, {
    method: "GET",
  });

  const data = await response.json();

  return data.result.reviews
    .map((review, index) => {
      const text = review.text
        .replace(/(\r\n|\n|\r)/gm, " ")
        .replace(/[^a-zA-Z0-9 ]/g, "")
        .replace(/\s+/g, " ")
        .trim();

      return `Review ${index + 1}: ${text}`;
    })
    .join("\n");
}

export const config = {
  runtime: "edge",
};

const handler = async () => {
  const reviews = await getRestaurantReviews();

  const prompt =
    "Based on this restaurant's reviews, do you think it is a good restaurant?\n\n" +
    reviews;

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
