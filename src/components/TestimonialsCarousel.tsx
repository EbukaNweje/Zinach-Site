"use client";

import { useEffect, useRef, useState } from "react";

type Testimonial = {
  quote: string;
  author: string;
  role: string;
};

type TestimonialsCarouselProps = {
  testimonials: Testimonial[];
};

export default function TestimonialsCarousel({
  testimonials,
}: TestimonialsCarouselProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const itemRefs = useRef<Array<HTMLDivElement | null>>([]);
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (testimonials.length === 0) return;

    const interval = window.setInterval(() => {
      setActiveIndex((current) => (current + 1) % testimonials.length);
    }, 5000);

    return () => window.clearInterval(interval);
  }, [testimonials.length]);

  useEffect(() => {
    const scrollContainer = containerRef.current;
    const currentItem = itemRefs.current[activeIndex];
    if (!scrollContainer || !currentItem) return;

    const targetLeft = currentItem.offsetLeft - scrollContainer.offsetLeft;
    scrollContainer.scrollTo({
      left: targetLeft,
      behavior: "smooth",
    });
  }, [activeIndex]);

  const handlePrevious = () => {
    setActiveIndex((current) =>
      current === 0 ? testimonials.length - 1 : current - 1,
    );
  };

  const handleNext = () => {
    setActiveIndex((current) => (current + 1) % testimonials.length);
  };

  return (
    <section id="testimonials" className="bg-slate-100 px-6 py-20">
      <div className="mx-auto max-w-7xl">
        <div className="mb-12 text-center">
          <p className="text-sm uppercase tracking-[0.24em] text-slate-500">
            Reviews
          </p>
          <h2 className="mt-3 text-4xl font-semibold text-slate-900">
            Trusted by patients across the U.S.
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-slate-600">
            Hear from customers who chose safe, physician-reviewed pharmacy care
            and fast shipping.
          </p>
        </div>

        <div className="relative">
          <div className="flex items-center justify-between pb-4">
            <div className="text-sm font-medium text-slate-500">
              Scroll through recent patient feedback
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handlePrevious}
                className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-300 bg-white text-slate-700 shadow-sm transition hover:bg-slate-50"
                aria-label="Previous testimonial"
              >
                ‹
              </button>
              <button
                type="button"
                onClick={handleNext}
                className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-300 bg-white text-slate-700 shadow-sm transition hover:bg-slate-50"
                aria-label="Next testimonial"
              >
                ›
              </button>
            </div>
          </div>

          <div
            ref={containerRef}
            className="flex gap-6 overflow-x-auto pb-4 pr-4 sm:px-2 snap-x snap-mandatory scroll-smooth"
          >
            {testimonials.map((item, index) => (
              <div
                key={item.author}
                ref={(el) => {
                  itemRefs.current[index] = el;
                }}
                className="min-w-[320px] flex-shrink-0 snap-start rounded-[2rem] border border-slate-200 bg-white p-8 shadow-sm"
              >
                <p className="text-lg leading-8 text-slate-700">
                  “{item.quote}”
                </p>
                <div className="mt-8">
                  <p className="text-base font-semibold text-slate-900">
                    {item.author}
                  </p>
                  <p className="text-sm text-slate-500">{item.role}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 flex justify-center gap-2">
            {testimonials.map((_, index) => (
              <button
                key={index}
                type="button"
                aria-label={`Show testimonial ${index + 1}`}
                onClick={() => setActiveIndex(index)}
                className={`h-2.5 w-2.5 rounded-full transition ${
                  index === activeIndex
                    ? "bg-slate-900"
                    : "bg-slate-300 hover:bg-slate-400"
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
