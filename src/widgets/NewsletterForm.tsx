import { useState } from "react";

export default function NewsletterForm() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (email) setSubmitted(true);
  };

  return (
    <>

        {submitted ? (
          <p className="text-white text-xl font-semibold animate-pulse">
            🎉 You're in! Welcome aboard.
          </p>
        ) : (
          <form
            onSubmit={handleSubmit}
            className="flex items-center gap-0 border border-white rounded-[10px] px-[10px] py-[5px] w-full max-w-xl"
          >
            {/* Email icon */}
            <svg
              className="w-5 h-5 text-white/60 mr-2 shrink-0"
              fill="none"
              stroke="currentColor"
              strokeWidth={1.5}
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25H4.5a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5H4.5a2.25 2.25 0 00-2.25 2.25m19.5 0l-9.75 6.75L2.25 6.75"
              />
            </svg>

            {/* Email input */}
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email Address"
              required
              className="
                flex-1
                bg-transparent
                border-none
                outline-none
                text-white
                placeholder:text-white
                placeholder:font-normal
                placeholder:text-[19px]
                placeholder:leading-none
                placeholder:capitalize
                text-[19px]
                leading-none
                w-[58%]
              "
            />

            {/* Submit button */}
            <button
              type="submit"
              className="
                flex items-center gap-2
                bg-white
                text-[#2A69C6]
                border border-[#2A69C6]
                rounded-[10px]
                px-[60px] py-[20px]
                font-extrabold
                text-[16px]
                leading-none
                uppercase
                tracking-wide
                transition-all
                duration-200
                hover:bg-[#2A69C6]
                hover:text-white
                hover:border-white
                active:scale-95
                cursor-pointer
                shrink-0
              "
            >
              {/* Send icon (replaces the SVG from ::before) */}
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                strokeWidth={2.5}
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5"
                />
              </svg>
              Join Us!
            </button>
          </form>
        )}
    </>
  );
}