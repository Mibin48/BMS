"use client"

import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '../../lib/utils';

const SQRT_5000 = Math.sqrt(5000);

const testimonials = [
  {
    tempId: 0,
    testimonial: "HEMA reduced our blood wastage by 40% in the first month. The real-time alerts are a game changer.",
    by: "Dr. Priya Menon, Chief Medical Officer at KIMS Hospital, TVM",
    imgSrc: "https://i.pravatar.cc/150?img=32"
  },
  {
    tempId: 1,
    testimonial: "We can now track every unit from donation to transfusion. Zero manual errors since deployment.",
    by: "Dr. Rahul Nair, Blood Bank Director at Lakeshore Centre, EKM",
    imgSrc: "https://i.pravatar.cc/150?img=11"
  },
  {
    tempId: 2,
    testimonial: "The AI forecasting predicted our O- shortage 3 days early. We had time to request from other banks.",
    by: "Dr. Ananya Krishnan, Emergency Medicine Head at Amrita Medical, KOCH",
    imgSrc: "https://i.pravatar.cc/150?img=45"
  },
  {
    tempId: 3,
    testimonial: "The efficiency gains since implementing HEMA are off the charts. Our team was up to speed in 10 minutes.",
    by: "Dr. Jibin Jose, Blood Bank Director at Medical College, Kozhikode",
    imgSrc: "https://i.pravatar.cc/150?img=12"
  },
  {
    tempId: 4,
    testimonial: "HEMA is the standard for blood management in Kerala. It has fundamentally changed how we handle crises.",
    by: "Dr. Lakshmi Varier, Head of Ops at MVR Cancer Centre, CLI",
    imgSrc: "https://i.pravatar.cc/150?img=5"
  },
  {
    tempId: 5,
    testimonial: "The scalability of HEMA's solution is impressive. It grows with our hospital network seamlessly.",
    by: "Arjun Krishnan, Scaling Officer at Aster Medcity, KOCH",
    imgSrc: "https://i.pravatar.cc/150?img=16"
  },
  {
    tempId: 6,
    testimonial: "We've tried many solutions, but HEMA stands out in terms of reliability and performance.",
    by: "Meera Nair, Performance Manager at Jubilee Mission, TCR",
    imgSrc: "https://i.pravatar.cc/150?img=20"
  }
];

const TestimonialCard = ({ 
  position, 
  testimonial, 
  handleMove, 
  cardSize 
}) => {
  const isCenter = position === 0;

  return (
    <div
      onClick={() => handleMove(position)}
      className={cn(
        "absolute left-1/2 top-1/2 cursor-pointer border-2 p-8 transition-all duration-500 ease-in-out select-none",
        isCenter 
          ? "z-10 shadow-[0px_8px_40px_rgba(217,0,37,0.35)]" 
          : "z-0 border-white/5 hover:border-[var(--red)]/30 opacity-70 scale-90"
      )}
      style={{
        width: cardSize,
        height: cardSize,
        background: isCenter ? 'var(--red)' : 'var(--bg2)',
        color: isCenter ? '#fff' : 'var(--text2)',
        borderColor: isCenter ? 'var(--red)' : 'var(--border)',
        clipPath: `polygon(50px 0%, calc(100% - 50px) 0%, 100% 50px, 100% 100%, calc(100% - 50px) 100%, 50px 100%, 0 100%, 0 0)`,
        transform: `
          translate(-50%, -50%) 
          translateX(${(cardSize / 1.5) * position}px)
          translateY(${isCenter ? -65 : position % 2 ? 15 : -15}px)
          rotate(${isCenter ? 0 : position % 2 ? 2.5 : -2.5}deg)
        `,
      }}
    >
      <span
        className="absolute block origin-top-right rotate-45"
        style={{
          right: -2,
          top: 48,
          width: SQRT_5000,
          height: 1.5,
          background: isCenter ? 'rgba(255,255,255,0.4)' : 'var(--border)'
        }}
      />
      
      <div className="relative mb-6">
        <img
          src={testimonial.imgSrc}
          alt={`${testimonial.by.split(',')[0]}`}
          className="h-14 w-12 object-cover object-top filter saturate-[0.8]"
          style={{
            boxShadow: `3px 3px 0px ${isCenter ? 'rgba(255,255,255,0.2)' : 'var(--bg)'}`,
            border: `1.5px solid ${isCenter ? '#fff' : 'var(--border)'}`
          }}
        />
        {/* Badge removed as requested */}
      </div>

      <h3 className={cn(
        "text-base sm:text-xl font-medium tracking-tight leading-relaxed italic",
        isCenter ? "text-white" : "text-[var(--text1)]"
      )}>
        "{testimonial.testimonial}"
      </h3>
      
      <div className={cn(
        "absolute bottom-8 left-8 right-8 mt-4 flex flex-col gap-0.5",
        isCenter ? "text-white/80" : "text-[var(--text3)]"
      )}>
        <p className="text-sm font-bold tracking-wider uppercase">— {testimonial.by.split('at')[0]}</p>
        <p className="text-[10px] font-mono opacity-60 uppercase">{testimonial.by.split('at')[1] || ''}</p>
      </div>
    </div>
  );
};

