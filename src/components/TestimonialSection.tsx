import React, { useState, useEffect, useRef } from 'react';

const TestimonialSection = () => {
    const [index, setIndex] = useState(0);
    const sliderRef = useRef(null);
    const visibleCards = 3;
    const cardGap = 30;

    const testimonials = [
        { name: "Jane Doe", role: "Chief Digital Officer", text: "Attach photographs of bonds, remittances and other attachments relating to sales invoices." },
        { name: "Jane Doe", role: "Chief Digital Officer", text: "Attach photographs of bonds, remittances and other attachments relating to sales invoices." },
        { name: "Jane Doe", role: "Chief Digital Officer", text: "Attach photographs of bonds, remittances and other attachments relating to sales invoices." },
        { name: "Jane Doe", role: "Chief Digital Officer", text: "Attach photographs of bonds, remittances and other attachments relating to sales invoices." },
        { name: "Jane Doe", role: "Chief Digital Officer", text: "Keep track of your digital assets and manage them effectively." },
    ];

    // Number of dots needed
    const dotCount = testimonials.length - visibleCards + 1;

    // Auto-slide logic
    useEffect(() => {
        const timer = setInterval(() => {
            setIndex((prevIndex) => (prevIndex >= dotCount - 1 ? 0 : prevIndex + 1));
        }, 3000);

        return () => clearInterval(timer); // Cleanup on unmount
    }, [dotCount]);

    // Calculate the transform offset
    const getOffset = () => {
        if (!sliderRef.current) return 0;
        const card = sliderRef.current.firstChild;
        if (!card) return 0;
        const moveWidth = card.offsetWidth + cardGap;
        return -(moveWidth * index);
    };

    return (
        <section className="relative bg-[#E8F4FE] overflow-hidden">
            <div className="flex flex-wrap lg:flex-nowrap items-center max-w-full">

                {/* Slider Section */}
                <div className="w-full lg:w-[73%] px-4 md:px-[50px] py-16 relative z-10">

                    {/* Background Shape */}
                    <div
                        className="absolute right-0 top-[-50px] bottom-[-50px] w-[388px] bg-no-repeat bg-cover z-0 hidden lg:block"
                        style={{ backgroundImage: "url('/shape.svg')" }}
                    />

                    <div className="relative z-10 max-w-[1100px] mx-auto overflow-hidden px-5">
                        <div
                            ref={sliderRef}
                            className="flex gap-[30px] transition-transform duration-[1500ms] ease-in-out"
                            style={{ transform: `translateX(${getOffset()}px)` }}
                        >
                            {testimonials.map((item, i) => (
                                <div
                                    key={i}
                                    className="card_testimonial min-w-full md:min-w-[calc((100%-60px)/3)] flex flex-col"
                                >
                                    <div className="bg-white p-[30px] rounded-[50px_50px_50px_0] shadow-[0_10px_25px_rgba(0,0,0,0.05)] mb-[30px]">
                                        <p className="font-['Roboto'] text-base leading-6 text-black/85 mb-[30px]">
                                            {item.text}
                                        </p>
                                        <div className="text-[#FFD700] text-[50px] leading-none">★★★★★</div>
                                    </div>

                                    <div className="flex items-center gap-3">
                                        <img src="/Ellipse.svg" alt="" className="w-[60px] h-[60px] rounded-full border-3 border-white shadow-sm" />
                                        <div>
                                            <p className="font-['Roboto'] font-bold text-[25px] text-black/85 m-0">{item.name}</p>
                                            <p className="font-['Roboto'] italic text-base text-black/50 m-0">{item.role}</p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Dots Container */}
                    <div className="flex justify-center gap-2.5 mt-10">
                        {Array.from({ length: dotCount }).map((_, i) => (
                            <div
                                key={i}
                                onClick={() => setIndex(i)}
                                className={`h-2.5 cursor-pointer transition-all duration-300 ${index === i
                                        ? "bg-[#2B59C3] w-[25px] rounded-[10px]"
                                        : "bg-[#cbd5e0] w-2.5 rounded-full"
                                    }`}
                            />
                        ))}
                    </div>
                </div>

                {/* Side Image */}
                <div className="w-full lg:w-[25%] py-16 hidden lg:block">
                    <img src="/Reviews.webp" alt="" className="w-full object-contain" />
                </div>

            </div>
        </section>
    );
};

export default TestimonialSection;