 import { useMemo, useState } from "react";
import { Link } from "wouter";
import { ChevronDown } from "lucide-react";
import GreetingAnimation from "./components/GreetingAnimation";
import CTAButtons from "./components/CTAButtons";

const languages = [
  { code: "en", name: "English" },
  { code: "es", name: "Espanol" },
  { code: "zh", name: "中文" },
  { code: "hi", name: "हिन्दी" },
  { code: "ar", name: "العربية" },
  { code: "bn", name: "বাংলা" },
  { code: "pt", name: "Portugues" },
  { code: "ru", name: "Русский" },
  { code: "ja", name: "日本語" },
  { code: "de", name: "Deutsch" },
  { code: "ko", name: "한국어" },
  { code: "fr", name: "Francais" },
  { code: "it", name: "Italiano" },
  { code: "tr", name: "Turkce" },
  { code: "vi", name: "Tiếng Việt" },
  { code: "th", name: "ไทย" },
  { code: "pl", name: "Polski" },
  { code: "uk", name: "Українська" },
  { code: "nl", name: "Nederlands" },
  { code: "ro", name: "Română" },
  { code: "el", name: "Ελληνικά" },
  { code: "cs", name: "Čeština" },
  { code: "hu", name: "Magyar" },
  { code: "sv", name: "Svenska" },
  { code: "da", name: "Dansk" },
  { code: "fi", name: "Suomi" },
  { code: "no", name: "Norsk" },
  { code: "he", name: "עברית" },
  { code: "id", name: "Indonesia" },
  { code: "ms", name: "Melayu" },
  { code: "tl", name: "Filipino" },
  { code: "sw", name: "Kiswahili" },
  { code: "bg", name: "Български" },
  { code: "hr", name: "Hrvatski" },
  { code: "sk", name: "Slovenčina" },
  { code: "sl", name: "Slovenščina" },
  { code: "lt", name: "Lietuvių" },
  { code: "lv", name: "Latviešu" },
  { code: "et", name: "Eesti" },
  { code: "sr", name: "Српски" },
  { code: "mk", name: "Македонски" },
  { code: "sq", name: "Shqip" },
  { code: "ca", name: "Català" },
  { code: "eu", name: "Euskara" },
  { code: "gl", name: "Galego" },
  { code: "mt", name: "Malti" },
  { code: "is", name: "Íslenska" },
  { code: "ga", name: "Gaeilge" },
  { code: "cy", name: "Cymraeg" },
  { code: "be", name: "Беларуская" },
  { code: "ka", name: "ქართული" },
  { code: "hy", name: "Հայերեն" },
  { code: "az", name: "Azərbaycan" },
  { code: "kk", name: "Қазақ" },
  { code: "uz", name: "O'zbek" },
  { code: "mn", name: "Монгол" },
  { code: "my", name: "မြန်မာ" },
  { code: "km", name: "ខ្មែរ" },
  { code: "lo", name: "ລາວ" },
  { code: "ka", name: "ქართული" },
  { code: "am", name: "አማርኛ" },
  { code: "ti", name: "ትግርኛ" },
  { code: "om", name: "Oromoo" },
  { code: "so", name: "Soomaali" },
  { code: "ha", name: "Hausa" },
  { code: "yo", name: "Yorùbá" },
  { code: "ig", name: "Igbo" },
  { code: "zu", name: "isiZulu" },
  { code: "af", name: "Afrikaans" },
  { code: "xh", name: "isiXhosa" },
  { code: "st", name: "Sesotho" },
  { code: "tn", name: "Setswana" },
  { code: "rw", name: "Kinyarwanda" },
  { code: "mg", name: "Malagasy" },
  { code: "pa", name: "ਪੰਜਾਬੀ" },
  { code: "gu", name: "ગુજરાતી" },
  { code: "ta", name: "தமிழ்" },
  { code: "te", name: "తెలుగు" },
  { code: "kn", name: "ಕನ್ನಡ" },
  { code: "ml", name: "മലയാളം" },
  { code: "mr", name: "मराठी" },
  { code: "ur", name: "اردو" },
  { code: "fa", name: "فارسی" },
  { code: "ps", name: "پښتو" },
  { code: "ku", name: "Kurdî" },
  { code: "ckb", name: "کوردی" },
];

