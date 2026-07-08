import { useGreetingAnimation } from "../hooks/useGreetingAnimation";

export default function GreetingAnimation() {
  const { currentGreeting } = useGreetingAnimation();

  return (
    <div className="min-h-[140px] md:min-h-[160px] lg:min-h-[180px] flex items-center justify-center">
      <h1
        className="text-[72px] sm:text-[84px] md:text-[96px] lg:text-[96px] text-white tracking-[-0.04em] leading-none drop-shadow-[0_10px_35px_rgba(0,0,0,0.35)]"
        style={{ fontFamily: '"Playwrite ID", cursive' }}
      >
        {currentGreeting}
      </h1>
    </div>
  );
}
