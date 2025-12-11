// const express = require('express');
// const pool = require('./db');
// const router = express.Router();


// router.get('/info/:userId',async (req, res)=>{
//     try{
//         const {userId} = req.params;

//         const rows = await pool.query(
//             `SELECT 
//                 name, 
//                 phone
//             FROM users WHERE id =?`, [userId]
//         );
        
//         if(rows.length > 0){
//             res.status(200).json(rows[0]);
//         }else{
//             res.status(404).json({ error: '사용자 정보를 찾을 수 없습니다.' });
//         }
//     } catch (error) {
//         console.error('사용자 정보 조회 에러:', error);
//         res.status(500).json({ error: '서버 에러' });
//     }
// });

// router.post('/', async(req, res) => {
//     console.log('주문 요청 받음:', req.body);
//     const connection = await pool.getConnection();
//     try {
//         await connection.beginTransaction();

//         const {
//             userId,
//             zipCode,
//             address,
//             detailAddress,
//             deliveryName,
//             recipient,
//             phone,
//             deliveryMessage,
//             paymentMethod,
//             items,
//             totalAmount
//         } = req.body;

//         for (const item of items) {
//             const product = await connection.query(
//                 `SELECT stock FROM products WHERE pId = ?`,
//                 [item.id]
//             );

//             if (!product || product.length === 0) {
//                 throw new Error(`상품을 찾을 수 없습니다: ${item.name}`);
//             }

//             if (product[0].stock < item.amount) {
//                 throw new Error(`재고가 부족합니다: ${item.name} (현재 재고: ${product[0].stock}개, 주문: ${item.amount}개)`);
//             }
//         }

//         const orderResult = await connection.query(
//             `INSERT INTO orders (
//                 id, 
//                 zipCode, 
//                 address, 
//                 detailAddress,
//                 deliveryName,
//                 recipient,
//                 phone,
//                 deliveryMessage,
//                 paymentMethod,
//                 totalAmount,
//                 orderDate
//             ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
//             [userId, zipCode, address, detailAddress, deliveryName, 
//              recipient, phone, deliveryMessage, paymentMethod, totalAmount]
//         );

//         const orderId = Number(orderResult.insertId);

//         for (const item of items) {
//             await connection.query(
//                 `INSERT INTO order_items (
//                     order_Id,
//                     pId, 
//                     pName, 
//                     pPrice, 
//                     amount
//                 ) VALUES (?, ?, ?, ?, ?)`,
//                 [orderId, item.id, item.name, item.price, item.amount]
//             );

//             await connection.query(
//                 `UPDATE products SET stock = stock - ? WHERE pId = ?`,
//                 [item.amount, item.id]
//             );
            
//             console.log(`재고 감소: ${item.name} - ${item.amount}개`);
//         }

//         for (const item of items) {
//             await connection.query(
//                 `DELETE FROM cart WHERE id = ? AND pId = ?`,
//                 [userId, item.id]
//             );
//         }

//         await connection.commit();
//         console.log('주문 완료! 재고 업데이트 완료!');
//         res.status(200).json({ 
//             success: true, 
//             orderId: orderId,
//             message: '주문이 완료되었습니다.' 
//         });

//     } catch(error) {
//         await connection.rollback();
//         console.error('주문 처리 에러:', error);
//         res.status(500).json({
//             error: '주문 처리 실패', 
//             details: error.message
//         });
//     } finally {
//         connection.release();
//     }
// });

// router.put('/stock', async(req, res)=> {
//     try{
//         const { pId, amount } = req.body;

//         const product = await pool.query(
//             `SELECT stock FROM products WHERE pId = ?`,
//             [pId]);

//         if(!product || product.length === 0){
//             return res.status(404).json({error:'상품을 찾을 수 없습니다'});
//         }
//         const currentStock = product[0].stock;
            
//         if (currentStock < amount) {
//             return res.status(400).json({error: '재고가 부족합니다'});
//         }

//         await pool.query(
//             `UPDATE products SET stock = stock - ? WHERE pId = ?`,
//             [amount, pId]
//         );
        
//         res.status(200).json({message: '재고 업데이트 성공'});
//     }catch(error){
//         console.error('재고 업데이트 에러:', error);
//         res.status(500).json({error: '재고 수량 업데이트 실패'});
//     }
// })


// // =======================
// // 관리자 전용 주문 조회
// // =======================
// router.get("/admin", async (req, res) => {
//     // 관리자 권한 체크
//     if (!req.session.user || req.session.user.admin !== 1) {
//         return res.status(403).json({ error: "관리자 권한 필요" });
//     }

//     try {
//         // orders 조회 (order_Id를 JS에서 사용할 orderId로 alias)
//         const orders = await pool.query(`
//             SELECT 
//                 order_Id AS orderId,
//                 id AS userId,
//                 totalAmount,
//                 orderDate
//             FROM orders
//             ORDER BY orderDate DESC
//         `);

//         // 각 주문에 대한 items 조회
//         const result = [];
//         for (let order of orders) {
//             const items = await pool.query(
//                 "SELECT * FROM order_items WHERE order_Id = ?",
//                 [order.orderId]
//             );
//             order.items = items;
//             result.push(order);
//         }