const copyByLanguage = {
  en: {
    headline: "Tell Us About Your Project.",
    description:
      "Answer a few quick questions about your project to generate an estimated construction cost and professional fees.",
    cta: "Get Started",
  },
  es: {
    headline: "Cuentanos sobre tu proyecto.",
    description:
      "Responde algunas preguntas rapidas sobre tu proyecto para generar un costo de construccion estimado y honorarios profesionales.",
    cta: "Comenzar",
  },
  zh: {
    headline: "告诉我们您的项目。",
    description:
      "回答一些关于您项目的快速问题，以生成估算的建筑成本和专业费用。",
    cta: "开始",
  },
  hi: {
    headline: "हमें अपने प्रोजेक्ट के बारे में बताएं।",
    description:
      "अपने प्रोजेक्ट के बारे में कुछ त्वरित प्रश्नों का उत्तर दें ताकि अनुमानित निर्माण लागत और पेशेवर फीस उत्पन्न हो सके।",
    cta: "शुरू करें",
  },
  ar: {
    headline: "أخبرنا عن مشروعك.",
    description:
      "أجب عن بعض الأسئلة السريعة حول مشروعك لتوليد تكلفة بناء تقديرية ورسوم مهنية.",
    cta: "ابدأ",
  },
  bn: {
    headline: "আপনার প্রকল্প সম্পর্কে আমাদের জানান।",
    description:
      "আনুমানিক নির্মাণ খরচ এবং পেশাদার ফি তৈরি করতে আপনার প্রকল্প সম্পর্কে কিছু দ্রুত প্রশ্নের উত্তর দিন।",
    cta: "শুরু করুন",
  },
  pt: {
    headline: "Fale-nos sobre o seu projeto.",
    description:
      "Responda a algumas perguntas rapidas sobre o seu projeto para gerar um custo de construcao estimado e honorarios profissionais.",
    cta: "Comecar",
  },
  ru: {
    headline: "Расскажите нам о вашем проекте.",
    description:
      "Ответьте на несколько быстрых вопросов о вашем проекте, чтобы получить оценку стоимости строительства и профессиональных сборов.",
    cta: "Начать",
  },
  ja: {
    headline: "プロジェクトについてお聞かせください。",
    description:
      "プロジェクトに関するいくつかの簡単な質問に答えると、推定建設コストと専門家費用が生成されます。",
    cta: "開始",
  },
  de: {
    headline: "Erzahlen Sie uns von Ihrem Projekt.",
    description:
      "Beantworten Sie ein paar kurze Fragen zu Ihrem Projekt, um die geschatzten Baukosten und professionellen Gebuhren zu ermitteln.",
    cta: "Starten",
  },
  ko: {
    headline: "프로젝트에 대해 알려주세요.",
    description:
      "프로젝트에 대한 몇 가지 빠른 질문에 답하여 예상 건설 비용 및 전문가 수수료를 생성하세요.",
    cta: "시작",
  },
  fr: {
    headline: "Parlez-nous de votre projet.",
    description:
      "Repondez a quelques questions rapides sur votre projet pour generer un cout de construction estime et des honoraires professionnels.",
    cta: "Commencer",
  },
  it: {
    headline: "Raccontaci del tuo progetto.",
    description:
      "Rispondi a qualche domanda veloce sul tuo progetto per generare un costo di costruzione stimato e gli onorari professionali.",
    cta: "Inizia",
  },
  tr: {
    headline: "Projenizden bahsedin.",
    description:
      "Projeniz hakkında birkaç hızlı soruya yanıtlayarak tahmini inşaat maliyeti ve profesyonel ücretler oluşturun.",
    cta: "Başla",
  },
  vi: {
    headline: "Hãy cho chúng tôi biết về dự án của bạn.",
    description:
      "Trả lời một vài câu hỏi nhanh về dự án của bạn để tạo chi phí xây dựng ước tính và phí chuyên môn.",
    cta: "Bắt đầu",
  },
  th: {
    headline: "บอกเราเกี่ยวกับโครงการของคุณ",
    description:
      "ตอบคำถามสั้นๆ เกี่ยวกับโครงการของคุณเพื่อสร้างค่าใช้จ่ายการก่อสร้างโดยประมาณและค่าบริการมืออาชีพ",
    cta: "เริ่มต้น",
  },
  pl: {
    headline: "Powiedz nam o swoim projekcie.",
    description:
      "Odpowiedz na kilka szybkich pytań o swój projekt, aby wygenerować szacunkowy koszt budowy i opłaty profesjonalne.",
    cta: "Rozpocznij",
  },
  uk: {
    headline: "Розкажіть нам про свій проєкт.",
    description:
      "Відповідь на кілька швидких запитань про ваш проєкт, щоб отримати орієнтовну вартість будівництва та професійні збори.",
    cta: "Почати",
  },
  nl: {
    headline: "Vertel ons over uw project.",
    description:
      "Beantwoord een paar korte vragen over uw project om een geschatte bouwkosten en professionele vergoedingen te genereren.",
    cta: "Beginnen",
  },
  ro: {
    headline: "Spune-ne despre proiectul tău.",
    description:
      "Răspunde la câteva întrebări rapide despre proiectul tău pentru a genera o estimare a costurilor de construcție și taxe profesionale.",
    cta: "Începe",
  },
  el: {
    headline: "Πείτε μας για το έργο σας.",
    description:
      "Απαντήστε σε μερικές γρήγορες ερωτήσεις σχετικά με το έργο σας για να δημιουργήσετε έναν εκτιμώμενο κόστος κατασκευής και επαγγελματικές αμοιβές.",
    cta: "Ξεκινήστε",
  },
  cs: {
    headline: "Řekněte nám o svém projektu.",
    description:
      "Odpovězte na několik rychlých otázek o svém projektu, abyste generovali odhadované náklady na stavbu a profesionální poplatky.",
    cta: "Začít",
  },
  hu: {
    headline: "Meséljen a projektjéről.",
    description:
      "Válaszoljon néhány gyors kérdésre a projektjéről, hogy becsült építési költséget és szakmai díjakat generáljon.",
    cta: "Kezdés",
  },
  sv: {
    headline: "Berätta om ditt projekt.",
    description:
      "Svara på några snabba frågor om ditt projekt för att generera uppskattade byggkostnader och professionella avgifter.",
    cta: "Kom igång",
  },
  da: {
    headline: "Fortæl os om dit projekt.",
    description:
      "Svar på nogle korte spørgsmål om dit projekt for at generere estimerede byggeomkostninger og professionelle gebyrer.",
    cta: "Kom i gang",
  },
  fi: {
    headline: "Kerro meille projektistasi.",
    description:
      "Vastaa muutamaan nopeaan kysymykseen projektistasi luodaksesi arvioidut rakennuskustannukset ja ammattipalkkiot.",
    cta: "Aloita",
  },
  no: {
    headline: "Fortell oss om prosjektet ditt.",
    description:
      "Svar på noen korte spørsmål om prosjektet ditt for å generere estimerte byggekostnader og profesjonelle gebyrer.",
    cta: "Kom i gang",
  },
  he: {
    headline: "ספר לנו על הפרויקט שלך.",
    description:
      "ענה על כמה שאלות מהירות על הפרויקט שלך כדי לייצר עלויות בנייה משוערות ועמלות מקצועיות.",
    cta: "התחל",
  },
  id: {
    headline: "Beri tahu kami tentang proyek Anda.",
    description:
      "Jawab beberapa pertanyaan cepat tentang proyek Anda untuk menghasilkan estimasi biaya konstruksi dan biaya profesional.",
    cta: "Mulai",
  },
  ms: {
    headline: "Beritahu kami tentang projek anda.",
    description:
      "Jawab beberapa soalan cepat tentang projek anda untuk menghasilkan anggaran kos pembinaan dan yuran profesional.",
    cta: "Mula",
  },
  tl: {
    headline: "Sabihin sa amin ang tungkol sa iyong proyekto.",
    description:
      "Sumagot sa ilang mabilis na tanong tungkol sa iyong proyekto upang makabuo ng tinantiyang gastos sa konstruksyon at propesyonal na bayarin.",
    cta: "Magsimula",
  },
  sw: {
    headline: "Tuambie kuhusu mradi wako.",
    description:
      "Jibu baadhi ya maswali ya haraka kuhusu mradi wako ili kutengeneza gharama zilizokadiriwa za ujenzi na ada za kitaalamu.",
    cta: "Anza",
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
          <Link href="/" className="flex items-center gap-3">
            <img
              src="/logo.png"
              alt="BUILD PLAN"
              className="h-11 w-auto object-contain drop-shadow-[0_6px_18px_rgba(0,0,0,0.25)]"
            />
            <span className="text-xl font-semibold tracking-tight text-white">
              BUILD PLAN
            </span>
          </Link>

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
            <div 
              className="absolute right-0 mt-3 w-56 max-h-64 overflow-y-auto overscroll-contain rounded-2xl border border-white/15 bg-slate-900/95 shadow-2xl backdrop-blur-xl scrollbar-hide"
              onClick={(e) => e.stopPropagation()}
            >
              {languages.map((item) => (
                <button
                  key={item.code}
                  type="button"
                  onClick={() => {
                    setLanguage(item.code);
                    setIsDropdownOpen(false);
                  }}
                  className="block w-full px-5 py-3 text-left text-sm font-medium text-white transition hover:bg-white/10 cursor-pointer"
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
          <GreetingAnimation />
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
