export function PWAHead() {
  return (
    <>
      {/* PWA Meta Tags */}
      <meta name="application-name" content="Eagle" />
      <meta name="apple-mobile-web-app-capable" content="yes" />
      <meta name="apple-mobile-web-app-status-bar-style" content="default" />
      <meta name="apple-mobile-web-app-title" content="Eagle" />
      <meta name="format-detection" content="telephone=no" />
      <meta name="mobile-web-app-capable" content="yes" />
      <meta name="msapplication-config" content="/browserconfig.xml" />
      <meta name="msapplication-TileColor" content="#2772ce" />
      <meta name="msapplication-tap-highlight" content="no" />

      {/* Apple Touch Icons */}
      <link rel="apple-touch-icon" sizes="152x152" href="/icon-192.jpg" />
      <link rel="apple-touch-icon" sizes="180x180" href="/icon-192.jpg" />

      {/* Microsoft Tiles */}
      <meta name="msapplication-square70x70logo" content="/icon-192.jpg" />
      <meta name="msapplication-square150x150logo" content="/icon-192.jpg" />
      <meta name="msapplication-wide310x150logo" content="/icon-512.jpg" />
      <meta name="msapplication-square310x310logo" content="/icon-512.jpg" />

      {/* Splash Screens for iOS */}
      <link
        rel="apple-touch-startup-image"
        href="/icon-512.jpg"
        media="(device-width: 375px) and (device-height: 812px) and (-webkit-device-pixel-ratio: 3)"
      />
      <link
        rel="apple-touch-startup-image"
        href="/icon-512.jpg"
        media="(device-width: 414px) and (device-height: 896px) and (-webkit-device-pixel-ratio: 2)"
      />
      <link
        rel="apple-touch-startup-image"
        href="/icon-512.jpg"
        media="(device-width: 414px) and (device-height: 896px) and (-webkit-device-pixel-ratio: 3)"
      />
    </>
  )
}