export const StaggerTestimonials = () => {
  const [cardSize, setCardSize] = useState(365);
  const [testimonialsList, setTestimonialsList] = useState(testimonials);

  const handleMove = (steps) => {
    const newList = [...testimonialsList];
    if (steps > 0) {
      for (let i = steps; i > 0; i--) {
        const item = newList.shift();
        if (!item) return;
        newList.push({ ...item, tempId: Math.random() });
      }
    } else {
      for (let i = steps; i < 0; i++) {
        const item = newList.pop();
        if (!item) return;
        newList.unshift({ ...item, tempId: Math.random() });
      }
    }
    setTestimonialsList(newList);
  };

  useEffect(() => {
    const updateSize = () => {
      const { matches } = window.matchMedia("(min-width: 640px)");
      setCardSize(matches ? 365 : 290);
    };

    updateSize();
    window.addEventListener("resize", updateSize);
    return () => window.removeEventListener("resize", updateSize);
  }, []);

  return (
    <div
      className="relative w-full overflow-hidden"
      style={{ height: 640 }}
    >
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[var(--bg2)]/10 to-transparent" />
      
      {testimonialsList.map((testimonial, index) => {
        const position = testimonialsList.length % 2
          ? index - (testimonialsList.length - 1) / 2
          : index - testimonialsList.length / 2;
        
        // Only render the visible cards (center and 3 on each side)
        if (Math.abs(position) > 3) return null;

        return (
          <TestimonialCard
            key={testimonial.tempId}
            testimonial={testimonial}
            handleMove={handleMove}
            position={position}
            cardSize={cardSize}
          />
        );
      })}

      <div className="absolute bottom-10 left-1/2 flex -translate-x-1/2 gap-4 z-20">
        <button
          onClick={() => handleMove(-1)}
          className={cn(
            "flex h-12 w-12 items-center justify-center text-2xl transition-all duration-300",
            "bg-[var(--bg)] border-2 border-[var(--border)] hover:bg-[var(--red)] hover:text-white hover:border-[var(--red)]",
            "active:scale-95"
          )}
          aria-label="Previous testimonial"
        >
          <ChevronLeft size={24} />
        </button>
        <button
          onClick={() => handleMove(1)}
          className={cn(
            "flex h-12 w-12 items-center justify-center text-2xl transition-all duration-300",
            "bg-[var(--bg)] border-2 border-[var(--border)] hover:bg-[var(--red)] hover:text-white hover:border-[var(--red)]",
            "active:scale-95"
          )}
          aria-label="Next testimonial"
        >
          <ChevronRight size={24} />
        </button>
      </div>
    </div>
  );
};
