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
        // stores dynamic SET clauses
        const fields = [];

        // stores actual values
        const values = [];

        // CHECK NAME
        if (name !== undefined) {

            fields.push("name");
            values.push(name);
        }

        // CHECK PRICE
        if (price !== undefined) {

            fields.push("price");
            values.push(price);
        }

        // CHECK IMAGE
        if (image !== undefined) {

            fields.push("image");
            values.push(image);
        }

        // if user sends nothing
        if (fields.length === 0) {

            return res.status(400).json({
                error: "At least one field is required"
            });
        }

        let updatedProduct;

        // ONLY NAME
        if (fields.length === 1) {

            updatedProduct = await sql`
                UPDATE products
                SET ${sql(fields[0])} = ${values[0]}
                WHERE id = ${id}
                RETURNING *
            `;
        }

        // NAME + PRICE
        else if (fields.length === 2) {

            updatedProduct = await sql`
                UPDATE products
                SET
                    ${sql(fields[0])} = ${values[0]},
                    ${sql(fields[1])} = ${values[1]}
                WHERE id = ${id}
                RETURNING *
            `;
        }

        // NAME + PRICE + IMAGE
        else {

            updatedProduct = await sql`
                UPDATE products
                SET
                    ${sql(fields[0])} = ${values[0]},
                    ${sql(fields[1])} = ${values[1]},
                    ${sql(fields[2])} = ${values[2]}
                WHERE id = ${id}
                RETURNING *
            `;
        }

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

