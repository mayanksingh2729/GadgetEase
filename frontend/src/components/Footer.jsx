import React from "react";

const Footer = () => {

  return (
    <footer className="bg-black text-white py-8 px-6">
      <div className="max-w-8xl mx-auto flex flex-col md:flex-row justify-between gap-6">
        {/* Left Side: Subscribe Section */}
        <div className="md:w-2/8">
          <h2 className="text-xl font-bold text-sky-400">Subscribe to our newsletter for updates.</h2>
          <div className="mt-3 flex gap-6">
            <input
              type="email"
              placeholder="Enter your email"
              className="p-2 w-full border border-gray-300 rounded-md text-sky-400 focus:outline-none"
            />
            <button className="bg-blue-500 text-white font-bold text-lg px-4 py-2 rounded-md transform transition-all duration-300 hover:scale-105 hover:bg-black hover:text-sky-400">
              Subscribe
            </button>
          </div>
        </div>

        {/* Right Side: Quick Learn & Industries */}
        <div className="md:w-1/3 flex flex-wrap justify-between">
          {/* Quick Learn Section */}
          <div className="mb-4 md:mb-0">
            <h3 className="text-lg text-sky-400 font-semibold">Quick Learn</h3>
            <ul className="mt-2 space-y-2">
              <li>
                <a href="#" className="hover:text-blue-400">Home</a>
              </li>
              <li>
                <a href="#" className="hover:text-blue-400">Who are we</a>
              </li>
              <li>
                <a href="#" className="hover:text-blue-400">Our Guidelines</a>
              </li>
            </ul>
          </div>

          {/* Industries Section */}
          <div>
            <h3 className="text-lg text-sky-400 font-semibold">Industries</h3>
            <ul className="mt-2 space-y-2">
              <li>
                <a href="#" className="hover:text-blue-400">Retail & E-commerce</a>
              </li>
              <li>
                <a href="#" className="hover:text-blue-400">Information & Technology</a>
              </li>
              <li>
                <a href="#" className="hover:text-blue-400">Finance & Insurance</a>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Divider Line */}
      <hr className="border-gray-400 my-6" />

      {/* Bottom Section: App Store & Social Links */}
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
        {/* App Store Links */}
        <div className="flex gap-4">
          <img
            src="https://upload.wikimedia.org/wikipedia/commons/thumb/7/78/Google_Play_Store_badge_EN.svg/2560px-Google_Play_Store_badge_EN.svg.png"
            alt="Google Play Store"
            className="h-12 cursor-pointer"
          />
          <img
            src="https://upload.wikimedia.org/wikipedia/commons/thumb/9/91/Download_on_the_App_Store_RGB_blk.svg/1200px-Download_on_the_App_Store_RGB_blk.svg.png"
            alt="Apple App Store"
            className="h-12 cursor-pointer"
          />
        </div>

        {/* Social Media Links */}
        <div className="flex gap-6">
          <a href="#" target="_blank" rel="noopener noreferrer">
          <img width="64" height="64" src="https://img.icons8.com/nolan/64/facebook-new.png" alt="facebook-new"/>
          </a>
          <a href="#" target="_blank" rel="noopener noreferrer">
          <img width="64" height="64" src="https://img.icons8.com/nolan/64/instagram-new.png" alt="instagram-new"/>
          </a>
          <a href="#" target="_blank" rel="noopener noreferrer">
          <img width="64" height="64" src="https://img.icons8.com/nolan/64/linkedin.png" alt="linkedin"/>
          </a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
