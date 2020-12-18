/// <reference types="@welldone-software/why-did-you-render" />
import React from 'react';

// This is useful for debugging rerendering problems.
// https://github.com/welldone-software/why-did-you-render
if (process.env.NODE_ENV === 'development' && process.env.REACT_APP_ENABLE_WDYR === 'true') {
    const whyDidYouRender = require('@welldone-software/why-did-you-render');
    whyDidYouRender(React, {
        trackAllPureComponents: true,
    });
}