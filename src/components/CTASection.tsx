import React, { useState } from 'react';

const CTASection = () => {
    const [email, setEmail] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        console.log("Submitting email:", email);
        // Add your form submission logic here
    };

    return (
        <section className="py-16 bg-white overflow-hidden">
            <div className="max-w-[1300px] mx-auto px-4">

                {/* Blue Container */}
                <div className="bg-[#2A69C6] rounded-[21px] overflow-hidden">

                    <div className="flex flex-wrap items-center px-10 py-[55px]">

                        {/* Left Side: Text Content (60%) */}
                        <div className="w-full lg:w-[60%] mb-8 lg:mb-0">
                            <h2 className="font-['Roboto'] font-bold text-4xl leading-none text-white m-0">
                                Ready to get started?
                            </h2>
                            <p className="font-['Roboto'] font-normal text-2xl leading-[1.3] text-white mt-[15px] max-w-2xl">
                                Join our growing HR and recruitment community for insights, updates, and career opportunities.
                            </p>
                        </div>

                        {/* Right Side: Form (40%) */}
                        <div className="w-full lg:w-[40%]">
                            <form
                                onSubmit={handleSubmit}
                                className="border border-white p-[5px_10px] rounded-[10px] flex items-center justify-between"
                            >
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="email address"
                                    className="bg-transparent border-none text-white w-[58%] focus:outline-none placeholder:text-white/100 placeholder:font-['Roboto'] placeholder:text-[19px] placeholder:capitalize"
                                    required
                                />

                                <button
                                    type="submit"
                                    className="relative bg-white border border-[#2A69C6] text-[#2A69C6] py-5 px-[60px] font-['Roboto'] font-extrabold text-base leading-none text-center uppercase rounded-[10px] transition-transform hover:scale-105 active:scale-95 flex items-center justify-center gap-2"
                                >
                                    {/* Icon injected here to replace CSS ::before */}
                                    <img src="/android-send.svg" alt="" className="w-4 h-4" />
                                    Join Us!
                                </button>
                            </form>
                        </div>

                    </div>
                </div>
            </div>
        </section>
    );
};

export default CTASection;