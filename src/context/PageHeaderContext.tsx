import React, { createContext, useContext, useState, ReactNode, Dispatch, SetStateAction } from "react";

// Define the shape of the header props
interface HeaderProps {
  title: ReactNode;
  children: ReactNode | null;
}

// Define the context value type
interface PageHeaderContextType {
  headerProps: HeaderProps;
  setHeaderProps: Dispatch<SetStateAction<HeaderProps>>;
}

// Default values for the context
const defaultContextValue: PageHeaderContextType = {
  headerProps: { title: "", children: null },
  setHeaderProps: () => {},
};

// Create the context
const PageHeaderContext = createContext<PageHeaderContextType>(defaultContextValue);

// Hook to consume the context
export const usePageHeader = (): PageHeaderContextType => {
  const context = useContext(PageHeaderContext);
  if (!context) {
    throw new Error("usePageHeader must be used within a PageHeaderProvider");
  }
  return context;
};

// Provider component
export const PageHeaderProvider = ({ children }: { children: ReactNode }) => {
  const [headerProps, setHeaderProps] = useState<HeaderProps>(defaultContextValue.headerProps);

  return (
    <PageHeaderContext.Provider value={{ headerProps, setHeaderProps }}>
      {children}
    </PageHeaderContext.Provider>
  );
};
