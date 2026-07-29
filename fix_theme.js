const fs = require('fs');

let css = fs.readFileSync('styles.css', 'utf8');

// Colors replacement map
const replacements = [
    // Purples -> Blue
    { regex: /#7c3aed/gi, replace: '#1e2754' },
    { regex: /#6d28d9/gi, replace: '#131a38' },
    { regex: /rgba\(124,\s*58,\s*237,/gi, replace: 'rgba(30, 39, 84,' },
    { regex: /rgba\(138,\s*43,\s*226,/gi, replace: 'rgba(30, 39, 84,' },
    { regex: /#8a2be2/gi, replace: '#1e2754' },
    { regex: /#a78bfa/gi, replace: '#445199' },
    { regex: /#c084fc/gi, replace: '#6171c7' },
    { regex: /#e9d5ff/gi, replace: '#d8defa' },
    { regex: /#f1eef8/gi, replace: '#f0f2fb' },
    { regex: /#f8f7fc/gi, replace: '#ffffff' },

    // Dark backgrounds -> Light backgrounds
    { regex: /--bg-dark:\s*#000000;/gi, replace: '--bg-dark: #ffffff;' },
    { regex: /--bg-gradient:\s*[^;]+;/gi, replace: '--bg-gradient: radial-gradient(circle at center, #ffffff 0%, #f4f6fc 100%);' },
    { regex: /--text-main:\s*#ffffff;/gi, replace: '--text-main: #111111;' },
    { regex: /--text-muted:\s*#b3b3b3;/gi, replace: '--text-muted: #555555;' },
    { regex: /--glass-bg:\s*rgba\(20,\s*20,\s*20,\s*0\.4\);/gi, replace: '--glass-bg: rgba(255, 255, 255, 0.8);' },
    { regex: /--glass-border:\s*rgba\(255,\s*255,\s*255,\s*0\.1\);/gi, replace: '--glass-border: rgba(30, 39, 84, 0.1);' },

    // Update section dark background explicitly
    { regex: /background:\s*#0a0a0a;/gi, replace: 'background: #fafafc;' },
    { regex: /background:\s*#111;/gi, replace: 'background: #f0f0f5;' },
    { regex: /background:\s*#1a1a1a;/gi, replace: 'background: #e8e8f0;' },
    { regex: /background:\s*#000;/gi, replace: 'background: #fff;' },

    // Other specific color swaps
    { regex: /color:\s*#fff/gi, replace: 'color: var(--text-main)' },
    { regex: /color:\s*#ffffff/gi, replace: 'color: var(--text-main)' },

    // Specific dark gradients back to light
    { regex: /linear-gradient\(135deg,\s*rgba\(11,\s*6,\s*29,\s*0\.95\),\s*rgba\(15,\s*8,\s*35,\s*0\.95\)\)/gi, replace: 'linear-gradient(135deg, #ffffff, #f4f6fc)' },
    { regex: /background:\s*rgba\(7,\s*3,\s*19,\s*0\.8\)/gi, replace: 'background: rgba(255,255,255,0.9)' },
    { regex: /background:\s*rgba\(7,\s*3,\s*19,\s*0\.95\)/gi, replace: 'background: rgba(255,255,255,0.95)' }
];

replacements.forEach(({regex, replace}) => {
    css = css.replace(regex, replace);
});

fs.writeFileSync('styles.css', css);
console.log('styles.css updated');
