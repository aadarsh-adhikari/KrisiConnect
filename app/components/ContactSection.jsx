"use client";

export default function ContactSection() {
  const sendMail = (e) => {
    e.preventDefault();
    const form = e.target;
    const name = form.elements.name?.value || '';
    const email = form.elements.email?.value || '';
    const message = form.elements.message?.value || '';

    const subject = encodeURIComponent(`Contact from ${name}`);
    const htmlBody = `<p><strong>Name:</strong> ${name}</p><p><strong>Email:</strong> ${email}</p><p><strong>Message:</strong><br/>${message.replace(/\n/g,'<br/>')}</p>`;

    // Replace the email address below with your personal Gmail address
    const mailto = `mailto:yourpersonal@gmail.com?subject=${subject}&body=${encodeURIComponent(htmlBody)}`;

    window.location.href = mailto;
  };

  return (
    <section className="min-h-screen bg-black text-white flex items-center justify-center px-6">
      <div className="max-w-6xl w-full grid grid-cols-1 md:grid-cols-2 gap-16">
        
        {/* Left: Form */}
        <form onSubmit={sendMail} className="space-y-8">
          <div>
            <input
              name="name"
              type="text"
              placeholder="Your Name"
              className="w-full bg-transparent border-b border-gray-500 py-3 text-sm focus:outline-none focus:border-white"
            />
          </div>

          <div>
            <input
              name="email"
              type="email"
              placeholder="Your Email"
              className="w-full bg-transparent border-b border-gray-500 py-3 text-sm focus:outline-none focus:border-white"
            />
          </div>

          <div>
            <textarea
              name="message"
              placeholder="Share your thoughts"
              rows="4"
              className="w-full bg-transparent border-b border-gray-500 py-3 text-sm resize-none focus:outline-none focus:border-white"
            />
          </div>

          <button type="submit" className="relative inline-block bg-white text-black text-xs font-medium px-10 py-4 tracking-wide hover:bg-gray-200 transition">
            SHARE YOUR FEEDBACK
          </button>
        </form>

        {/* Right: Text */}
        <div className="relative flex items-center">
          <div className="absolute -inset-6 border border-gray-700 rounded-[50%] opacity-40"></div>

          <div className="relative">
            <h2 className="text-5xl font-serif leading-tight">
              Contact <br />
              <span className="inline-block mt-2 border-t border-white w-16"></span>
              <span className="block mt-4">Us</span>
            </h2>

            <p className="mt-6 text-sm text-gray-400 max-w-sm">
              It is very important for us to keep in touch with you,
              so we are always ready to answer any question that
              interests you. Shoot!
            </p>
          </div>
        </div>

      </div>
    </section>
  );
}
