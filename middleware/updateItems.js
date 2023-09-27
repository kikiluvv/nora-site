const fs = require('fs');
const path = require('path');

// Function to update the items.json file for the add items path
function updateItems(newItem) {
  const filePath = path.join(__dirname, 'data', 'items.json');

  fs.readFile(filePath, 'utf8', (err, data) => {
    if (err) {
      console.error(err);
      return;
    }

    const items = JSON.parse(data);
    items.push(newItem);

    fs.writeFile(filePath, JSON.stringify(items, null, 2), 'utf8', (err) => {
      if (err) {
        console.error(err);
        return;
      }

      console.log('Items updated successfully.');
    });
  });
}



module.exports = { updateItems };


