import './globals.css';

// <html> и <body> задаются в app/[locale]/layout.tsx (свой lang для каждой версии).
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return children;
}
