import React from 'react';

const RecruitmentSection = () => {
    const recruitmentFeatures = [
        {
            img: "/Rectangle.svg",
            title: "Powerful ATS",
            desc: "Take control of your hiring with our easy-to-use ATS platform."
        },
        {
            img: "/Rectangle (1).svg",
            title: "Effortless Recruitment",
            desc: "Build your team faster with Fursan’s expert outsourcing services."
        },
        {
            img: "/Rectangle (2).svg",
            title: "Control documents",
            desc: "Drag and drop support documents and auto-link to relevant work papers."
        },
        {
            img: "/Rectangle (3).svg",
            title: "Job Seeker Hub",
            desc: "Create an account, apply, and land your next job quickly and easily."
        }
    ];

    return (
        <section className="py-16 bg-white overflow-hidden">
            <div className="max-w-[1300px] mx-auto px-4 flex flex-wrap lg:flex-row-reverse items-center justify-between">

                {/* Right Side: Illustration (Swapped to Right on Large Screens) */}
                <div className="w-full lg:w-[48%] mb-8 lg:mb-0">
                    <img
                        src="/Illustration & Title.webp"
                        alt="Recruitment Illustration"
                        className="w-full max-w-[654px] mx-auto block"
                    />
                </div>

                {/* Left Side: Feature Grid (Text Aligned Right) */}
                <div className="w-full lg:w-[48%] flex flex-wrap lg:pr-[50px] gap-y-[30px] text-right">
                    {recruitmentFeatures.map((item, index) => (
                        <div key={index} className="w-full sm:w-1/2 flex flex-col items-end">
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
};

export default RecruitmentSection;