/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { ComponentProps, createContext, useContext } from 'react';
import { UseFormReturn } from 'react-hook-form';
import { useMediaQuery } from '@uidotdev/usehooks'; 
import { cn } from '@/lib/utils'; 
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"; // Use your shadcn Card
import { Form } from "@/components/ui/form"; 

export interface PageContext {
    pageId?: string;
    entity?: any;
    form?: UseFormReturn<any>;
}
const PageContext = createContext<PageContext | undefined>(undefined);
export const usePageContext = () => {
    const context = useContext(PageContext);
    // if (!context) {
    //   throw new Error('usePageContext must be used within a Page component');
    // }
    return context;
};

export const PageProvider = createContext<PageContext | undefined>(undefined);

export interface PageProps extends Omit<ComponentProps<'div'>, 'onSubmit'> {
    pageId?: string; 
    entity?: any;    // The main data entity for the page (optional)
    form?: UseFormReturn<any>; // Pass react-hook-form instance
    onSubmit?: (event?: React.BaseSyntheticEvent) => Promise<void>; 
    className?: string;
    children: React.ReactNode;
}

export function Page({ children, pageId, entity, form, onSubmit, className, ...props }: PageProps) {
    const childArray = React.Children.toArray(children);

    const pageTitle = childArray.find(child => React.isValidElement(child) && child.type === PageTitle);
    const pageActionBar = childArray.find(
        child => React.isValidElement(child) && child.type === PageActionBar,
    );
    // All other direct children are considered page content
    const pageContent = childArray.filter(
        child => React.isValidElement(child) && child.type !== PageTitle && child.type !== PageActionBar,
    );

    const headerRow = (pageTitle || pageActionBar) ? (
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
            {pageTitle}
            {pageActionBar}
        </div>
    ) : null;

    const contentWithForm = form && onSubmit ? (
        <Form {...form}>
            <form onSubmit={onSubmit} className="space-y-4 lg:space-y-6">
                {headerRow}
                {pageContent}
            </form>
        </Form>
    ) : (
        <div className="space-y-4 lg:space-y-6">
            {headerRow}
            {pageContent}
        </div>
    );

    return (
        // Provide context values to descendants
        <PageContext.Provider value={{ pageId, form, entity }}>
            <div className={cn('p-4 md:p-6', className)} {...props}>
                {contentWithForm}
            </div>
        </PageContext.Provider>
    );
}


// --- Page Layout Component ---
// Arranges PageBlocks into columns based on props
export interface PageLayoutProps {
    children: React.ReactNode;
    className?: string;
}

// Helper to check if a child is a PageBlock or FullWidthPageBlock
function isPageBlockElement(child: unknown): child is React.ReactElement<PageBlockProps | FullWidthPageBlockProps> {
    if (!React.isValidElement(child)) return false;
    return child.type === PageBlock || child.type === FullWidthPageBlock;
}

// Type predicate for main PageBlocks
function isMainPageBlock(block: React.ReactElement<any>): block is React.ReactElement<PageBlockProps> {
    return block.type === PageBlock && block.props.column === 'main';
}

// Type predicate for side PageBlocks
function isSidePageBlock(block: React.ReactElement<any>): block is React.ReactElement<PageBlockProps> {
    return block.type === PageBlock && block.props.column === 'side';
}

