import React, { useState, useRef, useEffect } from 'react';

const JobPreviewSection = () => {
    const [position, setPosition] = useState(0);
    const sliderRef = useRef(null);

    const jobs = [
        { title: "Recruitment Officers", edu: "Bachelors Degree", exp: "At least 3 Years", loc: "Lebanon" },
        { title: "Data Analysts", edu: "Bachelors Degree", exp: "At least 3 Years", loc: "Algeria" },
        { title: "UI Designer", edu: "Bachelors Degree", exp: "2 Years", loc: "UAE" },
        { title: "Frontend Developer", edu: "Bachelors Degree", exp: "3 Years", loc: "Egypt" },
        { title: "Backend Developer", edu: "Bachelors Degree", exp: "3 Years", loc: "Jordan" },
        { title: "Project Manager", edu: "Bachelors Degree", exp: "5 Years", loc: "Saudi Arabia" },
    ];

    const scroll = (direction) => {
        const cardWidth = 278 + 20; // min-width + gap
        const move = direction === 'next' ? -cardWidth : cardWidth;

        // Simple boundary check
        const maxScroll = -(jobs.length * cardWidth - (sliderRef.current?.offsetWidth || 0));

        setPosition(prev => {
            const newPos = prev + move;
            if (newPos > 0) return 0;
            if (newPos < maxScroll) return maxScroll;
            return newPos;
        });
    };

    return (
        <section className="py-16 bg-[#E8F4FE] overflow-hidden">
            {/* Header */}
            <div className="max-w-[1300px] mx-auto px-4 flex justify-between items-center mb-12">
                <h2 className="font-['Roboto'] font-bold text-[40px] md:text-[60px] leading-tight text-[#0D47A1] capitalize">
                    Open Positions Preview
                </h2>
                <a href="#" className="flex items-center gap-2 font-['Roboto'] font-medium text-lg md:text-[28px] uppercase text-[#2597F3] no-underline">
                    See All <img src="/arrow.svg" alt="" className="w-6 md:w-auto" />
                </a>
            </div>

            <div className="flex flex-wrap lg:flex-nowrap gap-[30px]">
                {/* Slider Area */}
                <div className="w-full lg:w-3/4 relative pb-24 overflow-hidden">
                    <div
                        ref={sliderRef}
                        className="flex gap-5 transition-transform duration-500 ease-in-out pt-[70px] px-10"
                        style={{ transform: `translateX(${position}px)` }}
                    >
                        {jobs.map((job, index) => (
                            <div key={index} className="min-w-[278px] bg-white rounded-xl p-[15px] shadow-[10px_10px_25px_10px_rgba(0,0,0,0.05)]">
                                <img
                                    src="/preview_img_slider.webp"
                                    alt=""
                                    className="w-full rounded-[10px] -mt-[70px] mb-2.5"
                                />
                                <h3 className="font-['Roboto'] font-bold text-[25px] leading-[48px] text-[#2A69C6] capitalize">
                                    {job.title}
                                </h3>
                                <div className="space-y-1 font-['Roboto'] text-xl text-[#757575] capitalize">
                                    <p><b className="font-bold text-gray-800">Education:</b> {job.edu}</p>
                                    <p><b className="font-bold text-gray-800">Experience:</b> {job.exp}</p>
                                    <p><b className="font-bold text-gray-800">Location:</b> {job.loc}</p>
                                </div>
                                <button className="mt-4 w-full border border-[#2196F3] rounded-[10px] py-2 font-['Roboto'] font-medium text-xl text-[#0D47A1] transition-colors hover:bg-[#2196F3] hover:text-white">
                                    Browse Job
                                </button>
                            </div>
                        ))}
                    </div>

                    {/* Navigation Buttons */}
                    <div className="absolute bottom-6 w-full flex justify-center gap-10">
                        <button
                            onClick={() => scroll('prev')}
                            className="w-10 h-10 rounded-full bg-white shadow-md flex items-center justify-center hover:scale-110 transition-transform"
                        >
                            <img src="/Vector (3).svg" alt="prev" className="w-5" />
                        </button>
                        <button
                            onClick={() => scroll('next')}
                            className="w-10 h-10 rounded-full bg-white shadow-md flex items-center justify-center hover:scale-110 transition-transform"
                        >
                            <img src="/Vector (4).svg" alt="next" className="w-5" />
                        </button>
                    </div>
                </div>

                {/* Static Side Image */}
                <div className="hidden lg:block w-[23%]">
                    <img
                        src="/preview_img.webp"
                        alt="Preview side decor"
                        className="w-full object-contain"
                    />
                </div>
            </div>
        </section>
    );
};

export default JobPreviewSection;