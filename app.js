const express = require('express');
const fs = require('fs');
const path = require('path');
const cookieSession = require('cookie-session');
const bodyParser = require('body-parser');
require('dotenv').config();
const app = express();
const helmet = require('helmet');
const bcrypt = require('bcrypt');


app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use('/public', express.static('public'));
app.use('/data', express.static('data'));

// Use Helmet middleware with CSP configuration
app.use(
    helmet.contentSecurityPolicy({
        directives: {
            defaultSrc: ["'self'", 'blob:'],
            styleSrc: ["'self'", 'blob:', "'unsafe-inline'", 'https://unpkg.com', 'https://fonts.googleapis.com', 'https://cdn.jsdelivr.net'],
            scriptSrc: [
                "'self'",
                "'unsafe-inline'",
                'https://ajax.googleapis.com',
                'https://www.googletagmanager.com/',
                'https://ajax.googletagmanager.com/',
                'https://www.google-analytics.com',
                'https://code.jquery.com',
                'https://unpkg.com',
                'http://localhost:3000',
                'https://localhost:3000',
                'https://cdn.jsdelivr.net',
                'https://nora-dev.onrender.com/',
            ],
            connectSrc: [
                'https://www.googletagmanager.com/',
                'https://ajax.googletagmanager.com/',
                'https://www.google-analytics.com',
                'http://localhost:3000',
                'https://localhost:3000',
                'https://nora-dev.onrender.com/',
            ],
            imgSrc: ["'self'", 'data:', 'https://modelviewer.dev'],
            frameAncestors: ["'none'"],
        },
    }),
    helmet.frameguard(),
    helmet.hsts({
        maxAge: 123456,
        includeSubDomains: false,
    }),
);

//------------//
// Middleware //
//------------//

// Set up session middleware
app.use(
    cookieSession({
        name: 'sessionId',
        secret: process.env.SESSION_KEY,
        resave: false,
        saveUninitialized: true,
        sameSite: 'strict',
        cookie: {
            maxAge: 3600000,
            expires: 360000, // Set the maximum age to 1 hour (in milliseconds)
        },
    })
);

// Use body-parser middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());
app.disable('x-powered-by')

// Middleware to check authentication for protected routes
function requireAuth(req, res, next) {
    if (req.session && req.session.authenticated) {
        return next();
    } else {
        res.redirect('/login');
    }
}

// Error handling middleware
app.use((req, res, next) => {
    // Check for specific status codes and render the appropriate error page
    if (res.statusCode === 500) {
        return res.status(500).sendFile(`${__dirname}/public/error500.ejs`);
    } else if (res.statusCode === 404) {
        return res.status(404).sendFile(`${__dirname}/public/error404.ejs`);
    } else if (res.statusCode === 400) {
        return res.status(400).sendFile(`${__dirname}/public/error400.ejs`);
    }
    
    // For other status codes, let them pass through
    next();
});



const { validateLogin, validationResult } = require('./middleware/validateLogin');

const rateLimiter = require('./middleware/rateLimit');

app.use(rateLimiter);

//------------//
//   Routes   //
//------------//

// Public Routes
app.get('/', (req, res) => {
    res.render('index');
});

app.get('/contact', (req, res) => {
    res.render('contact');
});

app.get('/portraits', (req, res) => {
    const filePath = path.join(__dirname, 'data', 'portraits.json');

    fs.readFile(filePath, 'utf8', (err, data) => {
        if (err) {
            console.error(err);
            res.status(500).send('Error reading JSON file');
            return;
        }

        const items = JSON.parse(data);
        res.render('portraits', { items });
    });
});

app.get('/products', (req, res) => {
    const filePath = path.join(__dirname, 'data', 'products.json');

    fs.readFile(filePath, 'utf8', (err, data) => {
        if (err) {
            console.error(err);
            res.status(500).send('Error reading JSON file');
            return;
        }

        const items = JSON.parse(data);
        res.render('products', { items });
    });
});

app.get('/studio', (req, res) => {
    const filePath = path.join(__dirname, 'data', 'studio.json');

    fs.readFile(filePath, 'utf8', (err, data) => {
        if (err) {
            console.error(err);
            res.status(500).send('Error reading JSON file');
            return;
        }

        const items = JSON.parse(data);
        res.render('studio', { items });
    });
});


//------------//
//    Auth    //
//------------//

app.get('/login', (req, res) => {
    res.render('login');
});

app.get('/logout', (req, res) => {
    req.session.authenticated = false;
    res.redirect('/login');
});

