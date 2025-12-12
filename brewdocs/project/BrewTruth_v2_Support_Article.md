# BrewTruth v2: For Support & Docs

## What is BrewTruth?

BrewTruth is a real-time, automated quality assurance engine built directly into BrewAssist. It acts as a "second pair of eyes" on every response BrewAssist generates, ensuring that the information provided is accurate, safe, and helpful.

## How does it work?

When BrewAssist generates a response, BrewTruth runs a series of checks to evaluate its quality. These checks include:

*   **Internal Consistency:** Does the response contradict itself?
*   **Code Validity:** Is the code in the response syntactically correct and likely to run?
*   **Safety:** Does the response suggest any dangerous or destructive actions?
*   **Groundedness:** Is the response grounded in the context of the project and the user's request?

Based on these checks, BrewTruth assigns a "Truth Score" to the response, which is displayed as a "Truth Chip" in the BrewAssist UI.

## What do the Truth Scores mean?

The Truth Score is a percentage that represents BrewTruth's confidence in the quality of the response. Here's a general guide to what the scores mean:

*   **90-100% (Gold):** The response is highly accurate, safe, and well-grounded. You can trust this information completely.
*   **70-89% (Silver):** The response is likely accurate and safe, but may have some minor inconsistencies or could be more detailed.
*   **50-69% (Bronze):** The response is a good starting point, but may require some verification or refinement.
*   **Below 50% (Red):** The response is likely to be inaccurate, unsafe, or unhelpful. Proceed with caution and verify the information before taking any action.

## Why is this important?

BrewTruth is a critical component of BrewAssist's commitment to providing a safe and reliable AI-powered development experience. By providing real-time feedback on the quality of BrewAssist's responses, BrewTruth helps users make informed decisions and avoid potential pitfalls.

## What's next for BrewTruth?

BrewTruth is constantly evolving. Future versions will include more sophisticated checks, such as cross-referencing information with external documentation and APIs, and providing more detailed feedback on why a particular score was assigned.

We're excited about the future of BrewTruth and its potential to make BrewAssist the most trusted and reliable AI-powered development assistant in the world.