export function PageLayout({ children, className }: PageLayoutProps) {
    const isDesktop = useMediaQuery('only screen and (min-width : 768px)'); // Tailwind's 'md' breakpoint

    // --- Simplified Block Sorting (No Extensions) ---
    const allBlocks: React.ReactElement<PageBlockProps | FullWidthPageBlockProps>[] = [];
    React.Children.forEach(children, child => {
        // Handle fragments containing blocks
        if (React.isValidElement(child) && child.type === React.Fragment) {
            if (child.props && typeof child.props === 'object') {
                const fragmentChildren = (child.props as { children?: React.ReactNode }).children;
                React.Children.forEach(fragmentChildren, grandchild => {
                    if (isPageBlockElement(grandchild)) {
                        allBlocks.push(grandchild);
                    }
                });
            }
        } else if (isPageBlockElement(child)) { // Handle direct blocks
            allBlocks.push(child);
        }
    });

    // Categorize blocks based on type or 'column' prop
    const fullWidthBlocks = allBlocks.filter(block => block.type === FullWidthPageBlock);
    // Use type predicates for filtering
    const mainBlocks = allBlocks.filter(isMainPageBlock);
    const sideBlocks = allBlocks.filter(isSidePageBlock);

    return (
        <div className={cn('w-full', className)}>
            {/* Desktop Layout: Multi-column grid */}
            {isDesktop ? (
                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4 lg:gap-6">
                    {fullWidthBlocks.length > 0 && (
                        <div className="md:col-span-3 lg:col-span-4 space-y-4 lg:space-y-6">{fullWidthBlocks}</div>
                    )}
                    <div className="md:col-span-2 lg:col-span-3 space-y-4 lg:space-y-6">{mainBlocks}</div>
                    <div className="md:col-span-1 space-y-4 lg:space-y-6">{sideBlocks}</div>
                </div>
            ) : (
                // Mobile Layout: Single column stack
                <div className="space-y-4">
                    {/* Render blocks in received order on mobile */}
                    {allBlocks}
                </div>
            )}
        </div>
    );
}


// --- Page Title Component ---
export function PageTitle({ children }: { children: React.ReactNode }) {
    return <h1 className="text-2xl font-bold tracking-tight">{children}</h1>;
}


export function PageActionBar({ children }: { children: React.ReactNode }) {
    // Use React.Children to find specific Left/Right components if provided
    const childArray = React.Children.toArray(children);
    const leftContent = childArray.find(child => React.isValidElement(child) && child.type === PageActionBarLeft);
    const rightContent = childArray.find(child => React.isValidElement(child) && child.type === PageActionBarRight);
    // Get other direct children that are not Left/Right wrappers
    const otherChildren = childArray.filter(child => React.isValidElement(child) && child.type !== PageActionBarLeft && child.type !== PageActionBarRight);

    // Default to right alignment if only direct children are provided
    const justification = leftContent ? 'justify-between' : 'justify-end';

    return (
        <div className={cn('flex flex-wrap items-center gap-2', justification)}>
            {leftContent}
            {!leftContent && otherChildren}
            {rightContent || (leftContent ? otherChildren : null) /* Render direct children in right slot if right wrapper isn't used */}
        </div>
    );
}

export function PageActionBarLeft({ children }: { children: React.ReactNode }) {
    return <div className="flex justify-start items-center gap-2">{children}</div>;
}

export function PageActionBarRight({ children }: { children: React.ReactNode }) {
    // Simplified: No longer fetches extension items
    return <div className="flex justify-end items-center gap-2">{children}</div>;
}



export type PageBlockProps = {
    children?: React.ReactNode;
    column: 'main' | 'side'; // Explicitly require column for layout
    blockId?: string;
    title?: React.ReactNode | string;
    description?: React.ReactNode | string;
    className?: string;
}

export function PageBlock({ children, title, description, className }: PageBlockProps) {
    return (
        <Card className={cn('w-full', className)}>
            {title || description ? (
                <CardHeader>
                    {title && <CardTitle>{title}</CardTitle>}
                    {description && <CardDescription>{description}</CardDescription>}
                </CardHeader>
            ) : null}
            <CardContent className={cn(!title ? 'pt-6' : '')}>{children}</CardContent>
        </Card>
    );
}
export interface FullWidthPageBlockProps {
    children: React.ReactNode;
    className?: string;
}
export function FullWidthPageBlock({ children, className }: FullWidthPageBlockProps) {
    return (
        <div className={cn('w-full', className)}>{children}</div>
    );
}

export function DetailFormGrid({ children }: { children: React.ReactNode }) {
    return <div className="md:grid md:grid-cols-2 gap-4 items-start mb-4">{children}</div>;
}

export interface CustomFieldsPageBlockProps {
    column: 'main' | 'side';
    entityType: string;
    className?: string;
    // control: Control<any>;
}
export function CustomFieldsPageBlock({ column, entityType, className }: CustomFieldsPageBlockProps) {
    // TODO: Implement custom field fetching (via REST) and rendering logic here
    // We might need a hook like useRestCustomFields(entityType)
    return (
        <PageBlock column={column} title="Custom Fields" className={className}>
            <p className="text-sm text-muted-foreground">Custom fields for {entityType} will render here.</p>
        </PageBlock>
    );
}