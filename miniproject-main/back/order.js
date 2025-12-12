const express = require('express');
const pool = require('./db');
const router = express.Router();


router.get('/info/:userId',async (req, res)=>{
    try{
        const {userId} = req.params;

        const rows = await pool.query(
            `SELECT 
                name, 
                phone
            FROM users WHERE id =?`, [userId]
        );
        
        if(rows.length > 0){
            res.status(200).json(rows[0]);
        }else{
            res.status(404).json({ error: '사용자 정보를 찾을 수 없습니다.' });
        }
    } catch (error) {
        console.error('사용자 정보 조회 에러:', error);
        res.status(500).json({ error: '서버 에러' });
    }
});

router.post('/', async(req, res) => {
    console.log('주문 요청 받음:', req.body);
    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();

        const {
            userId,
            zipCode,
            address,
            detailAddress,
            deliveryName,
            recipient,
            phone,
            deliveryMessage,
            paymentMethod,
            items,
            totalAmount
        } = req.body;

        for (const item of items) {
            const product = await connection.query(
                `SELECT stock FROM products WHERE pId = ?`,
                [item.id]
            );

            if (!product || product.length === 0) {
                throw new Error(`상품을 찾을 수 없습니다: ${item.name}`);
            }

            if (product[0].stock < item.amount) {
                throw new Error(`재고가 부족합니다: ${item.name} (현재 재고: ${product[0].stock}개, 주문: ${item.amount}개)`);
            }
        }

        const orderResult = await connection.query(
            `INSERT INTO orders (
                id, 
                zipCode, 
                address, 
                detailAddress,
                deliveryName,
                recipient,
                phone,
                deliveryMessage,
                paymentMethod,
                totalAmount,
                orderDate
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
            [userId, zipCode, address, detailAddress, deliveryName, 
             recipient, phone, deliveryMessage, paymentMethod, totalAmount]
        );

        const orderId = Number(orderResult.insertId);

        for (const item of items) {
            await connection.query(
                `INSERT INTO order_items (
                    order_Id,
                    pId, 
                    pName, 
                    pPrice, 
                    amount
                ) VALUES (?, ?, ?, ?, ?)`,
                [orderId, item.id, item.name, item.price, item.amount]
            );

            await connection.query(
                `UPDATE products SET stock = stock - ? WHERE pId = ?`,
                [item.amount, item.id]
            );
            
            console.log(`재고 감소: ${item.name} - ${item.amount}개`);
        }

        for (const item of items) {
            await connection.query(
                `DELETE FROM cart WHERE id = ? AND pId = ?`,
                [userId, item.id]
            );
        }

        await connection.commit();
        console.log('주문 완료! 재고 업데이트 완료!');
        res.status(200).json({ 
            success: true, 
            orderId: orderId,
            message: '주문이 완료되었습니다.' 
        });

    } catch(error) {
        await connection.rollback();
        console.error('주문 처리 에러:', error);
        res.status(500).json({
            error: '주문 처리 실패', 
            details: error.message
        });
    } finally {
        connection.release();
    }
});

router.put('/stock', async(req, res)=> {
    try{
        const { pId, amount } = req.body;

        const product = await pool.query(
            `SELECT stock FROM products WHERE pId = ?`,
            [pId]);

        if(!product || product.length === 0){
            return res.status(404).json({error:'상품을 찾을 수 없습니다'});
        }
        const currentStock = product[0].stock;
            
        if (currentStock < amount) {
            return res.status(400).json({error: '재고가 부족합니다'});
        }

        await pool.query(
            `UPDATE products SET stock = stock - ? WHERE pId = ?`,
            [amount, pId]
        );
        
        res.status(200).json({message: '재고 업데이트 성공'});
    }catch(error){
        console.error('재고 업데이트 에러:', error);
        res.status(500).json({error: '재고 수량 업데이트 실패'});
    }
})

router.get("/admin", async (req, res) => {
    if (!req.session.user || req.session.user.admin !== 1) {
        return res.status(403).json({ error: "관리자 권한 필요" });
    }

    try {
        const orders = await pool.query(`
            SELECT 
                order_Id AS orderId,
                id AS userId,
                totalAmount,
                orderDate
            FROM orders
            ORDER BY orderDate DESC
        `);

        for (let order of orders) {
            const items = await pool.query(`
                SELECT 
                    oi.orderItemId,
                    oi.pId,
                    oi.pName,
                    oi.pPrice,
                    oi.amount,
                    p.image
                FROM order_items oi
                JOIN products p ON oi.pId = p.pId
                WHERE oi.order_Id = ?
            `, [order.orderId]);

            order.items = items;
        }

        res.json(orders);
    } catch (err) {
        console.error("관리자 주문 조회 실패:", err);
        res.status(500).json({ error: "서버 에러" });
    }
});

router.get("/test",async(req,res)=>{
    const items = await pool.query(`SELECT 
                    oi.orderItemId,
                    oi.pId,
                    oi.pName,
                    oi.pPrice,
                    oi.amount,
                    p.image
                FROM order_items oi
                JOIN products p ON oi.pId = p.pId
                WHERE oi.order_Id = 8`)
    const test = await pool.query('SELECT * FROM products')
    res.json(test)
})

router.get("/user/:userId", async (req, res) => {
    const { userId } = req.params;

    try {
        const orders = await pool.query(`
            SELECT 
                order_Id AS orderId,
                id AS userId,
                totalAmount,
                orderDate
            FROM orders
            WHERE id = ?
            ORDER BY orderDate DESC
        `, [userId]);

        for (let order of orders) {
            const items = await pool.query(`
                SELECT 
                    oi.orderItemId,
                    oi.pId,
                    oi.pName,
                    oi.pPrice,
                    oi.amount,
                    p.image
                FROM order_items oi
                JOIN products p ON oi.pId = p.pId
                WHERE oi.order_Id = ?
            `, [order.orderId]);

            order.items = items;
        }
        res.json(orders);
    } catch (err) {
        console.error("회원 주문 조회 실패:", err);
        res.status(500).json({ error: "서버 에러" });
    }
});

module.exports = router;