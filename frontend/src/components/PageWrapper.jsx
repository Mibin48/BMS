const PageWrapper = ({ children, className = '' }) => (
    <div className={`animate-fade-up min-h-screen px-6 py-8 md:px-8 md:py-10 max-w-screen-xl mx-auto ${className}`}>
        {children}
    </div>
);

export default PageWrapper;
