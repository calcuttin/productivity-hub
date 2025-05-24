import React from 'react';
import Link from 'next/link';

interface LinkedPostProps {
  title: string;
  description: string;
  href: string;
  date?: string;
  tags?: string[];
}

const LinkedPost: React.FC<LinkedPostProps> = ({
  title,
  description,
  href,
  date,
  tags = [],
}) => {
  return (
    <div className="group relative rounded-lg border border-gray-200 p-6 hover:border-gray-300 transition-all duration-200">
      <Link href={href} className="block">
        <h2 className="text-xl font-semibold text-gray-900 group-hover:text-blue-600 transition-colors duration-200">
          {title}
        </h2>
        {date && (
          <p className="mt-1 text-sm text-gray-500">
            {new Date(date).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </p>
        )}
        <p className="mt-2 text-gray-600">{description}</p>
        {tags.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-2">
            {tags.map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </Link>
    </div>
  );
};

export default LinkedPost; 