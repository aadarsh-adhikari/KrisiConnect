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
    <section className="px-6 bg-[color:var(--background)] text-[color:var(--foreground)]">
      <div className="max-w-6xl w-full mx-auto grid grid-cols-1 md:grid-cols-2 gap-16 items-center py-6">
        
        {/* Left: Form */}
        <form onSubmit={sendMail} className="space-y-8 bg-[color:var(--card)] border border-[color:var(--border)] rounded-lg p-8 shadow">
          <div>
            <input
              name="name"
              type="text"
              placeholder="Your Name"
              className="w-full bg-transparent border-b border-[color:var(--border)] py-3 text-sm placeholder:text-[color:var(--muted)] focus:outline-none focus:border-[color:var(--accent)]"
            />
          </div>

          <div>
            <input
              name="email"
              type="email"
              placeholder="Your Email"
              className="w-full bg-transparent border-b border-[color:var(--border)] py-3 text-sm placeholder:text-[color:var(--muted)] focus:outline-none focus:border-[color:var(--accent)]"
            />
          </div>

          <div>
            <textarea
              name="message"
              placeholder="Share your thoughts"
              rows="4"
              className="w-full bg-transparent border-b border-[color:var(--border)] py-3 text-sm resize-none placeholder:text-[color:var(--muted)] focus:outline-none focus:border-[color:var(--accent)]"
            />
          </div>

          <button type="submit" className="relative inline-flex items-center justify-center bg-[color:var(--accent)] text-white text-sm font-semibold px-8 py-3 rounded-md tracking-wide hover:opacity-95 transition">
            SHARE YOUR FEEDBACK
          </button>
        </form>

        {/* Right: Text */}
        <div className="relative flex items-center">
          <div className="absolute -inset-6 border border-[color:var(--border)] rounded-[50%] opacity-20"></div>

          <div className="relative">
            <h2 className="text-5xl font-serif leading-tight text-[color:var(--foreground)]">
              Contact <br />
              <span className="inline-block mt-2 border-t border-[color:var(--accent)] w-16"></span>
              <span className="block mt-4">Us</span>
            </h2>

            <p className="mt-6 text-sm text-[color:var(--muted)] max-w-sm">
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
