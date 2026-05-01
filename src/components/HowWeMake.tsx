import React from 'react'

const HowWeMake = () => {
    const features = [
        {
            img: "/Rectangle.svg",
            title: "Find the Right Talent",
            desc: "Access pre-screened Jordanian professionals across technology, engineering, finance, human resources, and operations."
        },
        {
            img: "/Rectangle (1).svg",
            title: "Build Stronger Companies",
            desc: "Our scalable recruitment and HR solutions support long-term business growth and workforce stability."
        },
        {
            img: "/Rectangle (2).svg",
            title: "Save While Growing",
            desc: "Hiring in Jordan allows organizations to optimize costs without compromising on talent quality."
        },
        {
            img: "/Rectangle (3).svg",
            title: "Quick Apply",
            desc: "Job seekers can apply easily, track applications, and connect with top employers."
        }
    ];

    return (
        <section className="py-16 bg-white overflow-hidden">
            <div className="max-w-[1300px] mx-auto px-4 flex flex-wrap items-center justify-between">

                {/* Left Side: Illustration/Image */}
                <div className="w-full lg:w-[48%] mb-8 lg:mb-0">
                    <img
                        src="/About (1).webp"
                        alt="About our platform"
                        className="w-full max-w-[654px] mx-auto block"
                    />
                </div>

                {/* Right Side: Feature Grid */}
                <div className="w-full lg:w-[48%] flex flex-wrap lg:pl-[50px] gap-y-[30px]">
                    {features.map((item, index) => (
                        <div key={index} className="w-full sm:w-1/2 flex flex-col">
                            <img
                                src={item.img}
                                alt=""
                                className="w-fit mb-2"
                            />
                            <h4 className="font-['Roboto'] font-medium text-[26px] leading-[42px] text-black/85">
                                {item.title}
                            </h4>
                            <p className="font-['Roboto'] font-normal text-base leading-6 text-black/85 max-w-[286px] mt-1">
                                {item.desc}
                            </p>
                        </div>
                    ))}
                </div>

            </div>
        </section>
    );
}

export default HowWeMake