const express = require('express');
const cors = require('cors');
const mysql = require('mysql2/promise');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Database connection
let db;

async function initializeDatabase() {
    try {
        // First connect without specifying database to create it if needed
        const connection = await mysql.createConnection({
            host: process.env.DB_HOST || 'localhost',
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD || '',
            waitForConnections: true,
            connectionLimit: 10,
            queueLimit: 0
        });

        // Create database if it doesn't exist
        await connection.execute(`CREATE DATABASE IF NOT EXISTS ${process.env.DB_NAME || 'crud_app'}`);

        // Now connect to the specific database
        db = await mysql.createConnection({
            host: process.env.DB_HOST || 'localhost',
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD || '',
            database: process.env.DB_NAME || 'crud_app',
            waitForConnections: true,
            connectionLimit: 10,
            queueLimit: 0
        });

        // Create items table if it doesn't exist
        await db.execute(`
            CREATE TABLE IF NOT EXISTS items (
                id INT AUTO_INCREMENT PRIMARY KEY,
                name VARCHAR(255) NOT NULL,
                description TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
            )
        `);

        console.log('Database connected and table created');
    } catch (error) {
        console.error('Database connection failed:', error);
        process.exit(1);
    }
}

// Routes

// GET all items
app.get('/api/items', async (req, res) => {
    try {
        const [rows] = await db.execute('SELECT * FROM items ORDER BY created_at DESC');
        res.json(rows);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching items', error: error.message });
    }
});

// GET single item by ID
app.get('/api/items/:id', async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        const [rows] = await db.execute('SELECT * FROM items WHERE id = ?', [id]);
        if (rows.length === 0) {
            return res.status(404).json({ message: 'Item not found' });
        }
        res.json(rows[0]);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching item', error: error.message });
    }
});

// POST create new item
app.post('/api/items', async (req, res) => {
    try {
        const { name, description } = req.body;
        if (!name) {
            return res.status(400).json({ message: 'Name is required' });
        }
        const [result] = await db.execute(
            'INSERT INTO items (name, description) VALUES (?, ?)',
            [name, description || '']
        );
        const [newItem] = await db.execute('SELECT * FROM items WHERE id = ?', [result.insertId]);
        res.status(201).json(newItem[0]);
    } catch (error) {
        res.status(500).json({ message: 'Error creating item', error: error.message });
    }
});

// PUT update item by ID
app.put('/api/items/:id', async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        const { name, description } = req.body;
        if (!name) {
            return res.status(400).json({ message: 'Name is required' });
        }
        const [result] = await db.execute(
            'UPDATE items SET name = ?, description = ? WHERE id = ?',
            [name, description || '', id]
        );
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Item not found' });
        }
        const [updatedItem] = await db.execute('SELECT * FROM items WHERE id = ?', [id]);
        res.json(updatedItem[0]);
    } catch (error) {
        res.status(500).json({ message: 'Error updating item', error: error.message });
    }
});

// DELETE item by ID
app.delete('/api/items/:id', async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        const [result] = await db.execute('DELETE FROM items WHERE id = ?', [id]);
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Item not found' });
        }
        res.json({ message: 'Item deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting item', error: error.message });
    }
});

// Initialize database and start server
initializeDatabase().then(() => {
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });
});