const fs = require('fs');

let css = fs.readFileSync('styles.css', 'utf8');

// Update bg-mesh for Hero specifically
css = css.replace(
    /\.bg-mesh \{[\s\S]*?\}/,
    `.bg-mesh {\n  position: absolute;\n  top: 0;\n  left: 0;\n  width: 100%;\n  height: 100%;\n  z-index: 0;\n  overflow: hidden;\n  background: radial-gradient(circle at center, #0d1226 0%, #000000 100%);\n}`
);

// We should fix navbar styling to look good on black
css += `\n.navbar.scrolled { background: rgba(255, 255, 255, 0.95); box-shadow: 0 4px 20px rgba(0,0,0,0.1); color: #111; }\n`;
css += `.navbar { color: #fff; }\n`;
css += `.navbar.scrolled .nav-link { color: #333; }\n`;
css += `.navbar.scrolled .logo { color: #111; }\n`;

fs.writeFileSync('styles.css', css);

let html = fs.readFileSync('index.html', 'utf8');
// Move bg-mesh from body to inside hero
html = html.replace(/<div class="bg-mesh">[\s\S]*?<\/div>\s*<\/div>/, ''); 
html = html.replace(
    /<section class="hero" id="home"([^>]+)>/,
    `<section class="hero" id="home"$1>\n        <div class="bg-mesh">\n            <div class="blob dark-blob" style="background: radial-gradient(circle, rgba(60, 100, 200, 0.15) 0%, transparent 70%);"></div>\n            <div class="grid-pattern"></div>\n        </div>`
);
fs.writeFileSync('index.html', html);

let js = fs.readFileSync('script.js', 'utf8');
// Revert script.js to white
js = js.replace(/color: 0x1e2754/g, 'color: 0xffffff');
js = js.replace(/color = '#1e2754'/g, "color = '#ffffff'");
fs.writeFileSync('script.js', js);
console.log('Fixed hero background and script colors');
