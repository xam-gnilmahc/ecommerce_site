import React, { useState } from 'react';

const ContactPage = () => {
  const [name, setname] = useState('');
  const [email, setEmail] = useState('');
  const [message, setmessage] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    alert(
      `Thank You ${name} for Contacting Us. We will Get Back to You Soon.\n\nYour Mail Id - ${email}.\nYour Message is - ${message}`
    );
    setname('');
    setEmail('');
    setmessage('');
  };

  return (
    <>
      <div className="container my-3 py-3">
        <div className="flex flex-col">
          <div>
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d49206.16593395236!2d2.5776979486328124!3d39.57346430000001!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x129793280de39c05%3A0x85d5f5ea839d6c2a!2sUOMO!5e0!3m2!1sen!2sin!4v1708798894132!5m2!1sen!2sin"
              width="800"
              height="600"
              allowfullscreen=""
              loading="lazy"
              referrerpolicy="no-referrer-when-downgrade"
              title="uomomap"
              className="w-full border-none bg-gray-50"
            ></iframe>
          </div>
          <div className="px-[clamp(16px,15vw,200px)] max-[1210px]:px-8 max-[450px]:px-4 flex flex-col gap-16">
            <div className="flex max-[450px]:flex-col">
              <div className="flex flex-col gap-4 mt-12 w-1/2 max-[450px]:w-full">
                <h3 className="text-xl font-semibold">Store in London</h3>
                <p className="text-sm text-gray-500">
                  1418 River Drive, Suite 35 Cottonhall, CA 9622
                  <br /> United Kingdom
                </p>
                <p className="text-sm text-gray-500">
                  admin@dummymail.com
                  <br />
                  +44 20 7123 4567
                </p>
              </div>
              <div className="flex flex-col gap-4 mt-12 w-1/2 max-[450px]:w-full">
                <h3 className="text-xl font-semibold">Store in India</h3>
                <p className="text-sm text-gray-500">
                  A-791, A-791, Bandra Reclamation Rd, Mumbai
                  <br /> Maharashtra
                </p>
                <p className="text-sm text-gray-500">
                  contact@dummymail.com
                  <br />
                  +44 20 7123 4567
                </p>
              </div>
            </div>
            <div>
              <h3 className="text-xl font-semibold mb-12">Get In Touch</h3>
              <form onSubmit={handleSubmit} className="flex flex-col gap-6">
                <input
                  type="text"
                  value={name}
                  placeholder="Name *"
                  onChange={(e) => setname(e.target.value)}
                  required
                  className="p-4 border border-gray-200 rounded-md text-gray-900 outline-none text-base transition-colors focus:border-gray-900"
                />
                <input
                  type="email"
                  value={email}
                  placeholder="Email address *"
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="p-4 border border-gray-200 rounded-md text-gray-900 outline-none text-base transition-colors focus:border-gray-900"
                />
                <textarea
                  rows={10}
                  cols={40}
                  placeholder="Your Message"
                  value={message}
                  onChange={(e) => setmessage(e.target.value)}
                  className="text-sm p-4 border border-gray-200 rounded-md text-gray-900 outline-none font-main resize-y min-h-[120px] transition-colors focus:border-gray-900"
                />
                <button
                  type="submit"
                  className="w-[200px] bg-gray-900 text-white border-none rounded-md px-4 py-4 uppercase font-semibold text-sm cursor-pointer transition-colors hover:bg-gray-800 max-[450px]:w-full"
                >
                  Submit
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ContactPage;
