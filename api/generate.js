function getLastNElements(array, n) {
  return array.slice(-n);
}

async function getRestaurantReviews(place) {
  const url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${place.place_id}&key=${process.env.VITE_GOOGLE_MAPS_API_KEY}`;

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

const handler = async (req, res) => {
  const { context, places } = req.body;

  const values = await Promise.all(
    getLastNElements(places, 5).map(
      async (place) => await getRestaurantReviews(place)
    )
  );

  const content =
    `Give me a recommendation, base it on this context: ${context} and the following reviews:\n\n` +
    values.join("\n\n");

  const payload = {
    model: "gpt-3.5-turbo",
    max_tokens: 200,
    messages: [{ role: "user", content }],
  };

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
    },
    method: "POST",
    body: JSON.stringify(payload),
  });

  const data = await response.json();

  return res.status(200).json(data.choices[0]);
};

export default handler;
