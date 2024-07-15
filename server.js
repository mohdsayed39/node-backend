import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import mysql from 'mysql2';
import dotenv from 'dotenv';
import { generateToken, hashPassword, comparePassword } from './utils/jwtUtils.js';

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.json());

const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'admin123',
    database: 'security_transactions_db'
});

db.connect(err => {
    if (err) {
        console.error('Error connecting to MySQL:', err);
        process.exit(1);
    }
    console.log('MySQL connected...');
});

app.get('/api/transactions', (req, res) => {
    const query = `
        SELECT 
            st.trade_date, 
            st.security_account, 
            st.security_number, 
            st.security_currency, 
            st.trans_type, 
            st.rec_id, 
            st.no_nominal, 
            st.price, 
            st.net_amt_trade, 
            st.broker_comms, 
            st.prof_loss_sec_ccy,
            sam.account_name AS sam_name,
            sm.short_name AS security_name
        FROM security_transactions st
        LEFT JOIN sec_acc_master sam ON st.security_account = sam.rec_id
        LEFT JOIN security_master sm ON st.security_number = sm.mnemonic
    `;
    db.query(query, (error, results) => {
        if (error) {
            console.error('Error executing SQL query:', error);
            res.status(500).json({ error: 'Database query failed', details: error.message });
            return;
        }
        res.json(results);
    });
});


// CRUD Operations for Users
app.get('/api/users', (req, res) => {
    const sql = 'SELECT id, username FROM users';
    db.query(sql, (err, results) => {
        if (err) {
            console.error('Error fetching users:', err);
            res.status(500).json({ error: 'Database query failed' });
            return;
        }
        res.json(results);
    });
});

app.post('/api/users', async (req, res) => {
    const { username, password } = req.body;
    const createdAt = new Date();

    try {
        const hashedPassword = await hashPassword(password);
        const checkSql = 'SELECT * FROM users WHERE username = ?';
        db.query(checkSql, [username], (err, results) => {
            if (err) {
                console.error('Error checking existing user:', err);
                res.status(500).json({ error: 'Database query failed' });
                return;
            }

            if (results.length > 0) {
                res.status(409).json({ error: 'Username already exists' });
            } else {
                const insertSql = 'INSERT INTO users (username, password, created_at) VALUES (?, ?, ?)';
                db.query(insertSql, [username, hashedPassword, createdAt], (err, result) => {
                    if (err) {
                        console.error('Error creating user:', err);
                        res.status(500).json({ error: 'Database query failed' });
                        return;
                    }
                    res.status(201).json({ message: 'User created successfully' });
                });
            }
        });
    } catch (error) {
        console.error('Error hashing password:', error);
        res.status(500).json({ error: 'Failed to hash password' });
    }
});

app.put('/api/users/:id', async (req, res) => {
    const { id } = req.params;
    const { username, password } = req.body;

    try {
        const hashedPassword = await hashPassword(password);
        const updateSql = 'UPDATE users SET username = ?, password = ? WHERE id = ?';
        db.query(updateSql, [username, hashedPassword, id], (err, result) => {
            if (err) {
                console.error('Error updating user:', err);
                res.status(500).json({ error: 'Database query failed' });
                return;
            }
            res.json({ message: 'User updated successfully' });
        });
    } catch (error) {
        console.error('Error hashing password:', error);
        res.status(500).json({ error: 'Failed to hash password' });
    }
});

app.delete('/api/users/:id', (req, res) => {
    const { id } = req.params;
    const deleteSql = 'DELETE FROM users WHERE id = ?';
    db.query(deleteSql, [id], (err, result) => {
        if (err) {
            console.error('Error deleting user:', err);
            res.status(500).json({ error: 'Database query failed' });
            return;
        }
        res.json({ message: 'User deleted successfully' });
    });
});

// Other routes
app.get('/api/sec_acc_master', (req, res) => {
    const sql = 'SELECT * FROM sec_acc_master';
    db.query(sql, (err, results) => {
        if (err) {
            console.error('Error fetching sec_acc_master records:', err);
            res.status(500).json({ error: 'Database query failed' });
            return;
        }
        res.json(results);
    });
});

app.get('/api/security_master', (req, res) => {
    const sql = 'SELECT * FROM security_master';
    db.query(sql, (err, results) => {
        if (err) {
            console.error('Error fetching security_master records:', err);
            res.status(500).json({ error: 'Database query failed' });
            return;
        }
        res.json(results);
    });
});

app.get('/api/security_transactions', (req, res) => {
    const sql = 'SELECT * FROM security_transactions';
    db.query(sql, (err, results) => {
        if (err) {
            console.error('Error fetching security_transactions records:', err);
            res.status(500).json({ error: 'Database query failed' });
            return;
        }
        res.json(results);
    });
});

// Register a new user
app.post('/api/register', async (req, res) => {
    const { username, password } = req.body;
    const createdAt = new Date();

    try {
        const hashedPassword = await hashPassword(password);
        const checkSql = 'SELECT * FROM users WHERE username = ?';
        db.query(checkSql, [username], (err, results) => {
            if (err) {
                console.error('Error checking existing user:', err);
                res.status(500).json({ error: 'Database query failed' });
                return;
            }

            if (results.length > 0) {
                res.status(409).json({ error: 'Username already exists' });
            } else {
                const insertSql = 'INSERT INTO users (username, password, created_at) VALUES (?, ?, ?)';
                db.query(insertSql, [username, hashedPassword, createdAt], (err, result) => {
                    if (err) {
                        console.error('Error registering user:', err);
                        res.status(500).json({ error: 'Database query failed' });
                        return;
                    }
                    res.status(201).json({ message: 'User registered successfully' });
                });
            }
        });
    } catch (error) {
        console.error('Error hashing password:', error);
        res.status(500).json({ error: 'Failed to hash password' });
    }
});

// User login
app.post('/api/login', async (req, res) => {
    const { username, password } = req.body;

    db.query('SELECT * FROM users WHERE username = ?', [username], async (err, results) => {
        if (err) {
            console.error('Error finding user:', err);
            res.status(500).json({ error: 'Database query failed' });
            return;
        }

        if (results.length === 0) {
            res.status(404).json({ error: 'User not found' });
        } else {
            try {
                const isPasswordValid = await comparePassword(password, results[0].password);
                if (isPasswordValid) {
                    const token = generateToken({ username });
                    res.status(200).json({ message: 'Login successful', token });
                } else {
                    res.status(401).json({ error: 'Invalid credentials' });
                }
            } catch (error) {
                console.error('Error comparing passwords:', error);
                res.status(500).json({ error: 'Failed to compare passwords' });
            }
        }
    });
});

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
