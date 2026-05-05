const fs = require('fs');
let code = fs.readFileSync('frontend/src/app/pages/employee/tpv/tpv.page.ts', 'utf8');

// Find the first instance of 'public logout()'
const index = code.indexOf('public logout()');
if (index !== -1) {
  // Find the end of the logout method which is the end of the class
  const endOfClass = code.indexOf('}', index);
  if (endOfClass !== -1) {
    const endFile = code.indexOf('}', endOfClass + 1);
    if (endFile !== -1) {
        code = code.substring(0, endFile + 1) + '\n';
        fs.writeFileSync('frontend/src/app/pages/employee/tpv/tpv.page.ts', code);
    }
  }
}
