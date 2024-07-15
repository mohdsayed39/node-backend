// routes/securityData.js
import express from 'express';
import db from '../db'; // Import database connection

const router = express.Router();

// GET /api/sec_acc_master
router.get('/sec_acc_master', (req, res) => {
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

// GET /api/security_master
router.get('/security_master', (req, res) => {
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

// GET /api/security_transactions
router.get('/security_transactions', (req, res) => {
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

export default router;
