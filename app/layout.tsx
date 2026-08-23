// Layout component with PWA meta tags
import React from 'react';

export default function Layout({ children }) {
  return (
    <html lang="en">
      <head>
        {/* PWA meta tags go here */}
      </head>
      <body>{children}</body>
    </html>
  );
}
