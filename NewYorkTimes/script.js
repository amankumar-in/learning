// import fs module, not const fs = require('fs'); - require is not defined in ES module scope, you can use import instead
import fs from 'fs';



fs.writeFile('/Users/amankumar/Web Dev/test.txt',"Hello", (err) => {
    if (err) {
        console.log('Error reading file');
    }
    console.log('File changed');
});
//  now read this file
fs.readFile('/Users/amankumar/Web Dev/test.txt', 'utf8', (err, data) => {
    if (err) {
        throw err;
    }
    console.log(data);
});