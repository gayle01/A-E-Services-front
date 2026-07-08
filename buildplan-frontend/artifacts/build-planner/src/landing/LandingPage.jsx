import { useMemo, useState } from "react";
import { ChevronDown } from "lucide-react";
import GreetingAnimation from "./components/GreetingAnimation";
import CTAButtons from "./components/CTAButtons";

const languages = [
  { code: "en", name: "English" },
  { code: "fr", name: "Francais" },
  { code: "es", name: "Espanol" },
  { code: "de", name: "Deutsch" },
  { code: "it", name: "Italiano" },
  { code: "pt", name: "Portugues" },
];

const copyByLanguage = {
  en: {
    greetings: ["Hello", "Welcome", "Hello there", "Let's begin"],
    headline: "Tell Us About Your Project.",
    description:
      "Answer a few quick questions about your project to generate an estimated construction cost and professional fees.",
    cta: "Get Started",
  },
  fr: {
    greetings: ["Bonjour", "Bienvenue", "Salut", "Commencons"],
    headline: "Parlez-nous de votre projet.",
    description:
      "Repondez a quelques questions rapides sur votre projet pour generer un cout de construction estime et des honoraires professionnels.",
    cta: "Commencer",
  },
  es: {
    greetings: ["Hola", "Bienvenido", "Vamos", "Empecemos"],
    headline: "Cuentanos sobre tu proyecto.",
    description:
      "Responde algunas preguntas rapidas sobre tu proyecto para generar un costo de construccion estimado y honorarios profesionales.",
    cta: "Comenzar",
  },
  de: {
    greetings: ["Hallo", "Willkommen", "Los gehts", "Lass uns starten"],
    headline: "Erzahlen Sie uns von Ihrem Projekt.",
    description:
      "Beantworten Sie ein paar kurze Fragen zu Ihrem Projekt, um die geschatzten Baukosten und professionellen Gebuhren zu ermitteln.",
    cta: "Starten",
  },
  it: {
    greetings: ["Ciao", "Benvenuto", "Iniziamo", "Pronti"],
    headline: "Raccontaci del tuo progetto.",
    description:
      "Rispondi a qualche domanda veloce sul tuo progetto per generare un costo di costruzione stimato e gli onorari professionali.",
    cta: "Inizia",
  },
  pt: {
    greetings: ["Ola", "Bem-vindo", "Vamos la", "Comecar"],
    headline: "Fale-nos sobre o seu projeto.",
    description:
      "Responda a algumas perguntas rapidas sobre o seu projeto para gerar um custo de construcao estimado e honorarios profissionais.",
    cta: "Comecar",
  },
};

export default function LandingPage() {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [language, setLanguage] = useState("en");

  const currentLang = useMemo(
    () => languages.find((item) => item.code === language) ?? languages[0],
    [language],
  );

  const copy = copyByLanguage[language] ?? copyByLanguage.en;

  return (
    <section
      className="relative min-h-screen overflow-hidden bg-cover bg-center bg-no-repeat"
      style={{
        backgroundImage:
          "linear-gradient(rgba(6, 16, 39, 0.42), rgba(6, 16, 39, 0.58)), radial-gradient(circle at top, rgba(20, 60, 120, 0.2), rgba(6, 16, 39, 0.2)), url('/skyscraper-bg.jpg')",
        backgroundColor: "#0b1d3a",
      }}
    >
      <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-black/25" />

      <div className="relative z-10 mx-auto flex max-w-7xl items-center justify-between px-6 py-6 md:px-10">
        <div className="flex items-center gap-3">
          <img
            src="/logo.png"
            alt="ARCH ESTIMATES"
            className="h-10 w-10 rounded-full object-cover shadow-lg shadow-black/20 ring-1 ring-white/15"
          />
          <span className="text-xl font-semibold tracking-tight text-white">
            ARCH ESTIMATES
          </span>
        </div>

        <div className="relative">
          <button
            type="button"
            onClick={() => setIsDropdownOpen((open) => !open)}
            className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/15 px-4 py-3 text-base font-semibold text-white shadow-lg backdrop-blur-md transition hover:bg-white/20"
          >
            <span>{currentLang.name}</span>
            <ChevronDown
              className={`h-5 w-5 transition-transform ${isDropdownOpen ? "rotate-180" : ""}`}
            />
          </button>

          {isDropdownOpen ? (
            <div className="absolute right-0 mt-3 w-48 overflow-hidden rounded-2xl border border-white/15 bg-slate-900/90 shadow-2xl backdrop-blur-xl">
              {languages.map((item) => (
                <button
                  key={item.code}
                  type="button"
                  onClick={() => {
                    setLanguage(item.code);
                    setIsDropdownOpen(false);
                  }}
                  className="block w-full px-4 py-3 text-left text-sm font-medium text-white transition hover:bg-white/10"
                >
                  {item.name}
                </button>
              ))}
            </div>
          ) : null}
        </div>
      </div>

      <div className="relative z-10 mx-auto flex min-h-[calc(100vh-88px)] max-w-5xl flex-col items-center justify-center px-6 pb-20 text-center text-white md:px-10">
        <div className="mb-4">
          <GreetingAnimation greetings={copy.greetings} />
        </div>

        <h2 className="max-w-5xl text-4xl font-semibold tracking-tight drop-shadow-[0_4px_20px_rgba(0,0,0,0.35)] md:text-7xl">
          {copy.headline}
        </h2>

        <p className="mt-10 max-w-4xl text-2xl leading-relaxed text-white/90 md:text-[32px]">
          {copy.description}
        </p>

        <div className="mt-16">
          <CTAButtons label={copy.cta} />
        </div>
      </div>
    </section>
  );
}
