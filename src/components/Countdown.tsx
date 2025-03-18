"use client";

import { useEffect, useState } from "react";
import { ApolloProvider, useQuery, gql } from "@apollo/client";
import sdk, { type Context } from "@farcaster/frame-sdk";
import { getApolloClientAuthed, CO_SOULS_QUERY } from "../lib/apollo-client";

const STAR_COUNT = 100;
const FALL_DURATION = 5000; // Duration for stars to fall in milliseconds
const END_DATE = new Date("2025-04-09"); // 6 weeks from Feb 26

const COLORS = [
  "#FF5733",
  "#FFBD33",
  "#DBFF33",
  "#75FF33",
  "#33FF57",
  "#33FFBD",
  "#33DBFF",
  "#3375FF",
  "#5733FF",
  "#BD33FF",
  "#FF33DB",
  "#FF3375",
];

const QUOTES = [
  "Time is the most valuable thing a man can spend. - Theophrastus",
  "The two most powerful warriors are patience and time. - Leo Tolstoy",
  "Yesterday is gone. Tomorrow has not yet come. We have only today. - Mother Teresa",
  "The future depends on what you do today. - Mahatma Gandhi",
  "Time waits for no one. - Folklore",
  "Lost time is never found again. - Benjamin Franklin",
  "The best time to plant a tree was 20 years ago. The second best time is now. - Chinese Proverb",
  "Time flies over us, but leaves its shadow behind. - Nathaniel Hawthorne",
  "Don't count every hour in the day, make every hour in the day count. - Muhammad Ali",
  "Time is what we want most, but what we use worst. - William Penn",
  "The key is in not spending time, but in investing it. - Stephen R. Covey",
  "Either you run the day, or the day runs you. - Jim Rohn",
  "Time discovers truth. - Seneca",
  "Time is a created thing. To say 'I don't have time' is to say 'I don't want to.' - Lao Tzu",
  "The trouble is, you think you have time. - Buddha",
  "Time is the wisest counselor of all. - Pericles",
  "Time is the school in which we learn, time is the fire in which we burn. - Delmore Schwartz",
  "The present time has one advantage over every other – it is our own. - Charles Caleb Colton",
  "Time is the coin of your life. It is the only coin you have, and only you can determine how it will be spent. - Carl Sandburg",
  "The time is always right to do what is right. - Martin Luther King Jr.",
];

// Convert the query string to a gql query
const CO_SOULS_GQL = gql`
  ${CO_SOULS_QUERY}
`;

interface Star {
  id: number;
  x: number;
  delay: number;
  color: string;
}

const generateStars = (): Star[] => {
  return Array.from({ length: STAR_COUNT }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    delay: Math.random() * FALL_DURATION,
    color: COLORS[Math.floor(Math.random() * COLORS.length)],
  }));
};

// GraphQL query component
const CoSoulsDisplay = () => {
  const { loading, error, data } = useQuery(CO_SOULS_GQL, {
    fetchPolicy: "network-only",
  });

  if (loading) return <div className="text-white">Loading CoSouls data...</div>;
  if (error)
    return <div className="text-white">Error loading CoSouls data</div>;
  if (!data?.cosouls) return null;

  return (
    <div className="mt-4 bg-black/50 p-4 rounded-lg overflow-auto max-h-48">
      <h2 className="text-white font-bold mb-2">CoSouls Data</h2>
      <div className="text-xs text-white">
        {data.cosouls.map(
          (soul: { id: string; token_id: string; address: string }) => (
            <div key={soul.id} className="mb-1">
              ID: {soul.token_id} - Address: {soul.address.substring(0, 8)}...
            </div>
          )
        )}
      </div>
    </div>
  );
};

const CountdownContent = () => {
  const [isSDKLoaded, setIsSDKLoaded] = useState(false);
  const [context, setContext] = useState<Context.FrameContext>();
  const [timeLeft, setTimeLeft] = useState(0);
  const [stars] = useState<Star[]>(() => generateStars());
  const [quote] = useState(QUOTES[Math.floor(Math.random() * QUOTES.length)]);

  // Add SDK initialization
  useEffect(() => {
    const load = async () => {
      const context = await sdk.context;
      setContext(context);

      // Set up any frame-specific event listeners here if needed

      console.log("Calling ready");
      sdk.actions.ready({});
    };

    if (sdk && !isSDKLoaded) {
      console.log("Calling load");
      setIsSDKLoaded(true);
      load();
      return () => {
        sdk.removeAllListeners();
      };
    }
  }, [isSDKLoaded]);

  // Update countdown based on current time
  useEffect(() => {
    const updateCountdown = () => {
      const now = new Date();
      const difference = END_DATE.getTime() - now.getTime();
      setTimeLeft(Math.max(0, difference));
    };

    updateCountdown();
    const intervalId = setInterval(updateCountdown, 1); // Update every millisecond
    return () => clearInterval(intervalId);
  }, []);

  const timeLeftString = timeLeft.toString();
  const visibleDigits = timeLeftString.slice(0, -3);
  const fadedDigits = timeLeftString.slice(-3);

  return (
    <div
      className="relative h-screen overflow-hidden bg-gradient-to-r from-purple-400 via-pink-500 to-red-500"
      style={{
        paddingTop: context?.client.safeAreaInsets?.top ?? 0,
        paddingBottom: context?.client.safeAreaInsets?.bottom ?? 0,
        paddingLeft: context?.client.safeAreaInsets?.left ?? 0,
        paddingRight: context?.client.safeAreaInsets?.right ?? 0,
      }}
    >
      {/* Starry Background */}
      <div className="absolute inset-0">
        {stars.map((star) => (
          <div
            key={star.id}
            className="absolute rounded-full"
            style={{
              width: "2px",
              height: "2px",
              top: "-10px",
              left: `${star.x}%`,
              backgroundColor: star.color,
              animation: `fall ${FALL_DURATION}ms linear ${star.delay}ms infinite`,
            }}
          />
        ))}
      </div>

      {/* Countdown Display */}
      <div className="relative z-10 flex justify-center items-center h-full">
        <div className="text-center">
          <h1 className="mb-5 text-base md:text-xl font-bold text-white text-shadow-lg opacity-0 animate-fadeIn px-4">
            {quote}
          </h1>
          <p className="text-4xl md:text-7xl font-mono font-bold text-white text-shadow-lg bg-black/30 p-4 md:p-8 rounded-lg backdrop-blur-sm mx-4">
            <span>{visibleDigits}</span>
            <span className="opacity-50">{fadedDigits}</span>
            <span className="text-xl md:text-2xl ml-2">ms</span>
          </p>
          <div className="mx-4">
            <CoSoulsDisplay />
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes fall {
          0% {
            transform: translateY(0);
          }
          100% {
            transform: translateY(100vh);
          }
        }
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        .animate-fadeIn {
          animation: fadeIn 2s ease-in-out forwards;
        }
      `}</style>
    </div>
  );
};

// Wrap the component with ApolloProvider
export default function Countdown() {
  return (
    <ApolloProvider client={getApolloClientAuthed()}>
      <CountdownContent />
    </ApolloProvider>
  );
}
