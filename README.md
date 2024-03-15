# Vapi React Native Integration Starter Template

This starter template is designed to help you quickly integrate Vapi into your react native project. It showcases a bot that assists authors in defining characters for their stories, demonstrating the ease of integrating Vapi to manipulate the frontend, display backend results, and leverage other capabilities.

## Features

- **Real-time Interaction**: Interact with the bot in real-time to refine character traits and details.
- **Message Handling**: Send and receive messages to and from the bot, handling different message types.
- **Event Handling**: Start, stop, and toggle bot calls with proper event management.

## Getting Started

1. Clone the repository.
2. Install dependencies with `npm install`.
3. Install iOS pods with `npx pod-install`
3. Set up your `.env` file with the required Vapi tokens.
4. Run the local server with `npm start -- --reset-cache`.

## Integration Points

- **Vapi SDK**: Integrated via `vapi.sdk.ts` to manage the Vapi instance.
- **React Hooks**: `useVapi.ts` to encapsulate Vapi logic within React components.
- **Event Listeners**: Set up listeners for various Vapi events like speech start/end, call start/end, and message updates.
- **Message Components**: Render messages and transcripts in real-time as they are received from the bot.
- **Character Details**: Edit and save character details, which are then sent as messages to the bot for processing.

