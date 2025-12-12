const express = require('express');
const pool = require('./db');
const router = express.Router();

router.get('/:userId', async(req, res)=>{
    try{
        const {userId} = req.params;

        const rows = await pool.query(
            `SELECT 
                c.pId as id, 
                p.pName as name, 
                p.pPrice as price,
                c.amount as amount,
                p.image,
                p.stock as stock
            FROM cart c
            LEFT JOIN products p ON c.pId = p.pId
            WHERE c.id = ?`, [userId]);

        res.status(200).json(rows);
    }catch(error){
        console.error('장바구니 조회 에러:', error);
        res.status(500).json({error: '장바구니 조회 실패'});
    }
})

router.put('/update', async(req,res)=>{
    try {
        const {pId, amount, userId} = req.body;

        const product = await pool.query(
            `SELECT stock FROM products WHERE pId = ?`,
            [pId]
        );

        if(!product || product.length === 0){
            return res.status(404).json({error:'상품 오류'});
        }

        if(product[0].stock < amount){
            return res.status(400).json({
                error:'재고 수량 확인',
                message:'재고 수량을 확인해주세요!',
                availableStock: product[0].stock
            });
        }

        await pool.query('UPDATE cart SET amount = ? WHERE pId = ? AND id = ?',
            [amount, pId, userId]
        )
        res.send({"result":true})
    } catch(error) {
        console.error('수량 업데이트 에러:', error);
        res.status(500).json({error: '수량 변경 실패'});
    }
})

router.delete('/delete', async(req,res)=>{
    try {
        const {pId, userId} = req.body;
        await pool.query('DELETE FROM cart WHERE pId = ? AND id = ?',
            [pId, userId]
        )
        res.send({"result":true})
    } catch(error) {
        console.error('삭제 에러:', error);
        res.status(500).json({error: '삭제 실패'});
    }
})

module.exports = router;