
export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <main className="auth-container">
          {children}
        </main>
      </body>
    </html>
  );
}
