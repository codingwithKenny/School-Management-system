import Image from "next/image";
import Link from "next/link";

const NewsCard = () => {
  return (
    <div className="border border-gray-200 shadow-md overflow-hidden w-full max-w-xs bg-white transition-transform transform hover:scale-105">
      {/* Image Section - Full Width */}
      <div className="w-full h-44 relative">
        <Image 
          src="/school2.jpg" 
          alt="News Image" 
          layout="fill"
          objectFit="cover"
          className="w-full"
        />
      </div>

      {/* Content Section */}
      <div className="p-3 gap-2 flex flex-col ">
        {/* Date Section */}
        <div className="flex items-center gap-2 text-gray-600 text-xs">
          <Image 
            src="/calendar.png" 
            alt="Date" 
            width={14} 
            height={14} 
          />
          <span>Jan 29, 2025</span>
        </div>

        {/* Title */}
        <h1 className="text-sm font-semibold text-gray-800 mt-2">
          Enhancing Academic Excellence in Our Schools
        </h1>

        {/* Description */}
        <p className="text-xs text-gray-600 mt-1 px-2 leading-relaxed">
          Discover how Muslim Group of Schools is advancing education with an engaging curriculum and dedicated teachers.
        </p>

        {/* Read More Link */}
        <Link 
          href="/news/[id]" 
          as={`/news/${123}`} 
          className="mt-2 text-purple-600 text-xs font-medium hover:underline"
        >
          Read More →
        </Link>
      </div>
    </div>
  );
};

export default NewsCard;