app.post('/login', validateLogin, (req, res) => {
    const { username, password } = req.body;
    const storedUser = process.env.USERNAME; // Load the username from .env
    const hashedPassword = process.env.HASHED_PASSWORD; // Load the hashed password from .env

    // First, check if the submitted username matches the stored username
    if (username === storedUser) {
        // Use bcrypt to compare the inputted password with the hashed password
        bcrypt.compare(password, hashedPassword, (err, result) => {
            if (err) {
                console.error(err);
                // Handle the error
                res.status(500).send('Internal Server Error');
                return;
            }

            if (result) {
                // Clear the existing session cookie
                req.session = null;

                // Create a new session cookie with an extended expiration
                req.session = {
                    authenticated: true,
                    cookie: {
                        expires: new Date(Date.now() + 3600000), // Set to 1 hour from now
                    },
                };
                res.redirect('dashboard');
            } else {
                // Failed login
                req.session.authenticated = false;

                // Custom response for validation errors
                const errors = validationResult(req);
                if (!errors.isEmpty()) {
                    res.status(500).send('Internal Server Error');
                }
                else {
                    res.redirect('/login');
                }

                
            }
        });
    } else {
        // Username doesn't match
        req.session.authenticated = false;

        // Custom response for validation errors
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            console.log(errors.array());
        }

        res.redirect('/login');
    }
});





app.get('/dashboard', requireAuth, (req, res) => {
    res.render('dashboard');
});

// Import necessary middleware and functions for portraits
const uploadPortraits = require('./middleware/portraitsUpload');
const updatePortraitsItems = require('./controllers/updatePortraitsItems.js');

// BW Add item route
app.post('/dashboard/portraits/add-item', requireAuth, uploadPortraits.fields([
    { name: 'image', maxCount: 1 },
]), (req, res) => {
    // Calculate the next ID based on the existing items
    const filePath = path.join(__dirname, 'data', 'portraits.json');
    fs.readFile(filePath, 'utf8', (err, data) => {
        if (err) {
            console.error(err);
            res.status(500).send('Error reading JSON file');
            return;
        }

        let items = JSON.parse(data);

        // Calculate the next ID
        let nextId = 1; // Default to 1 if there are no existing items
        if (items.length > 0) {
            const maxId = Math.max(...items.map(item => parseInt(item.id)));
            nextId = maxId + 1;
        }

        // Retrieve the filenames of the uploaded files
        const image = req.files['image'][0].filename;

        // Create the new item object with the calculated ID and image URL
        const newItem = {
            id: nextId.toString(), // Convert to string to match existing IDs
            url: `public/assets/portraits/${image}`, // URL to the stored image
        };

        // Call the updateItems function to update the items with the new item data
        updatePortraitsItems(newItem);


        res.redirect('/dashboard/portraits');
    });
});


app.post('/dashboard/portraits/remove-item', requireAuth, (req, res) => {
    const selectedItems = req.body.id;
    const filePath = path.join(__dirname, 'data', 'portraits.json');

    console.log('Received Item IDs:', selectedItems);

    fs.readFile(filePath, 'utf8', (err, data) => {
        if (err) {
            console.error('Error reading JSON file:', err);
            res.status(500).send('Error reading JSON file');
            return;
        }

        let items = JSON.parse(data);

        // Check if itemIds is an array before iterating
        if (!Array.isArray(selectedItems)) {
            console.error('Invalid request: Expected an array of item IDs');
            res.status(400).send('Invalid request: Expected an array of item IDs');
            return;
        }

        // Check if items is an array before performing operations
        if (!Array.isArray(items)) {
            console.error('JSON data is not an array');
            res.status(500).send('JSON data is not an array');
            return;
        }

        selectedItems.forEach(itemId => {
            // Find the index of the item in the array based on the provided itemId
            const itemIndex = items.findIndex(item => item.id === itemId);

            if (itemIndex !== -1) {
                // Remove the item from the array
                items.splice(itemIndex, 1);
            }
        });

        // Write the updated JSON data back to the file
        fs.writeFile(filePath, JSON.stringify(items, null, 2), 'utf8', (err) => {
            if (err) {
                console.error('Error writing to JSON file:', err);
                res.status(500).send('Error writing to JSON file');
                return;
            }

            // Redirect after writing the file successfully
            res.redirect('/dashboard/portraits');
        });
    });
});



app.get('/dashboard/portraits', requireAuth, (req, res) => {
    const filePath = path.join(__dirname, 'data', 'portraits.json');
    const itemsData = fs.readFileSync(filePath, 'utf8');
    const items = JSON.parse(itemsData);
    res.render('dashboardPortraits', { items });
});


// Import necessary middleware and functions for Products
const uploadProducts = require('./middleware/productsUpload');
const updateProductsItems = require('./controllers/updateProductsItems.js');

app.get('/dashboard/products', requireAuth, (req, res) => {
    const filePath = path.join(__dirname, 'data', 'products.json');
    const itemsData = fs.readFileSync(filePath, 'utf8');
    const items = JSON.parse(itemsData);
    res.render('dashboardProducts', { items });
});


