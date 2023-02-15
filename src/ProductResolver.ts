import { Resolver, Query, Mutation, Arg, ObjectType, UseMiddleware, Ctx } from "type-graphql";
import { Product } from "./entity/Product";
import { isAuth } from "./isAuth";
import { MyContext } from "./MyContext";


@ObjectType()
@Resolver()
export class ProductResolver {
    @Query(() => String)
    test() {
        return 'Test 123 working'
    }

    @Query(() => String)
    @UseMiddleware(isAuth)
    private(
        @Ctx() { payload }: MyContext
    ) {
        console.log(payload);
        return `Your user id is: ${payload!.userId}`
    }

    // Find all product

    @Query(() => [Product])
    products() {
        return Product.find();
    }

    // Find one product

    @Query(() => Product, { nullable: true })
    async findOneProduct(@Arg('id') id: number): Promise<Product | null> {
        const product = await Product.findOne({ where: { id } });
        if (!product) {
            throw new Error(`No product with ID ${id} found`);
        }
        return product;
    }

    // Add a product

    @Mutation(() => Boolean)
    async addProduct(
        @Arg('title') title: string,
        @Arg('price') price: number,
        @Arg('date') date: string,
        @Arg('status') status: string,
        @Arg('category') category: string,
        @Arg('description') description: string,
    ) {
        const product = await Product.findOne({ where: { title } });
        if (product) {
            throw new Error('Product Exist');
        }
        try {
            await Product.insert({
                title,
                price,
                date,
                status,
                category,
                description,
            });
        } catch (error) {
            console.log(error)
            return false
        }
        return true;
    }

    // Delete a product

    @Mutation(() => String)
    async deleteProduct(@Arg('id') id: number): Promise<string> {
        const product = await Product.findOne({ where: { id } });
        if (!product) {
            throw new Error(`No product with ID ${id} found`);
        }
        await product.remove();
        return `Product with ID ${id} was deleted successfully`;
    }

    // Update a product

    @Mutation(() => Product)
    async updateProduct(
        @Arg('id') id: number,
        @Arg('title', { nullable: true }) title?: string,
        @Arg('category', { nullable: true }) category?: string,
        @Arg('date', { nullable: true }) date?: string,
        @Arg('price', { nullable: true }) price?: number,
        @Arg('status', { nullable: true }) status?: string,
        @Arg('description', { nullable: true }) description?: string,
    ): Promise<Product> {
        const product = await Product.findOne({ where: { id } });
        if (!product) {
            throw new Error(`No product with ID ${id} found`);
        }
        if (title !== undefined) {
            product.title = title;
        }
        if (price !== undefined) {
            product.price = price;
        }
        if (category !== undefined) {
            product.category = category;
        }
        if (date !== undefined) {
            product.date = date;
        }
        if (status !== undefined) {
            product.status = status;
        }
        if (description !== undefined) {
            product.description = description;
        }
        await product.save();
        return product;
    }
}