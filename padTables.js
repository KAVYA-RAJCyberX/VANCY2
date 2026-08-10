const fs = require('fs');
const path = require('path');

const files = [
  'Orders.tsx',
  'Inventory.tsx',
  'Products.tsx',
  'Customers.tsx',
  'Staff.tsx',
  'Discounts.tsx'
];

files.forEach(file => {
  const filePath = path.join(__dirname, 'client', 'src', 'app', 'pages', 'admin', file);
  if (fs.existsSync(filePath)) {
    let content = fs.readFileSync(filePath, 'utf8');
    content = content.replace(/className="overflow-x-auto"/g, 'className="overflow-x-auto pr-24 lg:pr-32"');
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Updated ${file}`);
  } else {
    console.log(`File not found: ${filePath}`);
  }
});
