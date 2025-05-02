import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbSeparator,
} from '@/components/ui/breadcrumb.js';
import { Link, useRouterState } from '@tanstack/react-router';
import * as React from 'react';
import { Fragment } from 'react';


export interface BreadcrumbPair {
  label: string | React.ReactElement
  path: string
}

export type BreadcrumbShorthand = string | React.ReactElement

export type PageBreadcrumb = BreadcrumbPair | BreadcrumbShorthand

export function GeneratedBreadcrumbs() {
    const matches = useRouterState({ select: s => s.matches });
    function isBreadcrumbPair(item: any): item is BreadcrumbPair {
        return item && typeof item === 'object' && typeof item.label !== 'undefined' && typeof item.path === 'string';
    }

    const dynamicBreadcrumbs: BreadcrumbPair[] = matches
        .filter(match => match.loaderData?.breadcrumb)
        .map(({ pathname, loaderData }) => {
            if (!loaderData) {
                return undefined;
            }
            
            const processItem = (item: PageBreadcrumb, currentPath: string): BreadcrumbPair | undefined => {
                 if (typeof item === 'string') {
                    return { label: item, path: currentPath };
                } else if (React.isValidElement(item)) {
                    return { label: item, path: currentPath };
                } else if (typeof item === 'object' && item.label && item.path) {
                    return { label: item.label, path: item.path };
                }
                return undefined;
            };

            const breadcrumbData = loaderData.breadcrumb;

            if (typeof breadcrumbData === 'string') {
                return processItem(breadcrumbData, pathname);
            }
            if (Array.isArray(breadcrumbData)) {
                return breadcrumbData.map(item => processItem(item, pathname));
            }
            if (typeof breadcrumbData === 'function') {
                const breadcrumbResult = breadcrumbData();
                
                if (Array.isArray(breadcrumbResult)) {
                    return breadcrumbResult.map(item => processItem(item, pathname));
                } else {
                    return processItem(breadcrumbResult, pathname); 
                }
            }
            if (React.isValidElement(breadcrumbData)) {
                return processItem(breadcrumbData, pathname);
            }
            return undefined;
        })
        .flat()
        .filter(isBreadcrumbPair);
    
    // Define the static home breadcrumb
    const homeBreadcrumb: BreadcrumbPair = { 
        // label: <HomeIcon className="h-4 w-4" />, // Optional: Use an icon
        label: 'Dashboard', 
        path: '/' 
    };

    // Prepend the home breadcrumb to the dynamic ones
    const breadcrumbs = [homeBreadcrumb, ...dynamicBreadcrumbs];

    return (
        <Breadcrumb>
            <BreadcrumbList>
                {breadcrumbs.map(({ label, path }, index, arr) => (
                    <Fragment key={path}>
                        <BreadcrumbItem className="hidden md:block">
                            <BreadcrumbLink asChild>
                                <Link 
                                    to={path}
                                    // Add active styles if needed, check TanStack Router docs
                                //  className={({ isActive }) => cn("transition-colors hover:text-foreground", isActive ? "font-medium text-foreground" : "text-muted-foreground")}
                                >
                                    {label}
                                </Link>
                            </BreadcrumbLink>
                        </BreadcrumbItem>
                        {index < arr.length - 1 && <BreadcrumbSeparator className="hidden md:block" />}
                    </Fragment>
                ))}
            </BreadcrumbList>
        </Breadcrumb>
    );
}
