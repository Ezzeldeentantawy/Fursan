import React from 'react';

const HeroSection = () => {
    return (
        <section className="relative py-20 pb-12 overflow-hidden bg-white">
            {/* Background Artwork - Equivalent to .hero_sec::before */}
            <div
                className="absolute top-0 right-0 w-1/2 h-full bg-no-repeat bg-cover z-10"
                style={{ backgroundImage: "url('/Artwork.webp')" }}
            />

            {/* Main Container */}
            <div className="relative z-20 max-w-[1300px] mx-auto px-4 flex flex-col md:flex-row items-center gap-8">

                {/* Content Section */}
                <div className="w-full md:w-1/2">
                    <h2 className="font-['Roboto'] font-bold text-[40px] leading-[45px] capitalize text-black">
                        Innovative tech for <span className="text-[#0D47A1]">simpler,</span> smarter hiring
                    </h2>
                    <p className="mt-4 font-['Roboto'] font-normal text-2xl leading-[139%] text-black/50">
                        Attract, hire, and manage skilled professionals in Jordan through one secure, all-in-one HR platform.
                    </p>
                </div>

                {/* Image Section */}
                <div className="w-full md:w-1/2">
                    <img
                        src="/Hero Image.webp"
                        alt="Hiring platform interface"
                        className="w-full h-auto object-contain"
                    />
                </div>

            </div>
        </section>
    );
};

export default HeroSection;