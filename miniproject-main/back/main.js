const express = require('express');
const pool = require('./db');
const multer = require('multer');
const path = require('path');
const router = express.Router();


const storage = multer.diskStorage ({
    destination: function (req, file, cb) {
        cb(null, 'uploads/'); //uploads 폴더가 프로젝트 루트에 있어야 됨
    },
    filename: function (req, file, cb) {
        const ext = path.extname(file.originalname);
        cb(null, Date.now() + ext); // 파일명 중복 방지
    }
});

const upload = multer({ storage });

router.get('/search', async (req, res) => {
    const keyword = req.query.keyword || "";
    
    let sql = "SELECT * FROM products";
    let params = [];

    if (keyword) {
        sql += " WHERE pName LIKE ? OR pcategory LIKE ?";
        params.push(`%${keyword}%`, `%${keyword}%`);
    }

    const pp = await pool.query(sql, params);

    const result = pp.map(item => ({
        ...item,
        image: item.image ? `http://localhost:8080${item.image}` : null
    }));
    
    res.send(result);
});

router.post('/addmain', upload.single('image'), async(req,res)=> {
      // (관리자 체크)
    if (!req.session.user || req.session.user.admin !== 1) {
        return res.status(403).json({
            result: false,
            message: "관리자만 접근 가능합니다"
        });
    }
    const pId = 'p' + Date.now();
    const { pName, pPrice, brand, description,pcategory, stock } = req.body; // req.body 내용들 선언 및 등록

    // 필수 값 체크

    if (!pName || !pPrice) {
        return res.status(400).json({ message: "상품명과 가격을 적어주세요" });

    }

    try{
        const price = parseInt(pPrice);
        const stockNum = parseInt(stock) || 0;

        let imgPath = null;
        if (req.file) {
            imgPath = '/uploads/' + req.file.filename;
        }

    await pool.query(
        'INSERT INTO products(pId, pName, brand,pPrice,description,pcategory,stock,image) VALUES(?,?,?,?,?,?,?,?)',
        [pId, pName, brand, price, description || '',pcategory || '', stockNum, imgPath]
    );

    res.json({message: "상품등록 완료", pId});
} catch (err) {
    console.error("상품 등록 에러:", err);
    res.status(500).json({message:"서버 에러", error: err.message});
}
});

router.get('/dbprod', async (req, res) => {
    try {
        const rows = await pool.query("SELECT pId, pName, pPrice, description, pcategory, image, stock FROM products");
        const products = rows.map(row => ({
        id: row.pId,
        name: row.pName,
        price: row.pPrice,
        description: row.description,
        category: row.pcategory,
        image: `http://localhost:8080${row.image}`,
        stock: row.stock
        }));
        res.json(products);
    } catch (err) {
        console.error(err);
        res.status(500).json([]);
    }
    });

router.put('/dbprod', async(req, res) => {
    const { pId, stock } = req.body;
    

    if (pId === undefined) {
        return res.status(400).json({ success: false, error: "pId is missing" });
    }

    try {
        await pool.query(
            'UPDATE products SET stock=? WHERE pId=?',
            [Number(stock) || 0, pId] 
        );

        res.json({ success: true, message: "재고 수정 완료" });
    } catch(err) {
        console.error("DB 에러:", err);
        res.status(500).json({ success: false, error: err.message });
    }
});

//상품db
router.get('/products',async(req,res) => {
    const rows = await pool.query('SELECT * FROM `products`');
    res.send(rows);
})

//새상품db
router.get('/pnew',async(req,res) => {
    const rows = await pool.query('SELECT * FROM `pnew`');
    res.send(rows);
})

module.exports = router;