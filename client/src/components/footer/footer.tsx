const Footer = () => {
  return (
    <footer className="bg-white text-gray-700 px-6 md:px-20 border-t dark:bg-[#091025] dark:text-gray-300">
      {/* Bottom */}
      <div className="p-4 text-center flex justify-between text-sm items-center">
        <div className="text-gray-400">
          © {new Date().getFullYear()} Face-Teacher. All rights reserved.
        </div>
        <div className="text-gray-400">developed by: FaceTeacher solutions </div>
      </div>
    </footer>
  );
};

export default Footer;
