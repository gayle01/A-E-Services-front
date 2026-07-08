import { Link } from "wouter";
import { ArrowRight } from "lucide-react";

export default function CTAButtons({ label = "Get Started" }) {
  return (
    <div className="flex justify-center items-center">
      <Link
        href="/estimate"
        className="group inline-flex items-center justify-center gap-3 px-10 h-[70px] bg-[#2563EB] text-white rounded-[22px] font-semibold text-2xl shadow-[0_16px_45px_rgba(37,99,235,0.35)] transition-transform hover:-translate-y-0.5"
      >
        <span>{label}</span>
        <span className="inline-flex transition-transform duration-200 group-hover:translate-x-1">
          <ArrowRight className="w-8 h-8" />
        </span>
      </Link>
    </div>
  );
}
