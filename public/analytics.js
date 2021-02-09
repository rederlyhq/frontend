'use strict';

// Define the GA_ID globally so it can be referenced in tsx files.
window.GA_TRACKING_ID = 'G-EJ3PQ8D4XL';
var gaScript = document.createElement('script');
gaScript.async = true;
gaScript.src = 'https://www.googletagmanager.com/gtag/js?id='.concat(window.GA_TRACKING_ID);
document.head.appendChild(gaScript);
window.dataLayer = window.dataLayer || [];

function gtag() {
    window.dataLayer.push(arguments);
}

gtag('js', new Date());
gtag('config', window.GA_TRACKING_ID);