//         res.json(result);
//     } catch (err) {
//         console.error("관리자 주문 조회 실패:", err);
//         res.status(500).json({ error: "서버 에러" });
//     }
// });

// // =======================
// // 회원 전용 주문 조회
// // =======================
// // 🔹 여기 기존 쿼리로 교체해서 order.items 포함
// router.get("/user/:userId", async (req, res) => {
//     const { userId } = req.params;

//     // 권한 체크
//     if (!req.session.user || req.session.user.id !== userId) {
//         return res.status(403).json({ error: "권한이 없습니다" });
//     }

//     try {
//         // 회원 주문 조회
//         const orders = await pool.query(
//             `SELECT 
//                 order_Id as orderId,
//                 id as userId,
//                 totalAmount,
//                 orderDate
//              FROM orders
//              WHERE id = ? ORDER BY orderDate DESC`,
//             [userId]
//         );

//         // 각 주문에 대한 items 조회
//         for (let order of orders) {
//             const items = await pool.query(
//                 "SELECT * FROM order_items WHERE order_Id = ?",
//                 [order.orderId]
//             );
//             order.items = items;
//         }

//         res.json(orders);

//     } catch (err) {
//         console.error(err);
//         res.status(500).json({ error: "서버 에러" });
//     }
// });



// module.exports = router;






const express = require('express');
const pool = require('./db');
const router = express.Router();

/* ===========================
   사용자 정보 조회
=========================== */
router.get('/info/:userId', async (req, res) => {
    try {
        const { userId } = req.params;

        const rows = await pool.query(
            `SELECT 
                name, 
                phone
            FROM users WHERE id = ?`, 
            [userId]
        );
        
        if (rows.length > 0) {
            res.status(200).json(rows[0]);
        } else {
            res.status(404).json({ error: '사용자 정보를 찾을 수 없습니다.' });
        }
    } catch (error) {
        console.error('사용자 정보 조회 에러:', error);
        res.status(500).json({ error: '서버 에러' });
    }
});

/* ===========================
   주문 생성
=========================== */
router.post('/', async (req, res) => {
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

        // 재고 확인
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

        // 주문 생성
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
            [
                userId, zipCode, address,
                detailAddress, deliveryName, recipient,
                phone, deliveryMessage, paymentMethod, totalAmount
            ]
        );

        const orderId = Number(orderResult.insertId);

        // 주문 아이템 추가 및 재고 차감
        for (const item of items) {
            await connection.query(
                `INSERT INTO order_items (
                    order_Id,
                    pId, 
                    pName, 
                    pPrice, 
                    amount,
                    pImage
                ) VALUES (?, ?, ?, ?, ?, ?)`,
                [orderId, item.id, item.name, item.price, item.amount, item.pImage]
            );

            await connection.query(
                `UPDATE products SET stock = stock - ? WHERE pId = ?`,
                [item.amount, item.id]
            );
        }

        // 장바구니 삭제
        for (const item of items) {
            await connection.query(
                `DELETE FROM cart WHERE id = ? AND pId = ?`,
                [userId, item.id]
            );
        }

        await connection.commit();

        res.status(200).json({
            success: true,
            orderId: orderId,
            message: '주문이 완료되었습니다.'
        });

    } catch (error) {
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

/* ===========================
   재고 업데이트
=========================== */
router.put('/stock', async (req, res) => {
    try {
        const { pId, amount } = req.body;

        const product = await pool.query(
            `SELECT stock FROM products WHERE pId = ?`,
            [pId]
        );

        if (!product || product.length === 0) {
            return res.status(404).json({ error: '상품을 찾을 수 없습니다' });
        }

        if (product[0].stock < amount) {
            return res.status(400).json({ error: '재고가 부족합니다' });
        }

        await pool.query(
            `UPDATE products SET stock = stock - ? WHERE pId = ?`,
            [amount, pId]
        );

        res.status(200).json({ message: '재고 업데이트 성공' });
    } catch (error) {
        console.error('재고 업데이트 에러:', error);
        res.status(500).json({ error: '재고 수량 업데이트 실패' });
    }
});

/* ===========================
   관리자 주문 조회
=========================== */
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
                    p.img AS pImage
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

/* ===========================
   사용자 주문 조회
=========================== */

router.get("/test",async(req,res)=>{
    const items = await pool.query(`SELECT 
                    oi.orderItemId,
                    oi.pId,
                    oi.pName,
                    oi.pPrice,
                    oi.amount,
                    p.img AS pImage
                FROM order_items oi
                JOIN products p ON oi.pId = p.pId
                WHERE oi.order_Id = 8`)
    const test = await pool.query('SELECT * FROM products')
    res.json(test)
})

router.get("/user/:userId", async (req, res) => {
    const { userId } = req.params;

    // if (!req.session.user || req.session.user.id !== userId) {
    //     return res.status(403).json({ error: "권한이 없습니다" });
    // }

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
                    p.img AS pImage
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
