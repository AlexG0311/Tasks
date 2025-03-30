const Card = ({ iconSvg, title, description }) => {
    return (
      <div className="relative group bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden transform transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl">
        <div className="p-6 relative z-10">
          <span className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900 mb-4">
            <svg
              className="w-6 h-6 text-blue-600 dark:text-blue-300"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.2"
              strokeLinecap="round"
              strokeLinejoin="round"
              dangerouslySetInnerHTML={{ __html: iconSvg }}
            />
          </span>
          <h4 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">{title}</h4>
          <p className="text-gray-600 dark:text-gray-300 text-sm">{description}</p>
        </div>
        {/* Shine effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 transform -skew-x-12 pointer-events-none"></div>
        {/* Background pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="grid grid-cols-4 grid-rows-3 h-full w-full">
            <div className="bg-gray-200 dark:bg-gray-700"></div>
            <div className="bg-gray-300 dark:bg-gray-600"></div>
            <div className="bg-gray-200 dark:bg-gray-700"></div>
            <div className="bg-gray-300 dark:bg-gray-600"></div>
            <div className="bg-gray-300 dark:bg-gray-600"></div>
            <div className="bg-gray-200 dark:bg-gray-700"></div>
            <div className="bg-gray-300 dark:bg-gray-600"></div>
            <div className="bg-gray-200 dark:bg-gray-700"></div>
            <div className="bg-gray-200 dark:bg-gray-700"></div>
            <div className="bg-gray-300 dark:bg-gray-600"></div>
          </div>
        </div>
      </div>
    );
  };
  
  export default Card;