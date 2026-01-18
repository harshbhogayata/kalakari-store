import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';

interface BreadcrumbItem {
    label: string;
    path?: string;
}

interface BreadcrumbProps {
    items?: BreadcrumbItem[];
    className?: string;
}

const Breadcrumb: React.FC<BreadcrumbProps> = ({ items, className = '' }) => {
    const location = useLocation();

    // Auto-generate breadcrumbs from path if items not provided
    const generateBreadcrumbs = (): BreadcrumbItem[] => {
        const pathSegments = location.pathname.split('/').filter(Boolean);
        const breadcrumbs: BreadcrumbItem[] = [];

        let currentPath = '';
        pathSegments.forEach((segment, index) => {
            currentPath += `/${segment}`;

            // Format segment into readable label
            const label = segment
                .replace(/-/g, ' ')
                .replace(/\b\w/g, char => char.toUpperCase());

            breadcrumbs.push({
                label: index === pathSegments.length - 1 ? label : label,
                path: index === pathSegments.length - 1 ? undefined : currentPath
            });
        });

        return breadcrumbs;
    };

    const breadcrumbItems = items || generateBreadcrumbs();

    // Don't render on homepage
    if (location.pathname === '/' || breadcrumbItems.length === 0) {
        return null;
    }

    return (
        <nav
            className={`bg-gray-50 border-b border-gray-200 ${className}`}
            aria-label="Breadcrumb"
        >
            <div className="container mx-auto px-6 py-3">
                <ol className="flex items-center space-x-2 text-sm">
                    <li>
                        <Link
                            to="/"
                            className="text-gray-500 hover:text-brand-clay transition-colors flex items-center"
                        >
                            <Home className="w-4 h-4" />
                            <span className="sr-only">Home</span>
                        </Link>
                    </li>

                    {breadcrumbItems.map((item, index) => (
                        <li key={index} className="flex items-center">
                            <ChevronRight className="w-4 h-4 text-gray-400 mx-1" />
                            {item.path ? (
                                <Link
                                    to={item.path}
                                    className="text-gray-500 hover:text-brand-clay transition-colors"
                                >
                                    {item.label}
                                </Link>
                            ) : (
                                <span className="text-gray-900 font-medium">
                                    {item.label}
                                </span>
                            )}
                        </li>
                    ))}
                </ol>
            </div>
        </nav>
    );
};

export default Breadcrumb;
