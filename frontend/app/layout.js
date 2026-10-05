import './globals.css';

export const metadata = {
  title: 'RenewCred — Next.js Decarbonization Platform',
  description: 'ESP32 IoT Telemetry • AI dMRV Verification • Polygon Smart Contract',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="dark">
      <body className="bg-[#090d16] text-slate-100 font-sans antialiased min-h-screen flex flex-col">
        {children}
      </body>
    </html>
  );
}
