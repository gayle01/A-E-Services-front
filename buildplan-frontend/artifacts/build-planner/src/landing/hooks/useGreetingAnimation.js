import { useEffect, useState } from "react";

const defaultGreetings = [
  "Welcome",
  "Bienvenue",
  "Bienvenido",
  "Willkommen",
  "Benvenuto",
  "Bem-vindo",
  "Vítejte",
  "स्वागत",
  "خوش آمدید",
  "Добро пожаловать",
];

export function useGreetingAnimation(greetings = defaultGreetings, interval = 2500) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    setIndex(0);
  }, [greetings]);

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((current) => (current + 1) % greetings.length);
    }, interval);

    return () => clearInterval(timer);
  }, [greetings, interval]);

  return {
    currentGreeting: greetings[index],
    currentIndex: index,
  };
}
