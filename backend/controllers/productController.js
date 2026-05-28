import {sql} from "../config/db.js";


export const getAllProducts = async (req, res) => {
    try {
         const products = await sql `SELECT * FROM products
                     ORDER BY created_at DESC`;
         console.log('Products fetched successfully:', products);
         res.status(200).json({success: true, data: products}); 
    } catch (error) {
        console.error('Error fetching products:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

export const createProduct = async (req, res) => {
    const {name,price,image}=req.body;
    if(!name || !price || !image){
        return res.status(400).json({error:'Name, price and image are required'});
    }

    try{
        const newProduct = await sql`
                           INSERT INTO products (name,price,image)
                           VALUES (${name},${price},${image})
                           RETURNING *`;
        console.log('Product created successfully:', newProduct);
        res.status(201).json({success: true, data: newProduct[0]});
    } catch (error) {
        console.error('Error creating product:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

export const getProduct = async (req, res) => {
    const { id } = req.params;
    if(!id){
        return res.status(400).json({error:'Product ID is required'});
    }
    try{
        const product = await sql`
                                  SELECT * FROM products
                                  WHERE id=${id}`;
        if(!product.length){
            return res.status(404).json({error:'Product not found'});
        }
        console.log('Product fetched successfully:', product[0]);
        res.status(200).json({success: true, data: product[0]});
    } catch (error) {
        console.error('Error fetching product:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};


export const updateProduct = async (req, res) => {

    const { id } = req.params;

    const { name, price, image } = req.body;

    try {

        const fields = [];
        const values = [];

        // dynamic fields
        if (name !== undefined) {
            fields.push(`name = $${fields.length + 1}`);
            values.push(name);
        }

        if (price !== undefined) {
            fields.push(`price = $${fields.length + 1}`);
            values.push(price);
        }

        if (image !== undefined) {
            fields.push(`image = $${fields.length + 1}`);
            values.push(image);
        }

        // nothing sent
        if (fields.length === 0) {

            return res.status(400).json({
                error: "At least one field is required"
            });
        }

        // add id as LAST parameter
        values.push(id);

        // final query
        const query = `
            UPDATE products
            SET ${fields.join(", ")}
            WHERE id = $${values.length}
            RETURNING *
        `;

        // execute query
        const updatedProduct = await sql.query(
            query,
            values
        );

        // no product found
        if (!updatedProduct.length) {

            return res.status(404).json({
                error: "Product not found"
            });
        }

        console.log(
            "Product updated successfully:",
            updatedProduct[0]
        );

        res.status(200).json({
            success: true,
            data: updatedProduct[0]
        });

    } catch (error) {

        console.error(
            "Error updating product:",
            error
        );

        res.status(500).json({
            error: "Internal server error"
        });
    }
};


export const deleteProduct = async (req, res) => {    
    const { id } = req.params;
    if(!id){
        return res.status(400).json({error:'Product ID is required'});
    }
    try{
        const deletedProduct = await sql`
                                  DELETE FROM products
                                  WHERE id=${id}
                                  RETURNING *`;
        if(!deletedProduct.length){
            return res.status(404).json({error:'Product not found'});
        }
        console.log('Product deleted successfully:', deletedProduct[0]);
        res.status(200).json({success: true, data: deletedProduct[0]});
    } catch (error) {
        console.error('Error deleting product:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
    
}