// Products Add item route
app.post('/dashboard/products/add-item', requireAuth, uploadProducts.fields([
    { name: 'image', maxCount: 1 },
]), (req, res) => {
    // Calculate the next ID based on the existing items
    const filePath = path.join(__dirname, 'data', 'products.json');
    fs.readFile(filePath, 'utf8', (err, data) => {
        if (err) {
            console.error(err);
            res.status(500).send('Error reading JSON file');
            return;
        }

        let items = JSON.parse(data);

        // Calculate the next ID
        let nextId = 1; // Default to 1 if there are no existing items
        if (items.length > 0) {
            const maxId = Math.max(...items.map(item => parseInt(item.id)));
            nextId = maxId + 1;
        }

        // Retrieve the filenames of the uploaded files
        const image = req.files['image'][0].filename;

        // Create the new item object with the calculated ID and image URL
        const newItem = {
            id: nextId.toString(), // Convert to string to match existing IDs
            url: `public/assets/products/${image}`, // URL to the stored image
        };

        // Call the updateItems function to update the items with the new item data
        updateProductsItems(newItem);

        // Redirect to the appropriate page
        res.redirect('/dashboard/products');
    });
});

// Remove Color item route
app.post('/dashboard/products/remove-item', requireAuth, (req, res) => {
    const itemId = req.body.id;
    const filePath = path.join(__dirname, 'data', 'products.json');

    fs.readFile(filePath, 'utf8', (err, data) => {
        if (err) {
            console.error(err);
            res.status(500).send('Error reading JSON file');
            return;
        }

        const items = JSON.parse(data);

        // Find the index of the item in the array based on the provided itemId
        const itemIndex = items.findIndex(item => item.id === itemId);
        console.log('Item index:', itemIndex);

        // Check if the item exists
        if (itemIndex === -1) {
            console.error('Item not found:', itemId);
            res.status(404).send('Item not found');
            return;
        }

        // Remove the item from the array
        items.splice(itemIndex, 1);

        // Write the updated JSON data back to the file
        fs.writeFile(filePath, JSON.stringify(items, null, 2), 'utf8', (err) => {
            if (err) {
                console.error(err);
                res.status(500).send('Error writing to JSON file');
                return;
            }

            console.log('Item removed successfully.');
            res.redirect('/dashboard/products');
        });
    });
});



// Import necessary middleware and functions for studio
const uploadStudio = require('./middleware/studioUpload.js');
const updateStudioItems = require('./controllers/updateStudioItems.js');

app.get('/dashboard/studio', requireAuth, (req, res) => {
    const filePath = path.join(__dirname, 'data', 'studio.json');
    const itemsData = fs.readFileSync(filePath, 'utf8');
    const items = JSON.parse(itemsData);
    res.render('dashboardStudio', { items });
});


// studio Add item route
app.post('/dashboard/studio/add-item', requireAuth, uploadStudio.fields([
    { name: 'image', maxCount: 1 },
]), (req, res) => {
    // Calculate the next ID based on the existing items
    const filePath = path.join(__dirname, 'data', 'studio.json');
    fs.readFile(filePath, 'utf8', (err, data) => {
        if (err) {
            console.error(err);
            res.status(500).send('Error reading JSON file');
            return;
        }

        let items = JSON.parse(data);

        // Calculate the next ID
        let nextId = 1; // Default to 1 if there are no existing items
        if (items.length > 0) {
            const maxId = Math.max(...items.map(item => parseInt(item.id)));
            nextId = maxId + 1;
        }

        // Retrieve the filenames of the uploaded files
        const image = req.files['image'][0].filename;

        // Create the new item object with the calculated ID and image URL
        const newItem = {
            id: nextId.toString(), // Convert to string to match existing IDs
            url: `public/assets/studio/${image}`, // URL to the stored image
        };

        // Call the updateItems function to update the items with the new item data
        updateStudioItems(newItem);

        // Redirect to the appropriate page
        res.redirect('/dashboard/studio');
    });
});

// Remove Color item route
app.post('/dashboard/studio/remove-item', requireAuth, (req, res) => {
    const selectedItems = req.body.id;
    const filePath = path.join(__dirname, 'data', 'studio.json');

    console.log('Received Item IDs:', selectedItems);

    fs.readFile(filePath, 'utf8', (err, data) => {
        if (err) {
            console.error('Error reading JSON file:', err);
            res.status(500).send('Error reading JSON file');
            return;
        }

        let items = JSON.parse(data);

        // Check if itemIds is an array before iterating
        if (!Array.isArray(selectedItems)) {
            console.error('Invalid request: Expected an array of item IDs');
            res.status(400).send('Invalid request: Expected an array of item IDs');
            return;
        }

        // Check if items is an array before performing operations
        if (!Array.isArray(items)) {
            console.error('JSON data is not an array');
            res.status(500).send('JSON data is not an array');
            return;
        }

        selectedItems.forEach(itemId => {
            // Find the index of the item in the array based on the provided itemId
            const itemIndex = items.findIndex(item => item.id === itemId);

            if (itemIndex !== -1) {
                // Remove the item from the array
                items.splice(itemIndex, 1);
            }
        });

        // Write the updated JSON data back to the file
        fs.writeFile(filePath, JSON.stringify(items, null, 2), 'utf8', (err) => {
            if (err) {
                console.error('Error writing to JSON file:', err);
                res.status(500).send('Error writing to JSON file');
                return;
            }

            // Redirect after writing the file successfully
            res.redirect('/dashboard/studio');
        });
    });
});

app.get('*', (req, res) => {
    res.render('error404')
});



app.listen(process.env.PORT || 3000, () => {
    console.log('Server started on port 3000');
});

