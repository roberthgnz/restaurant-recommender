require('dotenv').config();

const { Configuration, OpenAIApi } = require("openai");

async function getRestaurantReviews() {
    const url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=ChIJOzLmMImipBIRqApr2CgqrBQ&key=${process.env.GOOGLE_MAPS_API_KEY}`;

    const response = await fetch(url, {
        method: "GET",
    });

    const data = await response.json();

    return data.result.reviews.map((review, index) => {
        const text = review.text
            .replace(/(\r\n|\n|\r)/gm, " ")
            .replace(/[^a-zA-Z0-9 ]/g, "")
            .replace(/\s+/g, " ")
            .trim()

        return `Review ${index + 1}: ${text}`
    }).join("\n");

}

const configuration = new Configuration({
    apiKey: process.env.OPENAI_API_KEY,
});

const openai = new OpenAIApi(configuration);

(async () => {
    const reviews = await getRestaurantReviews()

    const prompt = 'Based on this restaurant\'s reviews, do you think it is a good restaurant?\n\n' + reviews;

    const response = await openai.createCompletion({
        model: "text-davinci-003",
        prompt,
        temperature: 0.5,
        top_p: 1,
        frequency_penalty: 0,
        presence_penalty: 0,
        max_tokens: 200,
        n: 1,
    });

    console.log(response.data.choices);
})();